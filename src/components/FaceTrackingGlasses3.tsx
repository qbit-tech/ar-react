import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

const FaceTrackingGlasses3 = () => {
  const videoRef: any = useRef(null);
  const [detector, setDetector] = useState<any>(null);

  useEffect(() => {
    // Fungsi untuk mengakses kamera dan menampilkan feed di elemen video
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track: any) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Load face detector model
    const loadFaceDetector = async () => {
      // const model = await faceDetection.createDetector(
      //   faceDetection.SupportedModels.MediaPipeFaceDetector,
      //   {
      //     runtime: 'tfjs',
      //     maxFaces: 1, // Set max faces to detect per frame (optional)
      //   }
      // );
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig: any = {
        runtime: 'mediapipe', // or 'tfjs'
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
      };
      const detector = await faceLandmarksDetection.createDetector(
        model,
        detectorConfig
      );
      setDetector(detector);
    };

    loadFaceDetector();
  }, []);

  useEffect(() => {
    const detectFace = async () => {
      if (videoRef.current && detector) {
        try {
          const tensor = tf.browser.fromPixels(videoRef.current);
          const faces = await detector.estimateFaces(tensor);
          tensor.dispose(); // Always dispose tensors after processing to avoid memory leaks

          if (faces.length > 0) {
            console.log('Wajah terdeteksi:', faces);
            // faces adalah array yang berisi informasi deteksi wajah, seperti bounding box
            // Di sini, Anda bisa menggambar bounding box atau memprosesnya lebih lanjut
          }
        } catch (error) {
          console.error('Error detecting face:', error);
        }
      }
    };

    const interval = setInterval(detectFace, 100); // Deteksi wajah setiap 100ms

    return () => clearInterval(interval); // Cleanup interval saat unmount
  }, [detector]);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        width="640"
        height="480"
        style={{ display: 'block', backgroundColor: '#000' }}
      />
    </div>
  );
};

export default FaceTrackingGlasses3;
