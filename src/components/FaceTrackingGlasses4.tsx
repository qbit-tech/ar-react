import React, { useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Canvas } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useGLTF } from '@react-three/drei';

function FaceTrackingGlasses4() {
  const videoRef: any = useRef(null);
  const [modelReady, setModelReady] = React.useState(false);

  useEffect(() => {
    async function loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      setModelReady(true);
    }
    loadModels();

    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: {} }).then((stream) => {
        videoRef.current.srcObject = stream;
      });
    }
  }, []);

  const detectFace = async () => {
    if (!modelReady || !videoRef.current) return;
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (detection) {
      const { landmarks } = detection;
      const nose = landmarks.getNose()[0]; // Mendapatkan posisi hidung untuk posisi kacamata
      // Posisi 'nose' ini bisa digunakan untuk menempelkan kacamata
    }

    requestAnimationFrame(detectFace);
  };

  useEffect(() => {
    detectFace();
  }, [modelReady]);

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ display: 'none' }} />
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <GlassesModel position={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}

function GlassesModel(props: any) {
  const gltf = useGLTF('/Excellent_1803_whitetransparant_2021.gltf'); // Load kacamata GLTF

  return <primitive object={gltf.scene} {...props} />;
}

export default FaceTrackingGlasses4;
