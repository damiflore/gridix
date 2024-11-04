import { normalizeVector, rotateVector, substractVector } from "./vector.js";

export const createRectangle = ({
  width = 0,
  height = 0,
  centerX = 0,
  centerY = 0,
  angle = 0,
} = {}) => {
  return {
    shapeName: "rectangle",
    width,
    height,
    centerX,
    centerY,
    angle,
  };
};

export const rectangleToTopLeftCorner = ({
  centerX,
  centerY,
  width,
  height,
  angle,
}) => {
  return rotateVector(
    { x: centerX - width / 2, y: centerY - height / 2 },
    { centerX, centerY, angle },
  );
};

export const rectangleToCorners = ({
  centerX,
  centerY,
  width,
  height,
  angle,
}) => {
  return {
    topLeftCorner: rectangleToTopLeftCorner({
      centerX,
      centerY,
      width,
      height,
      angle,
    }),
    topRightCorner: rotateVector(
      { x: centerX + width / 2, y: centerY - height / 2 },
      { centerX, centerY, angle },
    ),
    bottomRightCorner: rotateVector(
      { x: centerX + width / 2, y: centerY + height / 2 },
      { centerX, centerY, angle },
    ),
    bottomLeftCorner: rotateVector(
      { x: centerX - width / 2, y: centerY + height / 2 },
      { centerX, centerY, angle },
    ),
  };
};
export const RECTANGLE_CORNER_KEYS = [
  "topLeftCorner",
  "topRightCorner",
  "bottomRightCorner",
  "bottomLeftCorner",
];

export const rectangleToNormals = ({
  centerX,
  centerY,
  width,
  height,
  angle,
}) => {
  const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } =
    rectangleToCorners({
      centerX,
      centerY,
      width,
      height,
      angle,
    });

  return {
    topNormal: normalizeVector(
      substractVector(topRightCorner, bottomRightCorner),
    ),
    rightNormal: normalizeVector(
      substractVector(bottomRightCorner, bottomLeftCorner),
    ),
    bottomNormal: normalizeVector(
      substractVector(bottomLeftCorner, topLeftCorner),
    ),
    leftNormal: normalizeVector(substractVector(topLeftCorner, topRightCorner)),
  };
};
export const RECTANGLE_NORMAL_KEYS = [
  "topNormal",
  "rightNormal",
  "bottomNormal",
  "leftNormal",
];

export const getIntersectionRatioBetweenRectangles = (
  firstRectangle,
  secondRectangle,
) => {
  const rectangleIntersection = getRectangleIntersection(
    firstRectangle,
    secondRectangle,
  );
  const firstArea = firstRectangle.width * firstRectangle.height;
  const intersectionArea =
    rectangleIntersection.width * rectangleIntersection.height;
  return intersectionArea / firstArea;
};

const getRectangleIntersection = (firstRectangle, secondRectangle) => {
  if (firstRectangle.angle || secondRectangle.angle) {
    // it's possible but not supported for now
    throw new Error("cannot be called on rotated rectangle");
  }

  const firstLeft = firstRectangle.centerX - firstRectangle.width / 2;
  const firstRight = firstLeft + firstRectangle.width;
  const firstTop = firstRectangle.centerY - firstRectangle.height / 2;
  const firstBottom = firstTop + firstRectangle.height;
  const secondLeft = secondRectangle.centerX - secondRectangle.width / 2;
  const secondRight = firstLeft + secondRectangle.width;
  const secondTop = secondRectangle.centerY - secondRectangle.height / 2;
  const secondBottom = firstTop + secondRectangle.height;
  const intersectionLeft = firstLeft < secondLeft ? secondLeft : firstLeft;
  const intersectionRight = firstRight < secondRight ? firstRight : secondRight;
  const intersectionTop = firstTop < secondTop ? secondTop : firstTop;
  const intersectionBottom =
    firstBottom < secondBottom ? firstBottom : secondBottom;
  const intersectionHeight = intersectionBottom - intersectionTop;
  const intersectionWidth = intersectionRight - intersectionLeft;
  const rectangleForIntersection = {
    centerX: intersectionLeft + intersectionWidth / 2,
    centerY: intersectionTop + intersectionHeight / 2,
    width: intersectionWidth,
    height: intersectionHeight,
  };
  return rectangleForIntersection;
};
