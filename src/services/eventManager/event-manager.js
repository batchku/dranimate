import { v1 as uuid } from 'uuid';

class EventManager {
	constructor() {
		this.events = [];
	}

	emit(eventName, data) {
		this.events.forEach((event) => {
			if (event.name === eventName) {
				event.callback(data);
			}
		});
	}

	on(eventName, callback) {
		const eventId = uuid();

		this.events.push({
			name: eventName,
			callback: callback,
			id: eventId,
		});

		return eventId;
	}

	remove(eventId) {
		this.events = this.events.filter((event) => {
			return event.id !== eventId;
		});
	}
}
export default new EventManager();
