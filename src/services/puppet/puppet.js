// import * as THREE from 'three';
import { Vector2 } from 'three';
import ARAP from 'services/arap/arap';
import { PuppetRecording } from 'services/puppet/puppetRecording';
import { pointIsInsideTriangle } from 'services/util/math';
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
  this.puppetRecording = new PuppetRecording();
  // this.initialArapFrames ...?
  this.initialControlPoints = [];

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

  this.selectionState = {
    isBeingDragged: false,
    lastPositionX: 0,
    lastPositionY: 0
  };
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
  // this.initialControlPoints = this.controlPoints.map(controlPointIndex => ({
  //   controlPointIndex,
  //   x: this.verts[controlPointIndex][0],
  //   y: this.verts[controlPointIndex][1]
  // }));
  this.initialControlPoints = this.controlPoints.map(cpi => this.verts[cpi].map(cp => cp));
  console.log('initialControlPoints', this.initialControlPoints);
}

Puppet.prototype.incrementPosition = function(x, y) {
  const _x = x - this.selectionState.lastPositionX;
  const _y = y - this.selectionState.lastPositionY;
  this._x += _x;
  this._y += _y;
  this.selectionState.lastPositionX = x;
  this.selectionState.lastPositionY = y;
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

Puppet.prototype.setRenderWireframe = function(shouldRender) {
  this.threeMesh.material = shouldRender ? this.wireframeMaterial : this.texturedMaterial;
}

Puppet.prototype.setSelectionState = function(isBeingDragged, x, y){
  this.selectionState.isBeingDragged = isBeingDragged;
  if (isBeingDragged) {
    this.selectionState.lastPositionX = x;
    this.selectionState.lastPositionY = y;
  }
}

Puppet.prototype.startRecording = function () {
  this.isRecording = true;
  this.puppetRecording = new PuppetRecording(this.initialControlPoints);
}

Puppet.prototype.stopRecording = function () {
  this.isRecording = false;
  this.recordedFrames = [];
  this.puppetRecording.stop();
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
  if (this.isRecording) {
    this.puppetRecording.setFrame(controlPointIndex, x, y);
  }
}

Puppet.prototype.update = function(elapsedTime, isRecording) {
  const dx = this._x - this.prevx;
  const dy = this._y - this.prevy;

  // MOVE PUPPET IN XY PLANE
  if(dx !== 0 || dy !== 0) {
    if(this.controlPoints) {
      for(var i = 0; i < this.controlPoints.length; i++) {
        var cpx = this.threeMesh.geometry.vertices[this.controlPoints[i]].x;
        var cpy = this.threeMesh.geometry.vertices[this.controlPoints[i]].y;

        const point = new Vector2(dx / this._scale, dy / this._scale);
        point.rotateAround(this.getRotationCenter(), -this._rotation);
        this.setControlPointPosition(i, cpx + point.x, cpy + point.y);
      }
    }
  }

  this.prevx = this._x;
  this.prevy = this._y;

  // SCALE PUPPET
  if (this.prevScale !== this._scale) {
    this.threeMesh.scale.set(this._scale, this._scale, 1);
    this.prevScale = this._scale;
    this.needsUpdate = true;
  }

  // ROTATE PUPPET
  if (this.prevRotation !== this._rotation) {
    this.threeMesh.rotation.set(0, 0, this._rotation);
    this.prevRotation = this._rotation;
    this.needsUpdate = true;
  }

  const recordedFrame = this.puppetRecording.update();
  if (recordedFrame) {
    this.setControlPointPosition(recordedFrame.cpi, recordedFrame.x, recordedFrame.y);
  }

  // DEFORM PUPPET WITH ARAP
  if(this.needsUpdate) {

    /* update ARAP deformer */
    ARAP.updateMeshDeformation(this.arapMeshID);
    const deformedVerts = ARAP.getDeformedVertices(this.arapMeshID, this.vertsFlatArray.length);
    for(let i = 0; i < deformedVerts.length; i += 2) {
      this.threeMesh.geometry.vertices[i / 2].x = deformedVerts[i];
      this.threeMesh.geometry.vertices[i / 2].y = deformedVerts[i + 1];
    }
    this.threeMesh.geometry.dynamic = true;
    this.threeMesh.geometry.verticesNeedUpdate = true;

    this.boundingBox.update();
    this.boundingBox.scale.z = 1; // To make sure volume != 0 (this will cause that warning to show up)

    // UPDATE CONTROL POINT GRAPHICS
    this.controlPoints.forEach((controlPoint, index) => {
      const vertex = this.threeMesh.geometry.vertices[controlPoint];
      const point = new Vector2(vertex.x * this._scale, vertex.y * this._scale);
      point.rotateAround(this.getRotationCenter(), this.prevRotation);
      this.controlPointSpheres[index].position.x = point.x;
      this.controlPointSpheres[index].position.y = point.y;
    });

    this.needsUpdate = false;
  }

};

// TODO: this work for everything execpt for threeMesh
// ... mesh.rotation.set is different from the other kinds of rotation we are applying
Puppet.prototype.getRotationCenter = function() {
  // return new Vector2(
  //   this._x + this.center.x,
  //   this._y + this.center.y
  // );
  return new Vector2(0, 0);
}

Puppet.prototype.cleanup = function () {
  console.error("Warning: Puppet.cleanup() not yet implemented! You are wasting memory! >:(")
}

Puppet.prototype.setSelectionGUIVisible = function (visible) {
  this.boundingBox.visible = visible;
  this.controlPointSpheres.forEach(sphere => sphere.visible = visible);
}

Puppet.prototype.pointInsideMesh = function (xUntransformed, yUntransformed) {
  const point = new Vector2(xUntransformed / this._scale, yUntransformed / this._scale);
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

module.exports = Puppet;
