import * as THREE from 'three';
import ARAP from 'services/arap/arap';
// TODO: only import needed three deps

var Puppet = function(puppetData) {

  // PARAMETERS
  this._x = 0.0;
  this._y = 0.0;
  this._rotation = 0.0;
  this._scale = 1.0;
  this.prevx = this._x;
  this.prevy = this._y;
  this.prevScale = this._scale;
  this.prevRotation = this._rotation;
  this.name = 'DEFAULT_PUPPET_NAME';

  // RECORDING
  this.isRecording = false;
  this.recordedFrames = [];

  // GRAPHICS
  this.image = puppetData.image;
  this.id = puppetData.id;
  this.imageNoBG = puppetData.imageNoBG;
  this.controlPointPositions = puppetData.controlPointPositions; // are these just unedited control points?
  this.backgroundRemovalData = puppetData.backgroundRemovalData;
  this.hasMeshData = true; // TODO: remove
  this.wireframeMaterial = this.wireframeMaterial;
  this.texturedMaterial = puppetData.texturedMaterial;
  this.verts = puppetData.verts;
  this.faces = puppetData.faces;
  this.controlPoints = puppetData.controlPoints;
  this.vertsFlatArray = puppetData.vertsFlatArray;
  this.facesFlatArray = puppetData.facesFlatArray;
  this.threeMesh = puppetData.threeMesh;
  this.boundingBox = puppetData.boundingBox;
  this.controlPointSpheres = puppetData.controlPointSpheres;
  this.group = puppetData.group;

  this.undeformedVertices = this.verts;
  this.needsUpdate = true;
  this.initArap();
};

Puppet.prototype.initArap = function() {
  /* Setup new ARAP mesh */
  console.log('----Puppet.generateMesh from ', this.vertsFlatArray.length / 2);
  this.arapMeshID = ARAP.createNewARAPMesh(this.vertsFlatArray, this.facesFlatArray);
  /* Add control points */
  for(var i = 0; i < this.controlPoints.length; i++) {
    ARAP.addControlPoint(this.arapMeshID, this.controlPoints[i]);
  }
  for(var i = 0; i < this.controlPoints.length; i++) {
    var cpi = this.controlPoints[i];
    ARAP.setControlPointPosition(this.arapMeshID, cpi, this.verts[cpi][0], this.verts[cpi][1]);
  }
}

Puppet.prototype.incrementPosition = function(x, y) {
  this._x += x;
  this._y += y;
}

Puppet.prototype.setScale = function(scale) {
  this._scale = scale;
}

Puppet.prototype.getScale = function() {
  return this._scale;
}

Puppet.prototype.setRotation = function(rotation) {
  this._rotation = rotation;
}

Puppet.prototype.getRotation = function() {
  return this._rotation;
}

Puppet.prototype.setRenderWireframe = function (renderWireframe) {
  if(renderWireframe) {
    this.threeMesh.material = this.wireframeMaterial;
  } else {
    this.threeMesh.material = this.texturedMaterial;
  }
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
