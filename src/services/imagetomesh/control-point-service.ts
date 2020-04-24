import { extractForeground, getImageDataFromImage } from 'services/imagetomesh/ImageUtil.js';
import loadImage from 'services/util/imageLoader';
import PanHandler from 'services/util/panHandler';
import { getDistance } from 'services/util/math';
import ControlPoint from 'services/puppet/control-point';

const MOUSE_STATE = {
	UP: 'UP',
	DOWN: 'DOWN',
	OUTSIDE: 'OUTSIDE',
};

const FINGER_POINT_MAPPING = {
	1: 'Thumb',
	2: 'Index',
	3: 'Middle',
	4: 'Ring',
	5: 'Pinky'
};

export enum ActiveHand {
	LEFT = 'left',
	RIGHT = 'right',
}

export enum FingerToMap {
	THUMB = 'thumb',
	INDEX = 'index',
	MIDDLE = 'middle',
	RING = 'ring',
	PINKY = 'pinky',
}

const CONTROL_POINT_COLOR = '#4A73E2';

class ControlPointService {
	private _context: CanvasRenderingContext2D;
	private _width: number;
	private _height: number;
	private _mouse = {
		x: 0,
		y: 0,
	};
	private _mouseAbs = {
		x: 0,
		y: 0,
	};
	private _activeHand = 'right';

	private _foregroundImage;
	private _controlPoints: ControlPoint[] = [];
	private _controlPointIndices = [];
	private _activeControlPointIndex = -1;

	private _zoom = 1;
	private _lastTouchTime = 0;
	private _panHandler = new PanHandler();
	private _mouseState = MOUSE_STATE.UP;

	public init = (canvas, imageData, backgroundRemovalData, controlPoints: ControlPoint[], initialZoom): void => {
		this._width = canvas.width;
		this._height = canvas.height;
		this._context = canvas.getContext('2d');
		this._controlPoints = controlPoints || [];
		this._context.fillStyle = CONTROL_POINT_COLOR;

		this._zoom = initialZoom || 1;

		loadImage(imageData)
			.then((img) => {
				const largerSize = Math.max(img.width, img.height);
				const normWidth = (img.width / largerSize) * 400;
				const normHeight = (img.height / largerSize) * 400;
				this._width = normWidth;
				this._height = normHeight;
				const originalImageData = getImageDataFromImage(img, this._width, this._height);
				return extractForeground(originalImageData, backgroundRemovalData);
			})
			.then((imageNoBG) => {
				this._foregroundImage = imageNoBG;
				this.redraw();
			});
	};

	public onMouseMove = (event): void => {
		const rect = event.target.getBoundingClientRect();
		this._mouseAbs.x = (event.clientX - rect.left) / this._zoom;
		this._mouseAbs.y = (event.clientY - rect.top) / this._zoom;
		this._mouse.x = this._mouseAbs.x - this._panHandler.getPanPosition().x;
		this._mouse.y = this._mouseAbs.y - this._panHandler.getPanPosition().y;
		this._mouse.x = Math.round(this._mouse.x);
		this._mouse.y = Math.round(this._mouse.y);

		if (!this._controlPoints.length) {
			return;
		}

		// Hover state control point logic
		if (this._mouseState === MOUSE_STATE.UP) {
			const nearestControlPoint = this._controlPoints
				.map((cp, index) => ({
					index,
					distance: getDistance(this._mouse.x, this._mouse.y, cp.position.x, cp.position.y)
				}))
				.filter(cp => cp.distance < 17)
				.sort((a, b) => a.distance - b.distance)[0];

			if (nearestControlPoint !== undefined) {
				this._activeControlPointIndex = nearestControlPoint.index;
			}
			else {
				this._activeControlPointIndex = -1;
			}
		}
		// Dragging control point logic
		if (this._mouseState === MOUSE_STATE.DOWN && this._controlPoints[this._activeControlPointIndex]) {
			const cp = this._controlPoints[this._activeControlPointIndex];
			cp.position.x = this._mouse.x;
			cp.position.y = this._mouse.y;
		}
		this.redraw();
	};

	public onMouseDown = (fingerName: string, fingerLabel: string): void => {
		this._mouseState = MOUSE_STATE.DOWN;
		if (this._activeControlPointIndex >= 0) { return; }

		// Allow user to place maximum of 5 control points on puppet.
		if (this._controlPoints.length >= 5) {
			return;
		}

		this._controlPoints.push({
			position: {
				x: this._mouse.x,
				y: this._mouse.y,
			},
			name: fingerName,
			label: fingerLabel,
		});
		this._activeControlPointIndex = this._controlPoints.length - 1;

		this.redraw();
	};

	public onContextMenu = (event): boolean => {
		event.preventDefault();
		return false;
	}

	public onMouseUp = (event): void => {
		this._mouseState = MOUSE_STATE.UP;
	}

	public onMouseOut = (event): void => {
		event.preventDefault();
		this._mouseState = MOUSE_STATE.OUTSIDE;
	}

	public onMouseOver = (event): void => {
		event.preventDefault();
		if (this._mouseState !== MOUSE_STATE.DOWN) {
			this._mouseState = MOUSE_STATE.UP;
		}
	};

	public onDoubleClick = (): void => {
		if (this._activeControlPointIndex < 0) { return; }
		this._controlPoints.splice(this._activeControlPointIndex, 1);
		this._activeControlPointIndex = -1;
		this.redraw();
	};

	public getControlPoints = (): any[] => this._controlPoints;

	public clearControlPoints = (): void => {
		this._controlPoints = [];
		this._activeControlPointIndex = -1;
		this.redraw();
	}

	public setMouseState = (state): void => this._mouseState = state;

	public setActiveHand = (activeHand: ActiveHand): void => {
		this._activeHand = activeHand;
		this.redraw();
	}

	public controlPointPlaced(controlPointLabel: string): boolean {
		const controlPoint = this._controlPoints.find((controlPoint) => {
			return controlPoint.label === controlPointLabel;
		});
		return Boolean(controlPoint);
	}

	public getNextFingerToMap = (): FingerToMap => {
		const fingersToMap: FingerToMap[] = [
			FingerToMap.THUMB,
			FingerToMap.INDEX,
			FingerToMap.MIDDLE,
			FingerToMap.RING,
			FingerToMap.PINKY
		];
		for(let i = 0; i < fingersToMap.length; i++) {
			const mappedFinger = this._controlPoints.find((controlPoint) => {
				return controlPoint.name === fingersToMap[i].toLowerCase();
			});

			if (!mappedFinger) {
				return fingersToMap[i];
			}
		}
	}

/*****************************
		Private stuff
*****************************/

	public redraw = (): void => {
		this._context.clearRect(0, 0, this._width, this._height);

		this._context.save();

		this._context.scale(this._zoom, this._zoom);
		this._context.drawImage(this._foregroundImage, 0, 0, this._width, this._height, 0, 0, this._width, this._height);
		if (!this._controlPoints || !this._controlPoints.length) {
			this._context.restore();
			return;
		}
		this._controlPoints.forEach((cp) => {
			const radius = 17;
			this._context.fillStyle = CONTROL_POINT_COLOR;
			this._context.beginPath();
			this._context.arc(cp.position.x, cp.position.y, radius, 0, 2 * Math.PI);
			this._context.fill();

			this._context.font = "bold 14px Inter";
			this._context.fillStyle = "white";
			this._context.textAlign = "center";
			this._context.fillText(cp.label, cp.position.x, cp.position.y + 6);
		});

		this._context.restore();
	}
}
export default ControlPointService;
