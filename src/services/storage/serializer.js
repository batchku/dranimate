import FileSaver from 'file-saver';

function savePuppetToFile(puppet) {
  const puppetJsonString = puppet.getJSONData();
  var blob = new Blob([puppetJsonString], {type: 'application/json;charset=utf-8'});
  FileSaver.saveAs(blob, 'testpuppet.json');
}

export default savePuppetToFile;
