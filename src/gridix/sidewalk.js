// later we will accept only a force
// and depending on the rotation we will know which direction the force apply

import { drawRectangle } from "../draw/draw.js";
import { centerXFromCellX, centerYFromCellY } from "../geometry/grid.js";
import { createRectangle } from "../geometry/rectangle.js";
import { addForce } from "../physic/physic.motion.js";

export const createSideWalk = ({ cellX, cellY, worldGrid, force = -6000 }) => {
  const rectangle = createRectangle({
    centerX: centerXFromCellX(cellX, worldGrid),
    centerY: centerYFromCellY(cellY, worldGrid),
    width: worldGrid.cellSize,
    height: worldGrid.cellSize,
  });

  const sidewalk = {
    ...rectangle,
    name: "sidewalk",
    update: () => {
      const cellContent = worldGrid.cells[sidewalk.cellIndex];
      cellContent.forEach((cellMate) => {
        if (cellMate !== sidewalk) {
          addForce(cellMate, { y: force, origin: sidewalk });
        }
      });
    },
    draw: drawRectangle,
    fillStyle: "lightgreen",
  };

  return sidewalk;
};
