import * as THREE from 'three';
import Puppet from 'services/puppet/puppet';
import dranimate from 'services/dranimate/dranimate';
import generateUniqueId from 'services/util/uuid';

// Temporary guard against this nasty guy: https://github.com/cmuartfab/dranimate-browser_archive/issues/1
const errorMessage = 'Must load largest puppet first.'
let mostFaces = 0;

//------- LOGIC FOR BUILDING PUPPETS, THIS IS TO KEEP CONSTRUCTION OUTSIDE OF PUPPET ENTITY ------//
function buildFromOptions(options) {
  const image = options.image;
  const id = options.id || generateUniqueId();
  const verts = options.vertices;
  const faces = options.faces;
  const controlPoints = options.controlPoints;
  const imageNoBG = options.imageNoBG;

  /* Generate wireframe material */
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF0000,
    wireframe: true,
    wireframeLinewidth: 1
  });

  /* Generate image material */
  const canvas = document.createElement('canvas');
  canvas.width  = imageNoBG.width;
  canvas.height = imageNoBG.height;
  const context = canvas.getContext('2d');
  // canvas.getContext('2d');
  context.drawImage(imageNoBG, 0, 0, imageNoBG.width, imageNoBG.height, 0, 0, canvas.width, canvas.height);

  const imageTexture = new THREE.Texture(canvas);
  imageTexture.needsUpdate = true;
  const texturedMaterial = new THREE.MeshBasicMaterial({
    map: imageTexture,
    transparent: true
  });

  const vertsFlatArray = [];
  for(var i = 0; i < verts.length; i++) {
    vertsFlatArray.push(verts[i][0]);
    vertsFlatArray.push(verts[i][1]);
  }

  const facesFlatArray = [];
  for(var i = 0; i < faces.length; i++) {
    facesFlatArray.push(faces[i]);
  }

  /* Create the THREE geometry */
  const geometry = new THREE.Geometry();

  for(var i = 0; i < vertsFlatArray.length; i+=2) {
    const x = vertsFlatArray[i];
    const y = vertsFlatArray[i+1];
    geometry.vertices.push( new THREE.Vector3( x, y, 0 ) );
  }
  for(var i = 0; i < facesFlatArray.length; i+=3) {
    const f1 = facesFlatArray[i];
    const f2 = facesFlatArray[i+1];
    const f3 = facesFlatArray[i+2];
    geometry.faces.push( new THREE.Face3( f1, f2, f3 ) );

    geometry.faceVertexUvs[0].push( [
      new THREE.Vector2(geometry.vertices[f1].x/imageNoBG.width, 1-geometry.vertices[f1].y/imageNoBG.height),
      new THREE.Vector2(geometry.vertices[f2].x/imageNoBG.width, 1-geometry.vertices[f2].y/imageNoBG.height),
      new THREE.Vector2(geometry.vertices[f3].x/imageNoBG.width, 1-geometry.vertices[f3].y/imageNoBG.height)
    ]);
  }

  geometry.dynamic = true;
  // geometry.translate(-200, -200, 0);

  /* Expand mesh to show finer edges of image (as opposed to rough triangle edges of mesh) */
  console.log("TODO: expand mesh")

  const threeMesh = new THREE.Mesh(geometry, texturedMaterial);

  const boundingBox = new THREE.BoxHelper(threeMesh, new THREE.Color(0xFF9900));
  boundingBox.visible = false;

  const box3 = new THREE.Box3();
  box3.setFromObject(boundingBox);
  const size = box3.getSize(new THREE.Vector3());
  const center = new THREE.Vector2(size.x / 2, size.y / 2);

  const controlPointSpheres = [];
  for(var i = 0; i < controlPoints.length; i++) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry( 5, 32, 32 ),
      new THREE.MeshBasicMaterial( {color: 0xFFAB40} )
    );
    sphere.position.z = 10;
    controlPointSpheres.push(sphere);
  }

  const group = new THREE.Group();
  group.add(threeMesh);
  group.add(boundingBox);
  controlPointSpheres.forEach(cp => group.add(cp));

  return {
    image,
    id,
    wireframeMaterial,
    texturedMaterial,
    verts,
    faces,
    controlPoints,
    vertsFlatArray,
    facesFlatArray,
    threeMesh,
    boundingBox,
    controlPointSpheres,
    group
  };
}

export default function requestPuppetCreation(options) {
  if (!mostFaces) {
    mostFaces = options.faces.length;
  }
  if (options.faces.length > mostFaces) {
    alert(errorMessage);
    return false;
  }

  const puppetData = {
    imageNoBG: options.imageNoBG,
    controlPointPositions: options.controlPointPositions,
    backgroundRemovalData: options.backgroundRemovalData,
    ...buildFromOptions(options)
  };
  const p = new Puppet(puppetData);
  dranimate.addPuppet(p);
  return p;
}
