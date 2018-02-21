import FileSaver from 'file-saver';

function getImageAsDataURL(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const context = canvas.getContext('2d');
  canvas.getContext('2d');
  context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL();
}

function getJsonFromPuppet(puppet) {
  const puppetData = {
    verts: puppet.verts,
    faces: puppet.faces,
    controlPoints: puppet.controlPoints,
    controlPointPositions: puppet.controlPointPositions,
    backgroundRemovalData: {
      data: [...puppet.backgroundRemovalData.data],
      width: puppet.backgroundRemovalData.width,
      height: puppet.backgroundRemovalData.height,
    },
    imageData: getImageAsDataURL(puppet.image),
    imageNoBGData: getImageAsDataURL(puppet.imageNoBG)
  };
  return JSON.stringify(puppetData);
}

function getPuppetJsonFile(puppet) {
  const puppetJsonString = getJsonFromPuppet(puppet);
  return new Blob([puppetJsonString], {type: 'application/json'});
}

function savePuppetToFile(puppet) {
  const puppetJsonFile = getPuppetJsonFile(puppet);
  FileSaver.saveAs(puppetJsonFile, 'testpuppet.json');
}

export { getPuppetJsonFile, savePuppetToFile };
