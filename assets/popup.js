"use strict";

var browser = browser || chrome;

function localizeUI() {
  const labelNodes = document.querySelectorAll("[data-label]");
  labelNodes.forEach((element) => {
    const messageName = element.dataset.label;
    const msg = browser.i18n.getMessage(messageName);
    element.innerHTML = msg;
  });
}

function alignRightButton() {
  const rightButton = document.querySelector(".btn.issue");
  const leftButton = rightButton.parentElement.children[0];
  rightButton.style.left = getComputedStyle(leftButton).width;
}

(function() {
  localizeUI();
  alignRightButton();
})();
