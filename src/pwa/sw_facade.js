import { createServiceWorkerFacade } from "@jsenv/pwa";
import { createDOM } from "../helper/dom.js";

const swFacade = createServiceWorkerFacade();

const callLater = requestIdleCallback
  ? requestIdleCallback
  : requestAnimationFrame;
callLater(() => {
  const registrationPromise = window.navigator.serviceWorker.register(
    "../service_worker.js",
  );
  swFacade.setRegistrationPromise(registrationPromise);
});

const serviceWorkerUpdateDocument = createDOM(`
    <button>Check update</button>
    <p></p>
    `);
const buttonCheckUpdate = serviceWorkerUpdateDocument.querySelector("button");
const paragraph = serviceWorkerUpdateDocument.querySelector("p");
document.body.appendChild(buttonCheckUpdate);
document.body.appendChild(paragraph);

buttonCheckUpdate.onclick = async () => {
  buttonCheckUpdate.disabled = true;
  paragraph.innerHTML = "checking for update";
  const found = await swFacade.checkForUpdates();

  if (found) {
    // when update is found, we already know from listenServiceWorkerUpdate
  } else {
    buttonCheckUpdate.disabled = false;
    paragraph.innerHTML = "No update available";
  }
};

swFacade.subscribe(() => {
  const { update } = swFacade.state;

  if (update) {
    paragraph.innerHTML = `Update available <button>Activate update</button>`;
    paragraph.querySelector("button").onclick = async () => {
      paragraph.querySelector("button").disabled = true;
      await update.activate();
    };
  } else {
    paragraph.innerHTML = "";
  }
});
