/* eslint-disable import/max-dependencies */
/**
TODO

- introduire les grilles avec 3 layer

- utiliser les grilles pour implémenter le areaEffect (frictionAmbient et sidewalk)

- LATER:  utiliser la méthod update pour les rigid object au lieu de boucler
sur les game object pour faire la physique (sauve un tour de boucle sur tous les game objects)
-> plus tard, quand on y verra plus clair

- introduire react qui servira de devtool pour le canvas
cette interface react fera 2 choses:

lorsqu'elle se lance elle met le jeu en pause
on peut ensuite controler le jeu pause/play
et les interaction change du jeu de base
-> click sélectionne le game object en desous du clic et permet
d'inspecter son état
on aura aussi un raccourci pour avancer 1 frame par une frame
(sans avoir les 30 tours, vraiment une seule)

lorsque l'interface se ferme le jeu reprend normalement

cette interface servira aussi a modifier une carte et permettre
de la sauvegarder en JSON va savoir ou
(ptet qu'un petit serveur local qui écrit dans un fichier ça semble opportun)

pour le moment on ne pourra travailler que sur une carte a la fois

- plein de unit tests ou on teste le moteur physique (voir comment faire)
ou au moin de petit fichier html pour tester des cas concrets

*/

// import { drawCollisionInfo } from "./draw/draw.js"
import { motionAllowedFromMass } from "./physic/physic.motion.js"
import { demoBloc } from "./demo-bloc.js"
import { demoCool } from "./demo-cool.js"
// import { forEachCollidingPairs } from "./collision/collision.js"
import { updateDevtool } from "./devtool.js"
import { createGameEngine } from "./engine/engine.js"
import { registerPageLifecyle } from "./page/page-lifecyle.js"

const demoPhysic = false

let gameObjectSelected = null
const world = demoPhysic ? demoCool() : demoBloc()
// const world = demoCool()
const canvas = document.createElement("canvas")
canvas.width = world.width
canvas.height = world.height
document.querySelector("#container").appendChild(canvas)
const context = canvas.getContext("2d")

const gameEngine = createGameEngine({
  framePerSecond: 60,
  update: (stepInfo) => {
    world.update(stepInfo)
  },

  draw: (stepInfo) => {
    world.draw(stepInfo, context)

    const { framePerSecondEstimation, memoryUsed, memoryLimit } = stepInfo

    context.clearRect(0, 0, world.width, world.height)
    context.strokeStyle = "blue"
    world.forEachGameObject((gameObject) => {
      const { draw } = gameObject
      if (!draw) {
        return
      }

      if (gameObject === gameObjectSelected) {
        gameObject.strokeStyle = "orange"
        gameObject.lineWidth = 4
      } else {
        gameObject.strokeStyle = "blue"
        gameObject.lineWidth = 1
      }
      gameObject.alpha = gameObject.sleeping ? 0.5 : 1

      gameObject.draw(gameObject, context)
    })

    updateDevtool({
      textContents: {
        "frame-per-second": framePerSecondEstimation,
        "js-heap-size-used": memoryUsed,
        "js-heap-size-limit": memoryLimit,

        "game-objects-length": world.countGameObjects(),
        "game-object-selected-sleeping": gameObjectSelected
          ? String(gameObjectSelected.sleeping)
          : "",

        "game-object-selected-center-x": gameObjectSelected
          ? gameObjectSelected.centerX.toPrecision(3)
          : "",
        "game-object-selected-center-y": gameObjectSelected
          ? gameObjectSelected.centerY.toPrecision(3)
          : "",
        "game-object-selected-angle": gameObjectSelected
          ? gameObjectSelected.angle.toPrecision(3)
          : "",
        "game-object-selected-velocity-x":
          gameObjectSelected && gameObjectSelected.rigid
            ? gameObjectSelected.velocityX.toPrecision(3)
            : "",
        "game-object-selected-velocity-y":
          gameObjectSelected && gameObjectSelected.rigid
            ? gameObjectSelected.velocityY.toPrecision(3)
            : "",
        "game-object-selected-velocity-angle":
          gameObjectSelected && gameObjectSelected.rigid
            ? gameObjectSelected.velocityAngle.toPrecision(3)
            : "",
        "game-object-selected-friction-ambient": gameObjectSelected
          ? gameObjectSelected.frictionAmbient
          : "",
        "game-object-selected-mass": gameObjectSelected ? gameObjectSelected.mass : "",
        "game-object-selected-restitution": gameObjectSelected
          ? gameObjectSelected.restitution
          : "",
        "game-object-selected-friction": gameObjectSelected ? gameObjectSelected.friction : "",
      },

      onClicks: {
        "play": () => {
          gameEngine.startGameLoop()
        },
        "pause": () => {
          gameEngine.pauseGameLoop()
        },
        "resume": () => {
          gameEngine.resumeGameLoop()
        },
        "step": () => {
          gameEngine.pauseGameLoop()
        },

        "debug-collision-detection": () => {
          if (gameObjectSelected) {
            gameObjectSelected.debugCollisionDetection = true
          }
        },
        "debug-collision-resolution": () => {
          if (gameObjectSelected) {
            gameObjectSelected.debugCollisionResolution = true
          }
        },

        "wakeup": () => {
          if (gameObjectSelected) {
            gameObjectSelected.sleeping = false
          }
        },
        "sleep": () => {
          if (gameObjectSelected) {
            gameObjectSelected.sleeping = true
          }
        },
        "debug-sleep": () => {
          if (gameObjectSelected) {
            gameObjectSelected.debugSleep = true
          }
        },

        "move-left": () => {
          if (gameObjectSelected) {
            gameObjectSelected.centerX -= 10
          }
        },
        "move-right": () => {
          if (gameObjectSelected) {
            gameObjectSelected.centerX += 10
          }
        },
        "move-up": () => {
          if (gameObjectSelected) {
            gameObjectSelected.centerY -= 10
          }
        },
        "move-down": () => {
          if (gameObjectSelected) {
            gameObjectSelected.centerY += 10
          }
        },
        "rotate-decrease": () => {
          if (gameObjectSelected) {
            gameObjectSelected.angle -= 0.1
          }
        },
        "rotate-increase": () => {
          if (gameObjectSelected) {
            gameObjectSelected.angle += 0.1
          }
        },
        "velocity-x-decrease": () => {
          if (gameObjectSelected) {
            gameObjectSelected.velocityX -= 1
          }
        },
        "velocity-x-increase": () => {
          if (gameObjectSelected) {
            gameObjectSelected.velocityX += 1
          }
        },
        "velocity-y-decrease": () => {
          if (gameObjectSelected) {
            gameObjectSelected.velocityY -= 1
          }
        },
        "velocity-y-increase": () => {
          if (gameObjectSelected) {
            gameObjectSelected.velocityY += 1
          }
        },
        "velocity-angle-decrease": () => {
          if (gameObjectSelected) {
            gameObjectSelected.velocityAngle -= 0.1
          }
        },
        "velocity-angle-increase": () => {
          if (gameObjectSelected) {
            gameObjectSelected.velocityAngle += 0.1
          }
        },
        "mass-negative": () => {
          if (gameObjectSelected) {
            gameObjectSelected.mass = -1
          }
        },
        "mass-positive": () => {
          if (gameObjectSelected) {
            gameObjectSelected.mass = 1
          }
        },
        "gravity-enable": () => {
          world.gravity = true
        },
        "gravity-disable": () => {
          world.gravity = false
        },
        "excite": () => {
          world.forEachGameObject((gameObject) => {
            if (motionAllowedFromMass(gameObject.mass)) {
              gameObject.velocityX = Math.random() * 500 - 250
              gameObject.velocityY = Math.random() * 500 - 250
            }
          })
        },
      },
    })
  },
})
window.addEventListener("error", () => {
  gameEngine.stopGameLoop()
})
registerPageLifecyle({
  active: () => {
    gameEngine.resumeGameLoop()
    document.title = "active"
  },
  passive: () => {
    gameEngine.resumeGameLoop()
    document.title = "passive"
  },
  hidden: () => {
    gameEngine.pauseGameLoop()
    document.title = "hidden"
  },
  frozen: () => {
    gameEngine.pauseGameLoop()
  },
})
// the first loop of the game engine is likely more expensive than the others
// - internal logic might setup things
// - browser might realize we will or just have created a lot of objects
// so wait a bit for browser to be peaceful before starting the game engine
window.requestIdleCallback(
  () => {
    gameEngine.startGameLoop()
  },
  { timeout: 200 },
)

canvas.addEventListener("click", (clickEvent) => {
  const clickPoint = {
    x: clickEvent.offsetX,
    y: clickEvent.offsetY,
  }
  const gameObjectUnderClick = world.gameObjectFromPoint(clickPoint)
  if (gameObjectUnderClick) {
    gameObjectSelected = gameObjectUnderClick
  }
})
