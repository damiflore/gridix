import { drawRectangle } from "src/draw/draw.js";
import {
  cellXFromCellIndex,
  cellYFromCellIndex,
  centerXFromCellX,
  centerYFromCellY,
} from "src/geometry/grid.js";
import { createRectangle } from "src/geometry/rectangle.js";

export const createHole = ({ cellX, cellY, worldGrid }) => {
  const rectangle = createRectangle({
    centerX: centerXFromCellX(cellX, worldGrid),
    centerY: centerYFromCellY(cellY, worldGrid),
    width: worldGrid.cellSize,
    height: worldGrid.cellSize,
  });

  const hole = {
    ...rectangle,
    name: "ice",
    onCellMateJoin: (gameObject, { cellIndexPrevious }) => {
      moveGameObjectToCell(gameObject, cellIndexPrevious, worldGrid);
    },
    draw: drawRectangle,
    fillStyle: "violet",
  };

  return hole;
};

const moveGameObjectToCell = (gameObject, cellIndex, worldGrid) => {
  gameObject.centerX = centerXFromCellX(
    cellXFromCellIndex(cellIndex, worldGrid),
    worldGrid,
  );
  gameObject.centerY = centerYFromCellY(
    cellYFromCellIndex(cellIndex, worldGrid),
    worldGrid,
  );
};
