class PuppetEditorStateService {
  constructor() {
    this.isPuppet = false;
    this.item;
  }
  setItem(item) {
    const itemIsPuppet = item && item.name;
    this.item = item;
    this.isPuppet = itemIsPuppet;
  }
  getItem() {
    return this.item;
  }
}

const puppetEditorStateService = new PuppetEditorStateService();
export default puppetEditorStateService;
