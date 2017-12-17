import { Vector2, Vector3, Matrix4 } from 'three';
import ARAP from 'services/arap/arap';
import { PuppetRecording } from 'services/puppet/puppetRecording';
import { pointIsInsideTriangle } from 'services/util/math';

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
  this._x += (x - this.selectionState.lastPositionX);
  this._y += (y - this.selectionState.lastPositionY);
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
    const point = new Vector2(x, y)
      .rotateAround(this.getRotationCenter(), this.getRotation())
      .sub(new Vector2(this._x, this._y));
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
  // if (shouldScale) {
  //   // const center = this.getRotationCenter();
  //   // this.threeMesh.translateX(-this._x);
  //   // this.threeMesh.translateY(-this._y);
  //   this.threeMesh.scale.set(this._scale, this._scale, 1);
  //   // this.threeMesh.translateX(this._x);
  //   // this.threeMesh.translateY(this._y);
  //   this.prevScale = this._scale;
  //   this.needsUpdate = true;
  // }

  // ROTATE PUPPET
  if (shouldRotate) {
    const center = this.getRotationCenter();

    // const object = this.threeMesh;
    // const radians = this.getRotation();
    // const axis = new Vector3(0, 0, 1);
    // const rotWorldMatrix = new Matrix4();
    // rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    // rotWorldMatrix.multiply(object.matrix);        // pre-multiply
    // object.matrix = rotWorldMatrix;
    // object.rotation.setFromRotationMatrix(object.matrix, object.scale);

    const deltaRotation = this._rotation - this.prevRotation;
    this.prevRotation = this._rotation;

    this.controlPoints.forEach((controlPoint, index) => {
      const point = new Vector2(
        this.threeMesh.geometry.vertices[controlPoint].x,
        this.threeMesh.geometry.vertices[controlPoint].y
      )
      .rotateAround(this.getRotationCenter(), deltaRotation)
      this.setControlPointPosition(index, point.x, point.y);
    });
  }

  // TRANSLATE PUPPET
  if(shouldMoveXY) {
    this.controlPoints.forEach((controlPoint, index) => {
      const point = new Vector2(
        this.threeMesh.geometry.vertices[controlPoint].x,
        this.threeMesh.geometry.vertices[controlPoint].y
      )
      const moveBy = new Vector2(dx, dy)
      point.add(moveBy)

      this.setControlPointPosition(index, point.x, point.y);
    });
  }

  const recordedFrame = this.puppetRecording.update();
  if (recordedFrame) {
    const absoluteControlPoints = recordedFrame.controlPoints.map((controlPoint) => {
      const puppetCenter = new Vector2(this._x, this._y)
      const point = new Vector2(controlPoint.x, controlPoint.y)
        .add(puppetCenter)
        .rotateAround(this.getRotationCenter(), this.getRotation());

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

    // UPDATE ARAP DEFORMER
    ARAP.updateMeshDeformation(this.arapMeshID);
    const deformedVerts = ARAP.getDeformedVertices(this.arapMeshID, this.vertsFlatArray.length);
    for (let i = 0; i < deformedVerts.length; i += 2) {
      const point = new Vector2(deformedVerts[i], deformedVerts[i + 1])
      this.threeMesh.geometry.vertices[i / 2].x = point.x;
      this.threeMesh.geometry.vertices[i / 2].y = point.y;
    }

    // UPDATE CONTROL POINT GRAPHICS
    this.controlPoints.forEach((controlPoint, index) => {
      const vertex = this.threeMesh.geometry.vertices[controlPoint];
      const point = new Vector2(vertex.x, vertex.y)
      this.controlPointSpheres[index].position.x = point.x;
      this.controlPointSpheres[index].position.y = point.y;
    });

    // UPDATE MISC THREEJS
    this.threeMesh.geometry.dynamic = true;
    this.threeMesh.geometry.verticesNeedUpdate = true;
    this.boundingBox.update();
    this.boundingBox.scale.z = 1; // To make sure volume != 0 (this will cause that warning to show up)
    this.needsUpdate = false;
  }

};

Puppet.prototype.getRotationCenter = function() {
  return new Vector2(
    this._x + this.halfSize.x,
    this._y + this.halfSize.y
  );
}

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
