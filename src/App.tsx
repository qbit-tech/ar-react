import { useEffect } from 'react';
import './App.css';
import CameraFeed from './components/CameraFeed';
import FaceMeshGlasses from './components/FaceMeshGlasses';
import TaskVisionGlasses from './components/TaskVisionGlasses';
// import FaceTrackingGlasses4 from './components/FaceTrackingGlasses4';
// import { Glasses } from './components/Glasses';
// import {app} from './indexApp';

function App() {

  // useEffect(() => {
  //   app();
  // }, []);

  return (
    <div className="App">
      {/* <FaceMeshGlasses /> */}

      <TaskVisionGlasses />
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
