export interface UserSignedInEventData {
	user: firebase.User;
}

interface Subscriber {
	callback: (data: UserSignedInEventData) => void;
	id: string;
}

class UserSignedInEvent {
	private subscribers: Array<Subscriber> = [];
	
	public emit(data: UserSignedInEventData): void {
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
export default new UserSignedInEvent();
