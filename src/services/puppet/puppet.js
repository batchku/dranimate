import { Vector2, Vector3, Matrix4 } from 'three';
import ARAP from 'services/arap/arap';
import { PuppetRecording } from 'services/puppet/puppetRecording';
import { pointIsInsideTriangle } from 'services/util/math';

var Puppet = function(puppetData) {

  // PARAMETERS
  this._x = 0.0; // TODO: change to Vector2
  this._y = 0.0;
  this.displayCenter = puppetData.halfSize.clone();
  this._rotation = 0.0;
  this._scale = 1.0;
  this.prevx = this._x; // TODO: change to Vector2
  this.prevy = this._y;
  this.prevScale = this._scale; // TODO: create previous object?
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
  this.centerSphere = puppetData.centerSphere;

  this.undeformedVertices = this.verts;
  this.needsUpdate = true;
  this.initArap();

  this.selectionState = {
    isBeingDragged: false,
    lastPositionX: 0, // TODO: change to Vector2
    lastPositionY: 0
  };

  this.halfSize = puppetData.halfSize;
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
  this.initialControlPoints = this.controlPoints.map(cpi => this.verts[cpi].map(cp => cp));
}

Puppet.prototype.incrementPosition = function(x, y) {
  const lastPosition = new Vector2(
    this.selectionState.lastPositionX,
    this.selectionState.lastPositionY
  );
  const delta = new Vector2(x, y)
    .sub(lastPosition)
    .multiplyScalar(1 / this.getScale())
  // this.displayCenter.add(
  //   new Vector2(x, y)
  //     .sub(lastPosition)
  // );
  this._x += delta.x;
  this._y += delta.y;
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

// Set one to many control points (leap motion, touch)
Puppet.prototype.setControlPointPositions = function(controlPoints) {
  this.needsUpdate = true;
  controlPoints.forEach(controlPoint => {
    ARAP.setControlPointPosition(this.arapMeshID, this.controlPoints[controlPoint.cpi], controlPoint.x, controlPoint.y)
  });
  if (this.isRecording) {
    this.puppetRecording.setFrames(controlPoints);
  }
}

// Set a single control point (mouse interaction)
Puppet.prototype.setControlPointPosition = function(controlPointIndex, x, y) {
  this.needsUpdate = true;
  ARAP.setControlPointPosition(this.arapMeshID, this.controlPoints[controlPointIndex], x, y);
  if (this.isRecording) {
    const puppetCenter = this.getRotationCenter();
    const scaledCenter = this.getRotationCenter()
      .sub(puppetCenter)
      .multiplyScalar(1 / this.getScale())
      .add(puppetCenter)
      // .multiplyScalar(1 / this.getScale());
    const point = new Vector2(x, y)
      // .sub(puppetCenter)
      // .multiplyScalar(1 / this.getScale())
      // .add(puppetCenter)
      .rotateAround(puppetCenter, -this.getRotation())
      .sub(scaledCenter)
      // .multiplyScalar(1 / this.getScale())
      // .add(puppetCenter)
      // .sub(new Vector2(this._x, this._y))

    this.puppetRecording.setFrame(controlPointIndex, point.x, point.y);
  }
}

Puppet.prototype.update = function(elapsedTime ) {
  const dx = this._x - this.prevx;
  const dy = this._y - this.prevy;
  const shouldMoveXY = dx !== 0 || dy !== 0;
  const shouldScale = this.prevScale !== this._scale;
  const shouldRotate = this.prevRotation !== this._rotation;
  this.prevx = this._x;
  this.prevy = this._y;

  // SCALE PUPPET
  if (shouldScale) {
    const deltaScale = this._scale - this.prevScale;
    this.prevScale = this._scale; // TODO: remove prevScale?
    this.needsUpdate = true;
    // this.displayCenter.multiplyScalar(deltaScale);
  }

  // ROTATE PUPPET
  if (shouldRotate) {
    const deltaRotation = this._rotation - this.prevRotation;
    this.prevRotation = this._rotation;
    const puppetCenter = this.getRotationCenter();
    this.controlPoints.forEach((controlPoint, index) => {
      const {x, y} = this.threeMesh.geometry.vertices[controlPoint];
      const point = new Vector2(x, y)
        .sub(puppetCenter)
        .multiplyScalar(1 / this.getScale())
        .add(puppetCenter)
        .rotateAround(puppetCenter, deltaRotation)
      this.setControlPointPosition(index, point.x, point.y);
    });
  }

  // TRANSLATE PUPPET
  if(shouldMoveXY) {
    // let recordedIndices = [];
    // if (recordedFrame) {
    //   recordedIndices = recordedFrame.controlPoints.map(controlPoint => controlPoint.cpi);
    //   console.log('recordedIndices', recordedIndices);
    // }

    const puppetCenter = this.getRotationCenter();
    this.controlPoints.forEach((controlPoint, index) => {
      // if (recordedIndices.includes(index)) { return; }

      const {x, y} = this.threeMesh.geometry.vertices[controlPoint];
      const delta = new Vector2(x, y)
        .sub(puppetCenter)
        .multiplyScalar(1 / this.getScale())
        .add(puppetCenter)
        .add(new Vector2(dx, dy));
      this.setControlPointPosition(index, delta.x, delta.y);
    });

    // this.displayCenter.add(delta);
    this.displayCenter.add(
      new Vector2(dx, dy)
        .multiplyScalar(this.getScale())
    );
    // this.puppetRecording.translateFrames(dx, dy);
  }

  const recordedFrame = this.puppetRecording.update();
  if (recordedFrame) {
    const puppetCenter = this.getRotationCenter();
    const scaledCenter = this.getRotationCenter()
      .sub(puppetCenter)
      .multiplyScalar(this.getScale())
      .add(puppetCenter)
      // .multiplyScalar(this.getScale());
    const absoluteControlPoints = recordedFrame.controlPoints.map((controlPoint) => {
      const scaledPosition = new Vector2(this._x, this._y)
      const point = new Vector2(controlPoint.x, controlPoint.y)
        // .sub(puppetCenter)
        // .multiplyScalar(this.getScale())
        // .add(puppetCenter)
        .add(scaledCenter)
        .rotateAround(puppetCenter, this.getRotation())


      return {
        cpi: controlPoint.cpi,
        x: point.x,
        y: point.y
      };
    });
    this.setControlPointPositions(absoluteControlPoints);
  }

  // DEFORM PUPPET WITH ARAP
  if(this.needsUpdate) {
    console.log('update');
    // UPDATE ARAP DEFORMER
    ARAP.updateMeshDeformation(this.arapMeshID);
    const deformedVerts = ARAP.getDeformedVertices(this.arapMeshID, this.vertsFlatArray.length);
    const puppetCenter = this.getRotationCenter();
    for (let i = 0; i < deformedVerts.length; i += 2) {
      const vertex = this.threeMesh.geometry.vertices[i / 2];
      const point = new Vector2(deformedVerts[i], deformedVerts[i + 1])
        .sub(puppetCenter)
        .multiplyScalar(this.getScale())
        .add(puppetCenter);

      vertex.x = point.x;
      vertex.y = point.y;
    }

    // UPDATE CONTROL POINT GRAPHICS
    this.controlPoints.forEach((controlPoint, index) => {
      const vertex = this.threeMesh.geometry.vertices[controlPoint];
      const controlPointSphere = this.controlPointSpheres[index];
      controlPointSphere.position.x = vertex.x;
      controlPointSphere.position.y = vertex.y;
    });

    // const displayCenter = this.getDisplayCenter();
    // this.centerSphere.position.x = displayCenter.x;
    // this.centerSphere.position.y = displayCenter.y;
    this.centerSphere.position.x = this.displayCenter.x;
    this.centerSphere.position.y = this.displayCenter.y;
    // console.log(this.centerSphere.position);

    // UPDATE MISC THREEJS
    this.threeMesh.geometry.dynamic = true;
    this.threeMesh.geometry.verticesNeedUpdate = true;
    this.boundingBox.update();
    this.boundingBox.scale.z = 1; // To make sure volume != 0 (this will cause that warning to show up)
    this.needsUpdate = false;
  }

};

Puppet.prototype.getRotationCenter = function() {
  // return new Vector2(
  //   this._x + this.halfSize.x,
  //   this._y + this.halfSize.y
  // );
  return new Vector2(
    this._x,
    this._y
  );

};

Puppet.prototype.getDisplayCenter = function() {
  // return new Vector2(this._x, this._y)
  //   .multiplyScalar(this.getScale());
  return this.displayCenter.clone();
};

Puppet.prototype.cleanup = function () {
  console.error("Warning: Puppet.cleanup() not yet implemented! You are wasting memory! >:(")
}

Puppet.prototype.setSelectionGUIVisible = function (visible) {
  this.boundingBox.visible = visible;
  this.controlPointSpheres.forEach(sphere => sphere.visible = visible);
}

Puppet.prototype.pointInsideMesh = function (xUntransformed, yUntransformed) {
  const point = new Vector2(xUntransformed, yUntransformed)
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
