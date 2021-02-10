import React from "react"
import { addDOMEventListener } from "src/helper/dom.js"

export const InspectGesture = ({ world, worldNode, onInspectHover, onInspectSelect }) => {
  const worldViewWrapperNode = worldNode.querySelector(".world-view-wrapper")

  React.useEffect(() => {
    return addDOMEventListener(worldViewWrapperNode, "mousemove", (mousemoveEvent) => {
      const x = mousemoveEvent.layerX
      const y = mousemoveEvent.layerY
      const pointerPoint = {
        x,
        y,
      }
      const gameObjectUnderPointer = world.gameObjectFromPoint(pointerPoint)
      onInspectHover(gameObjectUnderPointer)
    })
  }, [])

  React.useEffect(() => {
    return addDOMEventListener(worldViewWrapperNode, "click", (clickEvent) => {
      const x = clickEvent.layerX
      const y = clickEvent.layerY
      const pointerPoint = {
        x,
        y,
      }
      const gameObjectUnderPointer = world.gameObjectFromPoint(pointerPoint)
      onInspectSelect(gameObjectUnderPointer)
    })
  }, [])

  return null
}
