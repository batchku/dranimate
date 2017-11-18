import Delaunay from 'delaunay-fast';
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

function generateTriangles(contourPoints, controlPoints, imageNoBackgroundData) {
    /* Create list of vertices from superpixel centroids and contour points */

    const vertices = [];

    for(let i = 0; i < contourPoints.length; i++) {
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
    const controlPointIndices = [];

    for(var i = 0; i < controlPoints.length; i++) {
        controlPointIndices.push(vertices.length);
        vertices.push(controlPoints[i]);
    }

    /* Run delaunay on vertices to generate mesh */

    const rawTriangles = Delaunay.triangulate(vertices);

    /* Remove trianges whose centroids are in the image background */

    const triangles = [];

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

    return { triangles, vertices, controlPointIndices };
}

// TODO: make this return a class that puppet factory can take to create puppet
function generateMesh(image, imageNoBackgroundData, originalImageData, context, dummyContext, dummyCanvas, controlPoints, slic) {
  const contourData = findEdgesOfImage(imageNoBackgroundData, context.createImageData(slic.result.width, slic.result.height));
  return removeBackgroundFromImage(slic, imageNoBackgroundData, originalImageData, dummyContext, dummyCanvas)
    .then((onlySelectionImage) => {
      const contourPoints = recalculateContourPoints(contourData);
      const geoData = generateTriangles(contourPoints, controlPoints, imageNoBackgroundData);
      return Promise.resolve({
        image,
        onlySelectionImage,
        vertices: geoData.vertices,
        triangles: geoData.triangles,
        controlPointIndices: geoData.controlPointIndices,
        controlPointPositions: controlPoints,
        imageNoBackgroundData
      });
    })
}

export { generateMesh };
