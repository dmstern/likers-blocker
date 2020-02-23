# Likers Blocker

A Chrome extension to block all likers of a tweet.

Inspired by [Mario Sixtus (@sixtus)](https://twitter.com/sixtus):

> In Übrigen wünsche ich mir für solche Fälle ein Twitter-Add-On, das alle Liker eines bestimmten Tweets blockt, weil es nur Arschlöcher sein können. Wer programmiert es?
> – [10:41 am · 22 Feb. 2020](https://twitter.com/sixtus/status/1231152136857231360)

In collaboration with [@pkreissel](https://twitter.com/pkreissel), who wrote the back-end for this tool: https://github.com/pkreissel/ichbinhier_twittertools.

## Installation

* Go to the [releases](https://github.com/dmstern/likers-blocker/releases) tab and download the .crx file from the latest release.
* Open it in Chrome.
* Conform the installation.

## Usage

* Once you click on a tweet, there is a link which indicates how many people liked this tweet.
* click on that link to get the list of all likers
* then click on the new button on the top which says "Block all" / "Alle Blockieren".
* if you use it for the first time, you will have to authorize the app to access your twitter account.
* you get a list of all users that are about to be blocked.
* Confirm and wait for the sucess message.
* ✔ DONE. All the likers of the tweet are blocked. 😇

## Known Issues and to dos

see [Issues](https://github.com/dmstern/likers-blocker/issues)

## Contribution

Feel free to suggest improvements or to create pull requests!

### Development

To test the extension locally:

* clone this repository
* in Chrome, go to `chrome://extensions`
* enable the developer mode with the regarding toggle button on the right side
* click on "Load unpacked"
* Select the folder of the cloned repository
