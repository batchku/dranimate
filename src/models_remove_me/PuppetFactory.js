/**
 * This factory is a temporary wrapper to guard against this nasty guy: https://github.com/cmuartfab/dranimate-browser_archive/issues/1
 */
 import Puppet from './puppet';
 import dranimate from './dranimate';


const errorMessage = 'Must load largest puppet first.'
let mostFaces = 0;

export default function requestPuppetCreation(options) {
  if (!mostFaces) {
    mostFaces = options.faces.length;
  }
  if (options.faces.length > mostFaces) {
    alert(errorMessage);
    return false;
  }

  const p = new Puppet(options.image);
  p.setImageToMeshData(options.imageNoBG, options.controlPointPositions, options.backgroundRemovalData);
  p.generateMesh(options.vertices, options.faces, options.controlPoints);
  dranimate.addPuppet(p);
  return p;
}
