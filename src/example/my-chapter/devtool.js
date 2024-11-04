const devtool = document.querySelector("#devtool");

export const updateDevtool = ({ textContents, onClicks }) => {
  const updates = [];

  Object.keys(textContents).forEach((key) => {
    const node = devtool.querySelector(`#${key}`);
    if (node) {
      updates.push(() => {
        node.innerHTML = textContents[key];
      });
    } else {
      throw new Error(`Cannot find ${key}`);
    }
  });

  Object.keys(onClicks).forEach((key) => {
    const node = devtool.querySelector(`[name="${key}"]`);
    if (node) {
      updates.push(() => {
        node.onclick = onClicks[key];
      });
    } else {
      throw new Error(`Cannot find ${key}`);
    }
  });

  updates.forEach((update) => {
    update();
  });
};
