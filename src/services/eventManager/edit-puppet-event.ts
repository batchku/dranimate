export interface EditPuppetEventData {
	puppet: any;
}

interface Subscriber {
	callback: (data: EditPuppetEventData) => void;
	id: string;
}

class EditPuppetEvent {
	private subscribers: Array<Subscriber> = [];
	
	public emit(data: EditPuppetEventData): void {
		this.subscribers.forEach((subscriber) => {
			subscriber.callback(data);
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
export default new EditPuppetEvent();
