/*
 *        ImageToMesh
 *
 * lil app made to:
 *  - superpixel segment images
 *  - detect contours
 *  - triangulate points
 *
 */
import Delaunay from 'delaunay-fast';
import SLIC from './slic.js';
import CanvasUtils from 'services/imagetomesh/canvasUtils.js';
import loadImage from 'services/util/imageLoader';
import {
  findEdgesOfImage,
  removeBackgroundFromImage,
  recalculateContourPoints
} from 'services/imagetomesh/generateMesh';

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

    var contourData;
    var contourImage;

    var contourPoints;

    var controlPoints;
    var controlPointIndices;

    var vertices;
    var triangles;

    var dummyCanvas;
    var dummyContext;
    let blankCanvas;
    let blankContext;

    var zoom;

    // var onlySelectionImage;

    var panPosition;
    var panFromPosition;

    let mouseState = MOUSE_STATE.UP;
    let selectState = SELECT_STATE.SELECT;

    var onChangeCallback = function () {};

/*****************************
    API
*****************************/

    this.onChange = function (callback) {
        onChangeCallback = callback;
    }

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
      mouse.x = mouseAbs.x - panPosition.x;
      mouse.y = mouseAbs.y - panPosition.y;
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
        panPosition.x += mouseAbs.x - panFromPosition.x;
        panPosition.y += mouseAbs.y - panFromPosition.y;
        panFromPosition = { x: mouseAbs.x, y: mouseAbs.y };
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

      panFromPosition = {x:mouseAbs.x, y:mouseAbs.y};

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

    // TODO: seperate this logic from the ui actions
    // each function is only called from here
    this.generateMesh = function () {
        // this.recalculateCentroids();
        const contourData = findEdgesOfImage(imageNoBackgroundData, context.createImageData(slic.result.width, slic.result.height));
        // return this.findEdgesOfImage()

        return removeBackgroundFromImage(slic, imageNoBackgroundData, originalImageData, dummyContext, dummyCanvas)
          .then((onlySelectionImage) => {
            const contourPoints = recalculateContourPoints(contourData);
            this.generateTriangles(contourPoints);
            // redraw();

            return Promise.resolve({
              onlySelectionImage,
              contourPoints
            });
          })
          .then((resolve) => {
            return {
              vertices,
              triangles,
              image,
              onlySelectionImage: resolve.onlySelectionImage,
              controlPoints: resolve.controlPoints,
              controlPointIndices,
              imageNoBackgroundData
            };
          });
    }

    // TODO: this should be the constructor
    this.editImage = function (imageData, controlPointPositions, backgroundRemovalData) {
        console.log('editImage start');
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

        // imageBackgroundMaskData = undefined;
        imageBackgroundMaskImage = new Image();

        contourData = undefined;
        contourImage = new Image();

        contourPoints = undefined;

        controlPoints = [];
        controlPointIndices = [];

        vertices = undefined;
        triangles = undefined;

        zoom = 1.0;
        panPosition = {x:0, y:0};
        panFromPosition = {x:0, y:0}

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

    this.setSelectState = state => selectState = state;
    this.setMouseState = state => mouseState = state;

/*****************************
    Private stuff
*****************************/

    this.generateImageData = function() {
      return context.createImageData(slic.result.width, slic.result.height);
    }

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

    // TODO: this could be an external function with 'contourData' passed in
    this.recalculateContourPoints = function (contourData) {

        var contourPointsRaw = [];

        /* Convert contour image into list of points */

        for (var x = 0; x < contourData.width; ++x) {
            for (var y = 0; y < contourData.height; ++y) {
                if(CanvasUtils.getColorAtXY(x,y,"a",contourData) == 255) {
                    contourPointsRaw.push([x,y]);
                }
            }
        }

        /* Resample list of points */

        contourPoints = [];

        var resampleDist = 10;
        for(var i = 0; i < contourPointsRaw.length; i++) {
            var a = contourPointsRaw[i];
            for(var j = 0; j < contourPointsRaw.length; j++) {
                if(i != j) {
                    var b = contourPointsRaw[j];
                    var ax = a[0];
                    var ay = a[1];
                    var bx = b[0];
                    var by = b[1];
                    var dx = Math.abs(bx - ax);
                    var dy = Math.abs(by - ay);
                    if(Math.sqrt(dx*dx+dy*dy) < resampleDist) {
                        contourPointsRaw.splice(j, 1);
                        j--;
                    }
                }
            }
        }
        contourPoints = contourPointsRaw;

        // redraw();

    }

    // this.recalculateCentroids = function () {
    //
    //     slicSegmentsCentroids = [];
    //
    //     for(var i = 0; i < slic.result.numSegments; i++) {
    //         this.findCentroidOfSLICSegment(slic.result,i);
    //     }
    //
    // }
    //
    // // TODO: make external function
    // this.findCentroidOfSLICSegment = function (slicImageData, SLICLabel) {
    //
    //     /* Find all pixels that have the label we're looking for */
    //
    //     var pixelPoints = []
    //
    //     for (var x = 0; x < slicImageData.width; ++x) {
    //         for (var y = 0; y < slicImageData.height; ++y) {
    //             var index = CanvasUtils.getIndexOfXY(x,y,slicImageData);
    //             var currentSLICLabel = this.getEncodedSLICLabel(slicImageData.data, index);
    //             if(currentSLICLabel == SLICLabel) {
    //                 pixelPoints.push([x,y]);
    //             }
    //         }
    //     }
    //
    //     /* Calculate centroid (average points) */
    //
    //     var totalX = 0;
    //     var totalY = 0;
    //     for(var i = 0; i < pixelPoints.length; i++) {
    //         totalX += pixelPoints[i][0];
    //         totalY += pixelPoints[i][1];
    //     }
    //     var avgX = totalX / pixelPoints.length;
    //     var avgY = totalY / pixelPoints.length;
    //
    //     var centroid = [avgX,avgY];
    //
    //     /* Update slicSegmentsCentroids if the centroid is not part of the background */
    //
    //     var roundedCentroid = [Math.round(centroid[0]), Math.round(centroid[1])];
    //     if(CanvasUtils.getColorAtXY(roundedCentroid[0], roundedCentroid[1], "a", imageNoBackgroundData) == 255) {
    //         slicSegmentsCentroids[SLICLabel] = centroid;
    //     }
    //
    // }


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

    this.generateTriangles = function(contourPoints) {
        /* Create list of vertices from superpixel centroids and contour points */

        vertices = [];

        for(var i = 0; i < contourPoints.length; i++) {
            vertices.push(contourPoints[i]);
        }

        // Don't actually add the slic centroids as points lol
        // (Just uncomment this if u want to tho.)
        // for(var i = 0; i < slicSegmentsCentroids.length; i++) {
        //     var segment = slicSegmentsCentroids[i];
        //     if(segment) {
        //         vertices.push(slicSegmentsCentroids[i]);
        //     }
        // }

        /* Add vertices for requested control points as well */

        for(var i = 0; i < controlPoints.length; i++) {
            controlPointIndices.push(vertices.length);
            vertices.push(controlPoints[i]);
        }

        /* Run delaunay on vertices to generate mesh */

        var rawTriangles = Delaunay.triangulate(vertices);

        /* Remove trianges whose centroids are in the image background */

        triangles = [];

        for(var i = 0; i < rawTriangles.length; i+=3) {
            var x1 = vertices[rawTriangles[i]][0];
            var y1 = vertices[rawTriangles[i]][1];

            var x2 = vertices[rawTriangles[i+1]][0];
            var y2 = vertices[rawTriangles[i+1]][1];

            var x3 = vertices[rawTriangles[i+2]][0];
            var y3 = vertices[rawTriangles[i+2]][1];

            var centroidX = Math.round((x1 + x2 + x3) / 3);
            var centroidY = Math.round((y1 + y2 + y3) / 3);

            if(CanvasUtils.getColorAtXY(centroidX,centroidY,"a",imageNoBackgroundData) == 255) {
                triangles.push(rawTriangles[i]);
                triangles.push(rawTriangles[i+1]);
                triangles.push(rawTriangles[i+2]);
            }
        }

        /* Remove vertices that aren't part of any triangle */

        for(var vi = 0; vi < vertices.length; vi++) {

            var vertexIsPartOfATriangle = false;

            for(var ti = 0; ti < triangles.length; ti++) {
                if(vi == triangles[ti]) {
                    vertexIsPartOfATriangle = true;
                }
            }

            if(!vertexIsPartOfATriangle) {
                vertices.splice(vi, 1)

                /* Since we removed a vertex from the verts array, we need to update the
                 * control points and triangles because they point to the vertices by index. */

                for(var ti = 0; ti < triangles.length; ti++) {
                    if(triangles[ti] > vi) {
                        triangles[ti] -= 1;
                    }
                }
                for(var cpi = 0; cpi < controlPointIndices.length; cpi++) {
                    if(controlPointIndices[cpi] > vi) {
                        controlPointIndices[cpi] -= 1;
                    }
                }
            }
        }

    }

    var redraw = function () {

        context.clearRect(0, 0, width, height);

        context.save();
        context.scale(zoom, zoom);
        context.translate(panPosition.x, panPosition.y);

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

        // context.drawImage(contourImage,
        //                   0, 0, contourImage.width, contourImage.height,
        //                   0, 0, width, height);

        // if(slicSegmentsCentroids) {
        //   console.log('---- draw slicSegmentsCentroids')
        //     for(var i = 0; i < slicSegmentsCentroids.length; i++) {
        //         var segment = slicSegmentsCentroids[i];
        //         if(segment) {
        //             var centroidX = slicSegmentsCentroids[i][0];
        //             var centroidY = slicSegmentsCentroids[i][1];
        //
        //             context.beginPath();
        //             context.arc(centroidX, centroidY, 3, 0, 2 * Math.PI, false);
        //             context.fillStyle = 'yellow';
        //             context.fill();
        //         }
        //     }
        // }
        // if(contourPoints) {
        //     for(var i = 0; i < contourPoints.length; i++) {
        //         var centroidX = contourPoints[i][0];
        //         var centroidY = contourPoints[i][1];
        //
        //         context.beginPath();
        //         context.arc(centroidX, centroidY, 3, 0, 2 * Math.PI, false);
        //         context.fillStyle = '#00FF00';
        //         context.fill();
        //     }
        // }
        if(controlPoints) {
            for(var i = 0; i < controlPoints.length; i++) {
                var cpx = controlPoints[i][0];
                var cpy = controlPoints[i][1];

                context.beginPath();
                context.arc(cpx, cpy, 3, 0, 2 * Math.PI, false);
                context.fillStyle = '#00FFFF';
                context.fill();
            }
        }

        if(vertices) {
            for(var i = 0; i < vertices.length; i++) {
                var centroidX = vertices[i][0];
                var centroidY = vertices[i][1];

                context.beginPath();
                context.arc(centroidX, centroidY, 3, 0, 2 * Math.PI, false);
                context.fillStyle = '#FF00FF';
                context.fill();
            }
        }

        if(triangles) {
            for(var i = 0; i < triangles.length; ) {
                context.beginPath();
                context.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]); i++;
                context.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]); i++;
                context.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]); i++;
                context.closePath();
                context.stroke();
            }
        }

        context.restore();
    }

}

export default ImageToMesh;
