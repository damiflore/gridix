/* eslint-disable no-nested-ternary */

/*

partons sur un truc méga simple niveau map genre du niveau de
Mystic quest legend (https://www.youtube.com/watch?v=Qlzd_fzUCdA)
qui au final se jouait tres bien malgré un system de carte et déplacement
simplissime

https://github.com/dmail-front/autotile
- context api: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
https://github.com/ovalia/ovalia/blob/master/html/game.html
https://developers.google.com/web/updates/2018/08/offscreen-canvas
https://developer.mozilla.org/en-US/docs/Games

Prochaines choses a faire:
- Faciliter les déplacement pixel perfect dans la grille
Lorsqu'un élement se déplace, on va faciliter le fait qu'il s'arette pixel perfect dans la grille
genre s'il s'arette a 4px du bord d'une cellule il va continuer de glisser jusqu'a ce bord

Ptet en "aimantant" les arrete de la grille
(tout objet déplacable est attiré vers cette grille (la grill lui confere une velocité))

- Avoir un menu en bas de l'écran
Ce menu peut avoir un élement actif
On click dessus pour l'activer/désactiver

- Pouvoir passer en mode édition (un bouton dans le menu)
dans ce mode on sélectionne le type de chose qu'on veut modifier
on commence par sélectionner si on veut un sol/mur
lorsqu'on clique quelque part, ce sol/mur actif remplace l'existant

- Avoir un/des objet piece qu'on peut ramasser, il s'affiche dans le menu
- Pouvoir ramasser une hache
- Pouvoir équiper/déséquipper la hache
- La hache permet de couper des arbres
- Lorsqu'on clique sur le héros cela active l'action actuelle (hache)
- Pouvoir faire un tunnel avec toit semi-transparent
- Faire un escalier montant/descendant
- Pouvoir faire un pont, on passe au dessus de quelque chose, mais aussi possible de passer en dessous

*/

import { createGame } from "src/game/game.js"
import { Bloc, mutateBloc } from "src/game/bloc.js"
import { blocUpdateFriction, blocUpdateVelocity } from "src/game/bloc.updates.js"
import {
  blocEffectCollisionDetection,
  blocEffectCollisionResolution,
  blocCollidingArrayGetter,
  getCollisionLeftLength,
  getCollisionTopLength,
  getCollisionRightLength,
  getCollisionBottomLength,
  blocToMoveDirection,
} from "src/game/bloc.effects.js"
import { CELL_SIZE } from "src/game.constant.js"
import { trackKeyboardKeydown } from "src/interaction/keyboard.js"

window.splashscreen.remove()

const cellToRectangleGeometry = ({ row, column }) => {
  return {
    positionX: column * CELL_SIZE,
    positionY: row * CELL_SIZE,
    width: CELL_SIZE,
    height: CELL_SIZE,
  }
}

const createFloorAtCell = ({ row, column }) => {
  return {
    ...Bloc,
    name: "floor",
    ...cellToRectangleGeometry({ row, column }),
    fillStyle: "white",
  }
}

const createWallAtCell = ({ row, column, ...rest }) => {
  return {
    ...Bloc,
    name: "wall",
    zIndex: 1,
    canCollide: true,
    ...cellToRectangleGeometry({ row, column }),
    fillStyle: "grey",
    ...rest,
  }
}

const createBarilAtCell = ({ row, column, ...rest }) => {
  return {
    ...Bloc,
    name: "baril",
    mass: 100,
    friction: 0.6,
    canCollide: true,
    canMove: true,
    updates: {
      ...blocUpdateFriction,
      ...blocUpdateVelocity,
    },
    effects: {
      ...blocEffectCollisionDetection,
      ...blocEffectCollisionResolution,
    },
    ...cellToRectangleGeometry({ row, column }),
    zIndex: 1,
    fillStyle: "brown",
    ...rest,
  }
}

const blocs = [
  createFloorAtCell({ row: 0, column: 0 }),
  createFloorAtCell({ row: 1, column: 0 }),
  createFloorAtCell({ row: 2, column: 0 }),
  createWallAtCell({ row: 0, column: 1 }),
  createWallAtCell({ row: 1, column: 1 }),
  createFloorAtCell({ row: 2, column: 1 }),
  createWallAtCell({ row: 0, column: 2 }),
  createFloorAtCell({ row: 1, column: 2 }),
  createFloorAtCell({ row: 2, column: 2 }),

  createWallAtCell({ row: 3, column: 3 }),
  createWallAtCell({ row: 3, column: 4 }),
  createWallAtCell({ row: 3, column: 1 }),
  createWallAtCell({ row: 4, column: 3 }),
  createWallAtCell({ row: 4, column: 4 }),
  createWallAtCell({ row: 0, column: 5 }),

  createBarilAtCell({ row: 2, column: 1 }),
  createWallAtCell({ row: 0, column: 3 }),

  createWallAtCell({ row: 6, column: 1 }),
  createWallAtCell({ row: 6, column: 2 }),
  createWallAtCell({ row: 6, column: 3 }),
]

const cellFromPoint = ({ x, y }) => {
  return {
    x: Math.floor(x / CELL_SIZE) * CELL_SIZE,
    y: Math.floor(y / CELL_SIZE) * CELL_SIZE,
  }
}

const game = createGame({
  // drawAfterUpdate: true,
  worldContainer: true,
  rowCount: 7,
  columnCount: 7,
  cellSize: 32,
  blocs,
})
document.body.appendChild(game.canvas)

game.start()

const downKey = trackKeyboardKeydown({
  code: "ArrowDown",
  node: game.canvas,
})
const upKey = trackKeyboardKeydown({
  code: "ArrowUp",
  node: game.canvas,
})
const leftKey = trackKeyboardKeydown({
  code: "ArrowLeft",
  node: game.canvas,
})
const rightKey = trackKeyboardKeydown({
  code: "ArrowRight",
  node: game.canvas,
})

const createHeroAtCell = ({ row, column }) => {
  const hero = {
    ...Bloc,
    name: "hero",
    canCollide: true,
    canMove: true,
    friction: 0.5,
    zIndex: 1,
    mass: 10,
    keyboardVelocity: 100,
    updates: {
      ...blocUpdateFriction,
      keyboardNavigation: ({ velocityX, velocityY, keyboardVelocity }) => {
        const velocityXNew = leftKey.isDown
          ? -keyboardVelocity
          : rightKey.isDown
          ? keyboardVelocity
          : velocityX
        const velocityYNew = upKey.isDown
          ? -keyboardVelocity
          : downKey.isDown
          ? keyboardVelocity
          : velocityY

        return {
          velocityX: velocityXNew,
          velocityY: velocityYNew,
        }
      },
      ...blocUpdateVelocity,
    },
    effects: {
      ...blocEffectCollisionDetection,
      "push-baril": (hero) => {
        hero.blocCollidingArray.forEach((blocColliding) => {
          if (blocColliding.name !== "baril") {
            return
          }
          // no dialognal move allowed
          if (hero.velocityX && hero.velocityY) {
            return
          }
          const baril = blocColliding
          const { movingLeft, movingTop, movingRight, movingBottom } = blocToMoveDirection(hero)
          if (movingLeft && getCollisionLeftLength(hero, baril)) {
            mutateBloc(baril, {
              velocityX: baril.velocityX + hero.velocityX,
            })
          }
          if (movingTop && getCollisionTopLength(hero, baril)) {
            mutateBloc(baril, {
              velocityY: baril.velocityY + hero.velocityY,
            })
          }
          if (movingRight && getCollisionRightLength(hero, baril)) {
            mutateBloc(baril, {
              velocityX: baril.velocityX + hero.velocityX,
            })
          }
          if (movingBottom && getCollisionBottomLength(hero, baril)) {
            mutateBloc(baril, {
              velocityY: baril.velocityY + hero.velocityY,
            })
          }
        })
      },
      ...blocEffectCollisionResolution,
    },
    ...cellToRectangleGeometry({ row, column }),
    width: 24,
    height: 24,
    fillStyle: "red",
  }
  return hero
}

const hero = createHeroAtCell({ row: 0, column: 0 })
blocs.push(hero)

game.canvas.addEventListener("click", (clickEvent) => {
  const clickPoint = {
    x: clickEvent.offsetX,
    y: clickEvent.offsetY,
  }
  const destinationPoint = cellFromPoint(clickPoint)
  moveBlocIfAllowed(hero, {
    positionX: destinationPoint.x,
    positionY: destinationPoint.y,
  })
})
game.canvas.setAttribute("tabindex", -1)

const moveBlocIfAllowed = (bloc, { positionX = bloc.positionX, positionY = bloc.positionY }) => {
  const currentPosition = {
    positionX: bloc.positionX,
    positionY: bloc.positionY,
  }
  mutateBloc(bloc, { positionX, positionY })
  const blocCollidingArray = blocCollidingArrayGetter(bloc, blocs)
  if (blocCollidingArray.length > 0) {
    mutateBloc(bloc, currentPosition)
  }
}

const buttonPause = document.createElement("button")
buttonPause.innerHTML = "pause"
buttonPause.onclick = () => {
  game.stop()
}
const buttonPlay = document.createElement("button")
buttonPlay.innerHTML = "play"
buttonPlay.onclick = () => {
  game.start()
}

document.body.appendChild(document.createElement("br"))
document.body.appendChild(buttonPause)
document.body.appendChild(buttonPlay)

window.game = game
window.blocs = blocs
