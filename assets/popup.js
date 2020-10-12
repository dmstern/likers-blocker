"use strict";

function localizeUI() {
  const labelNodes = document.querySelectorAll("[data-label]");
  labelNodes.forEach((element) => {
    const messageName = element.dataset.label;
    const msg = browser.i18n.getMessage(messageName);
    element.innerHTML = msg;
  });
}

(function() {
  localizeUI();
})();
