import { Vector2 } from 'three';
import ARAP from 'services/arap/arap';
// import { PuppetRecording } from 'services/puppet/puppetRecording';
import Recording from 'services/puppet/Recording';
import { pointIsInsideTriangle } from 'services/util/math';
import { clearObject } from 'services/util/threeUtil';

const Puppet = function(puppetData) {

  // INITIAL VALUES
  this.current = {
    position: new Vector2(0, 0),
    center: puppetData.center.clone(),
    rotation: 0,
    scale: 1,
  };
  this.previous = {
    position: this.current.position.clone(),
    scale: this.current.scale,
    rotation: this.current.rotation
  };
  this.selectionState = {
    isBeingDragged: false,
    lastPosition: new Vector2(0, 0)
  };
  this.name = puppetData.name;
  this.id = puppetData.id;
  this.recording = new Recording();

  // GRAPHICS
  this.image = puppetData.image;
  this.imageNoBG = puppetData.imageNoBG;
  this.controlPointPositions = puppetData.controlPointPositions; // are these just unedited control points?
  this.backgroundRemovalData = puppetData.backgroundRemovalData;
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

  // SETUP NEW ARAP MESH
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

  this.incrementPosition(-puppetData.center.x, -puppetData.center.y);
};

Puppet.prototype.incrementPosition = function(x, y) {
  const position = new Vector2(x, y);
  const delta = position.clone()
    .sub(this.selectionState.lastPosition)
    .multiplyScalar(1 / this.getScale())
  this.current.center.add(
    position.clone().sub(this.selectionState.lastPosition)
  );
  this.current.position.add(delta);
  this.selectionState.lastPosition = position;
}

Puppet.prototype.setName = function(name) {
  this.name = name;
}

Puppet.prototype.getName = function() {
  return this.name;
}

Puppet.prototype.getId = function() {
  return this.id;
}

Puppet.prototype.setScale = function(scale) {
  this.current.scale = scale;
}

Puppet.prototype.getScale = function() {
  return this.current.scale;
}

Puppet.prototype.setRotation = function(rotation) {
  this.current.rotation = rotation;
}

Puppet.prototype.getRotation = function() {
  return this.current.rotation;
}

Puppet.prototype.hasRecording = function() {
  return this.recording.hasRecording();
}

Puppet.prototype.clearRecording = function() {
  this.recording.clear();
  this.updateControlPointColors();
}

Puppet.prototype.setRenderWireframe = function(shouldRender) {
  this.threeMesh.material = shouldRender ? this.wireframeMaterial : this.texturedMaterial;
}

Puppet.prototype.setSelectionState = function(isBeingDragged, x, y){
  this.selectionState.isBeingDragged = isBeingDragged;
  if (isBeingDragged) {
    this.selectionState.lastPosition.x = x;
    this.selectionState.lastPosition.y = y;
  }
}

Puppet.prototype.startRecording = function () {
  this.recording.start(performance.now());
}

Puppet.prototype.stopRecording = function () {
  this.recording.stop(performance.now());
  this.updateControlPointColors();
}

Puppet.prototype.updateControlPointColors = function () {
  const activeIndices = this.recording.getActiveIndices();
  this.controlPoints.forEach((controlPoint, index) => {
    const controlPointSphere = this.controlPointSpheres[index];
    const color = activeIndices.has(index) ? 0x4A74E2 : 0x1144FF;
    controlPointSphere.material.color.setHex(color);
  });
}

// Set one to many control points (leap motion, touch)
Puppet.prototype.setControlPointPositions = function(controlPoints) {
  this.needsUpdate = true;
  controlPoints.forEach(controlPoint => {
    ARAP.setControlPointPosition(this.arapMeshID, this.controlPoints[controlPoint.cpi], controlPoint.position.x, controlPoint.position.y)
  });

  if (this.recording.isRecording()) {
    const puppetCenter = this.getCenter();
    const normalizedControlPoints = controlPoints.map((controlPoint) => {
      const position = controlPoint.position.clone()
        .rotateAround(puppetCenter, -this.getRotation())
        .sub(puppetCenter);
      return {
        cpi: controlPoint.cpi,
        position
      };
    });
    this.recording.setFrame(normalizedControlPoints, performance.now());
  }
}

// Set a single control point (mouse interaction)
Puppet.prototype.setControlPointPosition = function(controlPointIndex, position) {
  this.needsUpdate = true;
  ARAP.setControlPointPosition(this.arapMeshID, this.controlPoints[controlPointIndex], position.x, position.y);

  // NOTE: there still might be some unforseen problems with over recording
  if (this.recording.isRecording()) {
    const puppetCenter = this.getCenter();
    const point = position
      .rotateAround(puppetCenter, -this.getRotation())
      .sub(puppetCenter);
    const frame = [{
      cpi: controlPointIndex,
      position: point,
    }];
    this.recording.setFrame(frame, performance.now());
  }
}

Puppet.prototype.update = function(elapsedTime, targetTimestamp) {
  const dx = this.current.position.x - this.previous.position.x;
  const dy = this.current.position.y - this.previous.position.y;
  const shouldMoveXY = dx !== 0 || dy !== 0;
  const shouldScale = this.previous.scale !== this.current.scale;
  const shouldRotate = this.previous.rotation !== this.current.rotation;
  this.previous.position.x = this.current.position.x;
  this.previous.position.y = this.current.position.y;

  // SCALE PUPPET
  if (shouldScale) {
    this.previous.scale = this.current.scale;
    this.needsUpdate = true;
  }

  // ROTATE PUPPET
  if (shouldRotate) {
    const deltaRotation = this.current.rotation - this.previous.rotation;
    this.previous.rotation = this.current.rotation;
    const puppetCenter = this.getCenter();
    this.controlPoints.forEach((controlPoint, index) => {
      const {x, y} = this.threeMesh.geometry.vertices[controlPoint];
      const point = new Vector2(x, y)
        .sub(puppetCenter)
        .multiplyScalar(1 / this.getScale())
        .add(puppetCenter)
        .rotateAround(puppetCenter, deltaRotation)
      this.setControlPointPosition(index, point);
    });
  }

  // TRANSLATE PUPPET
  if(shouldMoveXY) {
    const puppetCenter = this.getCenter();
    const xyDelta = new Vector2(dx, dy);
    this.controlPoints.forEach((controlPoint, index) => {
      const position = this.threeMesh.geometry.vertices[controlPoint].clone();
      const vertexPosition = new Vector2(position.x, position.y);
      const point = vertexPosition
        .sub(puppetCenter)
        .multiplyScalar(1 / this.getScale())
        .add(puppetCenter)
        .add(xyDelta);
      this.setControlPointPosition(index, point);
    });
  }

  const recordingTimeStamp = targetTimestamp || performance.now();

  const recordedFrames = this.recording.getCurrentFrame(recordingTimeStamp);
  recordedFrames.forEach(recordedFrame => {
    const puppetCenter = this.getCenter();
    const absoluteControlPoints = recordedFrame.controlPoints.map((controlPoint) => {
      const point = controlPoint.position.clone()
        .add(puppetCenter)
        .rotateAround(puppetCenter, this.getRotation());
      return {
        cpi: controlPoint.cpi,
        position: point
      };
    });
    // calling this.setControlPointPositions here will over record, look into simplifying this
    this.needsUpdate = true;
    absoluteControlPoints.forEach(controlPoint => {
      ARAP.setControlPointPosition(this.arapMeshID, this.controlPoints[controlPoint.cpi], controlPoint.position.x, controlPoint.position.y)
    });
  });

  // DEFORM PUPPET WITH ARAP
  if(this.needsUpdate) {
    // UPDATE ARAP DEFORMER
    ARAP.updateMeshDeformation(this.arapMeshID);
    const deformedVerts = ARAP.getDeformedVertices(this.arapMeshID, this.vertsFlatArray.length);
    const puppetCenter = this.getCenter();
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

    // UPDATE MISC THREEJS
    this.threeMesh.geometry.dynamic = true;
    this.threeMesh.geometry.verticesNeedUpdate = true;
    this.boundingBox.update();
    this.boundingBox.scale.z = 1; // To make sure volume != 0 (this will cause that warning to show up)
    this.needsUpdate = false;
  }

};

Puppet.prototype.getCenter = function() {
  return this.current.center.clone();
};

Puppet.prototype.cleanup = function () {
  clearObject(this.group);
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

export default Puppet;
