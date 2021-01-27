export const createGameEngine = ({
  framePerSecond = 60,
  maxUpdatesPerFrame = 30,
  updateState = () => {},
  updateDraw = () => {},
}) => {
  let previousMs
  let frame
  let running = false

  const gameEngine = {
    framePerSecond,
    maxUpdatesPerFrame,
    ellapsedSeconds: 0,
    frameCount: 0,
  }

  const gameLoop = () => {
    if (!running) {
      return
    }
    gameEngine.frameCount++
    frame = requestAnimationFrame(gameLoop)

    // reread them in case they got updated from outside
    const { framePerSecond, maxUpdatesPerFrame } = gameEngine

    const secondsPerFrame = 1 / framePerSecond
    const msPerFrame = secondsPerFrame * 1000

    const currentMs = Date.now()
    // when it has never been called, previousMs is undefined
    // in that case run it once
    const ellapsedMs = previousMs ? currentMs - previousMs : msPerFrame
    previousMs = currentMs

    const updateIdealCount = Math.floor(ellapsedMs / msPerFrame)
    let updateCount
    if (updateIdealCount > maxUpdatesPerFrame) {
      console.warn(
        `too many updates to perform, only ${maxUpdatesPerFrame} out of ${updateIdealCount} iterations will be done`,
      )
      updateCount = maxUpdatesPerFrame
    } else {
      updateCount = updateIdealCount
    }
    gameEngine.ellapsedSeconds = secondsPerFrame
    while (updateCount--) {
      updateState(gameEngine)
    }
    updateDraw(gameEngine)
  }

  const startGameLoop = () => {
    if (running) {
      return
    }
    running = true
    gameLoop()
  }

  const stopGameLoop = () => {
    if (!running) {
      return
    }
    running = false
    window.cancelAnimationFrame(frame)
    previousMs = undefined
  }

  Object.assign(gameEngine, {
    startGameLoop,
    stopGameLoop,
  })

  return gameEngine
}
