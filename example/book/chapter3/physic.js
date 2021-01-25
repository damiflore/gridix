import { getVectorLength } from "../chapter2/vector.js"
import { substractVector } from "./vector.js"

export const updatePhysicForArcadeGame = (gameObjects) => {
  const collidingPairs = detectCollidingPairs(gameObjects)

  collidingPairs.forEach((gameObjectA, gameObjectB) => {
    gameObjectA.isColliding = true
    gameObjectB.isColliding = true
  })
}

const testGameObjectBound = (a, b) => {
  if (a.type === "circle" && b.type === "circle") {
    return testCircleToCircleBound(a, b)
  }
  
  return false
}

const testCircleToCircleBound = (circleA, circleB) => {
  const centerDiff = substractVector(
    { x: circleA.x, y: circleA.y },
    { x: circleB.centerX, y: circleB.centerY },
  )
  const centerDistance = getVectorLength(centerDiff)
  const radiusSum = circleA.radius + circleB.radius

  if (centerDistance > radiusSum) {
    return false
  }

  return true
}

const detectCollidingPairs = (blocs) => {
  return findPairs(blocs, (blocA, blocB) => {
    return testGameObjectBound(blocA, blocB)
  })
}

const findPairs = (array, pairPredicate) => {
  const pairs = []

  let i = 0
  while (i < array.length) {
    const value = array[i]
    i++
    let j = i
    while (j < array.length) {
      const otherValue = array[j]
      j++
      if (pairPredicate(value, otherValue)) {
        pairs.push([value, otherValue])
      }
    }
  }

  return pairs
}
