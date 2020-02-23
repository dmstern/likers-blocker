var blockIcon =
  '<svg viewBox="0 0 24 24" class="r-9ilb82 r-4qtqp9 r-yyyyoo r-1q142lx r-1xvli5t r-zso239 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 1.25C6.072 1.25 1.25 6.072 1.25 12S6.072 22.75 12 22.75 22.75 17.928 22.75 12 17.928 1.25 12 1.25zm0 1.5c2.28 0 4.368.834 5.982 2.207L4.957 17.982C3.584 16.368 2.75 14.282 2.75 12c0-5.1 4.15-9.25 9.25-9.25zm0 18.5c-2.28 0-4.368-.834-5.982-2.207L19.043 6.018c1.373 1.614 2.207 3.7 2.207 5.982 0 5.1-4.15 9.25-9.25 9.25z"></path></g></svg>';
var apiUrlBlock = "https://ichbinhier-twittertools.herokuapp.com/blocklists";

var topbarSelector = {
  mobile: "main > div > div > div > div > div > div",
  desktop: "[aria-labelledby=modal-header] > div > div > div > div > div"
};

function tryToAccessDOM(callback, elementToExpectSelector, context = document) {
  var elementToExpect = null;
  var tryCounter = 0;
  var tryMax = 10;
  var interval = undefined;

  function tryIt() {
    tryCounter++;

    if (tryCounter >= tryMax || elementToExpect) {
      clearInterval(interval);
    }

    elementToExpect = context.querySelector(elementToExpectSelector);

    if (
      !elementToExpect ||
      elementToExpect.style.display === "none" ||
      elementToExpect.offsetParent === null
    ) {
      return;
    }
    clearInterval(interval);

    callback(elementToExpect);
  }

  interval = setInterval(tryIt, 500);
}

function isMobile() {
  return document.documentElement.clientWidth < 699;
}

function getUsernames() {
  var userCells = document.querySelectorAll('[data-testid="UserCell"]');
  var users = Array.from(userCells);
  return users.map(user => {
    var userUrl = user.querySelector("a").href;
    return userUrl.replace("https://twitter.com/", "");
  });
}

function addBlockButton() {
  tryToAccessDOM(followButton => {
    // prevent multiple blockButtons:
    if (document.querySelector("[data-testid=blockAll")) {
      return;
    }

    var blockButton = document.createElement("button");
    blockButton.classList = followButton.classList;
    blockButton.style.textDecoration = "none";
    blockButton.style.marginRight = "1rem";
    blockButton.dataset.testid = "blockAll";
    blockButton.innerHTML = followButton.innerHTML;
    var blockButtonLabel = blockButton.querySelector("div > span > span");
    blockButtonLabel.innerHTML = "Alle Blockieren";

    var viewport = isMobile() ? "mobile" : "desktop";
    var topbar = document.querySelector(topbarSelector[viewport]);

    if (!topbar) {
      return;
    }
    topbar.appendChild(blockButton);

    // add blockIcon:
    var blockIconWrapper = document.createElement("span");
    blockIconWrapper.innerHTML = blockIcon;
    blockIconWrapper.style.marginRight = ".3em";
    blockButton.querySelector("div").prepend(blockIconWrapper);
    var highlightColor = getComputedStyle(blockButton).borderBottomColor;
    blockIconWrapper.querySelector("svg").style.color = highlightColor;

    blockButton.addEventListener("click", () => {
      var requestUrl = `${apiUrlBlock}?users=${getUsernames()}`;
      var confirmed = confirm(`Willst du alle ${getUsernames().length} Nutzer blockieren? Evtl. musst du Popups ein deinem Browser für twitter.com erlauben.`);
      if (confirmed) {
        window.open(requestUrl, '_blank');
      }
    });
  }, "[data-testid*=follow]");
}

// for when we are on the likes page:
addBlockButton();

// For every other page: try it on click again:
document.querySelector("body").addEventListener("click", addBlockButton);
window.addEventListener("resize", addBlockButton);
