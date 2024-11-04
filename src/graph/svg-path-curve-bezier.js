import { getDistanceBetweenVectors } from "src/geometry/vector.js";

// https://medium.com/@francoisromain/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74

export const getSVGPathCommandForSmoothCurve = (points) => {
  if (points.length === 0) {
    return "";
  }

  const firstPoint = points[0];
  const command = points.slice(1).reduce((acc, point, index) => {
    const startControlPoint = getStartControlPoint(index + 1, points);
    const endControlPoint = getEndControlPoint(index + 1, points);

    return `${acc} C ${startControlPoint.x},${startControlPoint.y} ${endControlPoint.x},${endControlPoint.y} ${point.x},${point.y}`;
  }, `M ${firstPoint.x},${firstPoint.y}`);

  return command;
};

const getStartControlPoint = (index, points) => {
  if (index === 1) {
    return getControlPoint({
      previousPoint: points[0],
      currentPoint: points[0],
      nextPoint: points[1],
    });
  }

  return getControlPoint({
    previousPoint: points[index - 2],
    currentPoint: points[index - 1],
    nextPoint: points[index],
  });
};

const getEndControlPoint = (index, points) => {
  if (index === points.length - 1) {
    return getControlPoint({
      previousPoint: points[index - 1],
      currentPoint: points[index],
      nextPoint: points[index],
      reverse: true,
    });
  }

  return getControlPoint({
    previousPoint: points[index - 1],
    currentPoint: points[index],
    nextPoint: points[index + 1],
    reverse: true,
  });
};

const getControlPoint = ({
  previousPoint,
  currentPoint,
  nextPoint,
  smoothing = 0.2,
  reverse = false,
}) => {
  const opposedLineDistance = getDistanceBetweenVectors(
    previousPoint,
    nextPoint,
  );
  const opposedLineAngle = Math.atan2(
    nextPoint.y - previousPoint.y,
    nextPoint.x - previousPoint.x,
  );

  // If is end-control-point, add PI to the angle to go backward
  const angle = opposedLineAngle + (reverse ? Math.PI : 0);
  const length = opposedLineDistance * smoothing;
  // The control point position is relative to the current point
  const x = currentPoint.x + Math.cos(angle) * length;
  const y = currentPoint.y + Math.sin(angle) * length;

  return { x, y };
};
