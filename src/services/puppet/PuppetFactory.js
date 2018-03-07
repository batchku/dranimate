import {
  Box3,
  BoxHelper,
  Color,
  Face3,
  Geometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  Texture,
  Vector2,
  Vector3
} from 'three';
import Puppet from 'services/puppet/puppet';
import generateUniqueId from 'services/util/uuid';

// Temporary guard against this nasty guy: https://github.com/cmuartfab/dranimate-browser_archive/issues/1
const errorMessage = 'Must load largest puppet first.'
let mostFaces = 0;

//------- LOGIC FOR BUILDING PUPPETS, THIS IS TO KEEP CONSTRUCTION OUTSIDE OF PUPPET ENTITY ------//
function buildFromOptions(options) {
  const image = options.image;
  const id = options.id || generateUniqueId();
  const name = options.name || '';
  const verts = options.vertices;
  const faces = options.faces;
  const controlPoints = options.controlPoints;
  const imageNoBG = options.imageNoBG;

  /* Generate wireframe material */
  const wireframeMaterial = new MeshBasicMaterial({
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

  const geometry = new Geometry();
  const imageTexture = new Texture(canvas);
  imageTexture.needsUpdate = true;
  const texturedMaterial = new MeshBasicMaterial({
    map: imageTexture,
    transparent: true
  });
  texturedMaterial.depthWrite = false;
  texturedMaterial.renderOrder = 1;

  const vertsFlatArray = verts.reduce((flatArray, vert) => flatArray.concat(vert[0], vert[1]), []);
  const facesFlatArray = faces.map(face => face);

  // add geometry vertices
  verts.map((vertex) => new Vector3(vertex[0], vertex[1], 0))
    .forEach(vertex => geometry.vertices.push(vertex));


  for(var i = 0; i < facesFlatArray.length; i+=3) {
    const f1 = facesFlatArray[i];
    const f2 = facesFlatArray[i + 1];
    const f3 = facesFlatArray[i + 2];
    geometry.faces.push(new Face3(f1, f2, f3 ));
    geometry.faceVertexUvs[0].push( [
      new Vector2(geometry.vertices[f1].x / imageNoBG.width, 1 - geometry.vertices[f1].y / imageNoBG.height),
      new Vector2(geometry.vertices[f2].x / imageNoBG.width, 1 - geometry.vertices[f2].y / imageNoBG.height),
      new Vector2(geometry.vertices[f3].x / imageNoBG.width, 1 - geometry.vertices[f3].y / imageNoBG.height)
    ]);
  }

  geometry.dynamic = true;
  // geometry.translate(-200, -200, 0);

  /* Expand mesh to show finer edges of image (as opposed to rough triangle edges of mesh) */
  console.log("TODO: expand mesh")

  const threeMesh = new Mesh(geometry, texturedMaterial);
  const boundingBox = new BoxHelper(threeMesh, new Color(0xFF9900));
  boundingBox.visible = false;

  const box3 = new Box3();
  box3.setFromObject(boundingBox);
  const size = box3.getSize(new Vector3());
  const halfSize = new Vector2(size.x, size.y).multiplyScalar(0.5);
  const vertexSum = geometry.vertices.reduce((sum, vertex) => ({
    x: sum.x + vertex.x,
    y: sum.y + vertex.y
  }), {x: 0, y: 0});
  const center = new Vector2(
    vertexSum.x / geometry.vertices.length,
    vertexSum.y / geometry.vertices.length
  );

  const controlPointSpheres = controlPoints.map(() => {
    const sphere = new Mesh(
      new SphereGeometry(15, 32, 32),
      new MeshBasicMaterial({ color: 0x1144FF })
    );
    sphere.position.z = 10;
    sphere.visible = false;
    return sphere;
  });

  // FOR TESTING THE CENTER OF THE PUPPET:
  // const centerSphere = new Mesh(
  //   new SphereGeometry(15, 32, 32),
  //   new MeshBasicMaterial({ color: 0x3300FF })
  // );
  // centerSphere.position.z = 20;
  // centerSphere.position.x = center.x;
  // centerSphere.position.y = center.y;

  const group = new Group();
  group.add(threeMesh);
  group.add(boundingBox);
  // group.add(centerSphere);
  controlPointSpheres.forEach(cp => group.add(cp));

  return {
    image,
    id,
    name,
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
    group,
    halfSize,
    center,
  };
}

export default function requestPuppetCreation(options) {
  console.log('requestPuppetCreation', options);
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
  return new Puppet(puppetData);
}
