import eventManager from './../../services/eventManager/event-manager';

export default class HandTrackingService {
	constructor() {
		this.model = null;
		this.video = null;
		this.tracking = false;
		this.palmPositionData = null;
		this.onUpdatePosition = null;
		this.partPositionData = {};

		this.lowPassFilterEnabled = false;
		this.lowPassSamplesCount = 4;
		this.lowPassSamples = [];

		this.trackAsync = this.trackAsync.bind(this);

		eventManager.on('low-pass-filter-toggle', this.lowPassFilterToggle);
		eventManager.on('low-pass-filter-samples-set', this.lowPassFilterSamplesSet);
	}

	lowPassFilterToggle = (enabled) => {
		this.lowPassFilterEnabled = enabled;
		this.lowPassSamples = [];
	}

	lowPassFilterSamplesSet = (samples) => {
		this.lowPassSamplesCount = samples;
		this.lowPassSamples = [];
	}

	async loadAsync() {
		this.model = await handpose.load();
		await this.loadVideoAsync();
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

	/**
	 * Takes last [this.lowPassSamples] frames and averages them in order to stabilize input from hand-pose library.
	 */
	lowPassFilter(inputData) {
		this.lowPassSamples.push(inputData);

		if (this.lowPassSamples.length < this.lowPassSamplesCount) {
			return false;
		}
		if (this.lowPassSamples.length > this.lowPassSamplesCount) {
			this.lowPassSamples.shift();
		}

		const handParts = ['thumb', 'indexFinger', 'middleFinger', 'ringFinger', 'pinky', 'palmBase'];

		this.lowPassSamples.forEach((sample) => {
			handParts.forEach((partName) => {
				const partPositionData = sample[partName];
				partPositionData.forEach((partData, index) => {
					if (!this[`${partName}-${index}-average`]) {
						this[`${partName}-${index}-average`] = [0, 0, 0];
					}

					this[`${partName}-${index}-average`][0] += partData[0];
					this[`${partName}-${index}-average`][1] += partData[1];
					this[`${partName}-${index}-average`][2] += partData[2];
				});
			});
		});

		handParts.forEach((partName) => {
			for(var i = 0; i < 4; i++) {
				if (this[`${partName}-${i}-average`]) {
					this[`${partName}-${i}-average`][0] /= this.lowPassSamplesCount;
					this[`${partName}-${i}-average`][1] /= this.lowPassSamplesCount;
					this[`${partName}-${i}-average`][2] /= this.lowPassSamplesCount;
				}
			}
		});

		handParts.forEach((partName) => {
			const partPositionData = this.palmPositionData[partName];
				partPositionData.forEach((partData, index) => {
					partData[0] = this[`${partName}-${index}-average`][0];
					partData[1] = this[`${partName}-${index}-average`][1];
					partData[2] = this[`${partName}-${index}-average`][2];

					this[`${partName}-${index}-average`][0] = 0;
					this[`${partName}-${index}-average`][1] = 0;
					this[`${partName}-${index}-average`][2] = 0;
				});
		});

		return true;
	}

	async trackAsync() {
		const predictions = await this.model.estimateHands(this.video, true);

		// If at least one hand is detected
		if (predictions.length > 0) {
			this.palmPositionData = predictions[0].annotations;

			if (this.lowPassFilterEnabled) {
				const result = this.lowPassFilter(predictions[0].annotations);
				if (result) {
					this.onUpdatePosition(this.palmPositionData);
				}
			}
			else {
				this.onUpdatePosition(this.palmPositionData);
			}
		}
		else {
			this.palmPositionData = null;
		}
	}
}
