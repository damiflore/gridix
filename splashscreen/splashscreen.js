const splashscreenHtml = `
<div id="splashscreen" data-step="loading">
  <h1>PWA template</h1>
  <div id="splashscreen-text">
    <noscript>
      <h1>JavaScript est requis</h1>
      <p>
        Cette page a besoin de Javascript pour fonctionner et JavaScript n'est pas disponible.
      </p>
    </noscript>
  </div>
  <div id="splashscreen-text-variants" style="display: none">
    <div id="loader">Loading...</div>
    <div id="network-error-screen">
      Une erreur est survenue pendant le chargement du fichier principal.
    </div>
    <div id="runtime-error-screen">
      <p>Une erreur est survenu pendant l'exécution du fichier principal.</p>
      <br />
      <details>
        <summary>Voir le détail</summary>
        <h6 id="runtime-error-title">{runtimeErrorTitle}</h6>
        <pre id="runtime-error-message">{runtimeErrorMessage}</pre>
      </details>
    </div>
  </div>
</div>`

const splashScreenCss = `
#splashscreen {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: black;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;

  opacity: 0;
  /* transform: scale(0); */

  animation-name: splashin;
  animation-duration: 0.4s;
  animation-delay: 0.1s;
  /* in case browser is very fast, don't display at all */
  animation-fill-mode: forwards;
}

#splashscreen[data-step="loading"] + #app {
  visibility: hidden;
  /*
  avoid big image to create a scroll
  or if the game is too big it will
  increase splashscreen size
  */
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#splashscreen[data-step="loaded"] {
  animation-name: splashout;
  animation-fill-mode: forwards;
}

@keyframes splashin {
  from {
    opacity: 0;
    /* transform: scale(0); */
  }

  to {
    opacity: 1;
    /* transform: scale(1); */
  }
}

@keyframes splashout {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
    display: none;
  }
}

#splashscreen #splashscreen-text {
  display: flex;
  justify-content: center;
  flex: 1;
  width: 80%;
}

#splashscreen #errorscreen {
  display: block;
}

#splashscreen #errorscreen details {
  max-width: 500px;
}

#splashscreen details pre {
  overflow: auto;
}

#splashscreen img {
  animation: loading 1.3s ease-in-out infinite alternate;
}

@keyframes loading {
  0% {
    transform: rotate(-90deg) scale(1);
  }

  100% {
    transform: rotate(90deg) scale(1.3);
  }
}`

const style = document.createElement("style")
style.innerHTML = splashScreenCss
document.body.appendChild(style)

const div = document.createElement("div")
div.innerHTML = splashscreenHtml
const splashscreenNode = div.children[0]
document.body.appendChild(splashscreenNode)

const splashscreenElement = document.querySelector("#splashscreen")
const mainScript = window.parent.document.querySelector("script#main-script")

const activateSplashscreenVariant = (variantId, data = {}) => {
  const activeVariantContainer = document.querySelector("#splashscreen-text")
  activeVariantContainer.innerHTML = ""
  const variantModel = document.querySelector(`#${variantId}`)
  const variantInstance = variantModel.cloneNode(true)

  const visitNode = (node) => {
    if (node.nodeName === "#text") {
      node.textContent = node.textContent.replace(/\${(\w*)}/g, (_, key) => {
        return data.hasOwnProperty(key) ? data[key] : ""
      })
    } else {
      Array.from(node.childNodes).forEach((node) => {
        visitNode(node)
      })
    }
  }
  visitNode(variantInstance)

  activeVariantContainer.appendChild(variantInstance)
  return variantInstance
}

// montre un loader ou quelque chose parce que le site met un peu de temps a se load
const showLoaderTimeout = setTimeout(() => {
  activateSplashscreenVariant("loader")
}, 2500)

// detect main script load error
mainScript.onerror = () => {
  clearTimeout(showLoaderTimeout)
  activateSplashscreenVariant("network-error-screen")
}
// uncomment the line below to test the case of a network error
// mainScript.onerror();

// detect main script parse or execute error
const errorEventCallback = (errorEvent) => {
  window.parent.removeEventListener("error", errorEventCallback)
  const { message, filename, lineno: lineNumber, colno: columnNumber } = errorEvent

  clearTimeout(showLoaderTimeout)
  activateSplashscreenVariant("runtime-error-screen", {
    runtimeErrorTitle: filename
      ? `${filename}:${lineNumber}:${columnNumber}`
      : "<Aucun fichier associé a cette erreur>",
    runtimeErrorMessage:
      message ||
      `<Aucun message associé a cette erreur>
      (Ouvrir les devtools pour en savoir plus)`,
  })
}
window.addEventListener("error", errorEventCallback)

window.splashscreen = {
  remove: () => {
    // uncomment the line below to test the case of an infite loading
    // return

    // here the main script should call this when it's ready to display something
    // because the main script might be loading some images and stuff
    // we should first display an other screen showing what the main script is doing
    // (likely loading assets)
    // we must create this component which does not exists yet
    clearTimeout(showLoaderTimeout)
    window.parent.removeEventListener("error", errorEventCallback)
    splashscreenElement.setAttribute("data-step", "loaded")
    setTimeout(() => {
      splashscreenElement.style.display = "none"
    }, 300)
  },
}
