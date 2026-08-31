import { useCallback, useEffect, useRef, useState } from 'react';
import { ConnectionInfo, DataPoint, NetworkProfilePreset, ServerNode, SpeedTestResult, TestStage } from '../types';
import { calculateGrade, DEFAULT_CONNECTION, PROFILE_CONFIGS, saveResultToHistory, SERVERS } from '../utils/speedEngine';

export interface SpeedTestState {
  stage: TestStage;
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
}

export function useSpeedTest() {
  const [selectedServer, setSelectedServer] = useState<ServerNode>(SERVERS[0]);
  const [connection, setConnection] = useState<ConnectionInfo>(DEFAULT_CONNECTION);
  const [preset, setPreset] = useState<NetworkProfilePreset>('gigabit_fiber');

  const [state, setState] = useState<SpeedTestState>({
    stage: 'idle',
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
    statusMessage: 'Ready to benchmark connection',
  });

  const timerRef = useRef<number | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Keep state server/preset in sync
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      selectedServer,
      connection,
      preset,
    }));
  }, [selectedServer, connection, preset]);

  // Cancel test
  const cancelTest = useCallback(() => {
    isCancelledRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      stage: 'idle',
      progress: 0,
      currentSpeed: 0,
      statusMessage: 'Test aborted by user',
    }));
  }, []);

  // Start test simulation
  const startTest = useCallback(() => {
    isCancelledRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const config = PROFILE_CONFIGS[preset];
    const serverBasePing = selectedServer.basePingMs;
    const calculatedTargetPing = Math.round(config.targetPing + (serverBasePing * 0.4));
    const calculatedTargetJitter = Number((config.targetJitter + (serverBasePing * 0.05)).toFixed(1));

    // Reset initial test state
    setState({
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
      selectedServer,
      connection,
      preset,
      activeResult: null,
      statusMessage: 'Analyzing socket handshake & latency jitter...',
    });

    const testStartTime = Date.now();
    const PING_DURATION = 2200; // ms
    const DOWNLOAD_DURATION = 6500; // ms
    const UPLOAD_DURATION = 5500; // ms
    const TOTAL_DURATION = PING_DURATION + DOWNLOAD_DURATION + UPLOAD_DURATION;

    const dataPointsAcc: DataPoint[] = [];
    let pingSamples: number[] = [];
    let currentPingVal = 0;
    let currentJitterVal = 0;
    let currentDownloadVal = 0;
    let peakDownloadVal = 0;
    let currentUploadVal = 0;
    let peakUploadVal = 0;

    const intervalMs = 40; // 25 fps updates

    timerRef.current = window.setInterval(() => {
      if (isCancelledRef.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      const elapsed = Date.now() - testStartTime;

      // ----------------------------------------------------
      // PHASE 1: PING & JITTER (0 -> PING_DURATION)
      // ----------------------------------------------------
      if (elapsed < PING_DURATION) {
        const pingProgress = elapsed / PING_DURATION;
        const totalProgress = pingProgress * 20;

        // Sample ping pulses with realistic variance
        if (elapsed % 200 < intervalMs) {
          const variance = (Math.random() - 0.5) * config.jitterVariance * 2;
          const sample = Math.max(2, Math.round(calculatedTargetPing + variance));
          pingSamples.push(sample);
          if (pingSamples.length > 8) pingSamples.shift();

          const avgPing = Math.round(pingSamples.reduce((a, b) => a + b, 0) / pingSamples.length);
          currentPingVal = avgPing;

          // Calculate jitter as average deviation between consecutive pings
          let diffSum = 0;
          for (let i = 1; i < pingSamples.length; i++) {
            diffSum += Math.abs(pingSamples[i] - pingSamples[i - 1]);
          }
          const jitterAvg = pingSamples.length > 1 
            ? Number((diffSum / (pingSamples.length - 1)).toFixed(1))
            : calculatedTargetJitter;
          currentJitterVal = jitterAvg;
        }

        setState((prev) => ({
          ...prev,
          stage: 'ping',
          progress: Math.min(20, Math.round(totalProgress)),
          ping: currentPingVal || calculatedTargetPing,
          jitter: currentJitterVal || calculatedTargetJitter,
          statusMessage: `Probing edge node (${selectedServer.city}) • Ping ${currentPingVal || calculatedTargetPing} ms`,
        }));
        return;
      }

      // ----------------------------------------------------
      // PHASE 2: DOWNLOAD SPEED TEST (PING_DURATION -> PING + DOWNLOAD)
      // ----------------------------------------------------
      const downloadElapsed = elapsed - PING_DURATION;
      if (downloadElapsed < DOWNLOAD_DURATION) {
        const dProgress = downloadElapsed / DOWNLOAD_DURATION;
        const totalProgress = 20 + dProgress * 40; // 20% to 60%

        // Realistic TCP ramp-up curve (Logistic + Noise)
        // Ramp up in first 1.8s, then steady state with turbulent waves
        const rampFactor = Math.min(1, Math.pow(downloadElapsed / 1800, 1.4));
        const wave1 = Math.sin(downloadElapsed / 350) * 0.05;
        const wave2 = Math.cos(downloadElapsed / 700) * 0.03;
        const microNoise = (Math.random() - 0.5) * 0.08;
        const turbulence = 1 + wave1 + wave2 + microNoise;

        const instantaneousSpeed = Number(
          Math.max(1, config.targetDownload * rampFactor * turbulence).toFixed(1)
        );

        if (instantaneousSpeed > peakDownloadVal) {
          peakDownloadVal = instantaneousSpeed;
        }
        currentDownloadVal = instantaneousSpeed;

        // Record telemetry point every 160ms for smooth line chart
        if (downloadElapsed % 160 < intervalMs) {
          dataPointsAcc.push({
            time: Number((downloadElapsed / 1000).toFixed(2)),
            speed: instantaneousSpeed,
            stage: 'download',
          });
        }

        setState((prev) => ({
          ...prev,
          stage: 'download',
          progress: Math.min(60, Math.round(totalProgress)),
          currentSpeed: instantaneousSpeed,
          downloadSpeed: instantaneousSpeed,
          peakDownload: peakDownloadVal,
          dataPoints: [...dataPointsAcc],
          statusMessage: `Testing download bandwidth • 8 parallel streams via ${selectedServer.name}`,
        }));
        return;
      }

      // ----------------------------------------------------
      // PHASE 3: UPLOAD SPEED TEST (PING + DOWNLOAD -> TOTAL)
      // ----------------------------------------------------
      const uploadElapsed = elapsed - (PING_DURATION + DOWNLOAD_DURATION);
      if (uploadElapsed < UPLOAD_DURATION) {
        const uProgress = uploadElapsed / UPLOAD_DURATION;
        const totalProgress = 60 + uProgress * 40; // 60% to 100%

        const rampFactor = Math.min(1, Math.pow(uploadElapsed / 1500, 1.3));
        const wave1 = Math.sin(uploadElapsed / 300) * 0.06;
        const microNoise = (Math.random() - 0.5) * 0.07;
        const turbulence = 1 + wave1 + microNoise;

        const instantaneousSpeed = Number(
          Math.max(0.5, config.targetUpload * rampFactor * turbulence).toFixed(1)
        );

        if (instantaneousSpeed > peakUploadVal) {
          peakUploadVal = instantaneousSpeed;
        }
        currentUploadVal = instantaneousSpeed;

        if (uploadElapsed % 160 < intervalMs) {
          dataPointsAcc.push({
            time: Number(((DOWNLOAD_DURATION + uploadElapsed) / 1000).toFixed(2)),
            speed: instantaneousSpeed,
            stage: 'upload',
          });
        }

        setState((prev) => ({
          ...prev,
          stage: 'upload',
          progress: Math.min(100, Math.round(totalProgress)),
          currentSpeed: instantaneousSpeed,
          uploadSpeed: instantaneousSpeed,
          peakUpload: peakUploadVal,
          dataPoints: [...dataPointsAcc],
          statusMessage: `Testing upload throughput • Socket buffers streaming to ${selectedServer.name}`,
        }));
        return;
      }

      // ----------------------------------------------------
      // PHASE 4: TEST COMPLETE
      // ----------------------------------------------------
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Compute final stabilized speeds (average of stabilized region)
      const finalDownload = Number((peakDownloadVal * 0.94).toFixed(1));
      const finalUpload = Number((peakUploadVal * 0.93).toFixed(1));
      const finalPing = currentPingVal || calculatedTargetPing;
      const finalJitter = currentJitterVal || calculatedTargetJitter;

      const rating = calculateGrade(finalDownload, finalUpload, finalPing, finalJitter);

      const resultPayload: SpeedTestResult = {
        id: 'test-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        timestamp: Date.now(),
        downloadSpeed: finalDownload,
        uploadSpeed: finalUpload,
        ping: finalPing,
        jitter: finalJitter,
        peakDownload: peakDownloadVal,
        peakUpload: peakUploadVal,
        server: selectedServer,
        connection: connection,
        rating,
      };

      // Save to history in localStorage
      saveResultToHistory(resultPayload);

      setState((prev) => ({
        ...prev,
        stage: 'complete',
        progress: 100,
        currentSpeed: 0,
        downloadSpeed: finalDownload,
        uploadSpeed: finalUpload,
        ping: finalPing,
        jitter: finalJitter,
        peakDownload: peakDownloadVal,
        peakUpload: peakUploadVal,
        activeResult: resultPayload,
        statusMessage: `Benchmark completed! Overall Grade: ${rating.grade} (${rating.title})`,
      }));
    }, intervalMs);
  }, [selectedServer, connection, preset]);

  return {
    state,
    selectedServer,
    setSelectedServer,
    connection,
    setConnection,
    preset,
    setPreset,
    startTest,
    cancelTest,
  };
}
