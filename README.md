# Likers Blocker

![Logo](assets/icon128.png)

A browser extension to block likers, retweeters, list members and Twitter ads and share your block lists with others.

![Preview](screenshots/Ad-Preview/preview2-medium.png)

Inspired by [Mario Sixtus (@sixtus)](https://twitter.com/sixtus):

> In Übrigen wünsche ich mir für solche Fälle ein Twitter-Add-On, das alle Liker eines bestimmten Tweets blockt, weil es nur Arschlöcher sein können. Wer programmiert es?
> – [10:41 am · 22 Feb. 2020](https://twitter.com/sixtus/status/1231152136857231360)

![Screenshots with themes](screenshots/Ad-Preview/likers-blocker-themes-wide.png)

## Installation

[<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/68px-Firefox_logo%2C_2019.svg.png" width="64" height="auto" alt="Firefox"> Install for Mozilla Firefox](https://addons.mozilla.org/firefox/addon/likers-blocker/)

[<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Chrome_icon_%28September_2014%29.svg/64px-Google_Chrome_icon_%28September_2014%29.svg.png" width="64" height="auto" alt="Chrome"> Install for Google Chrome](https://chrome.google.com/webstore/detail/melnbpmfhaejmcpfflfjmchondkpmkcj/)

[<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Opera_2015_icon.svg/150px-Opera_2015_icon.svg.png" width="64" height="auto" alt="Opera"> Install for Opera](https://addons.opera.com/de/extensions/details/likers-blocker/)

[<img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Microsoft_Edge_logo_%282019%29.png" width="64" height="auto" alt="Edge">Install for Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/likers-blocker/fpcekgmidebefplhmglkndcbepplhkkb)

## Usage

---

⚠️ **IMPORTANT:** If you use Firefox, please right-click the extension icon, click "manage extension", go to "Permissions" and enable all permissions to make sure the extension works.

![Screenshot](screenshots/likers-blocker-permissions-0.png)
![Screenshot](screenshots/likers-blocker-permissions-1.png)

---


### Block likers or retweeters of a tweet

- Once you click on a tweet, there is a link which indicates how many people liked this tweet.
- Click on that link to get the list of all likers (or, to block the retweeters on the "retweeters" count)

  ![Screenshot](screenshots/likes.png)
  ![Screenshot](screenshots/retweets.png)

- Then click on the new button on the top which says "Block all", wait until Likers Blocker has collected all accounts (or skip if a smaller portion is fine for you ![Screenshot](screenshots/this-is-fine-crop.png)) and confirm to add the users to the blocking queue.
  ![Screenshot](screenshots/likers-blocker-collecting-and-confirm-animation.gif)
- ✔ DONE. LikersBlocker will process the blocking queue bit by bit in the background.
  You can find the status of the blocking queue by clicking on the extension icon in the upper right corner of your browser.
  ![Screenshot](screenshots/likers-blocker-block-animation.gif)

### Block all members or followers of a list

- Click on a list of twitter users
- Click on the number of members (or followers)
- Proceed with point three above ("Block all")

### Preferences

![Screenshot](screenshots/likers-blocker-options.gif)

### Import / Export

#### Only blocked by LikersBlocker

- Go to the extension options by clicking on the options button in the bottom right corner of the extension popup:

  ![Screenshot](screenshots/options-button.png)
- On the top of the options page you can find a file select button to import a CSV file and an export button to export your block list. This will download a CSV file with all accounts that were blocked by the extension.
![Screenshot](screenshots/import.png)

#### All blocked from Twitter settings

- _Alternatively_, you can "visually" collect all previously blocked accounts by clicking on the first link on the options page (which opens the [Twitter settings](https://twitter.com/settings/blocked/all)) and then on the share button.
  ![Screenshot](screenshots/likers-blocker-export-all.png)
- Wait a moment until all accounts from your list are collected (make sure to leave the tab in the foreground to avoid stopping the automatic down scrolling)
  ![Screenshot](screenshots/likers-blocker-export-collecting.png)
- After the collecting you can download the CSV file which includes all collected blocked accounts
  ![Screenshot](screenshots/likers-blocker-export-all-confirm.png)


## Found an error or want to suggest a feature?

If you find a bug or want to suggest new features, please [file a new issue](https://github.com/dmstern/likers-blocker/issues/new).

## Contribution

see [CONTRIBUTION.md](CONTRIBUTION.md).

## Support

Glad that you appreciate our work! 😃

We do this in our free time. This tool is and remains free for everyone and free from ads.
We would highly appreciate if you considered donating a little tip, rate this extension in your browser or tell others about it.

### Donate

- 💝 **[paypal.me/dmstr](https://paypal.me/dmstr)**
- 💝 **[paypal.me/philipkreissel](https://paypal.me/philipkreissel)**

### Rate

⭐⭐⭐⭐⭐ Rate this extension in the [Chrome Web Store](https://chrome.google.com/webstore/detail/melnbpmfhaejmcpfflfjmchondkpmkcj/), on [Firefox Add-Ons](https://addons.mozilla.org/firefox/addon/likers-blocker/), [Opera Add-Ons](https://addons.opera.com/de/extensions/details/likers-blocker/), [Edge Add-Ons](https://microsoftedge.microsoft.com/addons/detail/likers-blocker/fpcekgmidebefplhmglkndcbepplhkkb).

### Share

[🐦 Tweet about this extension](https://twitter.com/share?text=With%20the%20@LikersBlocker%20you%20can%20block%20people%20that%20like%20hate%20speech.&url=https://dmstern.github.io/likers-blocker&hashtags=LikersBlocker,sayNoToHateSpeech) and tell your friends!

### Follow us on Twitter

💬 Don't miss version updates or bugfixes and join the conversation!

[![Likers Blocker](https://pbs.twimg.com/profile_images/1397331928928378880/3O3zY4bh_bigger.png)  @LikersBlocker](https://twitter.com/LikersBlocker)

<a href="https://twitter.com/pkreissel"><img src="https://pbs.twimg.com/profile_images/1427346761291599879/XZ6AgKyH_bigger.jpg" alt="Daniel Morgenstern" style="border-radius:50%;"> @pkreissel</a>

<a href="https://twitter.com/d_mstern"><img src="https://pbs.twimg.com/profile_images/1584902128694329350/St36d5Jg_bigger.jpg" alt="Daniel Morgenstern" style="border-radius:50%;"> @d_mstern</a>

![ ](blank.png)

---

[![Creative Commons License Agreement](https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png)](http://creativecommons.org/licenses/by-nc-sa/4.0/)
All information on this site is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).

