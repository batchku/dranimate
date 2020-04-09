interface Subscriber {
	callback: () => void;
	id: string;
}

class OpenSignInDialogEvent {
	private subscribers: Array<Subscriber> = [];
	
	public emit(): void {
		this.subscribers.forEach((subscriber) => {
			subscriber.callback();
		});
	}

	public subscribe(subscriber: Subscriber): void {
		this.subscribers.push(subscriber);
	}

	public unsubscribe(subscriberId: string): void {
		this.subscribers = this.subscribers.filter((subscriber) => {
			return subscriber.id !== subscriberId;
		});
	}
}
export default new OpenSignInDialogEvent();
