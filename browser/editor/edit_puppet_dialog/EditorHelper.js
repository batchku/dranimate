
let imageSrc;

class EditorHelper {
  constructor() {
    this.imageSrc;
  }
  setImageSrc(imageSrc) {
    this.imageSrc = imageSrc;
  }
  getImageSrc(imageSrc) {
    return this.imageSrc;
  }
}

const editorHelper = new EditorHelper();
export default editorHelper;
