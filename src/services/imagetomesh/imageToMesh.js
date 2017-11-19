/*
 *        ImageToMesh
 *
 * lil app made to:
 *  - superpixel segment images
 *  - detect contours
 *  - triangulate points
 *
 */
// import Delaunay from 'delaunay-fast';
import SLIC from './slic.js';
import CanvasUtils from 'services/imagetomesh/canvasUtils.js';
import loadImage from 'services/util/imageLoader';
import PanHandler from 'services/util/panHandler';
import { generateMesh } from 'services/imagetomesh/generateMesh';

const SELECT_STATE = {
  PAN: 'PAN',
  CONTROL_POINT: 'CONTROL_POINT',
  SELECT: 'SELECT',
  DESELECT: 'DESELECT'
};
const MOUSE_STATE = {
  UP: 'UP',
  DOWN: 'DOWN',
  OUTSIDE: 'OUTSIDE',
};

var ImageToMesh = function () {

    var that = this;

    var context;

    let width;
    let height;

    var mouse;
    var mouseAbs;

    var image;
    var originalImageData;

    var slic;
    var slicSegmentsCentroids;

    var highlightData;
    var highlightImage;

    var imageNoBackgroundData;
    var imageNoBackgroundImage;

    var imageBackgroundMaskImage;

    var controlPoints;
    var controlPointIndices;

    var dummyCanvas;
    var dummyContext;
    let blankCanvas;
    let blankContext;

    var zoom;

    const panHandler = new PanHandler();

    let mouseState = MOUSE_STATE.UP;
    let selectState = SELECT_STATE.SELECT;

/*****************************
    API
*****************************/

    this.setup = function (i2mCanvas) {
        width = i2mCanvas.width;
        height = i2mCanvas.height;
        context = i2mCanvas.getContext('2d');
        console.log('------imageToMesh.setup', i2mCanvas)
    }

    this.onMouseMove = function(evt) {
      evt.preventDefault();
      const rect = evt.target.getBoundingClientRect();
      mouseAbs.x = (evt.clientX - rect.left) / zoom;
      mouseAbs.y = (evt.clientY - rect.top)  / zoom;
      mouse.x = mouseAbs.x - panHandler.getPanPosition().x;
      mouse.y = mouseAbs.y - panHandler.getPanPosition().y;
      mouse.x = Math.round(mouse.x);
      mouse.y = Math.round(mouse.y);

      if (selectState === SELECT_STATE.CONTROL_POINT) {
        return;
      }
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
        that.removeSelectionToNoBackgroundImage();
      }
    };

    this.onMouseDown = function(evt) {
      evt.preventDefault();
      mouseState = MOUSE_STATE.DOWN;

      panHandler.onMouseDown(mouseAbs.x, mouseAbs.y, zoom);

      if (selectState === SELECT_STATE.CONTROL_POINT) {
        controlPoints.push([mouse.x, mouse.y]);
        redraw();
      }
      if (selectState === SELECT_STATE.SELECT) {
        that.addSelectionToNoBackgroundImage();
      }
      if (selectState === SELECT_STATE.DESELECT) {
        that.removeSelectionToNoBackgroundImage();
      }
    };

    this.onContextMenu = function (evt) {
      evt.preventDefault();
      return false;
    }

    this.onMouseUp = event => {
      event.preventDefault();
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

    this.generateMesh = function () {
      return generateMesh(image, imageNoBackgroundData, originalImageData, context, dummyContext, dummyCanvas, controlPoints, slic);
    }

    // TODO: this should be the constructor
    this.editImage = function (imageData, controlPointPositions, backgroundRemovalData) {
        dummyCanvas = document.createElement("canvas");
        dummyContext = dummyCanvas.getContext("2d");
        blankCanvas = document.createElement('canvas');
        blankContext = blankCanvas.getContext('2d');

        mouse = {};
        mouseAbs = {};

        slic = undefined;
        slicSegmentsCentroids = undefined;

        highlightData = undefined;
        highlightImage = new Image();

        imageNoBackgroundData = undefined;
        imageNoBackgroundImage = new Image();

        imageBackgroundMaskImage = new Image();

        controlPoints = [];
        controlPointIndices = [];

        zoom = 1.0;

        if(controlPointPositions) {
          controlPoints = controlPointPositions;
        }

        if(backgroundRemovalData) {
          imageNoBackgroundData = backgroundRemovalData;
        }

        return loadImage(imageData)
          .then((img) => {
            let normWidth = img.width;
            let normHeight = img.height;
            const largerSize = Math.max(normWidth, normHeight);

            normWidth /= largerSize;
            normHeight /= largerSize;

            normWidth *= 400;
            normHeight *= 400;

            dummyCanvas.width = normWidth;
            dummyCanvas.height = normHeight;

            width = normWidth;
            height = normHeight;

            dummyContext.clearRect(0, 0, dummyCanvas.width, dummyCanvas.height);
            dummyContext.drawImage(img,
              0, 0, img.width, img.height,
              0, 0, dummyCanvas.width, dummyCanvas.height
            );
            return Promise.resolve(dummyCanvas.toDataURL('image/png'));
          })
          .then(imgSrc => loadImage(imgSrc))
          .then(img => image = img);
    }

    this.doSlic = function(threshold) {
      this.doSLICOnImage(threshold);
    }

    this.getControlPoints = function () {
      return controlPoints;
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

/*****************************
    Private stuff
*****************************/

    this.doSLICOnImage = function (threshold) {
        console.log('SLIC Start', performance.now());
        const regionSize = threshold || 30;

        dummyContext.drawImage(image, 0, 0, image.width, image.height,
                                      0, 0, dummyCanvas.width, dummyCanvas.height);
        originalImageData = dummyContext.getImageData(0, 0, dummyCanvas.width, dummyCanvas.height);

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
          imageNoBackgroundImage.src = dummyCanvas.toDataURL("image/png");
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

    this.removeSelectionToNoBackgroundImage = function () {

        for (var i = 0; i < slic.result.data.length; i += 4) {
            if(highlightData.data[i+3] === 255) {
                imageNoBackgroundData.data[i]     = 0;
                imageNoBackgroundData.data[i + 1] = 0;
                imageNoBackgroundData.data[i + 2] = 0;
                imageNoBackgroundData.data[i + 3] = 0;
            }
        }

        dummyContext.putImageData(imageNoBackgroundData, 0, 0);
        imageNoBackgroundImage.src = dummyCanvas.toDataURL("image/png");
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
      highlightImage.src = dummyCanvas.toDataURL("image/png");
      highlightImage.onload = () => redraw();
    }

    var redraw = function () {

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

        if(controlPoints && controlPoints.length) {
            context.fillStyle = '#00FFFF';
            for(var i = 0; i < controlPoints.length; i++) {
                var cpx = controlPoints[i][0];
                var cpy = controlPoints[i][1];

                context.beginPath();
                context.arc(cpx, cpy, 3, 0, 2 * Math.PI, false);
                context.fill();
            }
        }

        context.restore();
    }

}

export default ImageToMesh;
