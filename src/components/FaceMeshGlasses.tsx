import React, { useRef, useEffect, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { AmbientLight } from 'three';

function FaceMeshGlasses() {
  const videoRef: any = useRef(null);
  const faceMesh: any = useRef(null);
  const camera: any = useRef(null);
  const [glassesPosition, setGlassesPosition] = useState([0, 0, 0]);
  const [glassesRotation, setGlassesRotation] = useState([0, 0, 0]);

  useEffect(() => {
    async function setupFaceMesh() {
      faceMesh.current = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.current.onResults(onResults);

      if (videoRef.current) {
        camera.current = new cam.Camera(videoRef.current, {
          onFrame: async () => {
            await faceMesh.current.send({ image: videoRef.current });
          },
          width: 640,
          height: 480,
        });
        camera.current.start();
      }
    }

    setupFaceMesh();
  }, []);

  const onResults = (results: any) => {
    console.log('Hasil Deteksi Wajah:', results);
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const leftEye = landmarks[33]; // Mata kiri
      const rightEye = landmarks[263]; // Mata kanan
      const nose = landmarks[1]; // Hidung

      // const leftEar = landmarks[234]; // Landmark telinga kiri (sesuaikan dengan indeks yang tepat)
      // const rightEar = landmarks[454]; // Landmark telinga kanan (sesuaikan dengan indeks yang tepat)

      // Hitung jarak antara mata kiri dan kanan untuk memperkirakan lebar wajah
      // const faceWidth = Math.sqrt(
      //   Math.pow(rightEye.x - leftEye.x, 2) +
      //     Math.pow(rightEye.y - leftEye.y, 2) +
      //     Math.pow(rightEye.z - leftEye.z, 2)
      // );

      // Tentukan faktor skala atau offset tambahan untuk menyesuaikan panjang pegangan
      // const armLengthAdjustment = faceWidth * 0.1; // Adjust 0.1 as needed for arm length

      // Hitung posisi dan skala kacamata di antara mata kiri dan kanan
      const position = [
        (leftEye.x + rightEye.x) / 2,
        (leftEye.y + rightEye.y) / 2,
        (leftEye.z + rightEye.z) / 2,
      ];

      // Hitung orientasi (rotasi) berdasarkan posisi mata
      const dx = rightEye.x - leftEye.x;
      const dy = rightEye.y - leftEye.y;
      const rotation = [0, 0, Math.atan2(dy, dx)];

      // // Hitung kedalaman rata-rata antara mata dan telinga
      // const depth = (leftEar.z + rightEar.z) / 2;

      // Atur posisi dan rotasi kacamata
      setGlassesPosition([
        position[0] * 10 - 5,
        -position[1] * 10 + 5,
        // -position[2] * 10,
        -nose.z * 10 - 1, // Menggunakan posisi z hidung untuk kedalaman
        // -depth * 10, // Sesuaikan posisi z agar pegangan mendekati telinga
        // -position[2] * 10 - armLengthAdjustment, // Menggeser kacamata lebih dekat ke telinga
      ]);
      // setGlassesPosition([position[0], -position[1], -nose.z]);
      setGlassesRotation([0, 0, -rotation[2]]);
    }
  }

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 640,
          height: 480,
        }}
      />
      <Canvas
        style={{
          width: 640,
          height: 480,
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      >
        {/* <ambientLight intensity={0.5} /> */}
        <primitive object={new AmbientLight(0xffffff, 0.5)} />{' '}
        {/* Menentukan light secara eksplisit */}
        <pointLight position={[10, 10, 10]} />
        <GlassesModel position={glassesPosition} rotation={glassesRotation} />
      </Canvas>
    </div>
  );
}

export default FaceMeshGlasses;

function GlassesModel({ position, rotation }: any) {
  const gltf = useGLTF('/Excellent_1803_whitetransparant_2021.gltf');

  useFrame(() => {
    // Update posisi dan rotasi kacamata di sini jika diperlukan
  });

  return (
    <primitive
      object={gltf.scene}
      position={position}
      rotation={rotation}
      scale={0.7}
    />
  );
}
