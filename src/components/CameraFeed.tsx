import React, { useRef, useEffect } from 'react';

function CameraFeed() {
  const videoRef: any = useRef(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Gagal mengakses kamera:', err);
      }
    }

    startCamera();
  }, []);

  return <video ref={videoRef} autoPlay muted style={{ width: '100%' }} />;
}

export default CameraFeed;
