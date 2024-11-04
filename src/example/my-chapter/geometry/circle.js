import { rotateVector } from "./vector.js";

export const circleToStartPoint = ({ centerX, centerY, radius, angle }) => {
  return rotateVector(
    {
      x: centerX,
      y: centerY - radius,
    },
    { centerX, centerY, angle },
  );
};
