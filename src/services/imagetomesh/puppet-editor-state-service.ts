class PuppetEditorStateService {
	public isPuppet = false;

	private _item: any;

	public setItem(item): void {
		const itemIsPuppet = item && item.name;
		this._item = item;
		this.isPuppet = itemIsPuppet;
	}

	public getItem(): any {
		return this._item;
	}
}

export default new PuppetEditorStateService();
