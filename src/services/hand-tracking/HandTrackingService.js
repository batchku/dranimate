export default class HandTrackingService {
	constructor() {
		this.model = null;
		this.video = null;
		this.tracking = false;
		this.palmPositionData = null;

		this.trackAsync = this.trackAsync.bind(this);
	}

	async loadAsync() {
		this.model = await handpose.load();
		await this.loadVideoAsync();
	}

	startTracking() {
		this.tracking = true;
		this.trackAsync();
	}

	stopTracking() {
		this.tracking = false;
	}

	/**
	 * Requests access to user camera and returns a handle to video element
	 */
	async setupCameraAsync() {
		const videoElement = document.getElementById('video');
		const stream = await navigator.mediaDevices.getUserMedia({
			'audio': false,
			'video': {
				facingMode: 'user',
				width: window.innerWidth / 2,
				height: window.innerHeight / 2
			},
		});
		videoElement.srcObject = stream;
		
		return new Promise((resolve) => {
			videoElement.onloadedmetadata = () => {
				resolve(videoElement);
			};
		});
	}

	async loadVideoAsync() {
		this.video = await this.setupCameraAsync();
		this.video.play();
	}

	async trackAsync() {
		if (!this.tracking) {
			return;
		}

		const predictions = await this.model.estimateHands(this.video, true);

		// If at least one hand is detected
		if (predictions.length > 0) {
			this.palmPositionData = predictions[0].annotations;
		}
		else {
			this.palmPositionData = null;
		}
		requestAnimationFrame(this.trackAsync);
	}
}
