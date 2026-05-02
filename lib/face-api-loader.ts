'use client';

import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face-api.js models from /models/ directory.
 * Models required:
 * - tiny_face_detector (fast face detection)
 * - face_landmark_68 (facial landmarks)
 * - face_recognition (128-dim descriptor extraction)
 */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

/**
 * Detect a single face and extract its 128-dimensional descriptor.
 * Returns null if no face is detected.
 */
export async function detectFace(
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Promise<{ descriptor: Float32Array; detection: faceapi.FaceDetection } | null> {
  const result = await faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) return null;

  return {
    descriptor: result.descriptor,
    detection: result.detection,
  };
}

/**
 * Calculate Euclidean distance between two face descriptors.
 * Lower = more similar. Threshold typically 0.6.
 */
export function euclideanDistance(desc1: number[] | Float32Array, desc2: number[] | Float32Array): number {
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Check if face-api models have been loaded
 */
export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

export { faceapi };
