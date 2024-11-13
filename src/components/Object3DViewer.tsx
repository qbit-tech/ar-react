// import {GltfModel} from 'react-3d-viewer';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useState } from 'react';
import { AmbientLight } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function Object3DViewer({width, height, changeMode}: any) {
  const [gltfUrl, setGLTFUrl] = useState<string>();
  const [gltf, setGLTF] = useState<any>();
  
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

  return (
    <div>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'grey',
          padding: 10,
          textAlign: 'left',
          zIndex: 999,
          display: 'flex', 
          flexDirection: 'column',
        }}
      >
        <h2>Object 3D Viewer</h2>
        <input type="file" accept=".glb,.gltf" onChange={handleFileChange} />

        <button
          style={{ margin: 20 }}
          onClick={() => {
            changeMode();
          }}
        >
          Change mode to  FACE + GLASSES
        </button>
      </div>

      {gltf ? (
        <Canvas
          // ref={canvasGlassesRef}
          style={{
            width: '100vw',
            height: '100vh',
            background: '#f2f2f2',
          }}
        >
          <primitive object={new AmbientLight(0xffffff, 0.5)} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls />
          <GlassesModel gltf={gltf} />
        </Canvas>
      ) : (
        false
      )}
    </div>
  );
}

function GlassesModel({ gltf, position, rotation, scale }: any) {
  useFrame(() => {
    // Update posisi dan rotasi kacamata di sini jika diperlukan
  });

  return (
    <primitive
      // object={model}
      object={gltf.scene}
      // position={position}
      // rotation={rotation}
      // scale={scale}
    />
  );
}