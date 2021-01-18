System.register([],(function(){"use strict";return{execute:function(){var n=function(n,e,t){return n.addEventListener(e,t),function(){n.removeEventListener(e,t)}},e=function(){return window.navigator.standalone||window.matchMedia("(display-mode: standalone)").matches},t=function(n){var e=window.matchMedia("(display-mode: standalone)");return e.addListener(n),function(){e.removeListener(n)}};var o,r=(o=function(){return window.beforeinstallpromptEvent?(window.beforeinstallpromptEvent.prompt(),n=window.beforeinstallpromptEvent.userChoice,e=function(n){return"accepted"===n.outcome},t?e?e(n):n:(n&&n.then||(n=Promise.resolve(n)),e?n.then(e):n)):(console.warn("cannot promptAddToHomescreen: window.beforeinstallpromptEvent is missing"),!1);var n,e,t},function(){for(var n=[],e=0;e<arguments.length;e++)n[e]=arguments[e];try{return Promise.resolve(o.apply(this,n))}catch(n){return Promise.reject(n)}}),i=function(){return Boolean(window.beforeinstallpromptEvent)},a=function(n){var e=n.beforeinstallpromptEventAvailableOnWindow,t=n.displayModeIsStandalone,o=n.appInstalledEvent;return!!e&&(!t&&!o)},l=function(e){return n(window,"beforeinstallprompt",e)};function u(n,e){(null==e||e>n.length)&&(e=n.length);for(var t=new Array(e),o=0;o<e;o++)t[o]=n[o];return t}var c=function(n){return function(n){if(Array.isArray(n))return u(n)}(n)||function(n){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(n))return Array.from(n)}(n)||function(n,e){if(n){if("string"==typeof n)return u(n,e);var t=Object.prototype.toString.call(n).slice(8,-1);return"Object"===t&&n.constructor&&(t=n.constructor.name),"Map"===t||"Set"===t?Array.from(n):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?u(n,e):void 0}}(n)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()};function s(n,e,t){return t?e?e(n):n:(n&&n.then||(n=Promise.resolve(n)),e?n.then(e):n)}var d=window.navigator.serviceWorker;function f(n){return function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];try{return Promise.resolve(n.apply(this,e))}catch(n){return Promise.reject(n)}}}function v(n,e,t){if(t)return e?e(n()):n();try{var o=Promise.resolve(n());return e?o.then(e):o}catch(n){return Promise.reject(n)}}function p(n,e){var t=n();return t&&t.then?t.then(e):e(t)}var m,w=Boolean(d)&&"https:"===document.location.protocol,g=null,b=null,h=(m=[],{listen:function(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=e.once,o=void 0!==t&&t;if(o){var r=n;n=function(){a(),r.apply(void 0,arguments)}}m=[].concat(c(m),[n]);var i=!1,a=function(){if(!i){i=!0;for(var e=[],t=m.length,o=!0;t--;){var r=m[t];o&&r===n?o=!1:e.push(r)}m=e}};return a},emit:function(){for(var n=arguments.length,e=new Array(n),t=0;t<n;t++)e[t]=arguments[t];m.forEach((function(n){n.apply(void 0,e)}))}}),y=function(n){b&&b===n?console.log("we already know this worker is updating"):(n?console.log("found a worker updating (worker state is: ".concat(n.state,")")):console.log("worker update is done"),b=n,h.emit())},k=f((function(){return g?s(g,(function(n){return s(n.update(),(function(n){var e=n.installing;if(e)return console.log("installing worker found after calling update()"),y(e),!0;var t=n.waiting;return t?(console.log("waiting worker found after calling update()"),y(t),!0):(console.log("no worker found after calling update()"),!1)}))})):(console.warn("registerServiceWorker must be called before checkServiceWorkerUpdate can be used"),!1)})),E=function(n){if(b)return function(n,e){var t=new MessageChannel,o=t.port1,r=t.port2;return new Promise((function(t,i){o.onmessage=function(n){"rejected"===n.data.status?i(n.data.value):t(n.data.value)},n.postMessage(e,[r])}))}(b,n);console.warn("no service worker updating to send message to")},A=f((function(n){if(!b)throw new Error("no service worker update to activate");return S(b,n)})),S=f((function(e){var t=!1,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=o.onActivating,i=void 0===r?function(){}:r,a=o.onActivated,l=void 0===a?function(){}:a,u=o.onBecomesNavigatorController,c=void 0===u?function(){}:u,s=e.state,f=function(){return new Promise((function(t){var o=n(e,"statechange",(function(){"activating"===e.state&&i(),"activated"===e.state&&(l(),o(),t())}))}))};return p((function(){if("installed"===s||"activating"===s)return"installed"===s&&E({action:"skipWaiting"}),v(f,(function(){if(d.controller)var e=n(d,"controllerchange",(function(){e(),c(),y(null),I()}));else y(null),I();t=!0}))}),(function(n){if(t)return n;c(),y(null),I()}))})),M=!0,P=!1,I=function(){P||(P=!0,window.location.reload())};if(w)n(d,"controllerchange",I);var W,j=function(n){return(new DOMParser).parseFromString(n,"text/html")},O=j("<button disabled>Add to home screen</button>").querySelector("button");function C(n,e,t){if(t)return e?e(n()):n();try{var o=Promise.resolve(n());return e?o.then(e):o}catch(n){return Promise.reject(n)}}function L(n){return function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];try{return Promise.resolve(n.apply(this,e))}catch(n){return Promise.reject(n)}}}function q(){}if(document.body.appendChild(O),O.onclick=function(){r()},function(n){var o,r=!1,u=function(e){var t=e.beforeinstallpromptEventAvailableOnWindow,i=e.displayModeIsStandalone,l=a({beforeinstallpromptEventAvailableOnWindow:t,displayModeIsStandalone:i,appInstalledEvent:r});l!==o&&(o=l,n(l))};u({beforeinstallpromptEventAvailableOnWindow:i(),displayModeIsStandalone:e()});var c=l((function(n){window.beforeinstallpromptEvent=n,u({beforeinstallpromptEventAvailableOnWindow:!0,displayModeIsStandalone:e()})})),s=t((function(){u({beforeinstallpromptEventAvailableOnWindow:i(),displayModeIsStandalone:e()})})),d=function(n){return window.addEventListener("appinstalled",n),function(){window.removeEventListener("appinstalled",n)}}((function(){r=!0,u({beforeinstallpromptEventAvailableOnWindow:i(),displayModeIsStandalone:e()})}))}((function(n){O.disabled=!n})),(requestIdleCallback||requestAnimationFrame)((function(){!function(e){var t=(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).scope;if(!w)return function(){};var o=!1,r=function(){},i=function(){};s(g=d.register(e,{scope:t}),(function(e){if(r=function(){e.unregister()},o)r();else{var t=e.installing;e.waiting,e.active,i=n(e,"updatefound",(function(){console.log("browser notifies use an worker is installing"),e.installing!==t?y(e.installing):console.log("it's not an worker update, it's first time worker registers")}))}}))}("/service-worker.js")})),w){var B=j("\n<button>Check update</button>\n<p></p>\n"),T=B.querySelector("button"),H=B.querySelector("p");document.body.appendChild(T),document.body.appendChild(H),T.onclick=L((function(){return T.disabled=!0,H.innerHTML="checking for update",C(k,(function(n){n||(T.disabled=!1,H.innerHTML="No update available")}))})),W=function(){Boolean(b?{shouldBecomeNavigatorController:Boolean(d.controller),navigatorWillReload:M}:null)?(H.innerHTML="Update available <button>Activate update</button>",H.querySelector("button").onclick=L((function(){return H.querySelector("button").disabled=!0,C(A,q,n);var n}))):H.innerHTML=""},h.listen(W)}window.splashscreen.remove()}}}));

//# sourceMappingURL=main-d2e5686b.js.map