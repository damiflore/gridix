/* eslint-disable import/max-dependencies */
/**
TODO

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
import {
  motionAllowedFromMass,
  updateGameObjectPosition,
  updateGameObjectVelocity,
} from "./physic/physic.motion.js"
import { updatePhysicForArcadeGame } from "./physic/physic.js"
import { PHYSIC_CONSTANTS } from "./physic/physic.constants.js"
import { gameObjectFromPoint } from "./game/game.js"
// import { demoCool } from "./demo-cool.js"
// import { forEachCollidingPairs } from "./collision/collision.js"
import { getCollisionInfo } from "./collision/collisionInfo.js"
import { demoBloc } from "./demo-bloc.js"
import { updateDevtool } from "./devtool.js"
import { createGameEngine } from "./engine/engine.js"
import { drawCollisionInfo } from "./draw/draw.js"
import { registerPageLifecyle } from "./page/page-lifecyle.js"

const width = 32 * 7
const height = 32 * 7
const canvas = document.createElement("canvas")
canvas.height = height
canvas.width = width
document.querySelector("#container").appendChild(canvas)

const context = canvas.getContext("2d")
const gameObjects = []
let gameObjectSelectedIndex = 0

demoBloc({
  width,
  height,
  gameObjects,
})

const createContactTracker = () => {
  let previousContacts = null

  const cleanupWeakMap = new WeakMap()

  const update = (gameObject, gameObjects, effect) => {
    // ça risque d'etre couteux
    const currentContacts = getContactInfo(gameObject, gameObjects)

    let lost
    let found
    if (previousContacts) {
      lost = previousContacts.filter(
        (contactPrevious) => !currentContacts.includes(contactPrevious),
      )
      found = currentContacts.filter((contact) => !previousContacts.includes(contact))
    } else {
      lost = []
      found = currentContacts
    }
    previousContacts = currentContacts

    // chaque nouveau contact on apelle un truc dessus
    found.forEach((contactFound) => {
      const effectReturnValue = effect(contactFound)
      if (effectReturnValue) {
        cleanupWeakMap.set(contactFound, effectReturnValue)
      }
    })
    lost.forEach((contactLost) => {
      const cleanup = cleanupWeakMap.get(contactLost)
      if (cleanup) {
        cleanup()
        cleanupWeakMap.delete(contactLost)
      }
    })
  }

  return {
    update,
  }
}

const getContactInfo = (gameObject, gameObjects) => {
  if (!gameObject.hitbox) {
    return []
  }

  const contacts = []
  gameObjects.forEach((gameObjectCandidate) => {
    if (gameObjectCandidate === gameObject) {
      return
    }
    if (!gameObjectCandidate.hitbox && !gameObjectCandidate.rigid) {
      return
    }

    const collisionInfo = getCollisionInfo(gameObject, gameObjectCandidate)
    if (!collisionInfo) {
      return
    }

    contacts.push(gameObjectCandidate)
  })
  return contacts
}

const collisionInfos = []
const gameEngine = createGameEngine({
  framePerSecond: 60,
  updateState: ({ timePerFrame, time }) => {
    gameObjects.forEach((gameObject) => {
      const { updateState } = gameObject
      if (updateState) {
        updateState(gameObject)
      }
    })

    // faire un truc qui implémente le concept de area
    // lorsqu'un objet a une hitbox + un areaEffect on apelle cela sur tous les objets
    // dans la zone d'effet
    // lorsqu'un objet quitte la zone on apelle la fonction cleanup

    collisionInfos.length = 0
    updatePhysicForArcadeGame({
      gameObjects,
      timePerFrame,
      time,
      collisionCallback: ({ collisionInfo }) => {
        collisionInfos.push(collisionInfo)
      },
      collisionPositionResolution: true,
      collisionVelocityImpact: true,
    })

    gameObjects.forEach((gameObject) => {
      const { areaEffect } = gameObject
      if (areaEffect) {
        const contactTracker =
          gameObject.contactTracker || (gameObject.contactTracker = createContactTracker())
        contactTracker.update(gameObject, gameObjects, (contact) => {
          return areaEffect(gameObject, contact)
        })
      }
    })
  },

  updateDraw: ({ framePerSecondEstimation, memoryUsed, memoryLimit }) => {
    context.clearRect(0, 0, width, height)
    context.strokeStyle = "blue"
    gameObjects.forEach((gameObject, index) => {
      const { updateDraw } = gameObject
      if (!updateDraw) {
        return
      }

      if (gameObjectSelectedIndex === index) {
        gameObject.strokeStyle = "orange"
        gameObject.lineWidth = 4
      } else {
        gameObject.strokeStyle = undefined
        gameObject.lineWidth = 1
      }
      gameObject.alpha = gameObject.sleeping ? 0.5 : 1

      gameObject.updateDraw(gameObject, context)
    })

    collisionInfos.forEach((collisionInfo) => {
      drawCollisionInfo(collisionInfo, context)
    })

    const gameObjectSelected =
      gameObjectSelectedIndex === -1 ? null : gameObjects[gameObjectSelectedIndex]
    updateDevtool({
      textContents: {
        "frame-per-second": framePerSecondEstimation,
        "js-heap-size-used": memoryUsed,
        "js-heap-size-limit": memoryLimit,

        "game-objects-length": gameObjects.length,
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
        "game-object-selected-mass": gameObjectSelected ? gameObjectSelected.mass : "",
        "game-object-selected-restitution": gameObjectSelected
          ? gameObjectSelected.restitution
          : "",
        "game-object-selected-friction": gameObjectSelected ? gameObjectSelected.friction : "",
      },

      onClicks: {
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

        "move-left": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { x: gameObjectSelected.centerX - 10 })
          }
        },
        "move-right": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { x: gameObjectSelected.centerX + 10 })
          }
        },
        "move-up": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { y: gameObjectSelected.centerY - 10 })
          }
        },
        "move-down": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { y: gameObjectSelected.centerY + 10 })
          }
        },
        "rotate-decrease": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { angle: gameObjectSelected.angle - 0.1 })
          }
        },
        "rotate-increase": () => {
          if (gameObjectSelected) {
            updateGameObjectPosition(gameObjectSelected, { angle: gameObjectSelected.angle + 0.1 })
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
          PHYSIC_CONSTANTS.forceYAmbient = 200
        },
        "gravity-disable": () => {
          PHYSIC_CONSTANTS.forceYAmbient = 0
        },
        "excite": () => {
          gameObjects.forEach((gameObject) => {
            if (motionAllowedFromMass(gameObject.mass)) {
              updateGameObjectVelocity(gameObject, {
                x: Math.random() * 500 - 250,
                y: Math.random() * 500 - 250,
              })
            }
          })
        },
        "reset": () => {
          gameObjects.splice(5, gameObjects.length)
          gameObjectSelectedIndex = 4
        },
      },
    })
  },
})
window.addEventListener("error", () => {
  gameEngine.stopGameLoop()
})
canvas.addEventListener("click", (clickEvent) => {
  const clickPoint = {
    x: clickEvent.offsetX,
    y: clickEvent.offsetY,
  }
  const gameObjectUnderClick = gameObjectFromPoint(gameObjects, clickPoint)
  if (gameObjectUnderClick) {
    gameObjectSelectedIndex = gameObjects.indexOf(gameObjectUnderClick)
  }
})
gameEngine.startGameLoop()

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

window.gameObjects = gameObjects
