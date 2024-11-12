/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {VIDEO_SIZE} from './shared/params';
import {drawResults, isMobile} from './shared/util';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


export class Camera {
  constructor() {
    this.video = document.getElementById('video');
    // this.canvas = document.getElementById('output');
    this.canvasGlasses = document.getElementById('output-glasses');
    // this.ctx = this.canvas.getContext('2d');
    this.ctxGlasses =
      this.canvasGlasses.getContext('webgl') ||
      this.canvasGlasses.getContext('webgl2');
    this.glasses = [];
  }

  /**
   * Initiate a Camera instance and wait for the camera stream to be ready.
   * @param cameraParam From app `STATE.camera`.
   */
  static async setupCamera(cameraParam) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
          'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const {targetFPS, sizeOption} = cameraParam;
    const $size = VIDEO_SIZE[sizeOption];
    const videoConfig = {
      'audio': false,
      'video': {
        facingMode: 'user',
        // Only setting the video to a specified size for large screen, on
        // mobile devices accept the default size.
        width: isMobile() ? VIDEO_SIZE['360 X 270'].width : $size.width,
        height: isMobile() ? VIDEO_SIZE['360 X 270'].height : $size.height,
        frameRate: {
          ideal: targetFPS,
        },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

    const camera = new Camera();
    camera.video.srcObject = stream;

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = (vid) => {
        resolve(vid);
      };
    });

    camera.video.play();

    const videoWidth = camera.video.videoWidth;
    const videoHeight = camera.video.videoHeight;
    // Must set below two lines, otherwise video element doesn't show.
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    // camera.canvas.width = videoWidth;
    // camera.canvas.height = videoHeight;
    // const canvasContainer = document.querySelector('.canvas-wrapper');
    // canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;


    camera.canvasGlasses.width = videoWidth;
    camera.canvasGlasses.height = videoHeight;
    const canvasGlassesContainer = document.querySelector('.canvas-wrapper-glasses');
    canvasGlassesContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;

    // Because the image from camera is mirrored, need to flip horizontally.
    // camera.ctx.translate(camera.video.videoWidth, 0);
    // camera.ctx.scale(-1, 1);

    // camera.ctxGlasses.translate(camera.video.videoWidth, 0);
    // camera.ctxGlasses.scale(-1, 1);

    return camera;
  }

  drawCtx() {
    // this.ctx.drawImage(
    //     this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
  }

  drawResults(faces, triangulateMesh, boundingBox) {
    // drawResults(this.ctx, faces, triangulateMesh, boundingBox);
  }

  //
  initThree() {
    if (this.renderer) {
      this.renderer.dispose(); // Dispose of any existing renderer
    }
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasGlasses,
      alpha: true,
      // context: this.canvasGlasses.getContext('webgl2'),
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    camera.position.z = 5;

    console.info('before load gltf');
    // Load glasses model
    const loader = new GLTFLoader();
    loader.load(
      'https://api.klinikmatta.id/static/object_3d/Excellent_1803_whitetransparant_2021.gltf',
      (gltf) => {
        console.info('gltf.scene', gltf.scene);
        const modelGlasses = gltf.scene;
        modelGlasses.scale.set(0.1, 0.1, 0.1);
        scene.add(modelGlasses);
        // cb(modelGlasses);
        this.glasses = modelGlasses;
        // setGlasses(modelGlasses); // Save reference to glasses
      },
      undefined,
      (error) => console.error('Error loading glasses model:', error)
    );
    console.info('after load gltf');

    // Save renderer, scene, camera in refs
    this.canvasGlasses.renderer = this.renderer;
    this.canvasGlasses.scene = scene;
    this.canvasGlasses.camera = camera;
  }
}
