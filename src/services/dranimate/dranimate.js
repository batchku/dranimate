import * as THREE from 'three';
import FileSaver from 'file-saver';

var Dranimate = function () {
    /* debugging memory issue */

    var that = this;

    var container;

    var camera, scene, renderer;

    var mouseState = {down: false};
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

    var onChangeCallback = function () {};

    let isInRenderLoop = true;

    const updateMousePosition = (x,y) => {
      const boundingRect = renderer.domElement.getBoundingClientRect();
      mouseAbsolute = {
        x: x - boundingRect.left,
        y: y - boundingRect.top
      };
      mouseRelative = {
        x: (x - boundingRect.left-window.innerWidth/2) / zoom - panPosition.x,
        y: (y - boundingRect.top-window.innerHeight/2) / zoom - panPosition.y
      };
    }

/*****************************
    API
*****************************/

    this.onChange = function (callback) {
        onChangeCallback = callback;
    }

    this.setup = function (canvasContainer) {

        /* Initialize THREE canvas and scene */

        camera = new THREE.OrthographicCamera( 0,
                                               window.innerWidth,
                                               0,
                                               window.innerHeight,
                                               0.1, 1000 );
        refreshCamera();

        scene = new THREE.Scene();

        var ambient = new THREE.AmbientLight( 0x101030 );
        scene.add( ambient );

        var directionalLight = new THREE.DirectionalLight( 0xffeedd );
        directionalLight.position.set( 0, 0, 1 );
        scene.add( directionalLight );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor( 0xFFFFFF, 1 );
        canvasContainer.appendChild( renderer.domElement );

        animate();
    }

    this.onMouseWheel = function(event) {
      var d = ((typeof e.wheelDelta != "undefined")?(-e.wheelDelta):e.detail);
      d *= 0.01;

      zoom += d;

      refreshCamera();
    };

    this.onMouseDown = function(event) {
      updateMousePosition(event.clientX, event.clientY);
      mouseState.down = true;

      if(panEnabled) {
          panFromPosition.x = mouseAbsolute.x/zoom;
          panFromPosition.y = mouseAbsolute.y/zoom;
      } else {

          if(activeControlPoint.hoveredOver) {
              selectedPuppet = puppets[activeControlPoint.puppetIndex];
              activeControlPoint.beingDragged = true;
          } else {
              selectedPuppet = null;
              for(var i = 0; i < puppets.length; i++) {
                  if(puppets[i].pointInsideMesh(mouseRelative.x, mouseRelative.y)) {
                      selectedPuppet = puppets[i];
                      selectedPuppet.isBeingDragged = true;
                      selectedPuppet.dragFromPositionX = mouseRelative.x;
                      selectedPuppet.dragFromPositionY = mouseRelative.y;
                  }
              }
          }
          onChangeCallback();
      }
    };

    this.onMouseMove = function(event) {
      updateMousePosition(event.clientX, event.clientY);

      /* Find control point closest to the mouse */

      if(panEnabled) {

          renderer.domElement.parentNode.style.cursor = "move";

          if(mouseState.down) {
              panPosition.x += mouseAbsolute.x/zoom - panFromPosition.x;
              panPosition.y += mouseAbsolute.y/zoom - panFromPosition.y;
              panFromPosition.x = mouseAbsolute.x/zoom;
              panFromPosition.y = mouseAbsolute.y/zoom;
          }
      } else {
          if(!activeControlPoint.beingDragged) {

              var foundControlPoint = false;

              for(var p = 0; p < puppets.length; p++) {

                  if(puppets[p].hasMeshData) {

                      var verts = puppets[p].threeMesh.geometry.vertices;
                      var controlPoints = puppets[p].controlPoints;

                      for(var c = 0; c < controlPoints.length; c++) {
                        const mouseVector = new THREE.Vector2(mouseRelative.x / puppets[p].scale(), mouseRelative.y / puppets[p].scale());
                        mouseVector.rotateAround(new THREE.Vector2(0, 0), -puppets[p].rotation());

                          const vert = verts[controlPoints[c]];
                          const dist = vert.distanceTo(new THREE.Vector3(mouseVector.x, mouseVector.y, 0));

                          if(dist < 10 * zoom) {
                              activeControlPoint = {
                                  valid: true,
                                  puppetIndex: p,
                                  hoveredOver: true,
                                  beingDragged: false,
                                  controlPointIndex: c
                              };
                              foundControlPoint = true;
                              break;
                          }
                      }
                  }
              }

              if(foundControlPoint) {
                  renderer.domElement.parentNode.style.cursor = "pointer";
              } else {
                  renderer.domElement.parentNode.style.cursor = "default";
                  activeControlPoint.hoveredOver = false;
              }
          } else {
            // control point is being dragged by mouse
            const puppet = puppets[activeControlPoint.puppetIndex];
            const ci = activeControlPoint.controlPointIndex;
            const mouseVector = new THREE.Vector2(mouseRelative.x / puppet.scale(), mouseRelative.y / puppet.scale());
            mouseVector.rotateAround(new THREE.Vector2(0, 0), -puppet.rotation());
            puppet.setControlPointPosition(ci, mouseVector.x, mouseVector.y);
            onChangeCallback();
          }

          if(selectedPuppet && selectedPuppet.isBeingDragged) {
              selectedPuppet.x(
                mouseRelative.x - selectedPuppet.dragFromPositionX,
                true // doIncrement flag, to specify incremental update
              );
              selectedPuppet.y(
                mouseRelative.y - selectedPuppet.dragFromPositionY,
                true
              );
              selectedPuppet.dragFromPositionX = mouseRelative.x;
              selectedPuppet.dragFromPositionY = mouseRelative.y;
              onChangeCallback();
          }
      }
    };

    this.onMouseUp = function(event) {
      updateMousePosition(event.clientX, event.clientY);
      mouseState.down = false;

      if(panEnabled) {

      } else {
          if(activeControlPoint) {
              activeControlPoint.beingDragged = false;
              renderer.domElement.parentNode.style.cursor = "default";
          }

          if(selectedPuppet) {
              selectedPuppet.isBeingDragged = false;
          }
      }
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

        if(p.controlPointSpheres) {
            for(var i = 0; i < p.controlPointSpheres.length; i++) {
                scene.add(p.controlPointSpheres[i]);
            }
        }
        if(p.boundingBox) {
            scene.add(p.boundingBox);
        }
        scene.add(p.threeMesh)
    }

    this.zoomIn = function () {
        zoom += 0.1;
        //panPosition.x -= (0.1)*window.innerWidth/2;
        //panPosition.y -= (0.1)*window.innerHeight/2;

        refreshCamera();
        camera.updateProjectionMatrix();
    }

    this.zoomOut = function () {
        zoom -= 0.1;
        //panPosition.x += (0.1)*window.innerWidth/2;
        //panPosition.y += (0.1)*window.innerHeight/2;

        refreshCamera();
        camera.updateProjectionMatrix();
    }

    this.setPanEnabled = function (enable) {
        panEnabled = enable;
    }

    this.getPanEnabled = function (enable) {
        return panEnabled;
    }

    this.getSelectedPuppet = function () {
        return selectedPuppet;
    }

    this.exportSelectedPuppet = function () {
        console.log('-----here', this);
        var puppet = dranimate.getSelectedPuppet();
        var blob = new Blob([puppet.getJSONData()], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, "puppet.json");
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

            onChangeCallback();
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

        if(zoom < 0.1) zoom = 0.1;
        if(zoom > 3) zoom = 3;

        camera.left = -window.innerWidth/2 / zoom;
        camera.right =  window.innerWidth/2 / zoom;
        camera.top = -window.innerHeight/2 / zoom;
        camera.bottom = window.innerHeight/2 / zoom;
        camera.updateProjectionMatrix();
        //camera.lookAt( 0, 0, 0 );
    }

    function render() {

        for(var i = 0; i < puppets.length; i++) {
            puppets[i].setRenderWireframe(renderWireframes);
            puppets[i].setSelectionGUIVisible(false);
        }
        if(selectedPuppet) {
            selectedPuppet.setSelectionGUIVisible(true);
        }

        if(activeControlPoint.hoveredOver) {
            puppets[activeControlPoint.puppetIndex].controlPointSpheres[activeControlPoint.controlPointIndex].visible = true;
        }

        camera.position.x = -panPosition.x;
        camera.position.y = -panPosition.y;
        camera.position.z = 100;

        renderer.render( scene, camera );

    }

};

const dranimate = new Dranimate();
export default dranimate;
