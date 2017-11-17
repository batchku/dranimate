import loadImage from 'services/util/imageLoader';
import CanvasUtils from 'services/imagetomesh/canvasUtils.js';


function findEdgesOfImage(imageNoBackgroundData, contourData) {
    const width = imageNoBackgroundData.width;
    const height = imageNoBackgroundData.height;
    const data = imageNoBackgroundData.data;

    for (let i = 0; i < height; ++i) {
      for (let j = 0; j < width; ++j) {
        const offset = 4 * (i * width + j);
        const alpha = data[4 * (i * width + j) + 3];
        const isSLICBoundary = (alpha !== data[4 * (i * width + j - 1)] ||
                              alpha !== data[4 * (i * width + j + 1)] ||
                              alpha !== data[4 * ((i - 1) * width + j)] ||
                              alpha !== data[4 * ((i + 1) * width + j)]);
        const isOnImageBorder = i === 0 ||
                              j === 0 ||
                              i === (height - 1) ||
                              j === (width - 1);
        const isBoundary = isSLICBoundary && !isOnImageBorder;

        const p = 4 * (i * width + j);
        if (isBoundary) {
          contourData.data[p] = 255;
          contourData.data[p+1] = 0;
          contourData.data[p+2] = 0;
          contourData.data[p+3] = 255;
        } else {
          contourData.data[p] = 255;
          contourData.data[p+1] = 0;
          contourData.data[p+2] = 0;
          contourData.data[p+3] = 0;
        }

      }
    }
    return contourData;
}

function removeBackgroundFromImage(slic, imageNoBackgroundData, originalImageData, dummyContext, dummyCanvas) {
    for (let i = 0; i < slic.result.data.length; i += 4) {
      if(imageNoBackgroundData.data[i+3] !== 255) {
        originalImageData.data[i]     = 0;
        originalImageData.data[i + 1] = 0;
        originalImageData.data[i + 2] = 0;
        originalImageData.data[i + 3] = 0;
      }
    }
    dummyContext.putImageData(originalImageData, 0, 0);
    return loadImage(dummyCanvas.toDataURL('image/png'));
}

function recalculateContourPoints(contourData) {

    const contourPointsRaw = [];

    /* Convert contour image into list of points */

    for (let x = 0; x < contourData.width; ++x) {
        for (let y = 0; y < contourData.height; ++y) {
            if(CanvasUtils.getColorAtXY(x,y,"a",contourData) == 255) {
                contourPointsRaw.push([x,y]);
            }
        }
    }

    /* Resample list of points */

    // const contourPoints = [];

    const resampleDist = 10;
    for(let i = 0; i < contourPointsRaw.length; i++) {
        const a = contourPointsRaw[i];
        for(let j = 0; j < contourPointsRaw.length; j++) {
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

    return contourPointsRaw;

    // contourPoints = contourPointsRaw;

    // redraw();

}

export {
  findEdgesOfImage,
  removeBackgroundFromImage,
  recalculateContourPoints
};
