import loadPuppetFromFile from 'services/storage/deserializer';

const mimeTypeMap = {
  image: ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'],
  puppet: ['application/json']
};

function loadFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = event => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

function loadDranimateFile(element) {
  const file = element.files && element.files[0]
  if (!file) {
    return Promise.reject(error);
  }
  if (file.name.includes('.json')) {
    // TODO: why does mobile android not recognizing json mime type???
    return loadPuppetFromFile(file);
  }
  const fileType = Object.keys(mimeTypeMap)
    .find(key => mimeTypeMap[key].includes(file.type));
  if (!fileType) {
    return Promise.reject('Unsupported file type');
  }
  if (fileType === 'image') {
    return loadFile(file);
  }
  return loadPuppetFromFile(file);
}

export { loadFile, loadDranimateFile };
