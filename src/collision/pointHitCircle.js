import { getDistanceBetweenVectors } from "src/geometry/vector.js";

export const pointHitCircle = (point, { centerX, centerY, radius }) => {
  const distance = getDistanceBetweenVectors(point, { x: centerX, y: centerY });

  if (distance <= radius) {
    return true;
  }

  return false;
};
