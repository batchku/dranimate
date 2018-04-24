import { Mesh, TextureLoader } from 'three';

function loadTexture(imageSource) {
  return new Promise((resolve, reject) => {
    return new TextureLoader().load(imageSource,
      texture => resolve(texture),
      () => {},
      error => reject(error)
    );
  });
}

function clearObject(threeObj) {
  threeObj.children.forEach(child => {
    if (child.children) {
      clearObject(child);
    }
    cleanMeshMemory(child);
  });
  cleanMeshMemory(threeObj);
}

function cleanMeshMemory(obj) {
  if (!obj) return;
  if (obj.material && obj.material.map) {
    obj.material.map.dispose();
    obj.material.map = undefined;
  }
  if (obj.material) {
    obj.material.dispose();
    obj.material = undefined;
  }
  if (obj.geometry) {
    obj.geometry.dispose();
    obj.geometry = undefined;
  }
}

export {clearObject, cleanMeshMemory, loadTexture};
