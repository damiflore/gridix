import { addDOMEventListener } from "src/helper/dom.js"

export const trackKeyboardKeydown = ({ node, code, onpress = () => {}, onrelease = () => {} }) => {
  const key = {
    isDown: false,
    downTimeStamp: 0,
    upTimeStamp: 0,
  }

  const removeKeydownListener = addDOMEventListener(node, "keydown", (keydownEvent) => {
    if (keydownEvent.code !== code) {
      return
    }
    keydownEvent.preventDefault()
    if (!key.isDown) {
      key.isDown = true
      key.downTimeStamp = keydownEvent.timeStamp
      onpress()
    }
  })

  const removeKeyupListener = addDOMEventListener(node, "keyup", (keyupEvent) => {
    if (keyupEvent.code !== code) {
      return
    }
    keyupEvent.preventDefault()
    if (key.isDown) {
      key.isDown = false
      key.upTimeStamp = keyupEvent.timeStamp
      onrelease()
    }
  })

  key.untrack = () => {
    removeKeydownListener()
    removeKeyupListener()
  }

  return key
}
