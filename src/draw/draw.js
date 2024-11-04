import { circleToStartPoint } from "../geometry/circle.js";
import { rectangleToTopLeftCorner } from "../geometry/rectangle.js";

export const drawRectangle = (
  {
    centerX,
    centerY,
    width,
    height,
    angle,
    strokeStyle,
    fillStyle,
    lineWidth,
    alpha,
  },
  context,
) => {
  const topLeftCorner = rectangleToTopLeftCorner({
    centerX,
    centerY,
    width,
    height,
    angle,
  });

  context.save();
  context.beginPath();
  context.translate(topLeftCorner.x, topLeftCorner.y);
  context.rotate(angle);
  context.rect(0, 0, width, height);
  context.closePath();

  context.globalAlpha = alpha;
  context.lineWidth = lineWidth;
  if (strokeStyle) {
    context.strokeStyle = strokeStyle;
    context.stroke();
  }
  if (fillStyle) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  context.restore();
};

export const drawCircle = (
  { centerX, centerY, radius, angle, strokeStyle, fillStyle, alpha },
  context,
) => {
  const startPoint = circleToStartPoint({ centerX, centerY, radius, angle });

  context.save();
  context.beginPath();
  // draw a circle
  context.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  // draw a line from start point toward center
  context.moveTo(startPoint.x, startPoint.y);
  context.lineTo(centerX, centerY);
  context.closePath();

  context.globalAlpha = alpha;
  if (strokeStyle) {
    context.strokeStyle = strokeStyle;
    context.stroke();
  }
  if (fillStyle) {
    context.fillStyle = fillStyle;
    context.fill();
  }
  context.restore();
};

export const drawCollisionInfo = (
  { collisionStartX, collisionStartY, collisionEndX, collisionEndY },
  context,
) => {
  context.beginPath();
  context.moveTo(collisionStartX, collisionStartY);
  context.lineTo(collisionEndX, collisionEndY);
  context.closePath();
  context.strokeStyle = "orange";
  context.stroke();
};
