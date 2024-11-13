import { useEffect, useState } from 'react';
import './App.css';
import FaceMeshGlasses from './components/FaceMeshGlasses';
import Object3DViewer from './components/Object3DViewer';
// import Object3DViewer from './components/Object3DViewer';
import TaskVisionGlasses from './components/TaskVisionGlasses';
// import FaceTrackingGlasses4 from './components/FaceTrackingGlasses4';
// import { Glasses } from './components/Glasses';
// import {app} from './indexApp';

function App() {
  const location = window.location;
  console.info('location', location);
  const [mode, setMode] = useState<'TaskVisionGlasses' | '3DObjectViewer' | undefined>(location.pathname === '/3d-object' ? '3DObjectViewer' : location.pathname === '/face-glasses' ? 'TaskVisionGlasses' : undefined);

  return (
    <div className="App">
      {/* <FaceMeshGlasses /> */}

      {mode === 'TaskVisionGlasses' ? (
        <TaskVisionGlasses changeMode={() => {
          setMode('3DObjectViewer');
          window.location.href = window.location.origin + '/3d-object';
        }} />
      ) : mode === '3DObjectViewer' ? (
        <div style={{ position: 'relative' }}>
          <Object3DViewer width={640} height={480} changeMode={() => {
            setMode('TaskVisionGlasses');
            window.location.href = window.location.origin + '/face-glasses';
          }} />
        </div>
      ) : (
        false
      )}

      <div style={{ padding: 50 }}>
        {!mode && (
          <button
            style={{ margin: 20 }}
            onClick={() => {
              setMode('TaskVisionGlasses');
              window.location.href = window.location.origin + '/face-glasses';
            }}
          >
            FACE + GLASSES
          </button>
        )}

        {!mode && (
          <button
            style={{ margin: 20 }}
            onClick={() => {
              setMode('3DObjectViewer');
              window.location.href = window.location.origin + '/3d-object';
            }}
          >
            3D OBJECT VIEWER
          </button>
        )}
      </div>

      {/* <FaceTrackingGlasses4 /> */}
      {/* <CameraFeed /> */}
      {/* <Glasses /> */}
      {/* <button onClick={() => app()}>START</button>
      <div id="stats"></div>
      <div id="main">
        <div className="container">
          <div className="canvas-wrapper-glasses">
            <canvas id="output-glasses"></canvas>
          </div>
          <div className="canvas-wrapper">
            <canvas id="output"></canvas>
            <video
              id="video"
              playsInline
              style={{
                // '-webkit-transform': 'scaleX(-1)',
                transform: 'scaleX(-1)',
                visibility: 'hidden',
                width: 'auto',
                height: 'auto',
              }}
            ></video>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default App;
