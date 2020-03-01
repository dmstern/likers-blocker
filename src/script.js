var blockIcon =
  '<svg viewBox="0 0 24 24" class="r-9ilb82 r-4qtqp9 r-yyyyoo r-1q142lx r-1xvli5t r-zso239 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 1.25C6.072 1.25 1.25 6.072 1.25 12S6.072 22.75 12 22.75 22.75 17.928 22.75 12 17.928 1.25 12 1.25zm0 1.5c2.28 0 4.368.834 5.982 2.207L4.957 17.982C3.584 16.368 2.75 14.282 2.75 12c0-5.1 4.15-9.25 9.25-9.25zm0 18.5c-2.28 0-4.368-.834-5.982-2.207L19.043 6.018c1.373 1.614 2.207 3.7 2.207 5.982 0 5.1-4.15 9.25-9.25 9.25z"></path></g></svg>';
var checkmarkIcon = `<?xml version="1.0" encoding="UTF-8"?><svg width="45.255mm" height="37.707mm" version="1.1" viewBox="0 0 45.255 37.707" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><metadata><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title/></cc:Work></rdf:RDF></metadata><g transform="translate(-54.843 -79.398)"><path d="m56.872 99.051 16.455 13.496 24.244-31.185"/></g></svg>`;
var closeIcon =
  '<svg viewBox="0 0 24 24" class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z"></path></g></svg>';
var infoIcon =
  '<svg viewBox="0 0 24 24" class="r-daml9f r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 18.042c-.553 0-1-.447-1-1v-5.5c0-.553.447-1 1-1s1 .447 1 1v5.5c0 .553-.447 1-1 1z"></path><circle cx="12" cy="8.042" r="1.25"></circle><path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25s9.25-4.15 9.25-9.25S17.1 2.75 12 2.75z"></path></g></svg>';

var apiUrlBlock = "https://ichbinhier-twittertools.herokuapp.com/blocklists";
var urlLengthMax = 2000;
var collectedUsers = [];
var reactRoot;
var likesCount = 0;
var likersLimit = 80;

var limitMessage = {
  largeList:
    "Für besonders große Like-Zahlen können aus technischen Gründen nicht alle Nutzernamen eingesammelt werden, sondern nur max. 80 aus dieser Liste.",
  smallList:
    "Wir können nur Liker aus dieser Liste blocken. Evtl. werden einige von Twitter ausgeblendet."
};

var topbarSelector = {
  mobile: "main > div > div > div > div > div > div",
  desktop: "[aria-labelledby=modal-header] > div > div > div > div > div"
};

function getRoot() {
  if (!reactRoot) {
    reactRoot = document.querySelector("#react-root");
  }
  return reactRoot;
}

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

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

function closePopup(popup, scrollList) {
  popup.classList.add("lb-hide");
  popup.addEventListener("transitionend", () => {
    popup.remove();
  });

  scrollList.classList.remove("lb-blur");
}

function addBlockButton() {
  tryToAccessDOM(likesCountElement => {
    likesCount = likesCountElement.textContent;
  }, "a[href$=likes] > div > span > span");

  tryToAccessDOM(followButton => {
    // prevent multiple blockButtons:
    if (document.querySelector("[data-testid=blockAll")) {
      return;
    }

    var viewport = isMobile() ? "mobile" : "desktop";
    var topbar = document.querySelector(topbarSelector[viewport]);

    if (!topbar) {
      return;
    }

    var lastChild = topbar.children[topbar.children.length - 1];
    var lastHasWrongType = lastChild.nodeName !== "DIV";
    var heading = lastChild.querySelector("div > h2 > span");
    var headingIsNotLikes =
      !heading || !heading.innerText.match(/(gefällt|like).*/gi);

    var isTopbarFalseHit =
      topbar.children.length !== 2 ||
      lastHasWrongType ||
      !heading ||
      headingIsNotLikes;

    if (isTopbarFalseHit) {
      return;
    }

    var tweetId = location.href
      .replace(/https:\/\/twitter.com\/.*\/status\//g, "")
      .replace("/likes", "");

    var blockButton = document.createElement("a");
    blockButton.classList.add("lb-block-button", ...followButton.classList);
    blockButton.dataset.testid = "blockAll";
    blockButton.innerHTML = followButton.innerHTML;

    var blockButtonLabel = blockButton.querySelector("div > span > span");
    blockButtonLabel.innerHTML = "Alle Blockieren";

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

      var animationIterationCounter = 0;

      var bioText = document.querySelector(
        "[data-testid=UserCell] > div > div:nth-child(2) > div:nth-child(2)"
      );
      var nameText = document.querySelector(
        "[data-testid=UserCell] > div > div:nth-child(2) > div > div > a > div > div > div"
      );
      var textStyle = (bioText || nameText).classList;
      var popupWrapper = document.createElement("div");
      popupWrapper.classList.add("lb-popup-wrapper", "lb-hide");
      var popup = document.createElement("div");
      popupWrapper.appendChild(popup);
      popup.classList.add("lb-popup");
      popup.style.background = backgroundColor;
      popup.style.color = highlightColor;
      var isListLarge = likesCount > likersLimit;

      popup.innerHTML = `
        <div class='lb-label lb-collecting'>
          <h3>Sammle Nutzernamen ein...</h3>
          <p class="lb-text">${
            limitMessage[isListLarge ? "largeList" : "smallList"]
          }
            <span class="lb-info ${!isListLarge &&
              "lb-hide"}" title="Du kannst den Block-Vorgang nach dem Bestätigen einfach mehrfach wiederholen, um mehr Nutzer zu blockieren.">${infoIcon}</span>
          </p>
          <h1><span class='lb-loading'>...</span></h1>
        </div>
      `;
      document.querySelector("body").appendChild(popupWrapper);

      var loadingIndicator = popup.querySelector(".lb-loading");
      loadingIndicator.style.color = highlightColor;

      popup.querySelector(".lb-label").classList.add(...textStyle);

      setTimeout(() => {
        popupWrapper.classList.remove("lb-hide");
      }, 250);

      // add confirmMessage to dialog:
      var confirmMessage = `
      <h3> Nutzer gefunden. Alle blockieren?</h3>
      <p>Evtl. musst du in deinem Browser Popups für twitter.com erlauben.</p>`;

      var confirmButton = blockButton.cloneNode(true);
      confirmButton.classList.add("lb-confirm-button");
      confirmButton.classList.remove("lb-block-button");
      confirmButton.querySelector("div > span").remove();
      confirmButton.querySelector("div > span > span").innerText = "OK";
      confirmButton.target = "_blank";

      var checkbox = document.createElement("input");
      var label = document.createElement("label");
      var labelWrapper = document.createElement("div");
      labelWrapper.classList.add("lb-label-wrapper");
      labelWrapper.appendChild(label);

      var loadingInfo = popup.querySelector(".lb-label");
      var confirmMessageElement = loadingInfo.cloneNode();
      confirmMessageElement.classList.remove("lb-collecting");
      confirmMessageElement.classList.add("lb-confirm-message");
      confirmMessageElement.innerHTML = confirmMessage;
      popup.appendChild(confirmMessageElement);

      checkbox.type = "checkbox";
      checkbox.classList.add("lb-checkbox");
      confirmMessageElement.appendChild(labelWrapper);
      label.innerHTML = "<span>Auch alle Retweeter blockieren?</span>";
      retweetersNotice = document.createElement("span");
      retweetersNotice.classList.add("lb-info");
      retweetersNotice.title =
        "Beinhaltet nur direkte Retweeter ohne Kommentar";
      retweetersNotice.innerHTML = infoIcon;

      label.prepend(checkbox);
      labelWrapper.appendChild(retweetersNotice);
      confirmMessageElement.appendChild(confirmButton);

      var checkmark = document.createElement("span");
      checkmark.classList.add("lb-checkmark");
      loadingInfo.appendChild(checkmark);
      checkmark.style.background = highlightColor;
      checkmark.innerHTML = checkmarkIcon;
      checkbox.addEventListener("change", () => {
        var tweetParam = checkbox.checked ? `&tweet_id=${tweetId}` : "";
        var requestUrl = confirmButton.href;
        confirmButton.href = `${requestUrl}${tweetParam}`;
      });

      confirmButton.addEventListener("click", () => {
        closePopup(popupWrapper, scrollList);
      });

      var loadingIndicator = popup.querySelector(".lb-loading");
      loadingIndicator.addEventListener("animationiteration", () => {
        animationIterationCounter++;

        // only continue when indicator is on the right side:
        if (
          animationIterationCounter % 2 != 0 &&
          popup.classList.contains("lb-check")
        ) {
          popup.classList.add("lb-collected");
        }
      });

      // add closeButton:
      var closeButton = document.createElement("div");
      closeButton.role = "button";
      closeButton.innerHTML = closeIcon;
      closeButton.classList.add("lb-close-button");
      closeButton.title = "Abbrechen";
      closeButton.style.backgroundColor = highlightColor.replace(")", ", 0.1)");
      closeButton.style.color = highlightColor;
      popup.prepend(closeButton);
      scrollList.classList.add("lb-blur");

      // shrink popup to visible content:
      var hiddenContentHeight = confirmMessageElement.clientHeight;
      popup.style.height = `${popup.clientHeight - hiddenContentHeight}px`;

      var scrollInterval;

      var stopScrolling = function() {
        clearInterval(scrollInterval);
      };

      var scrolly = isMobile() ? document.querySelector("html") : scrollList;
      scrolly.scrollTo(0, 0);

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
        var requestUrl = `${apiUrlBlock}?users=${users}`;
        var reachedUrlLengthMax = requestUrl.length > urlLengthMax - 100;
        confirmButton.href = requestUrl;

        if (scrolledToBottom || scrollListIsSmall || reachedUrlLengthMax) {
          var confirmHeading = popup.querySelector(".lb-confirm-message h3");
          confirmHeading.textContent = `${users.length} ${confirmHeading.textContent}`;
          stopScrolling();
          popup.classList.add("lb-check");
          var checkmark = popup.querySelector(".lb-checkmark");

          checkmark.addEventListener("transitionend", () => {
            var collectingMessage = popup.querySelector(
              ".lb-label.lb-collecting"
            );
            collectingMessage.style.marginTop = `calc(-${collectingMessage.clientHeight}px - 1.5rem)`;
            popup.classList.add("lb-confirm");
            scrollList.classList.remove("lb-blur");
          });
        }
      }, 800);

      closeButton.addEventListener("click", () => {
        closePopup(popupWrapper, scrollList);
        stopScrolling();
      });
    });
  }, "[data-testid$=-follow]");
}

// for when we are on the likes page:
addBlockButton();

// For every other page: try it on click again:
document.querySelector("body").addEventListener("click", addBlockButton);
window.addEventListener("resize", debounce(addBlockButton, 250));
