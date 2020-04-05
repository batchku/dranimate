export interface PuppetSelectedEventData {
	puppet: any;
}

interface Subscriber {
	callback: (data: PuppetSelectedEventData) => void;
	id: string;
}

class PuppetSelectedEvent {
	private subscribers: Array<Subscriber> = [];
	
	public emit(data: PuppetSelectedEventData): void {
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
export default new PuppetSelectedEvent();
