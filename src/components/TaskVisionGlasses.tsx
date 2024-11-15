import React, { useRef, useEffect, useState } from 'react';
import { FilesetResolver, FaceLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { AmbientLight } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
const videoWidth = 480;
let lastVideoTime = -1;

function TaskVisionGlasses({changeMode}: any) {
  const videoRef: any = useRef(null);
  const faceLandmarker: any = useRef(null);
  const canvasRef: any = useRef(null);
  const canvasGlassesRef: any = useRef(null);
  const [landmarks, setLandmarks] = useState<any[]>([]);
  const [gltfUrl, setGLTFUrl] = useState<string>();
  const [gltf, setGLTF] = useState<any>();

  const [wh, setWH] = useState({width: 0, height: 0});

  const [runningMode, setRunningMode] = useState<'IMAGE' | 'VIDEO'>('IMAGE');

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.drawingUtils = new DrawingUtils(ctx);
  }, []);

  const [mode, setMode] = useState<'manual' | 'detection'>('detection');
  const [eyes, setEyes] = useState([
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
  ]);
  const [nose, setNose] = useState({ x: 0, y: 0, z: 0 });
  const [ears, setEars] = useState([
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
  ]);
  const [glassesPosition, setGlassesPosition] = useState([0, 0, 0]);
  const [glassesRotation, setGlassesRotation] = useState([0, 0, 0]);
  const [glassesScale, setGlassesScale] = useState([0, 0, 0]);

  useEffect(() => {
    async function setupTaskVision() {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
      );

      faceLandmarker.current = await FaceLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            // delegate: 'GPU',
          },
          runningMode,
          numFaces: 2,
          outputFaceBlendshapes: true,
        }
      );
      await faceLandmarker.current.setOptions({ runningMode: 'VIDEO' });

      enableCam();
    }

    setupTaskVision();
  }, []);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const modelUrl = e.target.result; // Set URL for the GLTF model
        setGLTFUrl(modelUrl);
        const loader = new GLTFLoader();
        // Optional: Provide a DRACOLoader instance to decode compressed mesh data
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(
          'https://www.gstatic.com/draco/v1/decoders/'
        );
        loader.setDRACOLoader(dracoLoader);
        loader.load(modelUrl, (gltf: any) => {
          setGLTF(gltf);
        });
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  // useEffect(() => {
  //   const modelUrl = 'Excellent_1803_whitetransparant_2021.gltf';
  //   const loader = new GLTFLoader();
  //   loader.load(modelUrl, (gltf: any) => {
  //     setGLTF(gltf);
  //   });
  // }, [])

  const onResults = (results: any) => {
    console.log('Hasil Deteksi Wajah:', results);
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      const leftEye = landmarks[33]; // Mata kiri
      const rightEye = landmarks[263]; // Mata kanan
      const nose = landmarks[1]; // Hidung

      const leftEar = landmarks[234]; // Landmark telinga kiri (sesuaikan dengan indeks yang tepat)
      const rightEar = landmarks[454]; // Landmark telinga kanan (sesuaikan dengan indeks yang tepat)

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

      const distance = Math.sqrt(
        Math.pow(rightEye.x - leftEye.x, 2) +
          Math.pow(rightEye.y - leftEye.y, 2) +
          Math.pow(rightEye.z - leftEye.z, 2)
      );
      // Pusatkan kacamata di antara mata kiri dan kanan
      const scaleFactor = distance * 4.8;
      setGlassesScale([scaleFactor, scaleFactor, scaleFactor]);

      // // Hitung kedalaman rata-rata antara mata dan telinga
      // const depth = (leftEar.z + rightEar.z) / 2;

      setEyes([leftEye, rightEye]);
      setNose(nose);
      setEars([leftEar, rightEar]);

      // Atur posisi dan rotasi kacamata
      setGlassesPosition([
        position[0] * 10 - 5,
        -position[1] * 10 + 5,
        // -position[2] * 10,
        -nose.z * 10 - 1, // Menggunakan posisi z hidung untuk kedalaman
        // -depth * 10, // Sesuaikan posisi z agar pegangan mendekati telinga
        // -position[2] * 10 - armLengthAdjustment, // Menggeser kacamata lebih dekat ke telinga
      ]);
      setGlassesRotation([0, 0, -rotation[2]]);
    }
  }

  function enableCam() {
    if (!faceLandmarker.current) {
      console.log('Wait! faceLandmarker not loaded yet.');
      return;
    }

    // getUsermedia parameters.
    const constraints = {
      video: true,
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // videoRef.current.play();
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();

          requestAnimationFrame(predictWebcam);
        };
        // videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
    });
  }

  // useEffect(() => {
  //   if (faceLandmarker.current) {
  //     requestAnimationFrame(predictWebcam);
  //   }
  //   // const interval = setInterval(predictWebcam, 100); // Adjust as necessary
  //   // return () => clearInterval(interval);
  // }, [faceLandmarker.current]);

  async function predictWebcam() {
    if (!faceLandmarker.current) {
      return;
    }
    
    const drawingUtils = canvasRef.drawingUtils;
    const video = videoRef.current;
    if (!video) {
      return;
    }
    console.info('video', video);
    const radio = video.videoHeight / video.videoWidth;

    console.info('video.videoHeight', video.videoHeight);
    console.info('video.videoWidth', video.videoWidth);
    console.info('radio', radio);

    videoRef.current.style.width = videoWidth + 'px';
    videoRef.current.style.height = videoWidth * radio + 'px';
    canvasRef.current.style.width = videoWidth + 'px';
    canvasRef.current.style.height = videoWidth * radio + 'px';
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    canvasRef.current.style.background = '#000000';

    setWH({
      width: videoWidth,
      height: videoWidth * radio,
    });

    // Now let's start detecting the stream.
    if (runningMode === 'IMAGE') {
      setRunningMode('VIDEO');
      await faceLandmarker.current.setOptions({ runningMode: 'VIDEO' });
    }
    let results;
    let startTimeMs = performance.now();
    if (lastVideoTime !== videoRef.current.currentTime) {
      lastVideoTime = videoRef.current.currentTime;
      console.info('lastVideoTime', lastVideoTime);
      console.info('videoRef.current', videoRef.current);
      results = await faceLandmarker.current.detectForVideo(
        videoRef.current,
        startTimeMs
      );
      console.info('results', results);
    }
    if (!results) {
      requestAnimationFrame(predictWebcam);
      return;
    }

    if (results.faceLandmarks) {
      onResults(results);
      setLandmarks(results.faceLandmarks);
      
      drawConnectors(drawingUtils, results);
    }

    drawBlendShapes(results.faceBlendshapes);

    // Call this function again to keep predicting when the browser is ready.
    // if (webcamRunning === true) {
    //   window.requestAnimationFrame(predictWebcam);
    // }
    requestAnimationFrame(predictWebcam);
  }

  function drawConnectors(drawingUtils: any, results: any) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: '#C0C0C070', lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: '#FF3030' }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: '#FF3030' }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: '#30FF30' }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: '#30FF30' }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: '#E0E0E0' }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: '#E0E0E0' }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: '#FF3030' }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: '#30FF30' }
      );
    }
  }

  function drawBlendShapes(blendShapes: any[]) {
    const videoBlendShapes = document.getElementById('video-blend-shapes');
    if (!videoBlendShapes) {
      return;
    }
    if (!blendShapes.length) {
      return;
    }

    console.log(blendShapes[0]);

    let htmlMaker = '';
    blendShapes[0].categories.map((shape: any) => {
      htmlMaker += `
      <li>
        <span>${
          shape.displayName || shape.categoryName
        }</span>
        <span">${(+shape.score).toFixed(2)}</span>
      </li>
    `;
    });

    videoBlendShapes.innerHTML = htmlMaker;
  }


  return (
    <div>
      <div
        style={{ position: 'relative', display: 'flex', background: '#f2f2f2' }}
      >
        <div style={{ flex: 1 }}>
          <h2>Face Tracker & Object 3D Viewer</h2>
          <div>
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileChange}
            />
          </div>

          <ul style={{ textAlign: 'left' }}>
            <li>
              Eye:{' '}
              {eyes
                .map(
                  (item) =>
                    `[${[
                      item.x.toFixed(2),
                      item.y.toFixed(2),
                      item.z.toFixed(2),
                    ].join(', ')}]`
                )
                .join(', ')}
            </li>
            <li>
              Nose:{' '}
              {[nose.x.toFixed(2), nose.y.toFixed(2), nose.z.toFixed(2)].join(
                ', '
              )}
            </li>
            <li>
              Ears:{' '}
              {ears
                .map(
                  (item) =>
                    `[${[
                      item.x.toFixed(2),
                      item.y.toFixed(2),
                      item.z.toFixed(2),
                    ].join(', ')}]`
                )
                .join(', ')}
            </li>
          </ul>
          <ul style={{ textAlign: 'left' }}>
            <li>
              Position:{' '}
              {glassesPosition.map((item) => item.toFixed(2)).join(', ')}
            </li>
            <li>
              Rotation:{' '}
              {glassesRotation.map((item) => item.toFixed(2)).join(', ')}
            </li>
            <li>
              Scale: {glassesScale.map((item) => item.toFixed(2)).join(', ')}
            </li>
          </ul>

          <button
            style={{ margin: 20 }}
            onClick={() => {
              changeMode();
            }}
          >
            Change mode to  3D OBJECT
          </button>
        </div>

        {/* <div
          style={{
            position: 'fixed',
            width: 400,
            height: 400,
            overflow: 'scroll',
          }}
        >
          <ul id="video-blend-shapes"></ul>
        </div> */}

        <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{
              width: 640,
              height: 480,
            }}
          />
          {wh.width && wh.height && landmarks.length > 0 && gltf ? (
            <Canvas
              ref={canvasGlassesRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: wh.width,
                height: wh.height,
                // background: 'rgb(0,0,0,0.5)',
              }}
            >
              <primitive object={new AmbientLight(0xffffff, 0.5)} />
              <pointLight position={[10, 10, 10]} />
              <OrbitControls />
              <GlassesModel
                gltf={gltf}
                // landmarks={landmarks}
                position={glassesPosition}
                rotation={glassesRotation}
                scale={glassesScale}
              />
            </Canvas>
          ) : (
            false
          )}
        </div>

        <canvas ref={canvasRef} id="output_canvas"></canvas>
      </div>
    </div>
  );
}

export default TaskVisionGlasses;

function GlassesModel({ gltf, position, rotation, scale }: any) {
  useFrame(() => {
    // Update posisi dan rotasi kacamata di sini jika diperlukan
  });

  return (
    <primitive
      // object={model}
      object={gltf.scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

// function GlassesModel({ landmarks }: any) {
//   const glassesRef: any = useRef();

//   // Load the 3D model using @react-three/drei's useGLTF hook
//   const { scene } = useGLTF('/Excellent_1803_whitetransparant_2021.gltf'); // Ganti dengan path model kacamata

//   // Update glasses position and scale based on landmarks
//   useFrame(() => {
//     if (landmarks && glassesRef.current) {
//       const leftEye = landmarks[33]; // Mata kiri
//       const rightEye = landmarks[263]; // Mata kanan
//       const nose = landmarks[1]; // Hidung

//       const leftEar = landmarks[234]; // Landmark telinga kiri (sesuaikan dengan indeks yang tepat)
//       const rightEar = landmarks[454]; // Landmark telinga kanan (sesuaikan dengan indeks yang tepat)

//       // Hitung jarak antara mata kiri dan kanan untuk memperkirakan lebar wajah
//       // const faceWidth = Math.sqrt(
//       //   Math.pow(rightEye.x - leftEye.x, 2) +
//       //     Math.pow(rightEye.y - leftEye.y, 2) +
//       //     Math.pow(rightEye.z - leftEye.z, 2)
//       // );

//       // Tentukan faktor skala atau offset tambahan untuk menyesuaikan panjang pegangan
//       // const armLengthAdjustment = faceWidth * 0.1; // Adjust 0.1 as needed for arm length

//       // Hitung posisi dan skala kacamata di antara mata kiri dan kanan
//       const position = [
//         (leftEye.x + rightEye.x) / 2,
//         (leftEye.y + rightEye.y) / 2,
//         (leftEye.z + rightEye.z) / 2,
//       ];

//       // Hitung orientasi (rotasi) berdasarkan posisi mata
//       const dx = rightEye.x - leftEye.x;
//       const dy = rightEye.y - leftEye.y;
//       const rotation = [0, 0, Math.atan2(dy, dx)];

//       // // Hitung kedalaman rata-rata antara mata dan telinga
//       // const depth = (leftEar.z + rightEar.z) / 2;

//       glassesRef.current.position.set(dx, dy, rotation);

//       // Tentukan skala kacamata berdasarkan jarak
//       const scaleFactor = distance * 10;
//       glassesRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);

//       // Tentukan rotasi berdasarkan orientasi wajah
//       const dx = rightEye.x - leftEye.x;
//       const dy = rightEye.y - leftEye.y;
//       const angle = Math.atan2(dy, dx);
//       glassesRef.current.rotation.z = angle;
//     }
//   });

//   return <primitive ref={glassesRef} object={scene} />;
// }