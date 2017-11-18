
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sign(x1, y1, x2, y2, x3, y3) {
  return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
}

//http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-triangle
function pointIsInsideTriangle(x, y, p1, p2, p3) {
  const b1 = sign(x, y, p1.x, p1.y, p2.x, p2.y) < 0.0;
  const b2 = sign(x, y, p2.x, p2.y, p3.x, p3.y) < 0.0;
  const b3 = sign(x, y, p3.x, p3.y, p1.x, p1.y) < 0.0;
  return ((b1 === b2) && (b2 === b3));
}

export { clamp, pointIsInsideTriangle };
