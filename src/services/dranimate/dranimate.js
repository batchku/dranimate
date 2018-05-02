import {
  Group,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  BackSide,
  Vector3,
  Color,
} from 'three';
import Stats from 'stats.js';
import DranimateMouseHandler from 'services/dranimate/mouseHandler';
import DranimateLeapHandler from 'services/dranimate/leapHandler';
import DranimateTouchHandler from 'services/dranimate/touchHandler';
import { GifRecording, GifBuilder } from 'services/util/GifRecorder';
import PanHandler from 'services/util/panHandler';
import { clamp } from 'services/util/math';
import { loadTexture } from 'services/util/threeUtil';
import loadImage from 'services/util/imageLoader';

// const stats = new Stats();
// stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );

const ZOOM = {
  MIN: 0.5,
  MAX: 1.5
};
const CAMERA_DEPTH = 100;
const OUTLINE_Z_INDEX = 5;

const Dranimate = function () {
    let container;
    let camera, scene, renderer;
    const puppets = [];

    let zoom = 1.0;
    const panHandler = new PanHandler();
    let leapHandler;
    let mouseHandler;
    let touchHandler;

    let lastUpdateTimestamp = performance.now();
    let animationRequest;

    let isInRenderLoop = false;
    let gifRecording = new GifRecording(performance.now(), false);

    let backgroundColorMesh;
    let backgroundImageMesh;
    let backgroundWidthHeightRatio = 1;

    const getSelectedPuppet = () => mouseHandler.getSelectedPuppet() || touchHandler.getSelectedPuppet();

/*****************************
    API
*****************************/

    this.setup = function (canvasContainer, cssClass) {
      /* Initialize THREE canvas and scene */
      const halfWidth = window.innerWidth / 2;
      const halfHeight = window.innerHeight / 2;
      // OrthographicCamera: left, right, top, bottom, near, far
      // puppet.z = 0, controlPoint.z = 10
      camera = new OrthographicCamera(-halfWidth, halfWidth, -halfHeight, halfHeight, CAMERA_DEPTH - 10, CAMERA_DEPTH + 1);
      scene = new Scene();
      renderer = new WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0xFFFFFF, 0);
      canvasContainer.appendChild(renderer.domElement);
      camera.position.x = 0;
      camera.position.y = 0;
      camera.position.z = CAMERA_DEPTH;

      // TODO: make this a texture instead!!!
      renderer.domElement.classList.add(cssClass)

      mouseHandler = new DranimateMouseHandler(renderer.domElement, panHandler);
      touchHandler = new DranimateTouchHandler(renderer.domElement, panHandler);
      leapHandler = new DranimateLeapHandler(renderer.domElement, panHandler, puppets);

      const renderAreaSize = window.innerWidth;
      const scaleMultiplier = 2000;
      const halfSize = renderAreaSize / 2;
      const halfScale = scaleMultiplier / 2;

      const backgroundGeometry = new PlaneGeometry(renderAreaSize, renderAreaSize);
      const backgroundColorMaterial = new MeshBasicMaterial({color: 0xFFFFFF, side: BackSide});
      backgroundColorMesh = new Mesh(backgroundGeometry.clone(), backgroundColorMaterial);
      backgroundColorMesh.visible = false;
      scene.add(backgroundColorMesh);

      const backgroundImageMaterial = new MeshBasicMaterial({side: BackSide, transparent: true});
      backgroundImageMesh = new Mesh(backgroundGeometry.clone(), backgroundImageMaterial);
      backgroundImageMesh.visible = false;
      backgroundImageMesh.scale.y = -1;
      scene.add(backgroundImageMesh);

      const outlineSize = 10;
      const geometry = new PlaneGeometry(1, 1);
      const material = new MeshBasicMaterial({color: 0x666666, side: BackSide});

      const topPlane = new Mesh(geometry.clone(), material);
      const rightPlane = new Mesh(geometry.clone(), material);
      const bottomPlane = new Mesh(geometry.clone(), material);
      const leftPlane = new Mesh(geometry.clone(), material);

      topPlane.scale.x = renderAreaSize * scaleMultiplier;
      topPlane.scale.y = renderAreaSize * 2;
      rightPlane.scale.x = renderAreaSize * 2;
      rightPlane.scale.y = renderAreaSize * scaleMultiplier;
      bottomPlane.scale.x = renderAreaSize * scaleMultiplier;
      bottomPlane.scale.y = renderAreaSize * 2;
      leftPlane.scale.x = renderAreaSize * 2;
      leftPlane.scale.y = renderAreaSize * scaleMultiplier;

      const topPosition = new Vector3()
        .add(new Vector3(0, -renderAreaSize * 1.5, OUTLINE_Z_INDEX));
      const rightPosition = new Vector3()
        .add(new Vector3(renderAreaSize * 1.5, 0, OUTLINE_Z_INDEX));
      const bottomPosition = new Vector3()
        .add(new Vector3(0, renderAreaSize * 1.5, OUTLINE_Z_INDEX));
      const leftPosition = new Vector3()
        .add(new Vector3(-renderAreaSize * 1.5, 0, OUTLINE_Z_INDEX));
      topPlane.position.add(topPosition);
      rightPlane.position.add(rightPosition);
      bottomPlane.position.add(bottomPosition);
      leftPlane.position.add(leftPosition);
      scene.add(topPlane);
      scene.add(rightPlane);
      scene.add(bottomPlane);
      scene.add(leftPlane);

      refreshCamera();
      animate();
    }

    this.onMouseWheel = function(event) {
      let d = ((typeof e.wheelDelta != "undefined")?(-e.wheelDelta):e.detail);
      d *= 0.01;
      zoom += d;
      zoom = clamp(zoom, ZOOM.MIN, ZOOM.MAX);
      refreshCamera();
    };

    this.onMouseDown = event => mouseHandler.onMouseDown(event, puppets, zoom);

    this.onMouseMove = event => mouseHandler.onMouseMove(event, puppets, zoom);

    this.onMouseUp = event => mouseHandler.onMouseUp(event, puppets, zoom);

    this.onTouchStart = event => touchHandler.onTouchStart(event, puppets, zoom);

    this.onTouchMove = event => touchHandler.onTouchMove(event, puppets, zoom);

    this.onTouchEnd = event => touchHandler.onTouchEnd(event, puppets, zoom);

    this.hasPuppet = () => puppets.length > 0;

    this.setBackgroundColor = hexString => {
      const color = new Color(hexString);
      backgroundColorMesh.material.color = color;
      if (!backgroundColorMesh.visible) {
        backgroundColorMesh.visible = true;
      }
      if (!isInRenderLoop) {
        animate();
      }
    };

    this.setBackgroundImage = imageSource => {
      Promise.all([
        loadImage(imageSource),
        loadTexture(imageSource)
      ])
      .then(([image, texture]) => {
        const { width, height } = image;
        backgroundWidthHeightRatio = width / height;
        backgroundImageMesh.material.map && backgroundImageMesh.material.map.dispose();
        backgroundImageMesh.material.map = texture;
        backgroundImageMesh.scale.x = backgroundWidthHeightRatio;
        // if (width > height) {
        //   backgroundImageMesh.scale.y = -height / width;
        // }
        // else if (width < height) {
        //   backgroundImageMesh.scale.x = width / height;
        // }
        if (!backgroundImageMesh.visible) {
          backgroundImageMesh.visible = true;
        }
        if (!isInRenderLoop) {
          animate();
        }
      })
      .catch(error => console.log(error)); // TODO: error modal
    };

    this.setBackgroundImageSize = sizeMultiplier => {
      backgroundImageMesh.scale.x = backgroundWidthHeightRatio * sizeMultiplier;
      backgroundImageMesh.scale.y = -sizeMultiplier;
      if (!isInRenderLoop) {
        animate();
      }
    };

    this.clearBackground = () => {
      backgroundColorMesh.visible = false;
      backgroundImageMesh.visible = false;
      backgroundImageMesh.material.map && backgroundImageMesh.material.map.dispose();
      // TODO: clear and dispose texture
      if (!isInRenderLoop) {
        animate();
      }
    };

    this.addPuppet = function (p) {
      const matchingIndex = puppets.findIndex(puppet => puppet.id === p.id);
      if(matchingIndex > -1) {
        this.removePuppetByIndex(matchingIndex);
      }
      puppets.push(p);
      scene.add(p.group);
    }

    this.movePuppet = function (puppet, val) {
      const currentIndex = puppets.findIndex(p => p === puppet);
      if (currentIndex === undefined) { return; }
      const targetIndex = currentIndex + val;
      if (targetIndex < 0 || targetIndex >= puppets.length) { return; }

      puppets.splice(currentIndex, 1);
      puppets.splice(targetIndex, 0, puppet);
      scene.children.forEach((obj) => {
        if (obj.type !== 'Group') { return; }
        const puppetIndex = puppets.findIndex(puppet => puppet.group === obj);
        const renderIndex = puppetIndex + 1;
        obj.children.forEach(child => child.renderOrder = renderIndex);
      });
    }

    this.zoomIn = function () {
      if (zoom >= ZOOM.MAX) { return; }
      zoom += 0.1;
      //panPosition.x -= (0.1)*window.innerWidth/2;
      //panPosition.y -= (0.1)*window.innerHeight/2;
      refreshCamera();
    }

    this.zoomOut = function () {
      if (zoom <= ZOOM.MIN) { return; }
      zoom -= 0.1;
      //panPosition.x += (0.1)*window.innerWidth/2;
      //panPosition.y += (0.1)*window.innerHeight/2;
      refreshCamera();
    }

    this.setPanEnabled = function (isEnabled) {
      panHandler.setPanEnabled(isEnabled);
      renderer.domElement.style.cursor = isEnabled ? 'move' : 'default';
    }

    this.deleteSelectedPuppet = function () {
      const selectedPuppet = getSelectedPuppet();
      if (!selectedPuppet) {
        return;
      }
      const index = puppets.indexOf(selectedPuppet);
      this.removePuppetByIndex(index);
      mouseHandler.onRemovePuppet();
      touchHandler.onRemovePuppet();
    }

    this.removePuppetByIndex = function(index) {
      const puppet = puppets[index];
      if (!puppet) {
        return;
      }
      scene.remove(puppet.group);
      puppet.cleanup();
      puppets.splice(index, 1);
    }

    this.getSelectedPuppet = () => getSelectedPuppet();

    this.setRecording = function(isRec) {
      if (getSelectedPuppet()) {
        isRec ?
          getSelectedPuppet().startRecording() :
          getSelectedPuppet().stopRecording();
      }
    };

    this.setGifIsRecording = function(isRec) {
      if (isRec) {
        gifRecording = new GifRecording(performance.now(), true);
        return;
      }
      else {
        this.stopRenderLoop();
        const gifBuilder = new GifBuilder();
        const { targetTimestamps, gifTimestep } = gifRecording.stop(performance.now(), puppets);
        targetTimestamps.forEach((targetTimestamp) => {
          puppets.forEach(puppet => puppet.update(gifTimestep, targetTimestamp));
          renderer.render(scene, camera);
          gifBuilder.recordFrame(renderer.domElement, gifTimestep);
        });
        return gifBuilder;
      }
    }

    this.startRenderLoop = () => {
      if (isInRenderLoop) { return; }
      isInRenderLoop = true;
      animate();
    };

    this.stopRenderLoop = () => {
      isInRenderLoop = false;
      cancelAnimationFrame(animationRequest);
      setTimeout(() => animate());
    };

/*****************************
    Dom events
*****************************/

    window.addEventListener('resize', $event => refreshCamera(), false );

/*****************************
    Draw/update loop
*****************************/

    function refreshCamera() {
      const width = window.innerWidth / 2 / zoom;
      const height = window.innerHeight / 2 / zoom
      camera.left = -width;
      camera.right = width;
      camera.top = -height;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (!isInRenderLoop) {
        animate();
      }
    }

    function animate() {
      const now = performance.now();
      const elapsedTime = now - lastUpdateTimestamp;
      // stats.begin();
      lastUpdateTimestamp = now;
      update(elapsedTime);
      render(elapsedTime);
      if (isInRenderLoop) {
        animationRequest = requestAnimationFrame(animate);
      }
    }

    function update(elapsedTime) {
      leapHandler.update(getSelectedPuppet());
      puppets.forEach(puppet => puppet.update(elapsedTime));
      panHandler.update(camera);
    }

    function render(elapsedTime) {
      renderer.render(scene, camera);
      gifRecording.setFrame(performance.now());
      // stats.end();
    }

};

const dranimate = new Dranimate();
export default dranimate;
