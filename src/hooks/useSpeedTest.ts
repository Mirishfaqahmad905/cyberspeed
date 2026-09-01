import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ConnectionInfo,
  DataPoint,
  NetworkProfilePreset,
  ServerNode,
  SpeedTestResult,
  SpeedUnit,
  TestDurationSeconds,
  TestMode,
  TestStage,
} from '../types';
import {
  calculateGrade,
  DEFAULT_CONNECTION,
  PROFILE_CONFIGS,
  saveResultToHistory,
  SERVERS,
} from '../utils/speedEngine';
import {
  detectRealConnectionInfo,
  measureRealDownload,
  measureRealPing,
  measureRealUpload,
} from '../utils/realSpeedEngine';

export interface SpeedTestState {
  stage: TestStage;
  testMode: TestMode;
  progress: number; // 0 to 100
  currentSpeed: number; // in Mbps
  downloadSpeed: number; // finalized or running avg
  uploadSpeed: number; // finalized or running avg
  peakDownload: number;
  peakUpload: number;
  ping: number; // ms
  jitter: number; // ms
  dataPoints: DataPoint[];
  selectedServer: ServerNode;
  connection: ConnectionInfo;
  preset: NetworkProfilePreset;
  activeResult: SpeedTestResult | null;
  statusMessage: string;
  totalBytesDownloaded: number;
  totalBytesUploaded: number;
  testDurationSeconds: TestDurationSeconds;
  speedUnit: SpeedUnit;
  elapsedSeconds: number;
}

export function useSpeedTest() {
  const [selectedServer, setSelectedServer] = useState<ServerNode>(SERVERS[0]);
  const [connection, setConnection] = useState<ConnectionInfo>(DEFAULT_CONNECTION);
  const [preset, setPreset] = useState<NetworkProfilePreset>('gigabit_fiber');
  const [testMode, setTestMode] = useState<TestMode>('live_network');
  const [testDurationSeconds, setTestDurationSeconds] = useState<TestDurationSeconds>(60);
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('dual');

  const [state, setState] = useState<SpeedTestState>({
    stage: 'idle',
    testMode: 'live_network',
    progress: 0,
    currentSpeed: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    peakDownload: 0,
    peakUpload: 0,
    ping: 0,
    jitter: 0,
    dataPoints: [],
    selectedServer: SERVERS[0],
    connection: DEFAULT_CONNECTION,
    preset: 'gigabit_fiber',
    activeResult: null,
    statusMessage: 'Ready to benchmark live Wi-Fi / broadband speed (Up to 1 minute continuous)',
    totalBytesDownloaded: 0,
    totalBytesUploaded: 0,
    testDurationSeconds: 60,
    speedUnit: 'dual',
    elapsedSeconds: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const simulationTimerRef = useRef<number | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Auto-detect real user network connection information on mount
  useEffect(() => {
    let isMounted = true;
    detectRealConnectionInfo().then((realConn) => {
      if (isMounted) {
        setConnection(realConn);
        setState((prev) => ({
          ...prev,
          connection: realConn,
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Keep state server/preset/testMode/duration/unit in sync
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      selectedServer,
      connection,
      preset,
      testMode,
      testDurationSeconds,
      speedUnit,
    }));
  }, [selectedServer, connection, preset, testMode, testDurationSeconds, speedUnit]);

  // Cancel any running test
  const cancelTest = useCallback(() => {
    isCancelledRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      stage: 'idle',
      progress: 0,
      currentSpeed: 0,
      elapsedSeconds: 0,
      statusMessage: 'Test cancelled by user',
    }));
  }, []);

  // -----------------------------------------------------------
  // REAL NETWORK SPEED TEST (Continuous measurement up to 1 minute)
  // -----------------------------------------------------------
  const runRealSpeedTest = useCallback(async () => {
    isCancelledRef.current = false;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;

    // Allocate phase durations based on selected duration (10s, 30s, or 60s)
    let pingSamplesCount = 10;
    let downloadDurationMs = 14000;
    let uploadDurationMs = 13500;

    if (testDurationSeconds === 60) {
      pingSamplesCount = 14;
      downloadDurationMs = 28000; // 28 seconds continuous download
      uploadDurationMs = 28000; // 28 seconds continuous upload
    } else if (testDurationSeconds === 10) {
      pingSamplesCount = 6;
      downloadDurationMs = 4500;
      uploadDurationMs = 4000;
    }

    const testStartTime = performance.now();

    // Reset initial state
    setState((prev) => ({
      ...prev,
      stage: 'ping',
      progress: 0,
      currentSpeed: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      peakDownload: 0,
      peakUpload: 0,
      ping: 0,
      jitter: 0,
      dataPoints: [],
      activeResult: null,
      totalBytesDownloaded: 0,
      totalBytesUploaded: 0,
      elapsedSeconds: 0,
      statusMessage: `Measuring real Wi-Fi latency & packet jitter (${testDurationSeconds}s benchmark)...`,
    }));

    try {
      // 1. MEASURE REAL PING & JITTER
      const pingResult = await measureRealPing(
        (curPing, curJitter, prog) => {
          if (signal.aborted) return;
          const elapsed = (performance.now() - testStartTime) / 1000;
          setState((prev) => ({
            ...prev,
            stage: 'ping',
            progress: Math.min(15, Math.round((prog / 100) * 15)),
            ping: curPing,
            jitter: curJitter,
            elapsedSeconds: Number(elapsed.toFixed(1)),
            statusMessage: `Probing active connection • Ping: ${curPing} ms (Jitter: ${curJitter} ms)`,
          }));
        },
        signal,
        pingSamplesCount
      );

      if (signal.aborted) return;

      const measuredPing = pingResult.ping;
      const measuredJitter = pingResult.jitter;

      // 2. MEASURE REAL DOWNLOAD SPEED (Continuous stream)
      setState((prev) => ({
        ...prev,
        stage: 'download',
        progress: 15,
        ping: measuredPing,
        jitter: measuredJitter,
        statusMessage: `Streaming live continuous download chunks over your Wi-Fi (${Math.round(downloadDurationMs / 1000)}s test)...`,
      }));

      const downloadResult = await measureRealDownload(
        downloadDurationMs,
        testDurationSeconds === 60 ? 6 : 4, // More parallel streams for 1-minute test
        (progress) => {
          if (signal.aborted) return;
          const totalProgress = 15 + Math.round((progress.progressPercent / 100) * 42); // 15% to 57%
          const elapsed = (performance.now() - testStartTime) / 1000;
          setState((prev) => ({
            ...prev,
            stage: 'download',
            progress: Math.min(57, totalProgress),
            currentSpeed: progress.currentSpeedMbps,
            downloadSpeed: progress.currentSpeedMbps,
            peakDownload: progress.peakSpeedMbps,
            totalBytesDownloaded: progress.totalBytes,
            dataPoints: progress.dataPoints,
            elapsedSeconds: Number(elapsed.toFixed(1)),
            statusMessage: `Continuous Download (${Math.round(progress.elapsedSeconds)}s / ${Math.round(downloadDurationMs / 1000)}s) • ${progress.currentSpeedMbps} Mbps (${(progress.totalBytes / (1024 * 1024)).toFixed(1)} MB transferred)`,
          }));
        },
        signal
      );

      if (signal.aborted) return;

      const measuredDownload = downloadResult.speedMbps;
      const peakDownloadVal = downloadResult.peakSpeedMbps;

      // 3. MEASURE REAL UPLOAD SPEED (Continuous stream)
      setState((prev) => ({
        ...prev,
        stage: 'upload',
        progress: 57,
        currentSpeed: 0,
        statusMessage: `Uploading live payload streams over active link (${Math.round(uploadDurationMs / 1000)}s test)...`,
      }));

      const uploadResult = await measureRealUpload(
        uploadDurationMs,
        testDurationSeconds === 60 ? 4 : 3,
        (progress) => {
          if (signal.aborted) return;
          const totalProgress = 57 + Math.round((progress.progressPercent / 100) * 43); // 57% to 100%
          const elapsed = (performance.now() - testStartTime) / 1000;
          setState((prev) => ({
            ...prev,
            stage: 'upload',
            progress: Math.min(100, totalProgress),
            currentSpeed: progress.currentSpeedMbps,
            uploadSpeed: progress.currentSpeedMbps,
            peakUpload: progress.peakSpeedMbps,
            totalBytesUploaded: progress.totalBytes,
            dataPoints: [...downloadResult.dataPoints, ...progress.dataPoints],
            elapsedSeconds: Number(elapsed.toFixed(1)),
            statusMessage: `Continuous Upload (${Math.round(progress.elapsedSeconds)}s / ${Math.round(uploadDurationMs / 1000)}s) • ${progress.currentSpeedMbps} Mbps (${(progress.totalBytes / (1024 * 1024)).toFixed(1)} MB sent)`,
          }));
        },
        signal
      );

      if (signal.aborted) return;

      const measuredUpload = uploadResult.speedMbps;
      const peakUploadVal = uploadResult.peakSpeedMbps;

      // 4. FINALIZE & CALCULATE REAL BROADBAND GRADE
      const rating = calculateGrade(measuredDownload, measuredUpload, measuredPing, measuredJitter);

      const totalElapsed = Number(((performance.now() - testStartTime) / 1000).toFixed(1));

      const resultPayload: SpeedTestResult = {
        id: 'real-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        timestamp: Date.now(),
        downloadSpeed: measuredDownload,
        uploadSpeed: measuredUpload,
        ping: measuredPing,
        jitter: measuredJitter,
        peakDownload: peakDownloadVal,
        peakUpload: peakUploadVal,
        server: selectedServer,
        connection: connection,
        rating,
        isRealTest: true,
        totalBytesDownloaded: downloadResult.totalBytes,
        totalBytesUploaded: uploadResult.totalBytes,
        testDurationSeconds,
      };

      saveResultToHistory(resultPayload);

      setState((prev) => ({
        ...prev,
        stage: 'complete',
        progress: 100,
        currentSpeed: 0,
        downloadSpeed: measuredDownload,
        uploadSpeed: measuredUpload,
        peakDownload: peakDownloadVal,
        peakUpload: peakUploadVal,
        ping: measuredPing,
        jitter: measuredJitter,
        activeResult: resultPayload,
        elapsedSeconds: totalElapsed,
        statusMessage: `1-Minute Continuous Wi-Fi benchmark complete! Rating: Grade ${rating.grade} (${rating.title})`,
      }));
    } catch (err: any) {
      if (signal.aborted || isCancelledRef.current) {
        return;
      }
      console.error('Real speed test error, providing active fallback stats', err);
      setState((prev) => ({
        ...prev,
        stage: 'idle',
        statusMessage: 'Real test timed out or cancelled. Please check connection.',
      }));
    }
  }, [selectedServer, connection, testDurationSeconds]);

  // -----------------------------------------------------------
  // SIMULATED SPEED TEST (Scaled by duration)
  // -----------------------------------------------------------
  const runSimulatedSpeedTest = useCallback(() => {
    isCancelledRef.current = false;
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }

    const config = PROFILE_CONFIGS[preset];
    const serverBasePing = selectedServer.basePingMs;
    const calculatedTargetPing = Math.round(config.targetPing + serverBasePing * 0.4);
    const calculatedTargetJitter = Number((config.targetJitter + serverBasePing * 0.05).toFixed(1));

    let pingDuration = 2000;
    let downloadDuration = 5500;
    let uploadDuration = 4500;

    if (testDurationSeconds === 60) {
      pingDuration = 3000;
      downloadDuration = 28500;
      uploadDuration = 28500;
    } else if (testDurationSeconds === 10) {
      pingDuration = 1500;
      downloadDuration = 4500;
      uploadDuration = 4000;
    }

    setState((prev) => ({
      ...prev,
      stage: 'ping',
      progress: 0,
      currentSpeed: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      peakDownload: 0,
      peakUpload: 0,
      ping: 0,
      jitter: 0,
      dataPoints: [],
      activeResult: null,
      elapsedSeconds: 0,
      statusMessage: `Simulating socket profile (${testDurationSeconds}s test): ${config.name}...`,
    }));

    const testStartTime = Date.now();
    const dataPointsAcc: DataPoint[] = [];
    let pingSamples: number[] = [];
    let currentPingVal = calculatedTargetPing;
    let currentJitterVal = calculatedTargetJitter;
    let peakDownloadVal = 0;
    let peakUploadVal = 0;

    const intervalMs = 60;

    simulationTimerRef.current = window.setInterval(() => {
      if (isCancelledRef.current) {
        if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
        return;
      }

      const elapsed = Date.now() - testStartTime;
      const elapsedSec = Number((elapsed / 1000).toFixed(1));

      if (elapsed < pingDuration) {
        const pingProgress = elapsed / pingDuration;
        const totalProgress = pingProgress * 15;

        const variance = (Math.random() - 0.5) * config.jitterVariance * 2;
        const sample = Math.max(2, Math.round(calculatedTargetPing + variance));
        pingSamples.push(sample);
        if (pingSamples.length > 8) pingSamples.shift();

        currentPingVal = Math.round(pingSamples.reduce((a, b) => a + b, 0) / pingSamples.length);

        setState((prev) => ({
          ...prev,
          stage: 'ping',
          progress: Math.min(15, Math.round(totalProgress)),
          ping: currentPingVal,
          jitter: currentJitterVal,
          elapsedSeconds: elapsedSec,
          statusMessage: `Simulating ping • ${currentPingVal} ms`,
        }));
        return;
      }

      const downloadElapsed = elapsed - pingDuration;
      if (downloadElapsed < downloadDuration) {
        const dProgress = downloadElapsed / downloadDuration;
        const totalProgress = 15 + dProgress * 42;

        const rampFactor = Math.min(1, Math.pow(downloadElapsed / 1500, 1.4));
        const wave = Math.sin(downloadElapsed / 400) * 0.05;
        const noise = (Math.random() - 0.5) * 0.06;
        const speed = Number(Math.max(1, config.targetDownload * rampFactor * (1 + wave + noise)).toFixed(1));

        if (speed > peakDownloadVal) peakDownloadVal = speed;

        if (downloadElapsed % 150 < intervalMs) {
          dataPointsAcc.push({
            time: Number((downloadElapsed / 1000).toFixed(2)),
            speed,
            stage: 'download',
          });
        }

        setState((prev) => ({
          ...prev,
          stage: 'download',
          progress: Math.min(57, Math.round(totalProgress)),
          currentSpeed: speed,
          downloadSpeed: speed,
          peakDownload: peakDownloadVal,
          dataPoints: [...dataPointsAcc],
          elapsedSeconds: elapsedSec,
          statusMessage: `Simulating download (${Math.round(downloadElapsed / 1000)}s / ${Math.round(downloadDuration / 1000)}s) • ${speed} Mbps`,
        }));
        return;
      }

      const uploadElapsed = elapsed - (pingDuration + downloadDuration);
      if (uploadElapsed < uploadDuration) {
        const uProgress = uploadElapsed / uploadDuration;
        const totalProgress = 57 + uProgress * 43;

        const rampFactor = Math.min(1, Math.pow(uploadElapsed / 1300, 1.3));
        const speed = Number(Math.max(0.5, config.targetUpload * rampFactor * (1 + (Math.random() - 0.5) * 0.08)).toFixed(1));

        if (speed > peakUploadVal) peakUploadVal = speed;

        if (uploadElapsed % 150 < intervalMs) {
          dataPointsAcc.push({
            time: Number(((downloadDuration + uploadElapsed) / 1000).toFixed(2)),
            speed,
            stage: 'upload',
          });
        }

        setState((prev) => ({
          ...prev,
          stage: 'upload',
          progress: Math.min(100, Math.round(totalProgress)),
          currentSpeed: speed,
          uploadSpeed: speed,
          peakUpload: peakUploadVal,
          dataPoints: [...dataPointsAcc],
          elapsedSeconds: elapsedSec,
          statusMessage: `Simulating upload (${Math.round(uploadElapsed / 1000)}s / ${Math.round(uploadDuration / 1000)}s) • ${speed} Mbps`,
        }));
        return;
      }

      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }

      const finalDownload = Number((peakDownloadVal * 0.94).toFixed(1));
      const finalUpload = Number((peakUploadVal * 0.93).toFixed(1));
      const rating = calculateGrade(finalDownload, finalUpload, currentPingVal, currentJitterVal);

      const resultPayload: SpeedTestResult = {
        id: 'sim-' + Date.now().toString(36),
        timestamp: Date.now(),
        downloadSpeed: finalDownload,
        uploadSpeed: finalUpload,
        ping: currentPingVal,
        jitter: currentJitterVal,
        peakDownload: peakDownloadVal,
        peakUpload: peakUploadVal,
        server: selectedServer,
        connection,
        rating,
        isRealTest: false,
        testDurationSeconds,
      };

      saveResultToHistory(resultPayload);

      setState((prev) => ({
        ...prev,
        stage: 'complete',
        progress: 100,
        currentSpeed: 0,
        downloadSpeed: finalDownload,
        uploadSpeed: finalUpload,
        ping: currentPingVal,
        jitter: currentJitterVal,
        peakDownload: peakDownloadVal,
        peakUpload: peakUploadVal,
        activeResult: resultPayload,
        elapsedSeconds: elapsedSec,
        statusMessage: `Simulation completed! Grade: ${rating.grade}`,
      }));
    }, intervalMs);
  }, [selectedServer, connection, preset, testDurationSeconds]);

  // Main start test trigger
  const startTest = useCallback(() => {
    if (testMode === 'live_network') {
      runRealSpeedTest();
    } else {
      runSimulatedSpeedTest();
    }
  }, [testMode, runRealSpeedTest, runSimulatedSpeedTest]);

  return {
    state,
    selectedServer,
    setSelectedServer,
    connection,
    setConnection,
    preset,
    setPreset,
    testMode,
    setTestMode,
    testDurationSeconds,
    setTestDurationSeconds,
    speedUnit,
    setSpeedUnit,
    startTest,
    cancelTest,
  };
}
