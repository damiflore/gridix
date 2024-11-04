export const addDOMEventListener = (node, eventName, callback, options) => {
  node.addEventListener(eventName, callback, options);
  return () => {
    node.removeEventListener(eventName, callback, options);
  };
};

export const createDOM = (stringContainingHTMLSource) => {
  const domParser = new DOMParser();
  const document = domParser.parseFromString(
    stringContainingHTMLSource,
    "text/html",
  );
  return document;
};

export const addLoadedListener = (domNode, callback) => {
  const removeLoadListener = addDOMEventListener(domNode, "load", () => {
    removeErrorListener();
    callback();
  });
  const removeErrorListener = addDOMEventListener(domNode, "error", () => {
    removeLoadListener();
    callback();
  });

  return () => {
    removeLoadListener();
    removeErrorListener();
  };
};

export const injectStylesheetIntoDocument = (
  href,
  { onload = () => {} } = {},
) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  const removeLoadedListener = addLoadedListener(link, onload);
  link.href = href;
  document.head.appendChild(link);
  return () => {
    removeLoadedListener();
    document.head.removeChild(link);
  };
};
