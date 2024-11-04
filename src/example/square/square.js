import { createGame } from "src/game/game.js"
import { Bloc } from "src/game/bloc.js"

const createSquare = (props) => {
  return {
    ...Bloc,
    canCollide: true,
    width: 50,
    height: 50,
    ...props,
    fillStyle: "green",
    effects: {
      ...Bloc.effects,
      "collision-color": ({ blocCollidingArray }) => {
        return {
          fillStyle: blocCollidingArray.length === 0 ? "green" : "red",
        }
      },
    },
  }
}

const blocs = [
  createSquare({
    positionX: 250,
    positionY: 50,
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
    positionX: 150,
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
    positionX: 300,
    positionY: 300,
    velocityX: 50,
    velocityY: -50,
  }),
]

const game = createGame({
  worldContainer: true,
  worldWidth: 300,
  worldHeight: 400,
  blocs,
})

document.body.appendChild(game.canvas)
game.start()

window.game = game
window.blocs = blocs
