// TODO: disable this in jsenv eslint config
/* eslint-disable operator-assignment */
export const getVectorLength = ({ x, y }) => {
  return Math.sqrt(x * x + y * y);
};

export const clampVectorLength = (vector, max) => {
  const length = getVectorLength(vector);
  if (length > max) {
    return vector;
  }

  const scale = max / length;
  const vectorClamped = {
    x: vector.x * scale,
    y: vector.y * scale,
  };
  return vectorClamped;
};

export const addVector = (vectorA, vectorB) => {
  return {
    x: vectorA.x + vectorB.x,
    y: vectorA.y + vectorB.y,
  };
};

export const substractVector = (vectorA, vectorB) => {
  return {
    x: vectorA.x - vectorB.x,
    y: vectorA.y - vectorB.y,
  };
};

export const scaleVector = (vector, scale) => {
  if (scale === 1) {
    return vector;
  }

  return {
    x: vector.x * scale,
    y: vector.y * scale,
  };
};

export const getScalarProduct = (vectorA, vectorB) => {
  return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
};

export const getVectorialProduct = (vectorA, vectorB) => {
  return vectorA.x * vectorB.y - vectorA.y * vectorB.x;
};

export const rotateVector = (vector, { centerX, centerY, angle }) => {
  if (angle === 0) {
    return vector;
  }

  // rotate in counterclockwise
  const xDiff = vector.x - centerX;
  const yDiff = vector.y - centerY;
  const angleSin = Math.sin(angle);
  const angleCos = Math.cos(angle);
  const x = xDiff * angleCos - yDiff * angleSin;
  const y = xDiff * angleSin + yDiff * angleCos;

  return {
    x: x + centerX,
    y: y + centerY,
  };
};

export const normalizeVector = (vector) => {
  const length = getVectorLength(vector);

  if (length > 0) {
    const lengthInverted = 1 / length;
    return {
      x: vector.x * lengthInverted,
      y: vector.y * lengthInverted,
    };
  }

  return {
    x: vector.x * length,
    y: vector.y * length,
  };
};

export const getDistanceBetweenVectors = (vectorA, vectorB) => {
  const xDiff = vectorA.x - vectorB.x;
  const yDiff = vectorA.y - vectorB.y;
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};
