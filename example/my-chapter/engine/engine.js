export const createGameEngine = ({
  framePerSecond = 60,
  maxUpdatesPerFrame = 30,
  updateState = () => {},
  updateDraw = () => {},
}) => {
  let previousMs
  let frame
  let started = false
  let paused = false

  const gameEngine = {
    framePerSecond,
    maxUpdatesPerFrame,
    time: 0,
    timePerFrame: undefined,
    frameCount: 0,
  }

  const gameLoop = () => {
    if (!started) {
      return
    }
    frame = requestAnimationFrame(gameLoop)
    if (paused) {
      return
    }

    // reread them in case they got updated from outside
    const { framePerSecond, maxUpdatesPerFrame } = gameEngine
    const timePerFrame = 1 / framePerSecond
    const frameCount = gameEngine.frameCount + 1
    const msPerFrame = timePerFrame * 1000

    gameEngine.frameCount = frameCount
    gameEngine.timePerFrame = timePerFrame

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
    gameEngine.framePerSecondEstimation = Math.round(1000 / ellapsedMs)
    gameEngine.memoryUsed = Math.round(window.performance.memory.usedJSHeapSize / 1048576)
    gameEngine.memoryLimit = window.performance.memory.jsHeapSizeLimit / 1048576
    while (updateCount--) {
      gameEngine.time += timePerFrame
      updateState(gameEngine)
    }
    updateDraw(gameEngine)
  }

  const pauseGameLoop = () => {
    if (paused) {
      return
    }
    paused = true
  }

  const resumeGameLoop = () => {
    if (!paused) {
      return
    }
    paused = false
    previousMs = undefined
  }

  const startGameLoop = () => {
    if (started) {
      return
    }
    started = true
    gameLoop()
  }

  const stopGameLoop = () => {
    if (!started) {
      return
    }
    started = false
    window.cancelAnimationFrame(frame)
    previousMs = undefined
  }

  Object.assign(gameEngine, {
    startGameLoop,
    pauseGameLoop,
    resumeGameLoop,
    stopGameLoop,
  })

  return gameEngine
}
