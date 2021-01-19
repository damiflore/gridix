import {
  circleCollidesWithCircle,
  rectangleCollidesWithRectangle,
  circleCollidesWithRectangle,
} from "src/physic/collision.js"

export const createUnit = (props) => {
  return props
}

export const unitCollidesWithUnit = (firstUnit, secondUnit) => {
  return firstUnit.hitboxes.some((firstUnitHitbox) => {
    return secondUnit.hitboxes.some((secondUnitHitbox) => {
      return hitboxCollidesHitbox(firstUnitHitbox, secondUnitHitbox)
    })
  })
}

const hitboxCollidesHitbox = (firstHitbox, secondHitbox) => {
  const firstIsCircle = firstHitbox.radius
  const secondIsCircle = secondHitbox.radius
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

export const drawPathStyle = (context, path, { fillStyle, strokeStyle } = {}) => {
  if (!fillStyle && !strokeStyle) {
    return
  }

  context.save()
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
