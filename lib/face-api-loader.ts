'use client';

import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face-api.js models from /models/ directory.
 */
export async function loadFaceModels(): Promise<boolean> {
  if (modelsLoaded) return true;

  try {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error('Failed to load face-api.js models:', error);
    return false;
  }
}

/**
 * Detect a face in the given video/canvas element and return its descriptor.
 */
export async function detectFace(
  input: HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  try {
    const detection = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptor();

    if (!detection) return null;
    return detection.descriptor;
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
}

/**
 * Calculate Euclidean distance between two face descriptors.
 * Lower = more similar. Threshold: typically 0.6
 */
export function euclideanDistance(a: number[], b: Float32Array | number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Check if face-api.js models are loaded.
 */
export function areModelsLoaded(): boolean {
  return modelsLoaded;
}
