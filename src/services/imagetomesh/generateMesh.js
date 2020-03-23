import Delaunay from 'delaunay-fast';
import { extractForeground } from './ImageUtil.js';
import CanvasUtils from './canvasutils';
import requestPuppetCreation from './../puppet/PuppetFactory';

function findEdgesOfImage(imageNoBackgroundData) {
  const width = imageNoBackgroundData.width;
  const height = imageNoBackgroundData.height;
  const data = imageNoBackgroundData.data;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const contourData = context.createImageData(imageNoBackgroundData.width, imageNoBackgroundData.height);

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

function recalculateContourPoints(contourData) {
    const contourPointsRaw = [];
    /* Convert contour image into list of points */
    for (let x = 0; x < contourData.width; ++x) {
      for (let y = 0; y < contourData.height; ++y) {
        if(CanvasUtils.getColorAtXY(x, y, 'a', contourData) === 255) {
          contourPointsRaw.push([x,y]);
        }
      }
    }
    /* Resample list of points */
    const resampleDist = 10;
    for(let i = 0; i < contourPointsRaw.length; i++) {
      const a = contourPointsRaw[i];
      for(let j = 0; j < contourPointsRaw.length; j++) {
        if(i != j) {
          const b = contourPointsRaw[j];
          const ax = a[0];
          const ay = a[1];
          const bx = b[0];
          const by = b[1];
          const dx = Math.abs(bx - ax);
          const dy = Math.abs(by - ay);
          if (Math.sqrt(dx * dx + dy * dy) < resampleDist) {
            contourPointsRaw.splice(j, 1);
            j--;
          }
        }
      }
    }
    return contourPointsRaw;
}

function generatePuppetGeometry(contourPoints, controlPoints, imageNoBackgroundData) {
  /* Create list of vertices from contour points */
  const vertices = contourPoints.map(contourPoint => contourPoint);

  /* Add vertices for requested control points as well */
  const controlPointIndices = [];
  controlPoints.forEach((controlPoint) => {
    controlPointIndices.push(vertices.length);
    vertices.push(controlPoint);
  });

  /* Run delaunay on vertices to generate mesh */
  const rawTriangles = Delaunay.triangulate(vertices);

  /* Remove trianges whose centroids are in the image background */
  const triangles = [];
  for(let i = 0; i < rawTriangles.length; i += 3) {
    const x1 = vertices[rawTriangles[i]][0];
    const y1 = vertices[rawTriangles[i]][1];
    const x2 = vertices[rawTriangles[i + 1]][0];
    const y2 = vertices[rawTriangles[i + 1]][1];
    const x3 = vertices[rawTriangles[i + 2]][0];
    const y3 = vertices[rawTriangles[i + 2]][1];
    const centroidX = Math.round((x1 + x2 + x3) / 3);
    const centroidY = Math.round((y1 + y2 + y3) / 3);
    if(CanvasUtils.getColorAtXY(centroidX, centroidY, 'a', imageNoBackgroundData) === 255) {
      triangles.push(rawTriangles[i]);
      triangles.push(rawTriangles[i + 1]);
      triangles.push(rawTriangles[i + 2]);
    }
  }

  /* Remove vertices that aren't part of any triangle */
  for (let vi = 0; vi < vertices.length; vi++) {
    var vertexIsPartOfATriangle = false;
    for (let ti = 0; ti < triangles.length; ti++) {
      if (vi === triangles[ti]) {
        vertexIsPartOfATriangle = true;
      }
    }
    if (!vertexIsPartOfATriangle) {
      vertices.splice(vi, 1)
      /* Since we removed a vertex from the verts array, we need to update the
       * control points and triangles because they point to the vertices by index. */
      for (let ti = 0; ti < triangles.length; ti++) {
        if (triangles[ti] > vi) {
          triangles[ti] -= 1;
        }
      }
      for (let cpi = 0; cpi < controlPointIndices.length; cpi++) {
        if (controlPointIndices[cpi] > vi) {
          controlPointIndices[cpi] -= 1;
        }
      }
    }
  }
  return { triangles, vertices, controlPointIndices };
}

function generateMesh(puppetId, puppetName, image, imageNoBackgroundData, originalImageData, controlPoints) {
  const contourData = findEdgesOfImage(imageNoBackgroundData);
  return extractForeground(originalImageData, imageNoBackgroundData)
    .then((imageNoBG) => {
      const contourPoints = recalculateContourPoints(contourData);
      const geometry = generatePuppetGeometry(contourPoints, controlPoints, imageNoBackgroundData);
      return Promise.resolve({
        id: puppetId,
        name: puppetName,
        image,
        vertices: geometry.vertices,
        faces: geometry.triangles,
        controlPoints: geometry.controlPointIndices,
        controlPointPositions: controlPoints,
        imageNoBG,
        backgroundRemovalData: imageNoBackgroundData
      });
    })
    .then(puppetParams => requestPuppetCreation(puppetParams));
}

export { generateMesh };
