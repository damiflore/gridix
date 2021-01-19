import {
  circleCollidesWithCircle,
  rectangleCollidesWithRectangle,
  circleCollidesWithRectangle,
} from "src/physic/collision.js"

export const createUnit = (props) => {
  return props
}

export const unitCollidesWithUnit = (firstUnit, secondUnit) => {
  // il faudrait aussi tester qu'ils sont sur le meme Z
  if (!firstUnit.isSolid) {
    return false
  }
  if (!secondUnit.isSolid) {
    return false
  }

  return firstUnit.hitboxes.some((firstUnitHitbox) => {
    return secondUnit.hitboxes.some((secondUnitHitbox) => {
      return hitboxCollidesHitbox(firstUnitHitbox, secondUnitHitbox)
    })
  })
}

const hitboxCollidesHitbox = (firstHitbox, secondHitbox) => {
  const firstIsCircle = Boolean(firstHitbox.radius)
  const secondIsCircle = Boolean(secondHitbox.radius)

  if (firstIsCircle && secondIsCircle) {
    return circleCollidesWithCircle(firstHitbox, secondHitbox)
  }

  if (firstIsCircle) {
    return circleCollidesWithRectangle(firstHitbox, secondHitbox)
  }

  if (secondIsCircle) {
    return circleCollidesWithRectangle(secondHitbox, firstHitbox)
  }

  return rectangleCollidesWithRectangle(firstHitbox, secondHitbox)
}

export const drawPathStyle = (context, { path, fillStyle, strokeStyle, opacity = 1 } = {}) => {
  if (!fillStyle && !strokeStyle) {
    return
  }

  context.save()
  context.globalAlpha = opacity
  if (fillStyle) {
    context.fillStyle = fillStyle
    context.fill(path)
  }
  if (strokeStyle) {
    context.strokeStyle = strokeStyle
    context.stroke(path)
  }
  context.restore()
}
