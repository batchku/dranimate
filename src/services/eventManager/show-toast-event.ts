export interface ShowToastEventData {
	text: string;
	duration: number;
}

interface Subscriber {
	callback: (data: ShowToastEventData) => void;
	id: string;
}

class ShowToastEvent {
	private subscribers: Array<Subscriber> = [];
	
	public emit(data: ShowToastEventData): void {
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
export default new ShowToastEvent();
