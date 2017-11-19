import {
  OrthographicCamera,
  Scene,
  WebGLRenderer
} from 'three';
import DranimateMouseHandler from 'services/dranimate/mouseHandler';
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
    let mouseHandler;

    let isInRenderLoop = true;

/*****************************
    API
*****************************/

    this.setup = function (canvasContainer) {
      /* Initialize THREE canvas and scene */
      const width = window.innerWidth;
      const height = window.innerHeight;
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      // OrthographicCamera: left, right, top, bottom, near, far
      // puppet.z = 0, controlPoint.z = 10
      camera = new OrthographicCamera(-halfWidth, halfWidth, -halfHeight, halfHeight, CAMERA_DEPTH - 10, CAMERA_DEPTH + 1);
      scene = new Scene();
      renderer = new WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      renderer.setClearColor(0xFFFFFF, 1);
      canvasContainer.appendChild(renderer.domElement);
      camera.position.x = 0;
      camera.position.y = 0;
      camera.position.z = CAMERA_DEPTH;

      mouseHandler = new DranimateMouseHandler(renderer.domElement, panHandler);

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
      const matchingPuppet = puppets.find(puppet => puppet.id === p.id);
      if(matchingPuppet) {
        console.log('TODO: save puppet instead of adding');
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
      return mouseHandler.getSelectedPuppet();
    }

    this.deleteSelectedPuppet = function () {
      const selectedPuppet = mouseHandler.getSelectedPuppet();
      if (!selectedPuppet) {
        return;
      }
      const index = puppets.indexOf(selectedPuppet);
      selectedPuppet.cleanup();
      scene.remove(selectedPuppet.group);
      puppets.splice(index, 1);
      mouseHandler.onRemovePuppet();
    }

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

    // TODO: move event listeners out of this file
    document.addEventListener('keydown', $event => {
      if($event.code === 'Space' && this.getSelectedPuppet()) {
        this.getSelectedPuppet().startRecording();
      }
    }, false);
    document.addEventListener('keyup', $event => {
      if($event.code === 'Space' && this.getSelectedPuppet()) {
        this.getSelectedPuppet().finishRecording();
      }
    }, false);

    window.addEventListener('resize', $event => {
      refreshCamera();
      renderer.setSize( window.innerWidth, window.innerHeight );
    }, false );

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
    }

    function animate() {
      update();
      render();
      // if (isInRenderLoop) {
        requestAnimationFrame(animate);
      // }
    }

    function update() {
      puppets.forEach(puppet => puppet.update());
      panHandler.update(camera);
    }

    function render() {
      renderer.render( scene, camera );
    }

};

const dranimate = new Dranimate();
export default dranimate;
