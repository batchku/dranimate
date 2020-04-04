import SLIC from './slic.js';
import { getImageDataFromImage } from 'services/imagetomesh/ImageUtil';
import loadImage from 'services/util/imageLoader';
import PanHandler from 'services/util/panHandler';

const SELECT_STATE = {
	PAN: 'PAN',
	SELECT: 'SELECT',
	DESELECT: 'DESELECT'
};
const MOUSE_STATE = {
	UP: 'UP',
	DOWN: 'DOWN',
	OUTSIDE: 'OUTSIDE',
};

const SELECTED_REGION_COLOR = {
	red: 74,
	green: 116,
	blue: 225,
	alpha: 255,
};

const HIGHLIGHTED_REGION_COLOR = {
	red: 74,
	green: 116,
	blue: 225,
	alpha: 255,
};

class ImageEditorService {
	constructor() {
		this.context;
		this.width;
		this.height;
		this.mouse = {};
		this.mouseAbs = {};

		this.image;
		this.originalImageData;

		this.slic;
		this.slicSegmentsCentroids;

		this.highlightData;
		this.highlightImage = new Image();
		this.highlightImageOutlined = new Image();

		this.imageNoBackgroundData;
		this.imageNoBackgroundImage = new Image();
		this.imageNoBackgroundImageOutlined = new Image();

		this.dummyCanvas = document.createElement('canvas');
		this.dummyContext = this.dummyCanvas.getContext('2d');
		this.blankCanvas = document.createElement('canvas');
		this.blankContext = this.blankCanvas.getContext('2d');
		this.outlineCanvas = document.createElement('canvas');
		this.outlineContext = this.outlineCanvas.getContext('2d');

		this.zoom = 1;
		this.panHandler = new PanHandler();

		this.mouseState = MOUSE_STATE.UP;
		this.selectState = SELECT_STATE.SELECT;

		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseOver = this.onMouseOver.bind(this);
	}

/*****************************
		API
*****************************/

	init(canvas, imageData, backgroundRemovalData) {
		this.width = canvas.width;
		this.height = canvas.height;
		this.context = canvas.getContext('2d');
		this.imageNoBackgroundData = backgroundRemovalData;

		return loadImage(imageData)
			.then((img) => {
				const largerSize = Math.max(img.width, img.height);
				const normWidth = (img.width / largerSize) * 400;
				const normHeight = (img.height / largerSize) * 400;
				this.width = normWidth;
				this.height = normHeight;
				this.dummyCanvas.width = normWidth;
				this.dummyCanvas.height = normHeight;
				this.outlineCanvas.width = normWidth;
				this.outlineCanvas.height = normHeight;

				if (this.width > canvas.width) {
					const targetZoom = canvas.width / this.width;
					this.zoom = targetZoom;
				}
				if (this.height > canvas.height) {
					const targetZoom = canvas.height / this.height;
					this.zoom = targetZoom;
				}

				this.image = img;
			});
	};

	onMouseMove(event, isTouch) {
		if (!isTouch) {
			event.preventDefault();
		};

		const rect = event.target.getBoundingClientRect();
		this.mouseAbs.x = (event.clientX - rect.left) / this.zoom;
		this.mouseAbs.y = (event.clientY - rect.top) / this.zoom;
		this.mouse.x = this.mouseAbs.x - this.panHandler.getPanPosition().x;
		this.mouse.y = this.mouseAbs.y - this.panHandler.getPanPosition().y;
		this.mouse.x = Math.round(this.mouse.x);
		this.mouse.y = Math.round(this.mouse.y);

		if (this.mouseState !== MOUSE_STATE.DOWN) {
			this.updateHighlightedSuperpixel();
			this.redraw();
			return;
		}
		if (this.selectState === SELECT_STATE.PAN) {
			this.panHandler.onMouseMove(this.mouseAbs.x, this.mouseAbs.y, this.zoom);
			this.redraw();
			return;
		}
		if (this.selectState === SELECT_STATE.SELECT) {
			this.updateHighlightedSuperpixel();
			this.addSelectionToNoBackgroundImage();
		}
		else if (this.selectState === SELECT_STATE.DESELECT) {
			this.updateHighlightedSuperpixel();
			this.removeSelectionFromNoBackgroundImage();
		}
	};

	onMouseDown(event, isTouch) {
		if (!isTouch) { event.preventDefault(); };
		this.mouseState = MOUSE_STATE.DOWN;

		this.panHandler.onMouseDown(this.mouseAbs.x, this.mouseAbs.y, this.zoom);

		if (this.selectState === SELECT_STATE.SELECT) {
			this.addSelectionToNoBackgroundImage();
		}
		if (this.selectState === SELECT_STATE.DESELECT) {
			this.removeSelectionFromNoBackgroundImage();
		}
	};

	onContextMenu(event) {
		event.preventDefault();
		return false;
	}

	onMouseUp(event, isTouch) {
		if (!isTouch) { event.preventDefault(); };
		this.mouseState = MOUSE_STATE.UP;
	}

	onMouseOut(event) {
		event.preventDefault();
		this.mouseState = MOUSE_STATE.OUTSIDE;
		this.updateHighlightedSuperpixel();
	}

	onMouseOver(event) {
		event.preventDefault();
		if (this.mouseState !== MOUSE_STATE.DOWN) {
			this.mouseState = MOUSE_STATE.UP;
		}
	};

	onTouchStart(event) {
		if (event.touches.length > 1) { return; }
		const now = performance.now();
		this.onMouseMove(event.touches[0], true); // build highlight data by forcing a "mouse hover"
		this.onMouseDown(event.touches[0], true);
	};

	onTouchMove(event) {
		event.preventDefault();
		this.onMouseMove(event.touches[0], true);
	};

	onTouchEnd(event) {
		if (event.touches.length) { return; }
		this.onMouseUp(event);
	};

	doSlic(threshold) {
		this.doSLICOnImage(threshold);
		this.updateHighlightedSuperpixel();
	}

	zoomIn(zoomStep) {
		this.zoom += zoomStep || 0.1;
		this.redraw();
	}

	zoomOut(zoomStep) {
		this.zoom -= zoomStep || 0.1;
		this.redraw();
	}

	getZoom() {
		return this.zoom;
	}

	setSelectState(state) {
		this.selectState = state;
		this.panHandler.setPanEnabled(this.selectState === SELECT_STATE.PAN);
	};

	setMouseState(state) {
		this.mouseState = state;
	}

	getImageForegroundSelection() {
		return this.imageNoBackgroundData;
	}

/*****************************
		Private stuff
*****************************/

	doSLICOnImage(threshold) {
		console.log('SLIC Start', performance.now());
		const regionSize = threshold || 30;

		this.originalImageData = getImageDataFromImage(this.image, this.dummyCanvas.width, this.dummyCanvas.height);
		this.slic = new SLIC(this.originalImageData, { method: 'slic', regionSize });

		if (!this.imageNoBackgroundData) {
			// we are editing a new puppet without a selection
			this.imageNoBackgroundData = this.context.createImageData(this.slic.result.width, this.slic.result.height);
			// imageBackgroundMaskData = this.context.createImageData(slic.result.width, slic.result.height);
			for (var i = 0; i < this.slic.result.data.length; i += 4) {
				this.imageNoBackgroundData.data[i] = 0;
				this.imageNoBackgroundData.data[i + 1] = 0;
				this.imageNoBackgroundData.data[i + 2] = 0;
				this.imageNoBackgroundData.data[i + 3] = 0;
			}
		}
		else {
			if (!this.imageNoBackgroundData.data.length) {
				console.error('Error', 'incorrect imageNoBackgroundData');
				return;
			}
			const tempNoBgData = this.context.createImageData(this.slic.result.width, this.slic.result.height);
			this.dummyContext.putImageData(this.imageNoBackgroundData, 0, 0);
			this.imageNoBackgroundImage.src = this.dummyCanvas.toDataURL('image/png');
			this.imageNoBackgroundImage.onload = () => {
				this.createOutline(this.imageNoBackgroundImage, this.imageNoBackgroundImageOutlined);
				this.redraw();

				this.imageNoBackgroundImage.onload = null;
			};
		}
		this.redraw();
		console.log('SLIC Done', performance.now());
	}

	getEncodedSLICLabel(array, offset) {
		return array[offset] |
					(array[offset + 1] << 8) |
					(array[offset + 2] << 16);
	}

	addSelectionToNoBackgroundImage() {
		for (var i = 0; i < this.slic.result.data.length; i += 4) {
			if(this.highlightData.data[i+3] === 255) {
				this.imageNoBackgroundData.data[i] = SELECTED_REGION_COLOR.red;
				this.imageNoBackgroundData.data[i + 1] = SELECTED_REGION_COLOR.green;
				this.imageNoBackgroundData.data[i + 2] = SELECTED_REGION_COLOR.blue;
				this.imageNoBackgroundData.data[i + 3] = SELECTED_REGION_COLOR.alpha;
			}
		}
		this.dummyContext.putImageData(this.imageNoBackgroundData, 0, 0);
		this.imageNoBackgroundImage.src = this.dummyCanvas.toDataURL('image/png');
		this.imageNoBackgroundImage.onload = () => {
			this.createOutline(this.imageNoBackgroundImage, this.imageNoBackgroundImageOutlined);
			// this.redraw();

			this.imageNoBackgroundImage.onload = null;
		};
	}

	removeSelectionFromNoBackgroundImage() {
		for (var i = 0; i < this.slic.result.data.length; i += 4) {
			if(this.highlightData.data[i+3] === 255) {
				this.imageNoBackgroundData.data[i] = 0;
				this.imageNoBackgroundData.data[i + 1] = 0;
				this.imageNoBackgroundData.data[i + 2] = 0;
				this.imageNoBackgroundData.data[i + 3] = 0;
			}
		}
		this.dummyContext.putImageData(this.imageNoBackgroundData, 0, 0);
		this.imageNoBackgroundImage.src = this.dummyCanvas.toDataURL('image/png');
		this.imageNoBackgroundImage.onload = () => {
			this.createOutline(this.imageNoBackgroundImage, this.imageNoBackgroundImageOutlined);
			// this.redraw();

			this.imageNoBackgroundImage.onload = null;
		};
	}

	updateHighlightedSuperpixel() {
		if (!this.slic) {
			return;
		}

		/**
		 * If mouse goes outside of main image canvas, clean up highlight canvas using blank canvas.
		 */
		if (this.mouseState === MOUSE_STATE.OUTSIDE) {
			this.highlightImage.src = this.blankCanvas.toDataURL('image/png');
			this.highlightImage.onload = () => this.redraw();
			return;
		}

		const selectedLabel = [];
		const selectedIndex = 4 * (this.mouse.y * this.slic.result.width + this.mouse.x);
		selectedLabel.push(this.slic.result.data[selectedIndex]);
		selectedLabel.push(this.slic.result.data[selectedIndex + 1]);
		selectedLabel.push(this.slic.result.data[selectedIndex + 2]);

		this.highlightData = this.context.createImageData(this.slic.result.width, this.slic.result.height);

		for (var i = 0; i < this.slic.result.data.length; i += 4) {
			if(selectedLabel[0] === this.slic.result.data[i] &&
			selectedLabel[1] === this.slic.result.data[i+1] &&
			selectedLabel[2] === this.slic.result.data[i+2]) {
				this.highlightData.data[i] = HIGHLIGHTED_REGION_COLOR.red;
				this.highlightData.data[i + 1] = HIGHLIGHTED_REGION_COLOR.green;
				this.highlightData.data[i + 2] = HIGHLIGHTED_REGION_COLOR.blue;
				this.highlightData.data[i + 3] = HIGHLIGHTED_REGION_COLOR.alpha;
			}
			else {
				this.highlightData.data[i] = 255;
				this.highlightData.data[i + 1] = 0;
				this.highlightData.data[i + 2] = 0;
				this.highlightData.data[i + 3] = 0;
			}
		}

		this.dummyContext.putImageData(this.highlightData, 0, 0);

		//this.highlightImage.src = this.blankCanvas.toDataURL('image/png');
		//this.highlightImage.onload = () => {
			this.highlightImage.src = this.dummyCanvas.toDataURL('image/png');
			this.highlightImage.onload = () => {
				this.createOutline(this.highlightImage, this.highlightImageOutlined);
				this.redraw();

				this.highlightImage.onload = null;
			};
		//}
	}

	createOutline(imageSrc, imageDst) {
		console.log('creating outline');

		this.outlineContext.save();

		var dArr = [
			-1,-1,
			0,-1,
			1,-1,
			-1,0,
			1,0,
			-1,1,
			0,1,
			1,1
		];
		var outlineScale = 1;
	
		this.outlineContext.clearRect(0, 0, this.width, this.height);

		// draw images at offsets from the array scaled by s
		for(var i = 0; i < dArr.length; i += 2) {
			this.outlineContext.drawImage(imageSrc, dArr[i] * outlineScale, dArr[i+1] * outlineScale);
		}

		// fill with color
		this.outlineContext.globalCompositeOperation = "source-in";
		this.outlineContext.fillStyle = "blue";
		this.outlineContext.fillRect(0, 0, this.outlineCanvas.width, this.outlineCanvas.height);
		
		// draw original image in normal mode
		this.outlineContext.globalCompositeOperation = "source-over";
		this.outlineContext.drawImage(imageSrc, 0, 0);

		imageDst.src = this.outlineCanvas.toDataURL('image/png');

		this.outlineContext.restore();
	}

	redraw() {
		if (!this.image) {
			return;
		}

		this.context.clearRect(0, 0, this.width, this.height);

		this.context.save();
		this.context.scale(this.zoom, this.zoom);
		this.context.translate(this.panHandler.getPanPosition().x, this.panHandler.getPanPosition().y);

		this.context.globalAlpha = 1.0;
		this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.width, this.height);

		this.context.globalAlpha = 0.8;
		this.context.drawImage(
			this.imageNoBackgroundImageOutlined,
			0,
			0,
			this.imageNoBackgroundImage.width,
			this.imageNoBackgroundImage.height,
			0,
			0,
			this.width,
			this.height
		);

		this.context.globalAlpha = 1.0;

		this.context.drawImage(
			this.highlightImageOutlined,
			0,
			0,
			this.highlightImage.width,
			this.highlightImage.height,
			0,
			0,
			this.width,
			this.height
		);

		this.context.restore();
	}
}
export default ImageEditorService;
