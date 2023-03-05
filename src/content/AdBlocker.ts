import Storage from "../storage/Storage";
import { tryToAccessDOM } from "../util";

const sponsoredSVGPath =
	'svg path[d="M19.498 3h-15c-1.381 0-2.5 1.12-2.5 2.5v13c0 1.38 1.119 2.5 2.5 2.5h15c1.381 0 2.5-1.12 2.5-2.5v-13c0-1.38-1.119-2.5-2.5-2.5zm-3.502 12h-2v-3.59l-5.293 5.3-1.414-1.42L12.581 10H8.996V8h7v7z"]';
const debugging = false;

export default class AdBlocker {
	private static _scrollListener: () => void;
	private static isRunning: boolean;

	static start() {
		if (this.isRunning) {
			return;
		}

		console.info("starting AdBlocker...");

		this.findAds(false).then((adSVGPaths) => {
			this.removeAds(adSVGPaths);
		});

		this.findAds(true).then((adSVGPaths) => {
			this.removeAds(adSVGPaths);
		});

		window.addEventListener("scroll", this.scrollListener);
		this.isRunning = true;
	}

	static stop() {
		window.removeEventListener("scroll", this.scrollListener);
		this.isRunning = false;
		console.info("AdBlocker stopped.");
	}

	private static get scrollListener() {
		if (!this._scrollListener) {
			this._scrollListener = () => {
				this.findAds(false).then((svgPaths) => {
					this.removeAds(svgPaths);
				});
			};
		}

		return this._scrollListener;
	}

	private static async findAds(async: boolean): Promise<NodeListOf<Element>> {
		const adSVGPaths = async
			? ((await tryToAccessDOM(sponsoredSVGPath, true, null, null, 50)) as NodeListOf<Element>)
			: (document.querySelectorAll(sponsoredSVGPath) as NodeListOf<Element>);

		if (!adSVGPaths || adSVGPaths.length === 0) {
			return;
		}

		return adSVGPaths;
	}

	private static removeAds(adSVGPaths: NodeListOf<Element>) {
		if (!adSVGPaths || !adSVGPaths.length) {
			return;
		}

		const ads: Element[] = Array.from(adSVGPaths)
			.map(
				(path) =>
					path.closest('[data-testid="cellInnerDiv"]') || path.closest('[data-testid="UserCell"]')
			)
			.filter((ad) => ad);

		ads.forEach((ad) => {
			if (!(ad instanceof HTMLElement) || ad.style.getPropertyValue("--adBlocked")) {
				return;
			}

			console.info("removing ad...");
			ad.style.setProperty("--adBlocked", "true");

			if (debugging) {
				ad.style.border = "2px solid magenta";
			} else {
				ad.style.visibility = "hidden";
				ad.style.maxHeight = "0";
			}

			Storage.increaseBlockedAdsCount();
		});
	}
}
