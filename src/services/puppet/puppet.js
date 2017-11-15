import * as THREE from 'three';
import generateUniqueId from 'services/util/uuid';
import ARAP from 'services/arap/arap';

// TODO: only import needed three deps
// const THREE = require('three');
// const GIF = require('gif.js');

// const ARAP = require('../arap/arap.js');
console.log('ARAP', ARAP);

var Puppet = function (image, id) {
  this.image = image;

  this.name = "The Puppet With No Name";
  this.id = id || generateUniqueId();
  this._x = 0.0;
  this._y = 0.0;
  this._rotation = 0.0;
  this._scale = 1.0;

  this.prevx = this._x;
  this.prevy = this._y;
  this.prevScale = this._scale;
  this.prevRotation = this._rotation;

  this.isRecording = false;
  this.recordedFrames = [];

  // Setup quad image

  const canvas = document.createElement('canvas');
  canvas.width  = this.image.width;
  canvas.height = this.image.height;
  const context = canvas.getContext('2d');
  canvas.getContext('2d');
  context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, canvas.width, canvas.height);
  // this.context = context;
  // this.canvas = canvas;

  const imageTexture = new THREE.Texture(canvas);
  imageTexture.needsUpdate = true;
  this.texturedMaterial = new THREE.MeshBasicMaterial({
    map: imageTexture,
    transparent: true
  });

  const vertsFlatArray = [0,0, image.width,0, 0,image.height, image.width,image.height];
  const facesFlatArray = [0,2,1, 1,2,3];

  const geometry = new THREE.Geometry();

  for(let i = 0; i < vertsFlatArray.length; i+=2) {
    const x = vertsFlatArray[i];
    const y = vertsFlatArray[i+1];
    geometry.vertices.push( new THREE.Vector3( x, y, 0 ) );
  }
  for(let i = 0; i < facesFlatArray.length; i+=3) {
    const f1 = facesFlatArray[i];
    const f2 = facesFlatArray[i+1];
    const f3 = facesFlatArray[i+2];
    geometry.faces.push( new THREE.Face3( f1, f2, f3 ) );

    geometry.faceVertexUvs[0].push( [
        new THREE.Vector2(geometry.vertices[f1].x/this.image.width, 1-geometry.vertices[f1].y/this.image.height),
        new THREE.Vector2(geometry.vertices[f2].x/this.image.width, 1-geometry.vertices[f2].y/this.image.height),
        new THREE.Vector2(geometry.vertices[f3].x/this.image.width, 1-geometry.vertices[f3].y/this.image.height)
        ]);
  }

  this.threeMesh = new THREE.Mesh(geometry, this.texturedMaterial);
  this.boundingBox = new THREE.BoxHelper(this.threeMesh, new THREE.Color(0xFF9900));
  this.boundingBox.visible = false;


  const box3 = new THREE.Box3();
  box3.setFromObject(this.boundingBox); // or from mesh, same answer
  const size = box3.getSize(new THREE.Vector3()); // pass in size so a new Vector3 is not allocated
  console.log(size)

  this.center = new THREE.Vector2(size.x / 2, size.y / 2);
  this._x = -this.center.x;
  this._y = -this.center.y;
};

Puppet.prototype.getName = function() {
  return name;
};

Puppet.prototype.getPosition = function() {
  return {x: this._x, y: this._y};
};

// doIncrement flag allows you to pass in an incremental value and add it to the
// preexisting value; if false, the value is erased and updated. Defaults to
// false.
Puppet.prototype.x = function(value, doIncrement = false) {
  var baseValue = doIncrement ? this._x : 0;
  return value ? (this._x = baseValue + value) : this._x;
}

Puppet.prototype.y = function(value, doIncrement = false) {
  var baseValue = doIncrement ? this._y : 0;
  return value ? (this._y = baseValue + value) : this._y;
}

Puppet.prototype.scale = function(value) {
  return value ? (this._scale = value) : this._scale;
}

Puppet.prototype.rotation = function(value) {
  return value ? (this._rotation = value) : this._rotation;
}

Puppet.prototype.setRenderWireframe = function (renderWireframe) {
  if(renderWireframe) {
    this.threeMesh.material = this.wireframeMaterial;
  } else {
    this.threeMesh.material = this.texturedMaterial;
  }
}

Puppet.prototype.setImageToMeshData = function (imageNoBG, controlPointPositions, backgroundRemovalData) {
  this.imageNoBG = imageNoBG;
  this.controlPointPositions = controlPointPositions;
  this.backgroundRemovalData = backgroundRemovalData;
}

Puppet.prototype.startRecording = function () {
  this.isRecording = true;
}

Puppet.prototype.stopRecording = function () {
  this.isRecording = false;
  this.recordedFrames = [];
}

Puppet.prototype.finishRecording = function() {
  this.isRecording = false;
  const gif = new GIF({
    workers: 2,
    quality: 10,
    // width: 20,
    // height: 20,
    workerScript: '/lib_remove_me/gif/gif.worker.js',
  });
  this.recordedFrames.forEach(recordedFrame => {
    // TODO: paint recorded frame to canavs and pass it to gif
    gif.addFrame(ctx, {copy: true});
  });
  gif.on('finished', blob => window.open(URL.createObjectURL(blob)));
  gif.render();
}

// TODO: this can probably get moved into the puppet factory
Puppet.prototype.generateMesh = function (verts, faces, controlPoints) {
  console.log('faces', verts.length, verts.length / 2);

  this.hasMeshData = true;

  /* Generate wireframe material */

  this.wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF0000,
    wireframe: true,
    wireframeLinewidth: 1
  });

  /* Generate image material */

  var canvas = document.createElement('canvas');
  canvas.width  = this.imageNoBG.width;
  canvas.height = this.imageNoBG.height;
  var context = canvas.getContext('2d');
  canvas.getContext('2d');
  context.drawImage(this.imageNoBG, 0, 0, this.imageNoBG.width, this.imageNoBG.height, 0, 0, canvas.width, canvas.height);

  var imageTexture = new THREE.Texture(canvas);
  imageTexture.needsUpdate = true;
  this.texturedMaterial = new THREE.MeshBasicMaterial({
    map: imageTexture,
    transparent: true
  });

  /* Make flat arrays to pass to ARAP.js */

  this.verts = verts.slice();
  this.faces = faces.slice();
  this.controlPoints = controlPoints;

  this.vertsFlatArray = [];
  for(var i = 0; i < this.verts.length; i++) {
    this.vertsFlatArray.push(this.verts[i][0]);
    this.vertsFlatArray.push(this.verts[i][1]);
  }

  this.facesFlatArray = [];
  for(var i = 0; i < faces.length; i++) {
    this.facesFlatArray.push(faces[i]);
  }

  /* Create the THREE geometry */

  var geometry = new THREE.Geometry();

  for(var i = 0; i < this.vertsFlatArray.length; i+=2) {
    var x = this.vertsFlatArray[i];
    var y = this.vertsFlatArray[i+1];
    geometry.vertices.push( new THREE.Vector3( x, y, 0 ) );
  }
  for(var i = 0; i < this.facesFlatArray.length; i+=3) {
    var f1 = this.facesFlatArray[i];
    var f2 = this.facesFlatArray[i+1];
    var f3 = this.facesFlatArray[i+2];
    geometry.faces.push( new THREE.Face3( f1, f2, f3 ) );

    geometry.faceVertexUvs[0].push( [
        new THREE.Vector2(geometry.vertices[f1].x/this.imageNoBG.width, 1-geometry.vertices[f1].y/this.imageNoBG.height),
        new THREE.Vector2(geometry.vertices[f2].x/this.imageNoBG.width, 1-geometry.vertices[f2].y/this.imageNoBG.height),
        new THREE.Vector2(geometry.vertices[f3].x/this.imageNoBG.width, 1-geometry.vertices[f3].y/this.imageNoBG.height)
        ]);
  }

  geometry.dynamic = true;

  /* Expand mesh to show finer edges of image (as opposed to rough triangle edges of mesh) */

  console.log("TODO: expand mesh")

  /* Setup new ARAP mesh */
  console.log('----Puppet.generateMesh from ', this.vertsFlatArray.length / 2);
  this.arapMeshID = ARAP.createNewARAPMesh(this.vertsFlatArray,
      this.facesFlatArray);

  /* Add control points */

  for(var i = 0; i < this.controlPoints.length; i++) {
    ARAP.addControlPoint(this.arapMeshID, this.controlPoints[i]);
  }
  for(var i = 0; i < this.controlPoints.length; i++) {
    var cpi = this.controlPoints[i];
    ARAP.setControlPointPosition(this.arapMeshID, cpi, this.verts[cpi][0], this.verts[cpi][1]);
  }

  /* Create the THREE objects */

  this.threeMesh = new THREE.Mesh(geometry, this.texturedMaterial);

  this.boundingBox = new THREE.BoxHelper(this.threeMesh, new THREE.Color(0xFF9900));
  this.boundingBox.visible = false;

  this.controlPointSpheres = [];
  for(var i = 0; i < this.controlPoints.length; i++) {
    var sphere = new THREE.Mesh(
        new THREE.SphereGeometry( 5, 32, 32 ),
        new THREE.MeshBasicMaterial( {color: 0xFFAB40} )
        );
    sphere.position.z = 10;
    this.controlPointSpheres.push(sphere);
  }

  /* Save a version of the vertices in their original position */

  this.undeformedVertices = this.verts;

  /* Set needsUpdate flag to update to initialze immediately */

  this.needsUpdate = true;

  const group = new THREE.Group();
  group.add(this.threeMesh);
  group.add(this.boundingBox);
  this.controlPointSpheres.forEach(cp => group.add(cp));
  this.group = group;
}

Puppet.prototype.setControlPointPosition = function(controlPointIndex, x, y) {
  this.needsUpdate = true;
  ARAP.setControlPointPosition(this.arapMeshID, this.controlPoints[controlPointIndex], x, y);
}

Puppet.prototype.update = function() {
  const dx = this._x - this.prevx;
  const dy = this._y - this.prevy;

  if(dx !== 0 || dy !== 0) {
    if(this.controlPoints) {
      for(var i = 0; i < this.controlPoints.length; i++) {
        var cpx = this.threeMesh.geometry.vertices[this.controlPoints[i]].x;
        var cpy = this.threeMesh.geometry.vertices[this.controlPoints[i]].y;

        const point = new THREE.Vector2(dx / this._scale, dy / this._scale);
        point.rotateAround(this.getRotationCenter(), -this._rotation);
        this.setControlPointPosition(i, cpx + point.x, cpy + point.y);
      }
    }
  }

  this.prevx = this._x;
  this.prevy = this._y;

  if (this.prevScale !== this._scale) {
    this.threeMesh.scale.set(this._scale, this._scale, 1);
    this.prevScale = this._scale;
    this.needsUpdate = true;
  }

  if (this.prevRotation !== this._rotation) {
    this.threeMesh.rotation.set(0, 0, this._rotation);
    this.prevRotation = this._rotation;
    this.needsUpdate = true;
  }

  if(this.needsUpdate) {

    /* update ARAP deformer */
    ARAP.updateMeshDeformation(this.arapMeshID);

    var deformedVerts = ARAP.getDeformedVertices(this.arapMeshID, this.vertsFlatArray.length);

    for(var i = 0; i < deformedVerts.length; i+=2) {
      var x = deformedVerts[i];
      var y = deformedVerts[i+1];
      this.threeMesh.geometry.vertices[i/2].x = x;
      this.threeMesh.geometry.vertices[i/2].y = y;
    }
    this.threeMesh.geometry.dynamic = true;
    this.threeMesh.geometry.verticesNeedUpdate = true;

    //this.threeMesh.geometry.computeBoundingBox();
    //console.log(this.boundingBox)
    this.boundingBox.update();
    this.boundingBox.scale.z = 1; // To make sure volume != 0 (this will cause that warning to show up)

    for(var i = 0; i < this.controlPoints.length; i++) {
      var cpi = this.controlPoints[i];
      var v = this.threeMesh.geometry.vertices[cpi];
      const point = new THREE.Vector2(v.x * this._scale, v.y * this._scale);
      point.rotateAround(this.getRotationCenter(), this.prevRotation);
      this.controlPointSpheres[i].position.x = point.x;
      this.controlPointSpheres[i].position.y = point.y;
    }
    this.needsUpdate = false;
  }

  if(this.isRecording) {
    var recordedFrame = this.threeMesh.clone();
    this.recordedFrames.push(recordedFrame);
  }

};

// TODO: this work for everything execpt for threeMesh
// ... mesh.rotation.set is different from the other kinds of rotation we are applying
Puppet.prototype.getRotationCenter = function() {
  // return new THREE.Vector2(
  //   this._x + this.center.x,
  //   this._y + this.center.y
  // );
  return new THREE.Vector2(0, 0);
}

// TODO: move to image util service
Puppet.prototype.getImageAsDataURL = function (img) {
  const canvas = document.createElement('canvas');
  canvas.width  = img.width;
  canvas.height = img.height;
  const context = canvas.getContext('2d');
  canvas.getContext('2d');
  context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL();
}

Puppet.prototype.getJSONData = function () {
  console.log('toJson', this.backgroundRemovalData);
  var puppetData = {
    verts: this.verts,
    faces: this.faces,
    controlPoints: this.controlPoints,
    controlPointPositions: this.controlPointPositions,
    backgroundRemovalData: {
      data: [...this.backgroundRemovalData.data],
      width: this.backgroundRemovalData.width,
      height: this.backgroundRemovalData.height,
    },
    imageData: this.getImageAsDataURL(this.image),
    imageNoBGData: this.getImageAsDataURL(this.imageNoBG)
  };
  return JSON.stringify(puppetData);
}

Puppet.prototype.cleanup = function () {
  console.error("Warning: Puppet.cleanup() not yet implemented! You are wasting memory! >:(")
}

Puppet.prototype.setSelectionGUIVisible = function (visible) {
  if(this.hasMeshData) {
    this.boundingBox.visible = visible;
    for(var i = 0; i < this.controlPointSpheres.length; i++) {
      this.controlPointSpheres[i].visible = visible;
    }
  }
}

Puppet.prototype.pointInsideMesh = function (xUntransformed, yUntransformed) {
  const point = new THREE.Vector2(xUntransformed / this._scale, yUntransformed / this._scale);
  point.rotateAround(this.getRotationCenter(), -this._rotation);
  const allFaces = this.threeMesh.geometry.faces;
  const allVerts = this.threeMesh.geometry.vertices;
  for(let i = 0; i < allFaces.length; i++) {
    const v1 = allVerts[allFaces[i].a];
    const v2 = allVerts[allFaces[i].b];
    const v3 = allVerts[allFaces[i].c];
    if (pointIsInsideTriangle(point.x, point.y, v1, v2, v3)) {
      return true;
    }
  }
  return false;
}

function sign(x1, y1, x2, y2, x3, y3) {
  return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
}

//http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-triangle
function pointIsInsideTriangle(x, y, p1, p2, p3) {
  const b1 = sign(x, y, p1.x, p1.y, p2.x, p2.y) < 0.0;
  const b2 = sign(x, y, p2.x, p2.y, p3.x, p3.y) < 0.0;
  const b3 = sign(x, y, p3.x, p3.y, p1.x, p1.y) < 0.0;
  return ((b1 === b2) && (b2 === b3));
}

module.exports = Puppet;
