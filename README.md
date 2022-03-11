# Likers Blocker

![Logo](assets/icon128.png)

A browser extension to block all visible likers (and optionally all retweeters) of a tweet on Twitter.

![Preview](screenshots/preview2-medium.png)

Inspired by [Mario Sixtus (@sixtus)](https://twitter.com/sixtus):

> In Übrigen wünsche ich mir für solche Fälle ein Twitter-Add-On, das alle Liker eines bestimmten Tweets blockt, weil es nur Arschlöcher sein können. Wer programmiert es?
> – [10:41 am · 22 Feb. 2020](https://twitter.com/sixtus/status/1231152136857231360)

In collaboration with [@pkreissel](https://twitter.com/pkreissel), who wrote the back-end for this tool: [https://github.com/pkreissel/ichbinhier_twittertools](https://github.com/pkreissel/ichbinhier_twittertools).

## Installation

[<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/68px-Firefox_logo%2C_2019.svg.png" width="64" height="auto" alt="Firefox"> Install for Mozilla Firefox](https://addons.mozilla.org/firefox/addon/likers-blocker/)

[<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Chrome_icon_%28September_2014%29.svg/64px-Google_Chrome_icon_%28September_2014%29.svg.png" width="64" height="auto" alt="Chrome"> Install for Google Chrome](https://chrome.google.com/webstore/detail/melnbpmfhaejmcpfflfjmchondkpmkcj/)

[<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Opera_2015_icon.svg/150px-Opera_2015_icon.svg.png" width="64" height="auto" alt="Opera"> Install for Opera](https://addons.opera.com/de/extensions/details/likers-blocker/)

[<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Microsoft_Edge_logo_%282019%29.svg/96px-Microsoft_Edge_logo_%282019%29.svg.png" width="64" height="auto" alt="Edge">Install for Microsoft Edge](https://chrome.google.com/webstore/detail/melnbpmfhaejmcpfflfjmchondkpmkcj/) (You can install Chrome extensions in Edge, it's basically the same browser)

## Usage

### Block likers of a tweet

- Once you click on a tweet, there is a link which indicates how many people liked this tweet.
- Click on that link to get the list of all likers

  ![Screenshot](screenshots/likes.png)

- Then click on the new button on the top which says "Block all" / "Alle Blockieren".
  ![Screenshot](screenshots/block-all-button.png)
  ![Screenshot](screenshots/collecting-usernames.png)
- You can also chose to block all retweeters of the tweet (only direct retweeters without comment).
  ![Screenshot](screenshots/confirm.png)
- If you use it for the first time, you will have to authorize the app to access your twitter account.
- You get a list of all users that are about to be blocked.
- Confirm and wait for the sucess message.
- ✔ DONE. All the collected likers of the tweet are blocked. 😇

### Block all members of a list

- Click on a list of twitter users
- Click on the number of members
- Proceed with point three above ("Block all")

### Share your block list with others

Since Twitter has disabled its ability to import/export block lists, _LikersBlocker_ brings back the feature.

#### Export

- Go to "Settings and privacy" > "Content preferences" > "Blocked accounts" (Or just go to https://twitter.com/settings/blocked/all)
- Click on the share button above the list of blocked accounts
  ![Screenshot](screenshots/likers-blocker-share-block-list-btn.png)
- Wait a moment until all acocunts from your list are collected (make sure to leave the tab in the foreground to avoid stoping the automatic down scrolling)
- Copy and share the block links with other persons to share your block list with them.
  ![Screenshot](screenshots/likers-blocker-share-block-list.png)

#### Import

- When you receive a block link, just click on it or enter it into the address bar of your browser.
- If you use it for the first time, you will have to authorize the app to access your twitter account.
- You get a list of all users that are about to be blocked.
- Confirm and wait for the sucess message.
- ✔ DONE. All the collected likers of the tweet are blocked. 😇

## Known Issues and ToDos

If you find a bug or want to suggest new features, [file a new issue](https://github.com/dmstern/likers-blocker/issues/new).

## Contribution

Feel free to suggest improvements or to create pull requests!

To test the extension locally:

- Clone this repository

### Build

- Install Node.js 14.x

In the repository directory, run:

```bash
npm install
```

```bash
npm run build
```

### Run

#### Chrome

- Go to `chrome://extensions`
- Enable the developer mode with the regarding toggle button on the right side
- Click on "Load unpacked"
- Select the `dist` folder of the cloned repository

#### Firefox

- Go `about:debugging#/runtime/this-firefox`
- Click on `Load Temorary Add-On...`
- Select any file in the `dist` folder of the cloned repository

---

[![Creative Commons Licence Agreement](https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png)](http://creativecommons.org/licenses/by-nc-sa/4.0/)
All information on this site is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).

## Support

Glad that you appreciate our work! :)

We do this in our free time. This tool is and remains free for everyone and free from ads.
We would highly appreciate if you considered donating a little tip, rate this extension in your browser or tell others about it.

### Donate

- 💝 [paypal.me/dmstr](https://paypal.me/dmstr)
- 💝 [paypal.me/philipkreissel](https://paypal.me/philipkreissel)

### Rate

⭐⭐⭐⭐⭐ Rate this extension in the [Chrome Web Store](https://chrome.google.com/webstore/detail/melnbpmfhaejmcpfflfjmchondkpmkcj/), on [Firefox Add-Ons](https://addons.mozilla.org/firefox/addon/likers-blocker/), [Opera Add-Ons](https://addons.opera.com/de/extensions/details/likers-blocker/).

### Share

[🐦 💬 Tweet about this extension](<https://twitter.com/share?text=With the @LikersBlocker you can block people that like hate speech.&url=https://dmstern.github.io/likers-blocker&hashtags=LikersBlocker,sayNoToHateSpeech,ichbinhier>)

### Follow us on Twitter

💬 Don't miss version updates or bugfixes and join the conversation!

[![Likers Blocker](https://pbs.twimg.com/profile_images/1397331928928378880/3O3zY4bh_bigger.png)  @LikersBlocker](https://twitter.com/LikersBlocker)

[![Philip Kreißel](https://pbs.twimg.com/profile_images/1427346761291599879/XZ6AgKyH_bigger.jpg)  @pkreissel](https://twitter.com/pkreissel) (Backend)

[![Daniel Morgenstern](https://pbs.twimg.com/profile_images/1445063182721196040/xuuufhWo_bigger.jpg)  @d_mstern](https://twitter.com/d_mstern) (Frontend)
