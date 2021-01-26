const devtool = document.querySelector("#devtool")

export const updateDevtool = ({ textContents, onClicks }) => {
  Object.keys(textContents).forEach((key) => {
    const node = devtool.querySelector(`#${key}`)
    if (node) {
      node.innerHTML = textContents[key]
    } else {
      console.warn(`Cannot find ${key}`)
    }
  })

  Object.keys(onClicks).forEach((key) => {
    const node = devtool.querySelector(`[name="${key}"]`)
    if (node) {
      node.onclick = onClicks[key]
    } else {
      console.warn(`Cannot find ${key}`)
    }
  })
}
