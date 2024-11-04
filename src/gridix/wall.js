import { drawRectangle } from "../draw/draw.js";
import { centerXFromCellX, centerYFromCellY } from "../geometry/grid.js";
import { createRectangle } from "../geometry/rectangle.js";
import { createRigidBody } from "../physic/rigid-body.js";

export const createWall = ({ cellX, cellY, worldGrid }) => {
  const rectangle = createRectangle({
    centerX: centerXFromCellX(cellX, worldGrid),
    centerY: centerYFromCellY(cellY, worldGrid),
    width: worldGrid.cellSize,
    height: worldGrid.cellSize,
  });

  const rigidBody = createRigidBody({
    ...rectangle,
    angleLocked: true,
    mass: Infinity,
    rigid: true,
    friction: 0.2,
  });

  const wall = {
    ...rigidBody,
    name: "wall",
    fillStyle: "black",
    draw: drawRectangle,
  };

  return wall;
};
