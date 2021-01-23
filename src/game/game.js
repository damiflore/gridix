import { Bloc, mutateBloc } from "./bloc.js"

export const createGame = ({
  worldContainer = false,
  drawAfterUpdate = false,
  rowCount,
  columnCount,
  worldCellSize = 32,
  worldMagneticGrid = false,
  worldRestitution = 0,
  blocs,
  fps = 60,
} = {}) => {
  const game = { fps }

  const worldWidth = rowCount * worldCellSize
  const worldHeight = columnCount * worldCellSize
  const canvas = createCanvas({
    width: worldWidth,
    height: worldHeight,
  })
  const context = canvas.getContext("2d")

  const blocForWorld = {
    ...Bloc,
    name: "world",
    update: (world, { blocs }) => {
      if (worldMagneticGrid) {
        applyWorldGridMagnetism(blocs, { worldCellSize })
      }
    },
    width: worldWidth,
    height: worldHeight,
  }
  blocs.push(blocForWorld)
  if (worldContainer) {
    blocs.push(
      createWorldBoundary("left", { worldWidth, worldHeight, worldCellSize, worldRestitution }),
      createWorldBoundary("right", { worldWidth, worldHeight, worldCellSize, worldRestitution }),
      createWorldBoundary("top", { worldWidth, worldHeight, worldCellSize, worldRestitution }),
      createWorldBoundary("bottom", { worldWidth, worldHeight, worldCellSize, worldRestitution }),
    )
  }

  const tick = (msEllapsed) => {
    blocs.forEach((bloc) => {
      mutateBloc(bloc.update(bloc, { msEllapsed, blocs }))
      if (drawAfterUpdate) {
        draw()
      }
    })
    blocs.forEach((bloc) => {
      mutateBloc(bloc, bloc.effect(bloc, { blocs, msEllapsed }))
    })

    draw()
  }

  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height)
    const blocSorted = [...blocs].sort((leftBloc, rightBloc) => {
      if (leftBloc.zIndex > rightBloc.zIndex) {
        return 1
      }
      if (leftBloc.zIndex < rightBloc.zIndex) {
        return -1
      }
      if (leftBloc.positionY > rightBloc.positionY) {
        return 1
      }
      if (leftBloc.positionY < rightBloc.positionY) {
        return -1
      }
      if (leftBloc.positionX > rightBloc.positionX) {
        return 1
      }
      if (leftBloc.positionX < rightBloc.positionX) {
        return -1
      }
      return 0
    })
    blocSorted.forEach((bloc) => {
      bloc.draw(bloc, context)
    })
  }

  let animationFrame
  let started = false
  let msPrevious

  const stop = () => {
    started = false
    msPrevious = undefined
    window.cancelAnimationFrame(animationFrame)
  }

  const start = () => {
    if (started) return
    started = true

    step()
    let previousFrameMs = Date.now()

    const requestNextFrame = () => {
      animationFrame = window.requestAnimationFrame(() => {
        if (!started) {
          return
        }
        const nowMs = Date.now()
        const ellapsedMs = nowMs - previousFrameMs
        const msPerFrame = (1 / game.fps) * 1000

        if (ellapsedMs < msPerFrame) {
          requestNextFrame()
        } else {
          previousFrameMs = nowMs
          step()
          requestNextFrame()
        }
      })
    }

    requestNextFrame()
  }

  const step = () => {
    if (msPrevious === undefined) {
      msPrevious = performance.now()
      tick(0)
    } else {
      const msNow = performance.now()
      const msEllapsed = msNow - msPrevious
      msPrevious = msNow
      tick(msEllapsed)
    }
  }

  Object.assign(game, {
    canvas,
    start,
    stop,
    draw,
    step,
  })

  return game
}

const applyWorldGridMagnetism = (blocs, { worldCellSize }) => {
  blocs.forEach((bloc) => {
    if (!bloc.canMove) {
      return
    }

    const { velocityX, positionX } = bloc
    const closestRowX = Math.round(positionX / worldCellSize) * worldCellSize
    const xDiff = positionX - closestRowX

    // x n'est pas sur la colonne et suffisament proche de celle ci
    // et se déplace suffisament lentement
    console.log(xDiff, velocityX)
    if (xDiff && Math.abs(xDiff) < 5 && Math.abs(velocityX) < 5) {
      // le bloc est a gauche de la colonne la plus proche
      if (xDiff < 0) {
        console.log("attire vers la droite", {
          positionX,
          closestRowX,
        })
        bloc.velocityX = 50
      }
      // le bloc est a droite
      if (xDiff > 0) {
        console.log("attire vers la gauche", {
          positionX,
          closestRowX,
        })
        bloc.velocityX = -50
      }
    }
  })
}

const createWorldBoundary = (
  side,
  { worldWidth, worldHeight, worldCellSize, worldRestitution },
) => {
  const sideGeometry = {
    left: {
      x: -worldCellSize,
      width: worldCellSize,
      y: 0,
      height: worldHeight,
    },
    right: {
      x: worldWidth,
      width: worldCellSize,
      y: 0,
      height: worldHeight,
    },
    top: {
      x: -worldCellSize,
      width: worldWidth + worldCellSize * 2,
      y: -worldCellSize,
      height: worldCellSize,
    },
    bottom: {
      x: -worldCellSize,
      width: worldWidth + worldCellSize * 2,
      y: worldHeight,
      height: worldCellSize,
    },
  }[side]

  return {
    ...Bloc,
    name: `world-${side}-boundary`,
    ...sideGeometry,
    restitution: worldRestitution,
  }
}

const createCanvas = ({ width, height }) => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}
