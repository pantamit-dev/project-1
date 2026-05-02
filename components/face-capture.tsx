'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { loadFaceModels, detectFace } from '@/lib/face-api-loader';

interface FaceCaptureProps {
  onCapture: (descriptor: number[], imageDataUrl: string) => void;
  disabled?: boolean;
}

export default function FaceCapture({ onCapture, disabled }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load models and start camera
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setLoading(true);
        setError(null);

        // Load face-api models
        await loadFaceModels();
        if (mounted) setModelsReady(true);

        // Start camera
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        if (mounted && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        if (mounted) {
          if (err instanceof DOMException && err.name === 'NotAllowedError') {
            setError('กรุณาอนุญาตการเข้าถึงกล้อง');
          } else {
            setError('ไม่สามารถเริ่มกล้องได้ กรุณาตรวจสอบการเชื่อมต่อ');
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Continuous face detection for real-time feedback
  useEffect(() => {
    if (!modelsReady || !videoRef.current || captured) return;

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;
      const result = await detectFace(videoRef.current);
      setFaceDetected(!!result);
    }, 500);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [modelsReady, captured]);

  // Capture face
  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsReady) return;

    setCapturing(true);
    setError(null);

    try {
      const result = await detectFace(videoRef.current);

      if (!result) {
        setError('ไม่พบใบหน้า กรุณาให้ใบหน้าอยู่ในกรอบ');
        setCapturing(false);
        return;
      }

      // Draw captured frame to canvas
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const descriptorArray = Array.from(result.descriptor);

      setCaptured(true);
      setCapturedImage(imageDataUrl);

      // Stop camera
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      onCapture(descriptorArray, imageDataUrl);
    } catch {
      setError('เกิดข้อผิดพลาดในการถ่ายภาพ กรุณาลองอีกครั้ง');
    } finally {
      setCapturing(false);
    }
  }, [modelsReady, onCapture, stream]);

  // Reset capture
  const handleReset = useCallback(async () => {
    setCaptured(false);
    setCapturedImage(null);
    setFaceDetected(false);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch {
      setError('ไม่สามารถเริ่มกล้องได้');
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Camera Preview */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[var(--surface-container-highest)]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
            <p className="text-sm text-[var(--on-surface-variant)]">กำลังเตรียมกล้อง...</p>
          </div>
        )}

        {captured && capturedImage ? (
          <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
            onLoadedData={() => setLoading(false)}
          />
        )}

        {/* Face detection indicator */}
        {!loading && !captured && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Center guide frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-48 h-60 rounded-[50%] border-2 transition-colors duration-300 ${
                  faceDetected ? 'border-[var(--success)]' : 'border-white/50'
                }`}
                style={{
                  boxShadow: faceDetected
                    ? '0 0 20px rgba(46, 125, 50, 0.3), inset 0 0 20px rgba(46, 125, 50, 0.1)'
                    : '0 0 20px rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>

            {/* Scanning line */}
            {!faceDetected && (
              <div className="absolute left-1/2 -translate-x-1/2 w-48 h-0.5 bg-[var(--biometric-active)] animate-scan-line opacity-60" />
            )}
          </div>
        )}

        {/* Status badge */}
        {!loading && !captured && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                faceDetected
                  ? 'bg-[var(--success)]/90 text-white'
                  : 'bg-black/60 text-white/80'
              }`}
            >
              {faceDetected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ตรวจพบใบหน้า
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  กำลังค้นหาใบหน้า...
                </>
              )}
            </div>
          </div>
        )}

        {captured && (
          <div className="absolute top-3 right-3">
            <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--success)] text-white flex items-center gap-1.5 animate-success-pop">
              <CheckCircle2 className="w-3.5 h-3.5" />
              บันทึกใบหน้าสำเร็จ
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--error-container)', color: 'var(--on-error-container)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!captured ? (
          <button
            onClick={handleCapture}
            disabled={!faceDetected || capturing || disabled || loading}
            className="flex-1 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg"
            style={{
              background: faceDetected && !capturing ? 'linear-gradient(135deg, #005EB8, #4285F4)' : 'var(--outline)',
            }}
          >
            {capturing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
            {capturing ? 'กำลังบันทึก...' : 'ถ่ายภาพใบหน้า'}
          </button>
        ) : (
          <button
            onClick={handleReset}
            disabled={disabled}
            className="flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-md border"
            style={{ borderColor: 'var(--outline-variant)', color: 'var(--primary)' }}
          >
            <RotateCcw className="w-5 h-5" />
            ถ่ายใหม่
          </button>
        )}
      </div>
    </div>
  );
}
