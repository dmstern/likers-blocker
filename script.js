var likesCounter = null;
var tryCounter = 0;
var tryMax = 10;
var interval = undefined;

function addBlockButton() {
  tryCounter++;

  if (tryCounter >= tryMax || likesCounter) {
    clearInterval(interval);
  }

  likesCounter = document.querySelector('a[href*="/likes"]');

  if (!likesCounter) {
    return;
  }

  clearInterval(interval);

  var blockButton = document.createElement("div");
  var interactionBar = likesCounter.parentNode.parentNode;

  blockButton.role = "button";
  blockButton.innerText = "Alle Blockieren";
  blockButton.style.marginLeft = "1em";
  blockButton.classList = likesCounter.classList;

  blockButton.addEventListener("click", function() {
    confirm(
      "Bist du sicher, dass du alle, die diesen Tweet geliked haben blockieren möchtest?"
    );
  });

  interactionBar.appendChild(blockButton);
}

interval = setInterval(addBlockButton, 500);
