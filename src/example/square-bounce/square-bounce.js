// Needs to be updated to latest behaviour
/* eslint-disable import/no-unresolved */
import {
  blocEffectCollisionDetection,
  blocEffectCollisionResolutionBounce,
} from "src/game/bloc.effects.js";
import { Bloc } from "src/game/bloc.js";
import { blocUpdateVelocity } from "src/game/bloc.updates.js";
import { createGame } from "src/game/game.js";

const createSquare = (props) => {
  return {
    ...Bloc,
    canCollide: true,
    updates: {
      ...blocUpdateVelocity,
    },
    effects: {
      ...blocEffectCollisionDetection,
      ...blocEffectCollisionResolutionBounce,
      "collision-color": ({ blocCollidingArray }) => {
        return {
          fillStyle: blocCollidingArray.length === 0 ? "green" : "red",
        };
      },
    },
    width: 50,
    height: 50,
    fillStyle: "green",
    ...props,
  };
};

const blocs = [
  createSquare({
    positionX: 250,
    positionY: 150,
    velocityX: 0,
    velocityY: 50,
  }),
  createSquare({
    positionX: 240,
    positionY: 300,
    velocityX: 0,
    velocityY: -50,
  }),
  createSquare({
    positionX: 50,
    positionY: 0,
    velocityX: 50,
    velocityY: 50,
  }),
  createSquare({
    positionX: 350,
    positionY: 75,
    velocityX: -50,
    velocityY: 50,
  }),
  createSquare({
    positionX: 30,
    positionY: 200,
    velocityX: 50,
    velocityY: -50,
  }),
];

const game = createGame({
  worldContainer: true,
  worldWidth: 300,
  worldHeight: 400,
  blocs,
});

document.body.appendChild(game.canvas);
game.start();

window.game = game;
window.blocs = blocs;
