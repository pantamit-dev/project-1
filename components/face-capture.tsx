'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { loadFaceModels, detectFace } from '@/lib/face-api-loader';

interface FaceCaptureProps {
  onCapture: (descriptor: number[]) => void;
  onError?: (error: string) => void;
}

export default function FaceCapture({ onCapture, onError }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'scanning' | 'success' | 'error'>('loading');
  const streamRef = useRef<MediaStream | null>(null);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera and load models
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const [modelsOk] = await Promise.all([
          loadFaceModels(),
          startCamera(),
        ]);
        if (mounted && modelsOk) {
          setIsLoading(false);
          setStatus('ready');
        }
      } catch (err) {
        if (mounted) {
          setIsLoading(false);
          setStatus('error');
          onError?.('ไม่สามารถเปิดกล้องหรือโหลดโมเดลได้');
        }
      }
    }

    init();

    return () => {
      mounted = false;
      stopCamera();
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time face detection indicator
  useEffect(() => {
    if (!isCameraReady || isLoading || captured) return;

    detectionInterval.current = setInterval(async () => {
      if (videoRef.current) {
        const descriptor = await detectFace(videoRef.current);
        setFaceDetected(!!descriptor);
      }
    }, 500);

    return () => {
      if (detectionInterval.current) clearInterval(detectionInterval.current);
    };
  }, [isCameraReady, isLoading, captured]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (err) {
      throw new Error('Camera access denied');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);
    setStatus('scanning');

    try {
      const descriptor = await detectFace(videoRef.current);
      if (!descriptor) {
        setStatus('ready');
        setIsCapturing(false);
        onError?.('ไม่พบใบหน้า กรุณาหันหน้าเข้ากล้อง');
        return;
      }

      // Draw captured frame to canvas
      if (canvasRef.current && videoRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx?.drawImage(videoRef.current, 0, 0);
      }

      setCaptured(true);
      setStatus('success');
      stopCamera();
      if (detectionInterval.current) clearInterval(detectionInterval.current);

      onCapture(Array.from(descriptor));
    } catch (err) {
      setStatus('error');
      onError?.('เกิดข้อผิดพลาดในการสแกนใบหน้า');
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, onCapture, onError]);

  const handleReset = useCallback(async () => {
    setCaptured(false);
    setFaceDetected(false);
    setStatus('loading');
    setIsLoading(true);
    setIsCameraReady(false);

    try {
      await startCamera();
      setIsLoading(false);
      setStatus('ready');
    } catch {
      setStatus('error');
      setIsLoading(false);
    }
  }, []);

  const statusColors = {
    loading: 'var(--on-surface-variant)',
    ready: faceDetected ? 'var(--success-green)' : 'var(--biometric-active)',
    scanning: 'var(--biometric-active)',
    success: 'var(--success-green)',
    error: 'var(--error-red)',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Camera / Canvas Preview */}
      <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden" style={{ background: 'var(--inverse-surface)' }}>
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span className="text-sm text-white/70">กำลังเตรียมกล้อง...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${captured ? 'hidden' : ''}`}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-cover ${!captured ? 'hidden' : ''}`}
        />

        {/* Face detection frame overlay */}
        {!isLoading && !captured && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-48 h-56 rounded-2xl border-2"
              animate={{
                borderColor: faceDetected ? 'var(--success-green)' : 'var(--biometric-active)',
                boxShadow: faceDetected
                  ? '0 0 20px rgba(46, 125, 50, 0.4)'
                  : '0 0 20px rgba(66, 133, 244, 0.3)',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Scanning animation */}
        {status === 'scanning' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 right-0 h-0.5 animate-scan-line" style={{ background: 'var(--biometric-active)', boxShadow: '0 0 10px var(--biometric-active)' }} />
          </div>
        )}

        {/* Success overlay */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(46, 125, 50, 0.2)' }}
          >
            <div className="flex flex-col items-center gap-2 text-white">
              <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--success-green)' }} />
              <span className="font-semibold text-sm">สแกนสำเร็จ!</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full" style={{ background: statusColors[status] }} />
        <span style={{ color: 'var(--on-surface-variant)' }}>
          {status === 'loading' && 'กำลังโหลดโมเดล AI...'}
          {status === 'ready' && (faceDetected ? '✓ ตรวจพบใบหน้า — พร้อมสแกน' : 'หันหน้าเข้ากล้อง')}
          {status === 'scanning' && 'กำลังสแกนใบหน้า...'}
          {status === 'success' && 'สแกนเรียบร้อย!'}
          {status === 'error' && 'เกิดข้อผิดพลาด'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!captured ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCapture}
            disabled={isLoading || isCapturing || !isCameraReady}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              background: faceDetected ? 'var(--success-green)' : 'var(--primary)',
              color: 'white',
            }}
          >
            {isCapturing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {isCapturing ? 'กำลังสแกน...' : 'ถ่ายรูปใบหน้า'}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: 'var(--surface-container)',
              color: 'var(--on-surface)',
              border: '1px solid var(--outline-variant)',
            }}
          >
            <RotateCcw className="w-4 h-4" />
            ถ่ายใหม่
          </motion.button>
        )}
      </div>
    </div>
  );
}
