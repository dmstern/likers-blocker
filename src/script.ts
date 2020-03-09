var blockIcon =
  '<svg viewBox="0 0 24 24" class="r-9ilb82 r-4qtqp9 r-yyyyoo r-1q142lx r-1xvli5t r-zso239 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 1.25C6.072 1.25 1.25 6.072 1.25 12S6.072 22.75 12 22.75 22.75 17.928 22.75 12 17.928 1.25 12 1.25zm0 1.5c2.28 0 4.368.834 5.982 2.207L4.957 17.982C3.584 16.368 2.75 14.282 2.75 12c0-5.1 4.15-9.25 9.25-9.25zm0 18.5c-2.28 0-4.368-.834-5.982-2.207L19.043 6.018c1.373 1.614 2.207 3.7 2.207 5.982 0 5.1-4.15 9.25-9.25 9.25z"></path></g></svg>';
var checkmarkIcon =
  '<?xml version="1.0" encoding="UTF-8"?><svg width="45.255mm" height="37.707mm" version="1.1" viewBox="0 0 45.255 37.707" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><metadata><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title/></cc:Work></rdf:RDF></metadata><g transform="translate(-54.843 -79.398)"><path d="m56.872 99.051 16.455 13.496 24.244-31.185"/></g></svg>';
var closeIcon =
  '<svg viewBox="0 0 24 24" class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z"></path></g></svg>';
var infoIcon =
  '<svg viewBox="0 0 24 24" class="r-daml9f r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 18.042c-.553 0-1-.447-1-1v-5.5c0-.553.447-1 1-1s1 .447 1 1v5.5c0 .553-.447 1-1 1z"></path><circle cx="12" cy="8.042" r="1.25"></circle><path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25s9.25-4.15 9.25-9.25S17.1 2.75 12 2.75z"></path></g></svg>';

var limitMessage = {
  largeList: `
    Für besonders große Like-Zahlen können aus technischen Gründen nicht alle Nutzernamen eingesammelt werden, sondern nur max. 80 aus dieser Liste.
    <span class="lb-info" title="Du kannst den Block-Vorgang nach dem Bestätigen einfach mehrfach wiederholen, um mehr Nutzer zu blockieren.">
      ${infoIcon}
    </span>`,
  smallList:
    "Wir können nur Liker aus dieser Liste blocken. <br> Evtl. werden einige von Twitter ausgeblendet."
};

var topbarSelector = {
  mobile: "main > div > div > div > div > div > div",
  desktop: "[aria-labelledby=modal-header] > div > div > div > div > div"
};

function debounce(func: Function, wait: number, immediate?: boolean) {
  var timeout: number;

  return function() {
    var context = this;
    var args = arguments;

    var later = function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

const API_URL_BLOCK: string =
  "https://ichbinhier-twittertools.herokuapp.com/blocklists";
const URL_LENGTH_MAX: number = 2000;
const LIKERS_LIMIT: number = 80;

class LikersBlocker {
  collectedUsers: string[];
  requestUrl: string;
  likesCount: number;
  backgroundColor: string;
  popup: HTMLElement;
  confirmMessage: string;
  confirmButton: HTMLLinkElement;
  popupWrapper: HTMLDivElement;
  checkbox: HTMLInputElement;
  confirmMessageElement: HTMLElement;
  blockButton: HTMLAnchorElement;
  scrollInterval: number;
  topbar: HTMLElement;

  static run(): void {
    // for when we are on the likes page:
    new LikersBlocker();

    // For every other page: try it on click again:
    document
      .querySelector("body")
      .addEventListener("click", () => new LikersBlocker());

    // Create a new one on resize due to changed viewport:
    window.addEventListener(
      "resize",
      debounce(() => new LikersBlocker(), 250)
    );
  }

  constructor() {
    this.collectedUsers = [];
    this.requestUrl = "";
    this.likesCount = 0;
    this.backgroundColor = "rgb(255, 255, 255)";
    this.confirmMessage = `
    <h3> Nutzer gefunden. Alle blockieren?</h3>
    <p>Evtl. musst du in deinem Browser Popups für twitter.com erlauben.</p>`;

    this.setUpLikesCounter();
    this.setUpBlockButton();
  }

  get scrollList() {
    return this.topbar.parentNode.parentNode.parentNode.parentNode.children[1]
      .children[0];
  }

  get highlightColor() {
    return getComputedStyle(this.topbar.querySelector("svg")).color;
  }

  get viewport() {
    return this.isMobile() ? "mobile" : "desktop";
  }

  get textStyle() {
    var bioText = document.querySelector(
      "[data-testid=UserCell] > div > div:nth-child(2) > div:nth-child(2)"
    );
    var nameText = document.querySelector(
      "[data-testid=UserCell] > div > div:nth-child(2) > div > div > a > div > div > div"
    );
    return Array.from((bioText || nameText).classList);
  }

  get scrolly() {
    return this.isMobile() ? document.querySelector("html") : this.scrollList;
  }

  async createBlockButton() {
    var followButton = await this.tryToAccessDOM("[data-testid$=-follow]");

    // prevent multiple blockButtons:
    if (document.querySelector("[data-testid=blockAll")) {
      return;
    }

    this.blockButton = document.createElement("a");
    this.blockButton.classList.add(
      "lb-block-button",
      ...followButton.classList
    );
    this.blockButton.dataset.testid = "blockAll";
    this.blockButton.innerHTML = followButton.innerHTML;

    var blockButtonLabel = this.blockButton.querySelector("div > span > span");
    blockButtonLabel.innerHTML = "Alle Blockieren";

    this.topbar.appendChild(this.blockButton);

    // add blockIcon:
    var blockIconWrapper = document.createElement("span");
    blockIconWrapper.innerHTML = blockIcon;
    blockIconWrapper.style.marginRight = ".3em";
    this.blockButton.querySelector("div").prepend(blockIconWrapper);

    this.backgroundColor = document.querySelector("body").style.backgroundColor;
    blockIconWrapper.querySelector("svg").style.color = this.highlightColor;

    this.blockButton.addEventListener("click", async () => {
      this.createPopup();
      this.createConfirmMessageElement();
      await this.createConfirmButton();
      this.createCheckbox();
      this.createCheckmark();
      this.createCloseButton();
      this.initBlockAction();
    });
  }

  createCloseButton() {
    var closeButton = document.createElement("button") as HTMLButtonElement;
    closeButton.innerHTML = closeIcon;
    closeButton.classList.add("lb-close-button");
    closeButton.title = "Abbrechen";
    closeButton.style.backgroundColor = this.highlightColor.replace(
      ")",
      ", 0.1)"
    );
    closeButton.style.color = this.highlightColor;
    this.popup.prepend(closeButton);
    closeButton.addEventListener("click", () => {
      this.closePopup();
      this.stopScrolling();
    });
  }

  createPopup() {
    this.popupWrapper = document.createElement("div");
    this.popupWrapper.classList.add("lb-popup-wrapper", "lb-hide");
    this.popup = document.createElement("div");
    this.popupWrapper.appendChild(this.popup);
    this.popup.classList.add("lb-popup");
    this.popup.style.background = this.backgroundColor;
    this.popup.style.color = this.highlightColor;
    var isListLarge = this.likesCount > LIKERS_LIMIT;

    this.popup.innerHTML = `
    <div class='lb-label lb-collecting'>
      <h3>Sammle Nutzernamen ein...</h3>
      <p class="lb-text">${
        limitMessage[isListLarge ? "largeList" : "smallList"]
      }
      </p>
      <h1><span class='lb-loading'>...</span></h1>
    </div>
  `;
    document.querySelector("body").appendChild(this.popupWrapper);

    setTimeout(() => {
      this.popupWrapper.classList.remove("lb-hide");
    }, 250);
  }

  createConfirmMessageElement() {
    this.confirmMessageElement = this.loadingInfo.cloneNode() as HTMLElement;
    this.confirmMessageElement.classList.add(...this.textStyle);
  }

  tryToAccessDOM = (elementToExpectSelector: string): Promise<HTMLElement> => {
    var elementToExpect = null;
    var tryCounter = 0;
    var tryMax = 10;
    var interval = undefined;

    return new Promise((resolve, reject) => {
      const tryIt = () => {
        tryCounter++;

        if (tryCounter >= tryMax || elementToExpect) {
          clearInterval(interval);
        }

        elementToExpect = document.querySelector(elementToExpectSelector);

        if (
          !elementToExpect ||
          elementToExpect.style.display === "none" ||
          elementToExpect.offsetParent === null
        ) {
          return;
        }

        clearInterval(interval);
        resolve(elementToExpect);
      };

      interval = setInterval(tryIt, 500);
    });
  };

  isMobile = (): boolean => {
    return document.documentElement.clientWidth < 699;
  };

  scrapeUsernames = (likersList): string[] => {
    var userCells = likersList.querySelectorAll(
      '[data-testid="UserCell"]'
    ) as HTMLCollection;
    var users: Element[] = Array.from(userCells);
    return users.map(user => {
      var userUrl = user.querySelector("a").href;
      return userUrl.replace("https://twitter.com/", "");
    });
  };

  addUsers = (users: string[]): void => {
    this.collectedUsers.push(...users);
  };

  getUsers = (): string[] => {
    return Array.from(new Set(this.collectedUsers));
  };

  closePopup = (): void => {
    this.popup.classList.add("lb-hide");
    this.popup.addEventListener("transitionend", () => {
      this.popup.remove();
    });

    this.popupWrapper.remove();
    this.scrollList.classList.remove("lb-blur");
  };

  setUpLikesCounter = async () => {
    var likesCountElement = await this.tryToAccessDOM(
      "a[href$=likes] > div > span > span"
    );
    var likesCountText = likesCountElement.textContent;
    var lastCharacter = likesCountText.slice(-1);

    var multiplyer = 1;
    if (lastCharacter === "K") {
      multiplyer = 1000;
    } else if (lastCharacter === "M") {
      multiplyer = 1000000;
    }

    this.likesCount =
      multiplyer === 1
        ? // german number format:
          parseInt(likesCountText.replace(".", ""))
        : // english number format:
          parseFloat(likesCountText) * multiplyer;
  };

  setUpBlockButton = async () => {
    this.topbar = await this.tryToAccessDOM(topbarSelector[this.viewport]);

    if (!this.topbar) {
      return;
    }

    var lastChild = this.topbar.children[this.topbar.children.length - 1];
    var lastHasWrongType = lastChild.nodeName !== "DIV";
    var heading = lastChild.querySelector("div > h2 > span");
    var headingIsNotLikes =
      !heading || !heading.textContent.match(/(gefällt|like).*/gi);

    var isTopbarFalseHit =
      this.topbar.children.length !== 2 ||
      lastHasWrongType ||
      !heading ||
      headingIsNotLikes;

    if (isTopbarFalseHit) {
      return;
    }

    await this.createBlockButton();
  };

  createCheckbox() {
    this.checkbox = document.createElement("input");
    var label = document.createElement("label");
    var labelWrapper = document.createElement("div");
    labelWrapper.classList.add("lb-label-wrapper");
    labelWrapper.appendChild(label);
    this.confirmMessageElement.classList.remove("lb-collecting");
    this.confirmMessageElement.classList.add("lb-confirm-message");
    this.confirmMessageElement.innerHTML = this.confirmMessage;
    this.popup.appendChild(this.confirmMessageElement);
    this.checkbox.type = "checkbox";
    this.checkbox.classList.add("lb-checkbox");
    this.confirmMessageElement.appendChild(labelWrapper);
    label.innerHTML = "<span>Auch alle Retweeter blockieren?</span>";
    var retweetersNotice = document.createElement("span");
    retweetersNotice.classList.add("lb-info");
    retweetersNotice.title = "Beinhaltet nur direkte Retweeter ohne Kommentar";
    retweetersNotice.innerHTML = infoIcon;
    label.prepend(this.checkbox);
    labelWrapper.appendChild(retweetersNotice);
    this.confirmMessageElement.appendChild(this.confirmButton);
  }

  createCheckmark() {
    var checkmark = document.createElement("span");
    checkmark.classList.add("lb-checkmark");
    this.loadingInfo.appendChild(checkmark);
    checkmark.style.background = this.highlightColor;
    checkmark.innerHTML = checkmarkIcon;
    this.checkbox.addEventListener("change", () => {
      var tweetParam = this.checkbox.checked ? `&tweet_id=${this.tweetId}` : "";
      this.confirmButton.href = `${this.requestUrl}${tweetParam}`;
    });
  }

  get tweetId() {
    return location.href
      .replace(/https:\/\/twitter.com\/.*\/status\//g, "")
      .replace("/likes", "");
  }

  get loadingInfo() {
    return this.popup.querySelector(".lb-label");
  }

  async createConfirmButton() {
    var blockButton = this.blockButton;
    this.confirmButton = blockButton.cloneNode(true) as HTMLLinkElement;
    this.confirmButton.classList.add("lb-confirm-button");
    this.confirmButton.classList.remove("lb-block-button");
    this.confirmButton.querySelector("div > span").remove();
    var confirmButtonLabel = this.confirmButton.querySelector(
      "div > span > span"
    ) as HTMLElement;
    confirmButtonLabel.innerText = "OK";
    this.confirmButton.target = "_blank";

    this.confirmButton.addEventListener("click", this.closePopup);
  }

  scrollDown = async () => {
    var scrollListIsSmall =
      this.scrolly.scrollHeight < this.scrolly.clientHeight * 2;
    var scrolledToBottom =
      this.scrolly.scrollTop >=
      this.scrolly.scrollHeight - this.scrolly.clientHeight;

    this.scrolly.scroll({
      top: this.scrolly.scrollTop + this.scrolly.clientHeight,
      left: 0,
      behavior: "smooth"
    });

    this.addUsers(this.scrapeUsernames(this.scrollList));

    var users = this.getUsers();
    this.requestUrl = `${API_URL_BLOCK}?users=${users}`;
    var reachedUrlLengthMax = this.requestUrl.length > URL_LENGTH_MAX - 100;
    this.confirmButton.href = this.requestUrl;

    if (scrolledToBottom || scrollListIsSmall || reachedUrlLengthMax) {
      var confirmHeading = this.popup.querySelector(".lb-confirm-message h3");
      confirmHeading.textContent = `${users.length} ${confirmHeading.textContent}`;
      this.stopScrolling();
      this.popup.classList.add("lb-check");
      var checkmark = this.popup.querySelector(".lb-checkmark");

      checkmark.addEventListener("transitionend", this.changeStateToConfirm);
    }
  };

  changeStateToConfirm = () => {
    var collectingMessage = this.popup.querySelector(
      ".lb-label.lb-collecting"
    ) as HTMLElement;
    collectingMessage.style.marginTop = `calc(-${collectingMessage.clientHeight}px - 1.5rem)`;
    this.popup.classList.add("lb-confirm");
    this.scrollList.classList.remove("lb-blur");
  };

  initBlockAction = async () => {
    let animationIterationCounter = 0;

    var loadingIndicator = this.popup.querySelector(
      ".lb-loading"
    ) as HTMLElement;
    loadingIndicator.style.color = this.highlightColor;

    this.popup.querySelector(".lb-label").classList.add(...this.textStyle);

    var loadingIndicator = this.popup.querySelector(
      ".lb-loading"
    ) as HTMLElement;

    const checkAnimationState = () => {
      animationIterationCounter++;

      // only continue when indicator is on the right side:
      if (
        animationIterationCounter % 2 != 0 &&
        this.popup.classList.contains("lb-check")
      ) {
        this.popup.classList.add("lb-collected");
      }
    };

    loadingIndicator.addEventListener(
      "animationiteration",
      checkAnimationState
    );

    this.shrinkPopupToVisibleContent();
    this.startScrolling();
  };

  shrinkPopupToVisibleContent() {
    var hiddenContentHeight = this.confirmMessageElement.clientHeight;
    this.popup.style.height = `${this.popup.clientHeight -
      hiddenContentHeight}px`;
  }

  startScrolling() {
    this.scrollList.classList.add("lb-blur");
    this.scrolly.scrollTo(0, 0);
    this.scrollInterval = setInterval(this.scrollDown, 800);
  }

  stopScrolling = () => {
    clearInterval(this.scrollInterval);
  };
}

LikersBlocker.run();
