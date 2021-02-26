import React from "react"

export const useNodeSize = (nodeRef) => {
  const [size, sizeSetter] = React.useState(sizeGetter(nodeRef.current))

  React.useLayoutEffect(() => {
    const node = nodeRef.current
    if (!node) {
      return null
    }

    let frameId
    const resizeObserver = new ResizeObserver(() => {
      // avoid ResizeObserver loop limit exceeded error
      frameId = window.requestAnimationFrame(() => {
        sizeSetter(sizeGetter(node))
      })
    })
    resizeObserver.observe(node)

    return () => {
      resizeObserver.disconnect()
      window.cancelAnimationFrame(frameId)
    }
  }, [nodeRef.current])

  return size
}

const sizeGetter = (node) => {
  if (node) {
    return {
      width: node.offsetWidth,
      height: node.offsetHeight,
    }
  }

  return {
    width: 0,
    height: 0,
  }
}
