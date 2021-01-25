import { getVectorLength } from "../chapter2/vector.js"
import { substractVector } from "./vector.js"

export const updatePhysicForArcadeGame = (gameObjects) => {
  const collidingPairs = detectCollidingPairs(gameObjects)
  gameObjects.forEach((gameObject) => {
    gameObject.isColliding = false
  })
  collidingPairs.forEach((collidingPair) => {
    const [a, b] = collidingPair
    a.isColliding = true
    b.isColliding = true
  })
}

const testGameObjectBound = (a, b) => {
  return testCircleBound(a, b)
}

const testCircleBound = (circleA, circleB) => {
  const centerDiff = substractVector(
    { x: circleA.centerX, y: circleA.centerY },
    { x: circleB.centerX, y: circleB.centerY },
  )
  const centerDistance = getVectorLength(centerDiff)
  const radiusSum = circleA.boundRadius + circleB.boundRadius

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
