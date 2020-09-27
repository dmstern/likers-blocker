const ICONS = {
  block:
    '<svg fill="currentColor" viewBox="0 0 24 24" class="r-9ilb82 r-4qtqp9 r-yyyyoo r-1q142lx r-1xvli5t r-zso239 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 1.25C6.072 1.25 1.25 6.072 1.25 12S6.072 22.75 12 22.75 22.75 17.928 22.75 12 17.928 1.25 12 1.25zm0 1.5c2.28 0 4.368.834 5.982 2.207L4.957 17.982C3.584 16.368 2.75 14.282 2.75 12c0-5.1 4.15-9.25 9.25-9.25zm0 18.5c-2.28 0-4.368-.834-5.982-2.207L19.043 6.018c1.373 1.614 2.207 3.7 2.207 5.982 0 5.1-4.15 9.25-9.25 9.25z"></path></g></svg>',
  checkmark:
    '<?xml version="1.0" encoding="UTF-8"?><svg fill="currentColor" width="45.255mm" height="37.707mm" version="1.1" viewBox="0 0 45.255 37.707" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><metadata><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title/></cc:Work></rdf:RDF></metadata><g transform="translate(-54.843 -79.398)"><path d="m56.872 99.051 16.455 13.496 24.244-31.185"/></g></svg>',
  close:
    '<svg fill="currentColor" viewBox="0 0 24 24" class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z"></path></g></svg>',
  info:
    '<svg viewBox="0 0 24 24" fill="currentColor" class="r-daml9f r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 18.042c-.553 0-1-.447-1-1v-5.5c0-.553.447-1 1-1s1 .447 1 1v5.5c0 .553-.447 1-1 1z"></path><circle cx="12" cy="8.042" r="1.25"></circle><path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25s9.25-4.15 9.25-9.25S17.1 2.75 12 2.75z"></path></g></svg>',
  share:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>',
  clipboardCopy:
    '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>',
  clipboardCheck:
    '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>'
};

const TOPBAR_SELECTOR = {
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

interface Labels {
  blockAll: string;
  blockRetweeters: string;
  cancel: string;
  collectingUsernames: string;
  copied: string;
  copyToShare: string;
  export: string;
  likesHeading: string;
  ok: string;
  onlyDirectRetweeters: string;
  onlyListItems: string;
  repeatBlocking: string;
  technicalConstraints: string;
  twitterHides: string;
  urlLimit: any;
  usersFound: string;
}

const LABELS: { [key: string]: Labels } = {
  en: {
    usersFound: "users found.",
    blockAll: "Block all",
    collectingUsernames: "Collecting usernames",
    cancel: "Cancel",
    technicalConstraints:
      "For large like amounts, not all usernames can be collected but only a maximum of 80 users from this list.",
    repeatBlocking:
      "You can repeat the block process after the confirmation to block more users.",
    twitterHides: "Some users may be hidden by Twitter.",
    onlyListItems: "We can only block users from this list",
    likesHeading: "like",
    blockRetweeters: "Also block retweeters?",
    onlyDirectRetweeters: "Only includes direct retweeters without a comment.",
    ok: "OK",
    export: "Export",
    copyToShare: "Copy to share block list.",
    copied:
      "Copied. Share the link with other persons to share your block list with them.",
    urlLimit:
      "Due to an URL length limit the block list may be divided into several links."
  },
  de: {
    usersFound: "Nutzer gefunden.",
    blockAll: "Alle Blockieren",
    collectingUsernames: "Sammle Nutzernamen ein",
    cancel: "Abbrechen",
    technicalConstraints:
      "Für besonders große Like-Zahlen können aus technischen Gründen nicht alle Nutzernamen eingesammelt werden, sondern nur max. 80 aus dieser Liste.",
    repeatBlocking:
      "Du kannst den Block-Vorgang nach dem Bestätigen einfach mehrfach wiederholen, um mehr Nutzer zu blockieren.",
    twitterHides: "Evtl. werden einige von Twitter ausgeblendet.",
    onlyListItems: "Wir können nur Liker aus dieser Liste blocken.",
    likesHeading: "gefällt",
    blockRetweeters: "Auch alle Retweeter blockieren?",
    onlyDirectRetweeters: "Beinhaltet nur direkte Retweeter ohne Kommentar",
    ok: "OK",
    export: "Exportieren",
    copyToShare: "Text kopieren um als Liste teilen.",
    copied:
      "Kopiert. Teile den Link aus der Zwischenablage mit anderen Personen, um deine Blockliste mit ihnen zu teilen.",
    urlLimit:
      "Aufgrund einer URL-Längenbeschränkung wird die Block-Liste evtl. in mehrere Links aufgeteilt."
  }
};

interface Window {
  likersBlocker: LikersBlocker;
}

let likersBlocker = window.likersBlocker;

class LikersBlocker {
  public static run(): void {
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

  private blockButton: HTMLAnchorElement;
  private checkbox: HTMLInputElement;
  private collectedUsers: string[];
  private confirmButton: HTMLLinkElement;
  private confirmMessageElement: HTMLElement;
  private i18n: Labels;
  private legacyTwitter: boolean;
  private likesCount: number;
  private popup: HTMLElement;
  private popupWrapper: HTMLElement;
  private requestUrl: string;
  private scrollInterval: number;
  private textarea: HTMLTextAreaElement;
  private topbar: HTMLElement;

  private constructor() {
    delete window.likersBlocker;

    this.collectedUsers = [];
    this.requestUrl = "";
    this.likesCount = 0;
    this.i18n = LABELS[this.lang];
    this.isLegacyTwitter = document.getElementById("page-outer") !== null;

    this.setUpLikesCounter();
    this.setUpBlockButton();
    this.setUpExportButton();

    window.likersBlocker = this;
  }

  public get isLegacyTwitter() {
    return this.legacyTwitter;
  }

  public set isLegacyTwitter(legacyTwitter) {
    if (legacyTwitter) {
      document.querySelector("body").classList.add("lb-legacy-twitter");
    }
    this.legacyTwitter = legacyTwitter;
  }

  public get isMobile(): boolean {
    return document.documentElement.clientWidth < 699;
  }

  public get lang() {
    const language = document.querySelector("html").lang;
    return language in LABELS ? language : "en";
  }

  public get tweetId() {
    return location.href
      .replace(/https:\/\/twitter.com\/.*\/status\//g, "")
      .replace("/likes", "");
  }

  public get viewport() {
    return this.isMobile ? "mobile" : "desktop";
  }

  private get backgroundColor() {
    return getComputedStyle(document.querySelector("body")).backgroundColor;
  }

  private get highlightColor() {
    if (!this.topbar) {
      return getComputedStyle(document.querySelector("[href='/compose/tweet']"))
        .backgroundColor;
    }

    return getComputedStyle(this.topbar.querySelector("svg")).color;
  }

  private get isBlockPage(): boolean {
    let isBlockPage = location.href.endsWith("blocked/all");
    document
      .querySelector("body")
      .classList[`${isBlockPage ? "add" : "remove"}`]("lb-block-page");
    return isBlockPage;
  }

  private get isListLarge() {
    return this.likesCount > LIKERS_LIMIT;
  }

  private get likesHeading() {
    if (this.lang in this.i18n) {
      return new RegExp(`${this.i18n.likesHeading}.*`, "ig");
    } else {
      return "";
    }
  }

  private get limitMessage() {
    if (this.isBlockPage) {
      return `${this.i18n.urlLimit}`;
    }
    if (this.isListLarge) {
      return `${this.i18n.technicalConstraints}
      <span class="lb-info" title="${this.i18n.repeatBlocking}">
        ${ICONS.info}
      </span>`;
    } else {
      return `${this.i18n.onlyListItems}<br>${this.i18n.twitterHides}`;
    }
  }

  private get loadingInfo() {
    return this.popup.querySelector(".lb-label");
  }

  private get popupContainer(): HTMLElement {
    const modalDialog = document.querySelector("[aria-modal=true]");
    return (modalDialog || document.querySelector("body")) as HTMLElement;
  }

  private get scrollList(): HTMLElement {
    let scrollList = this.isLegacyTwitter
      ? document.querySelector(".activity-popup-users")
      : this.topbar?.parentNode?.parentNode?.parentNode?.parentNode?.children[1]
          .children[0];

    if (!scrollList) {
      scrollList = document.querySelector("html");
    }

    return scrollList as HTMLElement;
  }

  private get scrolly() {
    return this.isMobile ? document.querySelector("html") : this.scrollList;
  }

  private get textStyle(): CSSStyleDeclaration {
    let textElement: HTMLElement;
    let style: any = {};
    let textElementStyle: CSSStyleDeclaration;

    if (this.isLegacyTwitter) {
      textElement = document.querySelector(".js-tweet-text");
    } else {
      var bioText: HTMLElement = document.querySelector(
        "[data-testid=UserCell] > div > div:nth-child(2) > div:nth-child(2)"
      );
      var nameText: HTMLElement = document.querySelector(
        "[data-testid=UserCell] > div > div:nth-child(2) > div > div > a > div > div > div"
      );
      textElement = bioText || nameText;
    }

    if (!textElement) {
      textElement = document.querySelector("span");
    }

    textElementStyle = getComputedStyle(textElement);
    style.color = textElementStyle.color;
    style.fontFamily = textElementStyle.fontFamily;
    style.fontStyle = textElementStyle.fontStyle;
    style.fontWeight = textElementStyle.fontWeight;

    return style;
  }

  private get users(): string[] {
    return Array.from(new Set(this.collectedUsers));
  }

  private changeStateToConfirm() {
    var collectingMessage = this.popup.querySelector(
      ".lb-label.lb-collecting"
    ) as HTMLElement;
    collectingMessage.style.marginTop = `calc(-${collectingMessage.clientHeight}px - 1rem)`;
    this.popup.classList.add("lb-confirm");
    this.scrollList.classList.remove("lb-blur");
  }

  private closePopup(): void {
    this.popup.classList.add("lb-hide");
    this.popup.addEventListener("transitionend", () => {
      this.popup.remove();
    });

    this.popupWrapper.remove();
    this.scrollList.classList.remove("lb-blur");

    // Reset focus on old twitter popup:
    setTimeout(() => {
      (this.popupContainer.querySelector(
        "[data-focusable='true']"
      ) as HTMLElement).focus();
    }, 0);
  }

  private collectUsers() {
    let userCells: NodeListOf<HTMLAnchorElement> = this.isLegacyTwitter
      ? this.scrollList.querySelectorAll("a.js-user-profile-link")
      : this.scrollList.querySelectorAll(
          '[data-testid="UserCell"] > div > div > div > div > a'
        );

    let users: HTMLAnchorElement[] = Array.from(userCells);

    for (let userLink of users) {
      let userUrl = userLink.href;

      this.collectedUsers.push(userUrl.replace("https://twitter.com/", ""));
    }
  }

  private async createBlockButton() {
    let followButton: HTMLElement = this.isLegacyTwitter
      ? await this.tryToAccessDOM("button.button-text.follow-text")
      : await this.tryToAccessDOM("[data-testid$=-follow]");

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
    this.blockButton.tabIndex = 0;
    this.blockButton.innerHTML = followButton.innerHTML;

    var blockButtonLabel = this.isLegacyTwitter
      ? this.blockButton
      : this.blockButton.querySelector("div > span > span");
    blockButtonLabel.innerHTML = this.i18n.blockAll;

    this.topbar.appendChild(this.blockButton);

    // add blockIcon:
    var blockIconWrapper = document.createElement("span");
    blockIconWrapper.innerHTML = ICONS.block;
    blockIconWrapper.style.marginRight = ".3em";
    var blockButtonWrapper = this.isLegacyTwitter
      ? this.blockButton
      : this.blockButton.querySelector("div");
    blockButtonWrapper.prepend(blockIconWrapper);

    blockIconWrapper.querySelector("svg").style.color = this.highlightColor;

    this.blockButton.addEventListener("click", () => {
      this.setUpBlockPopup();
    });

    this.blockButton.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        this.setUpBlockPopup();
      }
    });
  }

  private createCheckbox(): HTMLElement {
    this.checkbox = document.createElement("input");
    var label = document.createElement("label");
    var labelWrapper = document.createElement("div");
    labelWrapper.classList.add("lb-label-wrapper");
    labelWrapper.appendChild(label);
    this.checkbox.type = "checkbox";
    this.checkbox.classList.add("lb-checkbox");
    label.innerHTML = `<span>${this.i18n.blockRetweeters}</span>`;
    label.prepend(this.checkbox);
    var retweetersNotice = document.createElement("span");
    retweetersNotice.classList.add("lb-info");
    retweetersNotice.title = this.i18n.onlyDirectRetweeters;
    retweetersNotice.innerHTML = ICONS.info;
    labelWrapper.appendChild(retweetersNotice);
    return labelWrapper;
  }

  private createCheckmark() {
    var checkmark = document.createElement("span");
    checkmark.classList.add("lb-checkmark");
    this.loadingInfo.appendChild(checkmark);
    checkmark.style.background = this.highlightColor;
    checkmark.innerHTML = ICONS.checkmark;

    if (this.checkbox) {
      this.checkbox.addEventListener("change", () => {
        var tweetParam: string;
        if (this.checkbox.checked) {
          tweetParam = `&tweet_id=${this.tweetId}`;
        }

        if (this.confirmButton) {
          this.confirmButton.href = `${this.requestUrl}${tweetParam}`;
        }
      });
    }
  }

  private createCloseButton() {
    var closeButton = document.createElement("button") as HTMLButtonElement;
    closeButton.innerHTML = ICONS.close;
    closeButton.tabIndex = 0;
    closeButton.classList.add("lb-close-button");
    closeButton.title = this.i18n.cancel;
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

  private createConfirmButton() {
    if (this.isBlockPage) {
      let areaWrapper = document.createElement("div");
      let copyButton = document.createElement("button");

      copyButton.classList.add("lb-copy-button");
      copyButton.style.color = this.textStyle.color;
      copyButton.innerHTML = `${ICONS.clipboardCopy} <span>${this.i18n.copyToShare}</span>`;
      this.textarea = document.createElement("textarea");
      this.textarea.readOnly = true;
      this.textarea.classList.add("lb-textarea");

      areaWrapper.appendChild(copyButton);
      areaWrapper.appendChild(this.textarea);

      copyButton.addEventListener("click", () => {
        this.textarea.select();
        document.execCommand("copy");
        copyButton.innerHTML = `${ICONS.clipboardCheck} <span>${this.i18n.copied}</span>`;
        copyButton.style.color = "green";
      });

      return areaWrapper;
    } else {
      var blockButton = this.blockButton;
      this.confirmButton = blockButton.cloneNode(true) as HTMLLinkElement;
      this.confirmButton.classList.add("lb-confirm-button");
      this.confirmButton.classList.remove("lb-block-button");

      if (!this.isLegacyTwitter) {
        this.confirmButton.querySelector("div > span").remove();
      }

      var confirmButtonLabel = this.isLegacyTwitter
        ? this.confirmButton
        : (this.confirmButton.querySelector(
            "div > span > span"
          ) as HTMLElement);

      confirmButtonLabel.innerText = this.i18n.ok;
      this.confirmButton.target = "_blank";

      this.confirmButton.addEventListener("click", () => {
        this.closePopup();
      });

      return this.confirmButton;
    }
  }

  private createConfirmMessageElement() {
    this.confirmMessageElement = this.loadingInfo.cloneNode() as HTMLElement;
    Object.assign(this.confirmMessageElement.style, this.textStyle);
    this.confirmMessageElement.classList.remove("lb-collecting");
    this.confirmMessageElement.classList.add("lb-confirm-message");
    this.confirmMessageElement.innerHTML = `<h3> ${this.i18n.usersFound} ${
      this.isBlockPage ? "" : this.i18n.blockAll + "?"
    }</h3>`;
    this.popup.appendChild(this.confirmMessageElement);
  }

  private createPopup(content) {
    this.popupWrapper = document.createElement("div");
    this.popupContainer.appendChild(this.popupWrapper);
    this.popupWrapper.classList.add("lb-popup-wrapper", "lb-hide");
    this.popup = document.createElement("div");
    this.popupWrapper.appendChild(this.popup);
    this.popup.tabIndex = 0;
    this.popup.setAttribute("aria-modal", "true");
    this.popup.setAttribute("aria-labeledby", "lb-popup-heading");
    this.popup.dataset.focusable = "true";
    this.popup.classList.add("lb-popup");
    this.popup.style.top = `${this.scrollList.getBoundingClientRect().top +
      30}px`;
    this.popup.style.background = this.backgroundColor;
    this.popup.style.color = this.highlightColor;
    this.popup.innerHTML = content;

    setTimeout(() => {
      this.popup.focus();
    }, 0);

    setTimeout(() => {
      this.popupWrapper.classList.remove("lb-hide");
    }, 250);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.stopScrolling();
        this.closePopup();
      }

      // Circle focus in modal popup:
      setTimeout(() => {
        if (event.key === "Tab") {
          var focusIsInPopup = this.popup.matches(":focus-within");
          if (!focusIsInPopup) {
            this.popup.focus();
          }
        }
      }, 0);
    });
  }

  private async initBlockAction() {
    let animationIterationCounter = 0;

    var loadingIndicator = this.popup.querySelector(
      ".lb-loading"
    ) as HTMLElement;
    loadingIndicator.style.color = this.highlightColor;
    var popupLabel = this.popup.querySelector(".lb-label") as HTMLElement;
    Object.assign(popupLabel.style, this.textStyle);

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
  }

  private async scrollDown() {
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

    this.collectUsers();

    var reachedUrlLengthMax;

    if (!this.isBlockPage) {
      this.requestUrl = `${API_URL_BLOCK}?users=${this.users}`;
      reachedUrlLengthMax = this.requestUrl.length > URL_LENGTH_MAX - 100;
    }

    if (scrolledToBottom || scrollListIsSmall || reachedUrlLengthMax) {
      console.info("finished collecting!");

      if (this.isBlockPage) {
        this.requestUrl = `${API_URL_BLOCK}?users=${this.users}`;
      }

      if (this.confirmButton) {
        this.confirmButton.href = this.requestUrl;
      }

      if (this.textarea) {
        this.textarea.value = this.requestUrl;
      }

      if (this.isBlockPage && this.requestUrl.length > URL_LENGTH_MAX) {
        document.querySelector("body").classList.add("many");
        let requestCount = this.requestUrl.length / URL_LENGTH_MAX;
        let usersPerRequest = this.users.length / requestCount;

        for (let i = 0; i <= requestCount; i++) {
          let linkClone = this.textarea.parentNode.cloneNode(true);
          this.textarea.parentNode.parentNode.appendChild(linkClone);
          let textarea = linkClone.childNodes.item(1) as HTMLTextAreaElement;
          let copyButton = textarea.parentElement.querySelector("button");
          console.log({ copyButton });

          copyButton.addEventListener("click", () => {
            textarea.select();
            document.execCommand("copy");
            copyButton.innerHTML = `${ICONS.clipboardCheck} <span>${this.i18n.copied}</span>`;
            copyButton.style.color = "green";
          });

          let requestUrl = `${API_URL_BLOCK}?users=${this.users.slice(
            usersPerRequest * i,
            usersPerRequest * (i + 1)
          )}`;
          textarea.value = requestUrl;
        }
      }

      var confirmHeading = this.popup.querySelector(".lb-confirm-message h3");
      confirmHeading.textContent = `${this.users.length} ${confirmHeading.textContent}`;
      this.stopScrolling();
      this.popup.classList.add("lb-check");
      var checkmark = this.popup.querySelector(".lb-checkmark");

      checkmark.addEventListener("transitionend", () => {
        this.changeStateToConfirm();
      });
    }
  }

  private setUpBlockButton = async () => {
    let heading: HTMLElement;

    if (this.isLegacyTwitter) {
      heading = await this.tryToAccessDOM("#activity-popup-dialog-header");
      this.topbar = heading.parentElement;
      this.isLegacyTwitter = true;
    } else {
      this.topbar = await this.tryToAccessDOM(TOPBAR_SELECTOR[this.viewport]);
      var lastChild = this.topbar.children[this.topbar.children.length - 1];
      heading = lastChild.querySelector("div > h2 > span");
    }

    if (!this.topbar) {
      return;
    }

    var headingIsNotLikes =
      !heading || !heading.textContent.match(this.likesHeading);

    if (headingIsNotLikes) {
      return;
    }

    await this.createBlockButton();
  };

  private async setUpBlockPopup() {
    const popupInner = `
      <div class='lb-label lb-collecting'>
        <h3 id="lb-popup-heading">${this.i18n.collectingUsernames}...</h3>
        <p class="lb-text">${this.limitMessage}</p>
        <h1 class="lb-loading-wrapper"><span class='lb-loading'>...</span></h1>
      </div>`;

    this.createPopup(popupInner);
    this.createConfirmMessageElement();
    let confirmButton = this.createConfirmButton();

    if (!this.isBlockPage) {
      let checkbox = this.createCheckbox();
      this.confirmMessageElement.appendChild(checkbox);
    }

    this.confirmMessageElement.appendChild(confirmButton);

    this.createCheckmark();
    this.createCloseButton();
    this.initBlockAction();
  }

  private setUpExportButton = async () => {
    let isButtonAlreadyAdded = document.querySelector(".lb-btn--export");

    if (!this.isBlockPage) {
      return;
    }

    if (isButtonAlreadyAdded) {
      return;
    }

    let blockedListContainer = await this.tryToAccessDOM("section", true, 3);

    if (!blockedListContainer) {
      return;
    }

    let exportBtn = document.createElement("button");

    exportBtn.innerHTML = ICONS.share;
    exportBtn.setAttribute("aria-label", this.i18n.export);
    exportBtn.setAttribute("title", this.i18n.export);
    exportBtn.classList.add("lb-btn--export");
    exportBtn.style.backgroundColor = this.highlightColor;

    blockedListContainer.appendChild(exportBtn);

    exportBtn.addEventListener("click", () => {
      this.setUpBlockPopup();
    });
  };

  private setUpLikesCounter = async () => {
    var likesCountElement: HTMLElement;

    if (this.isLegacyTwitter) {
      const likesCounterLink = await this.tryToAccessDOM(
        "[data-tweet-stat-count].request-favorited-popup"
      );
      likesCounterLink.addEventListener("click", () => new LikersBlocker());
      likesCountElement = likesCounterLink.querySelector("strong");
    } else {
      likesCountElement = await this.tryToAccessDOM(
        "a[href$=likes] > div > span > span"
      );
    }

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

  private shrinkPopupToVisibleContent() {
    var hiddenContentHeight = this.confirmMessageElement.clientHeight;
    this.popup.style.height = `${this.popup.clientHeight -
      hiddenContentHeight}px`;
  }

  private startScrolling() {
    this.scrollList.classList.add("lb-blur");
    this.scrolly.scrollTo(0, 0);
    this.collectedUsers = [];
    this.scrollInterval = setInterval(() => {
      this.scrollDown();
    }, 800);
  }

  private stopScrolling = () => {
    clearInterval(this.scrollInterval);
  };

  private tryToAccessDOM(
    selector: string,
    multiple?: boolean,
    expectedCount?: number
  ): Promise<HTMLElement> {
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

        if (multiple) {
          let elements = document.querySelectorAll(selector);

          if (elements.length >= expectedCount) {
            elementToExpect = elements.item(elements.length - 1);
          }
        } else {
          elementToExpect = document.querySelector(selector);
        }

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
  }
}

LikersBlocker.run();
