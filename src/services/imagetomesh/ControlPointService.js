import { extractForeground, getImageDataFromImage } from 'services/imagetomesh/ImageUtil.js';
import loadImage from 'services/util/imageLoader';
import PanHandler from 'services/util/panHandler';
import { getDistance } from 'services/util/math';

const MOUSE_STATE = {
  UP: 'UP',
  DOWN: 'DOWN',
  OUTSIDE: 'OUTSIDE',
};

const ControlPointService = function () {
  let that = this;
  let context;
  let width;
  let height;
  let mouse = {};
  let mouseAbs = {};

  let foregroundImage;
  let controlPoints = [];
  let controlPointIndices = [];
  let activeControlPointIndex = -1;

  let zoom = 1;
  let lastTouchTime = 0;
  const panHandler = new PanHandler();
  let mouseState = MOUSE_STATE.UP;

/*****************************
    API
*****************************/

  this.init = function(canvas, imageData, backgroundRemovalData, controlPointPositions) {
    width = canvas.width;
    height = canvas.height;
    context = canvas.getContext('2d');
    controlPoints = controlPointPositions || [];
    context.fillStyle = '#0099EE';

    loadImage(imageData)
      .then((img) => {
        const largerSize = Math.max(img.width, img.height);
        const normWidth = (img.width / largerSize) * 400;
        const normHeight = (img.height / largerSize) * 400;
        width = normWidth;
        height = normHeight;
        const originalImageData = getImageDataFromImage(img, width, height);
        return extractForeground(originalImageData, backgroundRemovalData);
      })
      .then((imageNoBG) => {
        foregroundImage = imageNoBG;
        redraw();
      });
  };

  this.onMouseMove = (event, isTouch) => {
    if (!isTouch) { event.preventDefault(); };
    const rect = event.target.getBoundingClientRect();
    mouseAbs.x = (event.clientX - rect.left) / zoom;
    mouseAbs.y = (event.clientY - rect.top)  / zoom;
    mouse.x = mouseAbs.x - panHandler.getPanPosition().x;
    mouse.y = mouseAbs.y - panHandler.getPanPosition().y;
    mouse.x = Math.round(mouse.x);
    mouse.y = Math.round(mouse.y);

    if (!controlPoints.length) { return; }

    // Hover state control point logic
    if (mouseState === MOUSE_STATE.UP) {
      const nearestControlPoint = controlPoints
        .map((cp, index) => ({
          index,
          distance: getDistance(mouse.x, mouse.y, cp[0], cp[1])
        }))
        .filter(cp => cp.distance < 10)
        .sort((a, b) => a.distance - b.distance)[0];

      if (nearestControlPoint !== undefined) {
        activeControlPointIndex = nearestControlPoint.index;
      }
      else {
        activeControlPointIndex = -1;
      }
    }
    // Dragging control point logic
    if (mouseState === MOUSE_STATE.DOWN && controlPoints[activeControlPointIndex]) {
      const cp = controlPoints[activeControlPointIndex];
      cp[0] = mouse.x;
      cp[1] = mouse.y;
    }
    redraw();
  };

  this.onMouseDown = (event, isTouch) => {
    if (!isTouch) { event.preventDefault(); };
    mouseState = MOUSE_STATE.DOWN;
    if (activeControlPointIndex >= 0) { return; }
    controlPoints.push([ mouse.x, mouse.y ]);
    activeControlPointIndex = controlPoints.length - 1;
    redraw();
  };

  this.onContextMenu = event => {
    event.preventDefault();
    return false;
  }

  this.onMouseUp = (event, isTouch) => {
    if (!isTouch) { event.preventDefault(); };
    mouseState = MOUSE_STATE.UP;
  }

  this.onMouseOut = event => {
    event.preventDefault();
    mouseState = MOUSE_STATE.OUTSIDE;
  }

  this.onMouseOver = event => {
    event.preventDefault();
    if (mouseState !== MOUSE_STATE.DOWN) {
      mouseState = MOUSE_STATE.UP;
    }
  };

  this.onTouchStart = event => {
    event.preventDefault();
    if (event.touches.length > 1) { return; }
    const now = performance.now();
    const lastTouchDelta = now - lastTouchTime;
    lastTouchTime = now;
    if (lastTouchDelta < 200) {
      this.onDoubleClick();
      return;
    }
    this.onMouseMove(event.touches[0], true); // build highlight data by forcing a "mouse hover"
    this.onMouseDown(event.touches[0], true);
  };

  this.onTouchMove = event => {
    event.preventDefault();
    this.onMouseMove(event.touches[0], true);
  };

  this.onTouchEnd = event => {
    event.preventDefault();
    if (event.touches.length) { return; }
    this.onMouseUp(event);
  };

  this.onDoubleClick = event => {
    if (activeControlPointIndex < 0) { return; }
    controlPoints.splice(activeControlPointIndex, 1);
    activeControlPointIndex = -1;
    redraw();
  };

  this.getControlPoints = () => controlPoints;

  this.setMouseState = state => mouseState = state;

/*****************************
    Private stuff
*****************************/

  const redraw = () => {
    context.clearRect(0, 0, width, height);
    context.drawImage(foregroundImage,
                      0, 0, width, height,
                      0, 0, width, height);
    if (!controlPoints || !controlPoints.length) {
      return;
    }
    controlPoints.forEach((cp, index) => {
      const [x, y] = cp;
      const radius = index === activeControlPointIndex ? 10 : 5;
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fill();
    });
  }

}

export default ControlPointService;
