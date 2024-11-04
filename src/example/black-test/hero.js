import { Graphics, RigidBody, BoxCollider, ColorHelper, RGB } from "black-engine"

export const createHero = ({ x = 0, y = 0, width = 32, height = 32 } = {}) => {
  const gameObject = new Graphics()

  gameObject.x = x
  gameObject.y = y

  gameObject.onUpdate = () => {
    gameObject.beginPath()
    gameObject.rect(0, 0, width, height)
    gameObject.closePath()
    gameObject.fillStyle(redHex)
    gameObject.fill()
  }

  const rigidBody = new RigidBody()
  gameObject.addComponent(rigidBody)
  const boxCollider = new BoxCollider(0, 0, width, height)
  gameObject.addComponent(boxCollider)

  gameObject.rigidBody = rigidBody

  return gameObject
}

const redRGB = new RGB(255, 0, 0)
const redHex = ColorHelper.rgb2hex(redRGB)

export const createBaril = ({ x = 50, y = 50, width, height } = {}) => {
  const gameObject = new Graphics()

  gameObject.x = x
  gameObject.y = y

  gameObject.onUpdate = () => {
    gameObject.beginPath()
    gameObject.rect(0, 0, width, height)
    gameObject.closePath()
    gameObject.fillStyle(blueHex)
    gameObject.fill()
  }

  const rigidBody = new RigidBody()
  gameObject.addComponent(rigidBody)
  const boxCollider = new BoxCollider(0, 0, width, height)
  gameObject.addComponent(boxCollider)

  gameObject.rigidBody = rigidBody

  return gameObject
}

const blueRgb = new RGB(0, 0, 255)
const blueHex = ColorHelper.rgb2hex(blueRgb)
