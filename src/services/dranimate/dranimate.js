import * as THREE from 'three';
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
const SELECT_STATE = {
  PAN: 'PAN',
  CONTROL_POINT: 'CONTROL_POINT',
  SELECT: 'SELECT',
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

    var panEnabled = false;
    var zoom = 1.0;
    var panPosition = {x:0, y:0};
    var panFromPosition = {x:0, y:0}

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
        x: (x - boundingRect.left - window.innerWidth / 2) / zoom - panPosition.x,
        y: (y - boundingRect.top - window.innerHeight / 2) / zoom - panPosition.y
      };
    }

    // const getPuppetAndControlPointFromPostion = (x, y, distanceThreshold) => {
    //
    //   for(var p = 0; p < puppets.length; p++) { // WHY LOOP OVER ALL PUPPETS?
    //     const puppet = puppets[p];
    //
    //       // if(puppet.hasMeshData) {
    //
    //     const verts = puppet.threeMesh.geometry.vertices;
    //     const controlPoints = puppet.controlPoints;
    //
    //     const closeControlPointIndex = controlPoints.findIndex((controlPoint, index) => {
    //       const mouseVector = new THREE.Vector2(mouseRelative.x / puppet.getScale(), mouseRelative.y / puppet.getScale());
    //       mouseVector.rotateAround(puppet.getRotationCenter(), -puppet.getRotation());
    //       const vert = verts[controlPoint];
    //       const dist = vert.distanceTo(new THREE.Vector3(mouseVector.x, mouseVector.y, 0));
    //       return (dist < 10 * zoom);
    //     });
    //
    //     if (closeControlPointIndex > -1) {
    //       activeControlPoint = {
    //         valid: true,
    //         puppetIndex: p,
    //         hoveredOver: true,
    //         beingDragged: false,
    //         controlPointIndex: closeControlPointIndex
    //       };
    //       foundControlPoint = true;
    //     }
    //
    //   }
    //
    //   if (foundControlPoint) {
    //     return {
    //       puppet: puppets[activeControlPoint.puppetIndex],
    //       controlPoint: puppets[activeControlPoint.puppetIndex].controlPoints[activeControlPoint.controlPointIndex]
    //     };
    //   }
    // };

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

    this.onMouseDown = function(event) {
      updateMousePosition(event.clientX, event.clientY);
      mouseState = MOUSE_STATE.DOWN;

      if(panEnabled) {
        panFromPosition.x = mouseAbsolute.x / zoom;
        panFromPosition.y = mouseAbsolute.y / zoom;
        return;
      }

      if(activeControlPoint.hoveredOver) {
        selectedPuppet = puppets[activeControlPoint.puppetIndex];
        activeControlPoint.beingDragged = true;
        return;
      }

      // the notion of a selected puppet is only relative to mouse / touch, not leap motion
      selectedPuppet = puppets.find(puppet => puppet.pointInsideMesh(mouseRelative.x, mouseRelative.y));
      if (selectedPuppet) {
        selectedPuppet.setSelectionState(true, mouseRelative.x, mouseRelative.y);
      }

    };

    this.onMouseMove = function(event) {
      updateMousePosition(event.clientX, event.clientY);

      /* Find control point closest to the mouse */

      if(panEnabled && mouseState === MOUSE_STATE.DOWN) {
        panPosition.x += mouseAbsolute.x / zoom - panFromPosition.x;
        panPosition.y += mouseAbsolute.y / zoom - panFromPosition.y;
        panFromPosition.x = mouseAbsolute.x / zoom;
        panFromPosition.y = mouseAbsolute.y / zoom;
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


      // // start process of finding control point
      // // TODO: break each nested layer into named function
      let foundControlPoint = false;

      for(var p = 0; p < puppets.length; p++) { // WHY LOOP OVER ALL PUPPETS?
        const puppet = puppets[p];

          // if(puppet.hasMeshData) {

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
          foundControlPoint = true;
        }

      }

      // const puppetControlPointPair = getPuppetAndControlPointFromPostion(mouseVector.x, mouseVector.y, 10);

      if(foundControlPoint) {
        renderer.domElement.parentNode.style.cursor = "pointer";
      } else {
        renderer.domElement.parentNode.style.cursor = "default";
        activeControlPoint.hoveredOver = false;
      }

    };

    this.onMouseUp = function(event) {
      updateMousePosition(event.clientX, event.clientY);
      mouseState = MOUSE_STATE.UP;
      if (panEnabled) {
        return;
      }
      activeControlPoint.beingDragged = false;
      if (selectedPuppet) {
        selectedPuppet.setSelectionState(false);
      }
      // renderer.domElement.parentNode.style.cursor = "default";
    };

    this.onCurrentPuppetChange = function (callback) {
        onCurrentPuppetChangeCallback = callback;
    }

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
        panEnabled = isEnabled;
        renderer.domElement.parentNode.style.cursor = isEnabled ? 'move' : 'default';
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

    this.toggleRenderWireframes = () => {
      renderWireframes = !renderWireframes;
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

    function animate() {
      // console.log('render')
      requestAnimationFrame(animate);
      update();
      render();
      // if (isInRenderLoop) {
      //   requestAnimationFrame(animate);
      // }
    }

    function update() {

        for(var i = 0; i < puppets.length; i++) {
            puppets[i].update();
        }

    }

    function refreshCamera() {
      const width = window.innerWidth / 2 / zoom;
      const height = window.innerHeight / 2 / zoom
      camera.left = -width;
      camera.right = width;
      camera.top = -height;
      camera.bottom = height;
      camera.updateProjectionMatrix();
    }

    function render() {
      for(var i = 0; i < puppets.length; i++) {
          puppets[i].setRenderWireframe(renderWireframes);
          puppets[i].setSelectionGUIVisible(false); // TODO: this should be in mouse
      }
      // TODO: move to click listener
      if(selectedPuppet) {
          selectedPuppet.setSelectionGUIVisible(true);
      }
      // TODO: move to click listener
      if(activeControlPoint && activeControlPoint.hoveredOver) {
          puppets[activeControlPoint.puppetIndex].controlPointSpheres[activeControlPoint.controlPointIndex].visible = true;
      }

      camera.position.x = -panPosition.x;
      camera.position.y = -panPosition.y;
      // camera.position.z = 100;

      renderer.render( scene, camera );
    }

};

const dranimate = new Dranimate();
export default dranimate;
