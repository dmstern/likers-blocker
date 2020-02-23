var blockIcon =
  '<svg viewBox="0 0 24 24" class="r-9ilb82 r-4qtqp9 r-yyyyoo r-1q142lx r-1xvli5t r-zso239 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 1.25C6.072 1.25 1.25 6.072 1.25 12S6.072 22.75 12 22.75 22.75 17.928 22.75 12 17.928 1.25 12 1.25zm0 1.5c2.28 0 4.368.834 5.982 2.207L4.957 17.982C3.584 16.368 2.75 14.282 2.75 12c0-5.1 4.15-9.25 9.25-9.25zm0 18.5c-2.28 0-4.368-.834-5.982-2.207L19.043 6.018c1.373 1.614 2.207 3.7 2.207 5.982 0 5.1-4.15 9.25-9.25 9.25z"></path></g></svg>';

function tryToAccessDOM(callback, elementToExpectSelector, context = document) {
  var elementToExpect = null;
  var tryCounter = 0;
  var tryMax = 10;
  var interval = undefined;

  function tryIt() {
    tryCounter++;
    console.log(elementToExpectSelector, tryCounter);

    if (tryCounter >= tryMax || elementToExpect) {
      clearInterval(interval);
    }

    elementToExpect = context.querySelector(elementToExpectSelector);

    if (!elementToExpect) {
      return;
    }
    clearInterval(interval);

    callback(elementToExpect);
  }

  interval = setInterval(tryIt, 500);
}

function getUsernames() {
  let userCells = document.querySelectorAll('[data-testid="UserCell"]');
  let users = Array.from(userCells);
  return users.map(user => user.querySelector("a").href);
}

function addBlockButton() {
  tryToAccessDOM(followButton => {
    // prevent multiple blockButtons:
    if (document.querySelector("[data-testid=blockAll")) {
      return;
    }

    var blockButton = document.createElement("a");
    var requestURL = `https://ichbinhier-twittertools.herokuapp.com/blockapi/profile_urls=${usernamesList}`;
    blockButton.classList = followButton.classList;
    blockButton.style.textDecoration = "none";
    blockButton.style.marginRight = "1rem";
    blockButton.dataset.testid = "blockAll";
    blockButton.innerHTML = followButton.innerHTML;
    blockButton.querySelector("div > span > span").innerHTML =
      "Alle Blockieren";
    blockButton.target = "_blank";
    // post usernames to block API:
    var usernamesList = getUsernames().join(":");
    let topbar = document.querySelector(
      "main > div > div > div > div > div > div"
    );
    topbar.appendChild(blockButton);

    // add blockIcon:
    var blockIconWrapper = document.createElement("span");
    blockIconWrapper.innerHTML = blockIcon;
    blockIconWrapper.style.marginRight = ".3em";
    blockButton.querySelector("div").prepend(blockIconWrapper);
    blockIconWrapper.querySelector("svg").style.color = getComputedStyle(
      blockButton
    ).borderBottomColor;

    var confirmed = blockButton.addEventListener("click", function() {
      confirm(
        "Bist du sicher, dass du alle, die diesen Tweet geliked haben blockieren möchtest?"
      );

      if (confirmed) {
        window.location.href = requestUrl;
      }
    });
  }, "[data-testid*=follow]");
}

// for we are on the likes page:
addBlockButton();

// For every other page: try it on click again:
document.querySelector("body").addEventListener("click", addBlockButton);
