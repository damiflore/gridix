export const addDOMEventListener = (node, eventName, callback, options) => {
  node.addEventListener(eventName, callback, options)
  return () => {
    node.removeEventListener(eventName, callback, options)
  }
}
