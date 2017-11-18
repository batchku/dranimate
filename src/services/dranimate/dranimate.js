import * as THREE from 'three';
import PanHandler from 'services/dranimate/panHandler';
import { clamp } from 'services/util/math';

const ZOOM = {
  MIN: 0.1,
  MAX: 3
};
const CAMERA_DEPTH = 100;
const MOUSE_STATE = {
  UP: 'UP',
  DOWN: 'DOWN',
  OUTSIDE: 'OUTSIDE',
};

var Dranimate = function () {
    /* debugging memory issue */

    var that = this;

    var container;

    var camera, scene, renderer;

    var mouseState = MOUSE_STATE.UP;
    var mouseRelative = {x:0, y:0};
    var mouseAbsolute = {x:0, y:0};

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var activeControlPoint = { hoveredOver: false, valid:false };

    var puppets = [];

    var controlPointToControl = 0;

    var zoom = 1.0;
    const panHandler = new PanHandler();

    var renderWireframes = false;

    var selectedPuppet = null;

    let isInRenderLoop = true;

    const updateMousePosition = (x,y) => {
      const boundingRect = renderer.domElement.getBoundingClientRect();
      mouseAbsolute = {
        x: x - boundingRect.left,
        y: y - boundingRect.top
      };
      mouseRelative = {
        x: (x - boundingRect.left - window.innerWidth / 2) / zoom - panHandler.getPanPosition().x,
        y: (y - boundingRect.top - window.innerHeight / 2) / zoom - panHandler.getPanPosition().y
      };
    }

    const getPuppetAndControlPointFromPostion = (x, y, distanceThreshold) => {
      let activeControlPoint;
      for(var p = 0; p < puppets.length; p++) { // WHY LOOP OVER ALL PUPPETS?
        const puppet = puppets[p];
        const verts = puppet.threeMesh.geometry.vertices;
        const controlPoints = puppet.controlPoints;

        const closeControlPointIndex = controlPoints.findIndex((controlPoint, index) => {
          const mouseVector = new THREE.Vector2(mouseRelative.x / puppet.getScale(), mouseRelative.y / puppet.getScale());
          mouseVector.rotateAround(puppet.getRotationCenter(), -puppet.getRotation());
          const vert = verts[controlPoint];
          const dist = vert.distanceTo(new THREE.Vector3(mouseVector.x, mouseVector.y, 0));
          return (dist < 10 * zoom);
        });

        if (closeControlPointIndex > -1) {
          activeControlPoint = {
            valid: true,
            puppetIndex: p,
            hoveredOver: true,
            beingDragged: false,
            controlPointIndex: closeControlPointIndex
          };
        }

      }
      return activeControlPoint;
    };

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
      camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, -halfHeight, halfHeight, CAMERA_DEPTH - 10, CAMERA_DEPTH + 1);
      scene = new THREE.Scene();
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      renderer.setClearColor(0xFFFFFF, 1);
      canvasContainer.appendChild(renderer.domElement);
      camera.position.x = 0;
      camera.position.y = 0;
      camera.position.z = CAMERA_DEPTH;
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

    const setWireframeVisibility = () => {
      puppets.forEach(puppet => puppet.setSelectionGUIVisible(puppet === selectedPuppet));
    };

    this.onMouseDown = function(event) {
      updateMousePosition(event.clientX, event.clientY);
      mouseState = MOUSE_STATE.DOWN;

      if(panHandler.getPanEnabled()) {
        panHandler.onMouseDown(mouseAbsolute.x, mouseAbsolute.y, zoom);
        return;
      }

      if(activeControlPoint.hoveredOver) {
        selectedPuppet = puppets[activeControlPoint.puppetIndex];
        activeControlPoint.beingDragged = true;
        setWireframeVisibility();
        return;
      }

      // the notion of a selected puppet is only relative to mouse / touch, not leap motion
      selectedPuppet = puppets.find(puppet => puppet.pointInsideMesh(mouseRelative.x, mouseRelative.y));
      if (selectedPuppet) {
        selectedPuppet.setSelectionState(true, mouseRelative.x, mouseRelative.y);
      }
      setWireframeVisibility();

    };

    this.onMouseMove = function(event) {
      updateMousePosition(event.clientX, event.clientY);

      /* Find control point closest to the mouse */

      if(panHandler.getPanEnabled() && mouseState === MOUSE_STATE.DOWN) {
        panHandler.onMouseMove(mouseAbsolute.x, mouseAbsolute.y, zoom);
        return;
      }

      if (activeControlPoint.beingDragged) {
        // control point is being dragged by mouse
        const puppet = puppets[activeControlPoint.puppetIndex];
        const ci = activeControlPoint.controlPointIndex;
        const mouseVector = new THREE.Vector2(mouseRelative.x / puppet.getScale(), mouseRelative.y / puppet.getScale());
        mouseVector.rotateAround(puppet.getRotationCenter(), -puppet.getRotation());
        puppet.setControlPointPosition(ci, mouseVector.x, mouseVector.y);
        return;
      }

      if(selectedPuppet && selectedPuppet.selectionState.isBeingDragged) {
        selectedPuppet.incrementPosition(mouseRelative.x, mouseRelative.y);
        return;
      }

      // Mouse hover states
      const activeCp = getPuppetAndControlPointFromPostion(mouseRelative.x, mouseRelative.y, 10);
      if (activeCp) {
        activeControlPoint = activeCp;
        renderer.domElement.parentNode.style.cursor = 'pointer';
      }
      else {
        renderer.domElement.parentNode.style.cursor = 'default';
        activeControlPoint.hoveredOver = false;
      }

    };

    this.onMouseUp = function(event) {
      updateMousePosition(event.clientX, event.clientY);
      mouseState = MOUSE_STATE.UP;
      if (panHandler.getPanEnabled()) {
        return;
      }
      activeControlPoint.beingDragged = false;
      if (selectedPuppet) {
        selectedPuppet.setSelectionState(false);
      }
    };

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
        return selectedPuppet;
    }

    this.deleteSelectedPuppet = function () {
      if(selectedPuppet) {
        var index = puppets.indexOf(selectedPuppet);
        scene.remove(selectedPuppet.threeMesh);
        scene.remove(selectedPuppet.boundingBox);
        for(var i = 0; i < selectedPuppet.controlPointSpheres.length; i++) {
          scene.remove(selectedPuppet.controlPointSpheres[i]);
        }
        selectedPuppet.cleanup();
        puppets.splice(index, 1);

        selectedPuppet = null;
      }
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
