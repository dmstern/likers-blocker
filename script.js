var blockIcon =
  '<svg viewBox="0 0 24 24" class="r-9ilb82 r-4qtqp9 r-yyyyoo r-1q142lx r-1xvli5t r-zso239 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 1.25C6.072 1.25 1.25 6.072 1.25 12S6.072 22.75 12 22.75 22.75 17.928 22.75 12 17.928 1.25 12 1.25zm0 1.5c2.28 0 4.368.834 5.982 2.207L4.957 17.982C3.584 16.368 2.75 14.282 2.75 12c0-5.1 4.15-9.25 9.25-9.25zm0 18.5c-2.28 0-4.368-.834-5.982-2.207L19.043 6.018c1.373 1.614 2.207 3.7 2.207 5.982 0 5.1-4.15 9.25-9.25 9.25z"></path></g></svg>';
var apiUrlBlock = "https://ichbinhier-twittertools.herokuapp.com/blocklists";
var urlLengthMax = 2000;
var collectedUsers = [];

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

function scrapeUsernames(likersList) {
  var userCells = likersList.querySelectorAll('[data-testid="UserCell"]');
  var users = Array.from(userCells);
  return users.map(user => {
    var userUrl = user.querySelector("a").href;
    return userUrl.replace("https://twitter.com/", "");
  });
}

function addUsers(users) {
  collectedUsers.push(...users);
}

function getUsers() {
  return Array.from(new Set(collectedUsers));
}

function addBlockButton() {

  function closePopup(popup, blockButton, scrollList) {
    blockButton.disabled = false;

    popup.classList.add("lb-hide");
    popup.addEventListener("transitionend", () => {
      popup.remove();
    });

    scrollList.classList.remove("lb-blur");
  }

  tryToAccessDOM(followButton => {
    // prevent multiple blockButtons:
    if (document.querySelector("[data-testid=blockAll")) {
      return;
    }

    var blockButton = document.createElement("button");
    blockButton.classList.add("lb-block-button", ...followButton.classList);
    blockButton.dataset.testid = "blockAll";
    blockButton.innerHTML = followButton.innerHTML;
    var blockButtonLabel = blockButton.querySelector("div > span > span");
    blockButtonLabel.innerHTML = "Alle Blockieren";

    var viewport = isMobile() ? "mobile" : "desktop";
    var topbar = document.querySelector(topbarSelector[viewport]);

    if (!topbar) {
      return;
    }

    var lastChild = topbar.children[topbar.children.length - 1];
    var lastHasWrongType = lastChild.nodeName !== "DIV";
    var heading = lastChild.querySelector("div > h2 > span");
    var headingIsNotLikes = !heading.innerText.match(/(gefällt|like).*/gi);

    var isTopbarFalseHit =
      topbar.children.length !== 2 ||
      lastHasWrongType ||
      !heading ||
      headingIsNotLikes;

    if (isTopbarFalseHit) {
      return;
    }
    
    var tweetId = location.href.replace("https://twitter.com/muenchner661/status/", "").replace("/likes", "");

    topbar.appendChild(blockButton);

    // add blockIcon:
    var blockIconWrapper = document.createElement("span");
    blockIconWrapper.innerHTML = blockIcon;
    blockIconWrapper.style.marginRight = ".3em";
    blockButton.querySelector("div").prepend(blockIconWrapper);

    var highlightColor = getComputedStyle(topbar.querySelector("svg")).color;
    var backgroundColor = document.querySelector("body").style.backgroundColor;
    blockIconWrapper.querySelector("svg").style.color = highlightColor;

    blockButton.addEventListener("click", () => {
      var scrollList =
        topbar.parentNode.parentNode.parentNode.parentNode.children[1]
          .children[0];
      collectedUsers = [];

      // scroll down to get more users:
      var initBlocking = function(users, requestUrl, popup) {
        var confirmMessage = `<p>Willst du alle ${
            users.length
          } Nutzer blockieren? <br/>
          Evtl. musst du in deinem Browser Popups für twitter.com erlauben.</p>`;

        var confirmButton = blockButton.cloneNode(true);
        confirmButton.classList.add('lb-confirm-button');
        confirmButton.classList.remove('lb-block-button');
        confirmButton.querySelector("div > span").remove();
        confirmButton.querySelector("div > span > span").innerText = "OK";
        confirmButton.disabled = false;

        var checkbox = document.createElement("input");
        var label = document.createElement("label");

        var confirmMessageElement = popup.querySelector(".lb-label").cloneNode();
        confirmMessageElement.innerHTML = confirmMessage;
        popup.appendChild(confirmMessageElement);

        checkbox.type = "checkbox";
        checkbox.classList.add("lb-checkbox");
        confirmMessageElement.appendChild(label);
        label.innerHTML = "Auch alle Retweeter blockieren?";
        label.prepend(checkbox);
        confirmMessageElement.appendChild(confirmButton);

        confirmButton.addEventListener('click', () => {
          window.open(`${requestUrl}&rt=${checkbox.checked ? 1 : 0}`, "_blank");
          closePopup(popup, blockButton, scrollList);
        });
        setTimeout(() => {
          popup.classList.add('lb-confirm');
        }, 500);
      };

      var bioText = document.querySelector(
        "section > div > div > div > div > div > div > div > div:nth-child(2) > div:nth-child(2)"
      );
      var handleText = document.querySelector(
        "section > div > div > div > div > div > div > div > div:nth-child(2) > div >div >a > div > div > div"
      );
      var textStyle = (bioText || handleText).classList;
      var popup = document.createElement("div");
      popup.classList.add("lb-scrolling-info", "lb-popup", "lb-hide");
      popup.style.background = backgroundColor;
      popup.style.color = highlightColor;
      popup.innerHTML = `
        <span class='lb-label'>
          <h3>Sammle Nutzernamen ein...</h3>
          <p>Für besonders große Listen können aus technischen Gründen nicht alle Nutzernamen eingesammelt werden.</p>
        </span>
        <h1><span class='lb-loading'>...</span></h1>
      `;
      document.querySelector("body").appendChild(popup);
      blockButton.disabled = true;

      popup.querySelector(".lb-label").classList.add(...textStyle);
      popup.classList.remove("lb-hide");

      var closeButton = document.createElement("div");
      closeButton.role = "button";
      closeButton.innerHTML = "×";
      closeButton.classList.add("lb-close-button");
      closeButton.title = "Abbrechen";
      popup.prepend(closeButton);
      scrollList.classList.add("lb-blur");

      var scrollInterval;
      
      var stopScrolling = function () {
        clearInterval(scrollInterval);
      };

      var scrolly = isMobile() ? document.querySelector("html") : scrollList;
      scrollInterval = setInterval(() => {
        var scrollListIsSmall = scrolly.scrollHeight < scrolly.clientHeight * 2;
        var scrolledToBottom =
          scrolly.scrollTop >= scrolly.scrollHeight - scrolly.clientHeight;
        scrolly.scroll({
          top: scrolly.scrollTop + scrolly.clientHeight,
          left: 0,
          behavior: "smooth"
        });

        addUsers(scrapeUsernames(scrollList));

        var users = getUsers();
        var requestUrl = `${apiUrlBlock}?tweet_id=${tweetId}&users=${users}`;
        var reachedUrlLengthMax = requestUrl.length > urlLengthMax - 100;

        if (scrolledToBottom || scrollListIsSmall || reachedUrlLengthMax) {
          stopScrolling();
          initBlocking(users, requestUrl, popup);
        }
      }, 800); // FIXME: might be too long or too short. should rather scroll further on scrolled ready.

      closeButton.addEventListener("click", () => {
        closePopup(popup, blockButton, scrollList);
        stopScrolling();
      });
    });
  }, "[data-testid$=-follow]");
}

// for when we are on the likes page:
addBlockButton();

// For every other page: try it on click again:
document.querySelector("body").addEventListener("click", addBlockButton);
window.addEventListener("resize", addBlockButton);
