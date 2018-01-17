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

const ImageEditorService = function () {
  let that = this;
  let context;
  let width;
  let height;
  let mouse = {};
  let mouseAbs = {};

  let image;
  let originalImageData;

  let slic;
  let slicSegmentsCentroids;

  let highlightData;
  let highlightImage = new Image();

  let imageNoBackgroundData;
  let imageNoBackgroundImage = new Image();

  let dummyCanvas = document.createElement('canvas');
  let dummyContext = dummyCanvas.getContext('2d');
  let blankCanvas = document.createElement('canvas');
  let blankContext = blankCanvas.getContext('2d');

  let zoom = 1;
  const panHandler = new PanHandler();

  let mouseState = MOUSE_STATE.UP;
  let selectState = SELECT_STATE.SELECT;

/*****************************
    API
*****************************/

    this.init = function(canvas, imageData, backgroundRemovalData) {
      width = canvas.width;
      height = canvas.height;
      context = canvas.getContext('2d');
      imageNoBackgroundData = backgroundRemovalData;

      return loadImage(imageData)
        .then((img) => {
          const largerSize = Math.max(img.width, img.height);
          const normWidth = (img.width / largerSize) * 400;
          const normHeight = (img.height / largerSize) * 400;
          width = normWidth;
          height = normHeight;
          dummyCanvas.width = normWidth;
          dummyCanvas.height = normHeight;
          image = img;
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

      if (mouseState !== MOUSE_STATE.DOWN) {
        that.updateHighligtedSuperpixel();
        redraw();
        return;
      }
      if (selectState === SELECT_STATE.PAN) {
        panHandler.onMouseMove(mouseAbs.x, mouseAbs.y, zoom);
        redraw();
        return;
      }
      if (selectState === SELECT_STATE.SELECT) {
        that.updateHighligtedSuperpixel();
        that.addSelectionToNoBackgroundImage();
      }
      else if (selectState === SELECT_STATE.DESELECT) {
        that.updateHighligtedSuperpixel();
        that.removeSelectionFromNoBackgroundImage();
      }
    };

    this.onMouseDown = (event, isTouch) => {
      if (!isTouch) { event.preventDefault(); };
      mouseState = MOUSE_STATE.DOWN;

      panHandler.onMouseDown(mouseAbs.x, mouseAbs.y, zoom);

      if (selectState === SELECT_STATE.SELECT) {
        that.addSelectionToNoBackgroundImage();
      }
      if (selectState === SELECT_STATE.DESELECT) {
        that.removeSelectionFromNoBackgroundImage();
      }
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
      that.updateHighligtedSuperpixel();
    }

    this.onMouseOver = event => {
      event.preventDefault();
      if (mouseState !== MOUSE_STATE.DOWN) {
        mouseState = MOUSE_STATE.UP;
      }
    };

    this.onTouchStart = event => {
      if (event.touches.length > 1) { return; }
      const now = performance.now();
      this.onMouseMove(event.touches[0], true); // build highlight data by forcing a "mouse hover"
      this.onMouseDown(event.touches[0], true);
    };

    this.onTouchMove = event => {
      event.preventDefault();
      this.onMouseMove(event.touches[0], true);
    };

    this.onTouchEnd = event => {
      if (event.touches.length) { return; }
      this.onMouseUp(event);
    };

    this.doSlic = function(threshold) {
      this.doSLICOnImage(threshold);
      this.updateHighligtedSuperpixel();
    }

    this.zoomIn = function () {
        zoom += 0.1;
        redraw();
    }

    this.zoomOut = function () {
        zoom -= 0.1;
        redraw();
    }

    this.setSelectState = state => {
      selectState = state;
      panHandler.setPanEnabled(selectState === SELECT_STATE.PAN);
    };

    this.setMouseState = state => mouseState = state;

    this.getImageForegroundSelection = () => imageNoBackgroundData;

/*****************************
    Private stuff
*****************************/

  this.doSLICOnImage = function (threshold) {
    console.log('SLIC Start', performance.now());
    const regionSize = threshold || 30;

    originalImageData = getImageDataFromImage(image, dummyCanvas.width, dummyCanvas.height);
    slic = new SLIC(originalImageData, { method: 'slic', regionSize });

    if (!imageNoBackgroundData) {
      // we are editing a new puppet without a selection
      imageNoBackgroundData = context.createImageData(slic.result.width, slic.result.height);
      // imageBackgroundMaskData = context.createImageData(slic.result.width, slic.result.height);
      for (var i = 0; i < slic.result.data.length; i += 4) {
        imageNoBackgroundData.data[i]     = 0;
        imageNoBackgroundData.data[i + 1] = 0;
        imageNoBackgroundData.data[i + 2] = 0;
        imageNoBackgroundData.data[i + 3] = 0;
      }
    }
    else {
      if (!imageNoBackgroundData.data.length) {
        console.error('Error', 'incorrect imageNoBackgroundData');
        return;
      }
      const tempNoBgData = context.createImageData(slic.result.width, slic.result.height);
      dummyContext.putImageData(imageNoBackgroundData, 0, 0);
      imageNoBackgroundImage.src = dummyCanvas.toDataURL('image/png');
    }
    redraw();
    console.log('SLIC Done', performance.now());
  }

  this.getEncodedSLICLabel = function (array, offset) {
    return array[offset] |
          (array[offset + 1] << 8) |
          (array[offset + 2] << 16);
  }

  this.addSelectionToNoBackgroundImage = function () {
    for (var i = 0; i < slic.result.data.length; i += 4) {
      if(highlightData.data[i+3] === 255) {
        imageNoBackgroundData.data[i]     = 255;
        imageNoBackgroundData.data[i + 1] = 255;
        imageNoBackgroundData.data[i + 2] = 255;
        imageNoBackgroundData.data[i + 3] = 255;
      }
    }
    dummyContext.putImageData(imageNoBackgroundData, 0, 0);
    imageNoBackgroundImage.src = dummyCanvas.toDataURL('image/png');
  }

  this.removeSelectionFromNoBackgroundImage = function () {
    for (var i = 0; i < slic.result.data.length; i += 4) {
      if(highlightData.data[i+3] === 255) {
        imageNoBackgroundData.data[i]     = 0;
        imageNoBackgroundData.data[i + 1] = 0;
        imageNoBackgroundData.data[i + 2] = 0;
        imageNoBackgroundData.data[i + 3] = 0;
      }
    }
    dummyContext.putImageData(imageNoBackgroundData, 0, 0);
    imageNoBackgroundImage.src = dummyCanvas.toDataURL('image/png');
  }

  this.updateHighligtedSuperpixel = function () {
    if (!slic) {
      return;
    }
    if (mouseState === MOUSE_STATE.OUTSIDE) {
      highlightImage.src = blankCanvas.toDataURL('image/png');
      highlightImage.onload = () => redraw();
      return;
    }
    const selectedLabel = [];
    const selectedIndex = 4*(mouse.y*slic.result.width+mouse.x);
    selectedLabel.push(slic.result.data[selectedIndex]);
    selectedLabel.push(slic.result.data[selectedIndex+1]);
    selectedLabel.push(slic.result.data[selectedIndex+2]);

    highlightData = context.createImageData(slic.result.width, slic.result.height);

    for (var i = 0; i < slic.result.data.length; i += 4) {
      if(selectedLabel[0] === slic.result.data[i] &&
       selectedLabel[1] === slic.result.data[i+1] &&
       selectedLabel[2] === slic.result.data[i+2]) {
        highlightData.data[i]     = 255;
        highlightData.data[i + 1] = 0;
        highlightData.data[i + 2] = 0;
        highlightData.data[i + 3] = 255;
      } else {
        highlightData.data[i]     = 255;
        highlightData.data[i + 1] = 0;
        highlightData.data[i + 2] = 0;
        highlightData.data[i + 3] = 0;
      }
    }

    dummyContext.putImageData(highlightData, 0, 0);
    highlightImage.src = dummyCanvas.toDataURL('image/png');
    highlightImage.onload = () => redraw();
  }

  const redraw = () => {
    if (!image) { return; }
    context.clearRect(0, 0, width, height);

    context.save();
    context.scale(zoom, zoom);
    context.translate(panHandler.getPanPosition().x, panHandler.getPanPosition().y);

    context.globalAlpha = 1.0;
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
    context.drawImage(highlightImage,
                      0, 0, highlightImage.width, highlightImage.height,
                      0, 0, width, height);
    context.globalAlpha = 0.8;
    context.drawImage(imageNoBackgroundImage,
                      0, 0, imageNoBackgroundImage.width, imageNoBackgroundImage.height,
                      0, 0, width, height);
    context.globalAlpha = 1.0;

    context.restore();
  }

}

export default ImageEditorService;
