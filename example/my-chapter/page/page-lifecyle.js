/*

https://developers.google.com/web/updates/2018/07/page-lifecycle-api
https://github.com/GoogleChromeLabs/page-lifecycle

*/
import pageLifecyle from "page-lifecycle"

export const registerPageLifecyle = ({
  // user see and interacts with the page
  active = () => {},
  // user see but does not interact with the page
  passive = () => {},
  // user don't see the page
  hidden = () => {},
  // page frozen by browser
  frozen = () => {},
  // page unloads, not reliable but can be user for analytics (sendBeacon)
  terminated = () => {},

  notifyCurrent = true,
}) => {
  const callbacks = { active, passive, hidden, frozen, terminated }

  const check = () => {
    const pageState = getPageLifecycleState()
    callbacks[pageState]()
  }

  if (notifyCurrent) {
    check()
  }

  return listenPageLifecyleStateChange(check)
}

const getPageLifecycleState = () => {
  return pageLifecyle.state
}

const listenPageLifecyleStateChange = (callback) => {
  pageLifecyle.addEventListener("statechange", callback)
  return () => {
    pageLifecyle.removeEventListener("statechange", callback)
  }
}
