/* Some utility functions for html5 canvas images. -zrispo */

function getValueIndex(x, y, value, imageData) {
  const index = CanvasUtils.getIndexOfXY(x,y,imageData);
  let valueIndex = null;
  if(value === 'r') {
    valueIndex = index;
  } else if(value === 'g') {
    valueIndex = index + 1;
  } else if(value === 'b') {
    valueIndex = index + 2;
  } else if(value === 'a') {
    valueIndex = index + 3;
  }
  return valueIndex;
}

export default class CanvasUtils {

  static getIndexOfXY(x, y, imageData) {
    return 4 * (y * imageData.width + x);
  }

  // TODO: move get value index out
  static getColorAtXY(x, y, value, imageData) {
    const valueIndex = getValueIndex(x, y, value, imageData);
    if (valueIndex === null) {
      console.log('Invalid value param for getColorAtXY! (r,g,b,or a expected!!)');
      return null;
    }
    return imageData.data[valueIndex];
  }

  static setColorAtXY(x, y, value, imageData, newValue) {
    const valueIndex = getValueIndex(x, y, value, imageData);
    if (valueIndex === null) {
      console.log('Invalid value param for getColorAtXY! (r,g,b,or a expected!!)');
      return;
    }
    imageData.data[valueIndex] = newValue;
  }

}
