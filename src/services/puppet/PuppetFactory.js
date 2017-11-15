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
  const verts = options.verts;
  const faces = options.faces;
  const controlPoints = options.controlPoints;

  // ----- THIS WAS IN: PUPPET.GENERATEMESH ------ //
  console.log('faces', verts.length, verts.length / 2);

  /* Generate wireframe material */
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF0000,
    wireframe: true,
    wireframeLinewidth: 1
  });

  /* Generate image material */
  const canvas = document.createElement('canvas');
  canvas.width  = this.imageNoBG.width;
  canvas.height = this.imageNoBG.height;
  const context = canvas.getContext('2d');
  // canvas.getContext('2d');
  context.drawImage(this.imageNoBG, 0, 0, this.imageNoBG.width, this.imageNoBG.height, 0, 0, canvas.width, canvas.height);

  const imageTexture = new THREE.Texture(canvas);
  imageTexture.needsUpdate = true;
  const texturedMaterial = new THREE.MeshBasicMaterial({
    map: imageTexture,
    transparent: true
  });

  /* Make flat arrays to pass to ARAP.js */

  // const verts = verts.slice();
  // const faces = faces.slice();
  // const controlPoints = controlPoints;

  const vertsFlatArray = [];
  for(var i = 0; i < this.verts.length; i++) {
    vertsFlatArray.push(this.verts[i][0]);
    vertsFlatArray.push(this.verts[i][1]);
  }

  const facesFlatArray = [];
  for(var i = 0; i < faces.length; i++) {
    facesFlatArray.push(faces[i]);
  }

  /* Create the THREE geometry */
  const geometry = new THREE.Geometry();

  for(var i = 0; i < this.vertsFlatArray.length; i+=2) {
    const x = this.vertsFlatArray[i];
    const y = this.vertsFlatArray[i+1];
    geometry.vertices.push( new THREE.Vector3( x, y, 0 ) );
  }
  for(var i = 0; i < this.facesFlatArray.length; i+=3) {
    const f1 = this.facesFlatArray[i];
    const f2 = this.facesFlatArray[i+1];
    const f3 = this.facesFlatArray[i+2];
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
  // console.log('----Puppet.generateMesh from ', this.vertsFlatArray.length / 2);
  // const arapMeshID = ARAP.createNewARAPMesh(this.vertsFlatArray, this.facesFlatArray);
  // 
  // /* Add control points */
  // for(var i = 0; i < this.controlPoints.length; i++) {
  //   ARAP.addControlPoint(this.arapMeshID, this.controlPoints[i]);
  // }
  // for(var i = 0; i < this.controlPoints.length; i++) {
  //   const cpi = this.controlPoints[i];
  //   ARAP.setControlPointPosition(this.arapMeshID, cpi, this.verts[cpi][0], this.verts[cpi][1]);
  // }

  /* Create the THREE objects */
  const threeMesh = new THREE.Mesh(geometry, this.texturedMaterial);

  const boundingBox = new THREE.BoxHelper(this.threeMesh, new THREE.Color(0xFF9900));
  boundingBox.visible = false;

  const box3 = new THREE.Box3();
  box3.setFromObject(boundingBox);
  const size = box3.getSize(new THREE.Vector3());
  const center = new THREE.Vector2(size.x / 2, size.y / 2);

  const controlPointSpheres = [];
  for(var i = 0; i < this.controlPoints.length; i++) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry( 5, 32, 32 ),
      new THREE.MeshBasicMaterial( {color: 0xFFAB40} )
    );
    sphere.position.z = 10;
    controlPointSpheres.push(sphere);
  }

  /* Save a version of the vertices in their original position */
  // this.undeformedVertices = this.verts;

  /* Set needsUpdate flag to update to initialze immediately */
  // this.needsUpdate = true;

  const group = new THREE.Group();
  group.add(this.threeMesh);
  group.add(this.boundingBox);
  controlPointSpheres.forEach(cp => group.add(cp));
  // this.group = group;

  return {

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

  const p = new Puppet(options.image, options.id);
  p.setImageToMeshData(options.imageNoBG, options.controlPointPositions, options.backgroundRemovalData);
  p.generateMesh(options.vertices, options.faces, options.controlPoints);
  dranimate.addPuppet(p);
  return p;
}
