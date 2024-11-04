import { drawRectangle } from "../draw/draw.js";
import { centerXFromCellX, centerYFromCellY } from "../geometry/grid.js";
import { createRectangle } from "../geometry/rectangle.js";
import { createRigidBody } from "../physic/rigid-body.js";

export const createHero = ({ cellX, cellY, worldGrid }) => {
  const rectangle = createRectangle({
    centerX: centerXFromCellX(cellX, worldGrid),
    centerY: centerYFromCellY(cellY, worldGrid),
    width: 32,
    height: 32,
  });

  const rigidBody = createRigidBody({
    ...rectangle,
    angleLocked: true,
    mass: 1,
    friction: 0.01,
  });

  const hero = {
    ...rigidBody,
    name: "hero",
    update: () => {
      hero.frictionAmbient = hero.flagIce ? 0.02 : 0.2;
    },
    fillStyle: "red",
    draw: drawRectangle,
  };

  return hero;
};
