export const addDOMEventListener = (node, eventName, callback, options) => {
  node.addEventListener(eventName, callback, options)
  return () => {
    node.removeEventListener(eventName, callback, options)
  }
}

export const createDOM = (stringContainingHTMLSource) => {
  const domParser = new DOMParser()
  const document = domParser.parseFromString(stringContainingHTMLSource, "text/html")
  return document
}
