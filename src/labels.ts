interface Labels {
  blockAll: string;
  blockRetweeters: string;
  cancel: string;
  collectingUsernames: string;
  copied: string;
  copyToShare: string;
  divided: string;
  export: string;
  likesHeading: string;
  ok: string;
  onlyDirectRetweeters: string;
  onlyListItems: string;
  repeatBlocking: string;
  takeAMoment: string;
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
      "Due to an URL length limit, the block list may be divided into several links.",
    takeAMoment:
      "Depending on the number of blocked accounts, this may take a while.",
    divided: "Divided into several links due to URL length limit."
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
      "Aufgrund einer URL-Längenbeschränkung wird die Block-Liste evtl. in mehrere Links aufgeteilt.",
    takeAMoment:
      "Abhängig von der Anzahl geblockter Accounts kann das eine Weile dauern.",
    divided: "In mehrere Links aufgeteilt, weil URL sonst zu lang."
  }
};

export { Labels, LABELS };
