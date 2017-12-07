import {
  OrthographicCamera,
  Scene,
  WebGLRenderer
} from 'three';
import DranimateMouseHandler from 'services/dranimate/mouseHandler';
import DranimateLeapHandler from 'services/dranimate/leapHandler';
import DranimateTouchHandler from 'services/dranimate/touchHandler';
import PanHandler from 'services/util/panHandler';
import { clamp } from 'services/util/math';

const ZOOM = {
  MIN: 0.1,
  MAX: 3
};
const CAMERA_DEPTH = 100;

var Dranimate = function () {
    /* debugging memory issue */

    let that = this;

    let container;

    let camera, scene, renderer;

    const puppets = [];

    // var controlPointToControl = 0;

    let zoom = 1.0;
    const panHandler = new PanHandler();
    let leapHandler;
    let mouseHandler;
    let touchHandler;

    let isInRenderLoop = true;
    let isRecording = false;

/*****************************
    API
*****************************/

    this.setup = function (canvasContainer) {
      /* Initialize THREE canvas and scene */
      const halfWidth = window.innerWidth / 2;
      const halfHeight = window.innerHeight / 2;
      // OrthographicCamera: left, right, top, bottom, near, far
      // puppet.z = 0, controlPoint.z = 10
      camera = new OrthographicCamera(-halfWidth, halfWidth, -halfHeight, halfHeight, CAMERA_DEPTH - 10, CAMERA_DEPTH + 1);
      scene = new Scene();
      renderer = new WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      // renderer.setSize(width, height);
      renderer.setClearColor(0xFFFFFF, 1);
      canvasContainer.appendChild(renderer.domElement);
      camera.position.x = 0;
      camera.position.y = 0;
      camera.position.z = CAMERA_DEPTH;

      mouseHandler = new DranimateMouseHandler(renderer.domElement, panHandler);
      touchHandler = new DranimateTouchHandler(renderer.domElement, panHandler);
      leapHandler = new DranimateLeapHandler(renderer.domElement, panHandler, puppets);

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

    // this.createNewPuppet = function (vertices, faces, controlPoints, image, imageNoBG) {
    //
    //     /* Create the new Puppet */
    //
    //     var puppet = new Puppet(image, imageNoBG);
    //     puppet.generateMesh(vertices, faces, controlPoints, scene);
    //     puppets.push(puppet);
    //
    // }

    this.addPuppet = function (p) {
      const matchingIndex = puppets.findIndex(puppet => puppet.id === p.id);
      if(matchingIndex > -1) {
        this.removePuppetByIndex(matchingIndex);
      }
      puppets.push(p);
      scene.add(p.group);
    }

    this.zoomIn = function () {
        zoom += 0.1;
        zoom = clamp(zoom, ZOOM.MIN, ZOOM.MAX);
        //panPosition.x -= (0.1)*window.innerWidth/2;
        //panPosition.y -= (0.1)*window.innerHeight/2;

        refreshCamera();
        camera.updateProjectionMatrix();
    }

    this.zoomOut = function () {
        zoom -= 0.1;
        zoom = clamp(zoom, ZOOM.MIN, ZOOM.MAX);
        //panPosition.x += (0.1)*window.innerWidth/2;
        //panPosition.y += (0.1)*window.innerHeight/2;

        refreshCamera();
        camera.updateProjectionMatrix();
    }

    this.setPanEnabled = function (isEnabled) {
      panHandler.setPanEnabled(isEnabled);
      renderer.domElement.style.cursor = isEnabled ? 'move' : 'default';
    }

    this.getSelectedPuppet = function () {
      return mouseHandler.getSelectedPuppet() || touchHandler.getSelectedPuppet();
    }

    this.deleteSelectedPuppet = function () {
      const selectedPuppet = this.getSelectedPuppet();
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
      puppet.cleanup();
      scene.remove(puppet.group);
      puppets.splice(index, 1);
    }

    this.setRecording = function(isRec) {
      isRecording = isRec;
      if (this.getSelectedPuppet()) {
        isRecording ?
          this.getSelectedPuppet().startRecording() :
          this.getSelectedPuppet().stopRecording();
      }
    };

    // this.startRenderLoop = () => {
    //   isInRenderLoop = true;
    //   this.animate();
    // };
    //
    // this.stopRenderLoop = () => {
    //   isInRenderLoop = false;
    // };

/*****************************
    Dom events
*****************************/

    // // TODO: move event listeners out of this file
    // document.addEventListener('keydown', $event => {
    //   if($event.code === 'Space' && this.getSelectedPuppet()) {
    //     this.getSelectedPuppet().startRecording();
    //   }
    // }, false);
    // document.addEventListener('keyup', $event => {
    //   if($event.code === 'Space' && this.getSelectedPuppet()) {
    //     this.getSelectedPuppet().finishRecording();
    //   }
    // }, false);

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
    }

    function animate() {
      update();
      render();
      // if (isInRenderLoop) {
        requestAnimationFrame(animate);
      // }
    }

    function update() {
      puppets.forEach(puppet => puppet.update(isRecording));
      panHandler.update(camera);
    }

    function render() {
      renderer.render( scene, camera );
    }

};

const dranimate = new Dranimate();
export default dranimate;
