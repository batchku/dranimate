
class EditorHelper {
  constructor() {
    this.isPuppet = false;
    this.item;
  }
  setItem(item) {
    console.log('. . . .item?', this.item)
    this.item = item;
    if (this.item && this.item.name) {
      this.isPuppet = true;
    }
    else {
      this.isPuppet = false;
    }
  }
  getItem() {
    return this.item;
  }
}

const editorHelper = new EditorHelper();
export default editorHelper;
