import React from "react"

export const useNodeSize = (nodeRef) => {
  const [size, sizeSetter] = React.useState(sizeGetter(nodeRef.current))

  React.useLayoutEffect(() => {
    const node = nodeRef.current
    if (!node) {
      return null
    }

    //  sizeSetter(sizeGetter(node))
    const resizeObserver = new ResizeObserver(() => {
      sizeSetter(sizeGetter(node))
    })
    resizeObserver.observe(node)

    return () => {
      resizeObserver.disconnect()
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
