!(function () {
	"use strict";
	/*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */ function t(
		t,
		e,
		i,
		s
	) {
		return new (i || (i = Promise))(function (o, n) {
			function l(t) {
				try {
					a(s.next(t));
				} catch (t) {
					n(t);
				}
			}
			function r(t) {
				try {
					a(s.throw(t));
				} catch (t) {
					n(t);
				}
			}
			function a(t) {
				var e;
				t.done
					? o(t.value)
					: ((e = t.value),
					  e instanceof i
							? e
							: new i(function (t) {
									t(e);
							  })).then(l, r);
			}
			a((s = s.apply(t, e || [])).next());
		});
	}
	function e(t, e, i, s) {
		let o,
			n = null,
			l = 0;
		return new Promise((r, a) => {
			o = setInterval(function () {
				if ((l++, l >= 10 && (clearInterval(o), r(null)), e)) {
					let e = s ? s.querySelectorAll(t) : document.querySelectorAll(t);
					e.length >= i && (n = e.item(e.length - 1));
				} else n = s ? s.querySelector(t) : document.querySelector(t);
				n && "none" !== n.style.display && null !== n.offsetParent && (clearInterval(o), r(n));
			}, 500);
		});
	}
	var i,
		s =
			'<svg fill="currentColor" width="24" height="24" aria-hidden="true" viewBox="0 0 24 24" class="r-9ilb82 r-4qtqp9 r-yyyyoo r-1q142lx r-1xvli5t r-zso239 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 1.25C6.072 1.25 1.25 6.072 1.25 12S6.072 22.75 12 22.75 22.75 17.928 22.75 12 17.928 1.25 12 1.25zm0 1.5c2.28 0 4.368.834 5.982 2.207L4.957 17.982C3.584 16.368 2.75 14.282 2.75 12c0-5.1 4.15-9.25 9.25-9.25zm0 18.5c-2.28 0-4.368-.834-5.982-2.207L19.043 6.018c1.373 1.614 2.207 3.7 2.207 5.982 0 5.1-4.15 9.25-9.25 9.25z"></path></g></svg>',
		o =
			'<svg class="lb-checkmark w-6 h-6" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>',
		n =
			'<svg class="w-6 h-6" width="24" height="24" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>',
		l =
			'<svg fill="currentColor" width="24" height="24" aria-hidden="true"  viewBox="0 0 24 24" class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z"></path></g></svg>',
		r =
			'<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"  fill="currentColor" class="r-daml9f r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"><g><path d="M12 18.042c-.553 0-1-.447-1-1v-5.5c0-.553.447-1 1-1s1 .447 1 1v5.5c0 .553-.447 1-1 1z"></path><circle cx="12" cy="8.042" r="1.25"></circle><path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20C6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25s9.25-4.15 9.25-9.25S17.1 2.75 12 2.75z"></path></g></svg>',
		a =
			'<svg fill="none" width="24" height="24" aria-hidden="true"  stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>',
		c =
			'<svg class="w-6 h-6" width="24" height="24" aria-hidden="true"  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>',
		d =
			'<svg class="w-6 h-6" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>',
		h =
			'<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"  class="w-6 h-6" fill="currentColor"><g><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path></g></svg>',
		u =
			'<svg class="w-6 h-6" width="24" height="24" aria-hidden="true"  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
		p =
			'<svg class="w-6 h-6" width="24" height="24" aria-hidden="true"  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>',
		g =
			'<svg class="w-6 h-6" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"></path></svg>',
		b =
			'<svg class="w-6 h-6" width="24" height="24" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
		m =
			'<svg class="w-6 h-6" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
		v =
			'<svg width="16" height="16" fill="currentColor" class="bi bi-stars" viewBox="0 0 16 16"><path d="M6.66,6.25a.36.36,0,0,1,.68,0L8,8.18A2.88,2.88,0,0,0,9.82,10l1.93.65a.36.36,0,0,1,0,.68L9.82,12A2.85,2.85,0,0,0,8,13.82l-.65,1.93a.35.35,0,0,1-.45.23.33.33,0,0,1-.23-.23L6,13.81A2.84,2.84,0,0,0,4.18,12l-1.93-.65A.35.35,0,0,1,2,10.89a.33.33,0,0,1,.23-.23L4.18,10A2.85,2.85,0,0,0,6,8.18Z"/><path d="M2.79,1.15A.22.22,0,0,1,3.07,1a.22.22,0,0,1,.14.14l.38,1.16a1.77,1.77,0,0,0,1.1,1.1l1.16.38A.22.22,0,0,1,6,4.07a.2.2,0,0,1-.14.13l-1.16.39a1.74,1.74,0,0,0-1.1,1.1L3.21,6.85A.22.22,0,0,1,2.93,7a.24.24,0,0,1-.14-.14L2.41,5.69a1.72,1.72,0,0,0-1.1-1.1L.15,4.2A.21.21,0,0,1,0,3.93a.22.22,0,0,1,.14-.14l1.16-.38a1.74,1.74,0,0,0,1.1-1.1Z"/><path d="M9.86.1A.14.14,0,0,1,10.05,0a.16.16,0,0,1,.09.09l.26.77a1.11,1.11,0,0,0,.73.73l.77.26a.14.14,0,0,1,.09.19.16.16,0,0,1-.09.09l-.77.25a1.15,1.15,0,0,0-.73.74l-.26.77A.14.14,0,0,1,10,4a.2.2,0,0,1-.09-.09l-.25-.77a1.18,1.18,0,0,0-.74-.74L8.1,2.14A.16.16,0,0,1,8,2a.2.2,0,0,1,.09-.09l.77-.26A1.15,1.15,0,0,0,9.61.87L9.86.1Z"/></svg>',
		w = "https://ichbinhier-twittertools.herokuapp.com/blocklists",
		f = 2048,
		y = 200,
		k = 1600,
		L = 2;
	class S {
		constructor(t) {
			(this.color = t.color),
				(this.fontFamily = t.fontFamily),
				(this.fontStyle = t.fontStyle),
				(this.fontWeight = t.fontWeight);
		}
	}
	class C {
		static get backgroundColor() {
			return getComputedStyle(document.querySelector("body")).backgroundColor;
		}
		static get twitterBrandColor() {
			return window.getComputedStyle(document.querySelector("a[href='/home'] svg")).color;
		}
		static get highlightColor() {
			return getComputedStyle(document.querySelector("a[href='/compose/tweet']")).backgroundColor;
		}
		static get popupContainer() {
			return document.querySelector("[aria-modal=true]") || document.querySelector("body");
		}
		static get isMobile() {
			return document.documentElement.clientWidth < 699;
		}
		static get viewport() {
			return this.isMobile ? "mobile" : "desktop";
		}
		static getTextStyle(t) {
			let e, i, s;
			if (t) e = document.querySelector(".js-tweet-text");
			else {
				const t = document.querySelector(
						"[data-testid=UserCell] > div > div:nth-child(2) > div:nth-child(2)"
					),
					i = document.querySelector(
						"[data-testid=UserCell] > div > div:nth-child(2) > div > div > a > div > div > div"
					);
				e = t || i;
			}
			return e || (e = document.querySelector("span")), (s = getComputedStyle(e)), (i = new S(s)), i;
		}
		static isTweetPage() {
			return new Promise((t) => {
				setTimeout(() => {
					t(location.pathname.includes("status") && location.pathname.endsWith("likes"));
				}, 1);
			});
		}
		static isBlockPage() {
			return t(this, void 0, void 0, function* () {
				return new Promise((t) => {
					setTimeout(() => {
						let e =
							location.href.endsWith("blocked/all") ||
							location.href.endsWith("settings/content_preferences") ||
							location.href.endsWith("settings/mute_and_block");
						document.querySelector("body").classList["" + (e ? "add" : "remove")]("lb-block-page"),
							t(e);
					}, 1);
				});
			});
		}
		static isListPage() {
			return t(this, void 0, void 0, function* () {
				return new Promise((t) => {
					setTimeout(() => {
						const e = location.href.split("/"),
							s = e[e.length - 1];
						return (
							location.href.includes("list") &&
								(location.href.endsWith(i.followers) || location.href.endsWith(i.members)) &&
								t(i[s]),
							t(!1)
						);
					}, 1);
				});
			});
		}
	}
	!(function (t) {
		(t.members = "members"), (t.followers = "followers");
	})(i || (i = {}));
	const _ = "undefined" == typeof browser ? chrome : browser,
		B = new Date(),
		M = {
			retweeters: "lb.include-retweeters",
			hideBadgeShare: `lb.${_.runtime.getManifest().version}.hide-badge.share`,
			hideBadgeDonate: `lb.${_.runtime.getManifest().version}.hide-badge.donate`,
			hideBadgeFollow: `lb.${_.runtime.getManifest().version}.hide-badge.follow`,
			hideIdleWarning: `lb.${_.runtime.getManifest().version}.hide-idle-warning`,
			packageVersion: "lb.packageVersion",
			installedNewReleaseDate: "lb.installedNewReleaseDate",
		},
		x = { hide: "true", today: parseInt(`${B.getFullYear()}${B.getMonth()}${B.getDate()}`) };
	class T {
		static get packageVersion() {
			return localStorage.getItem(M.packageVersion);
		}
		static get includeRetweeters() {
			return localStorage.getItem(M.retweeters) === x.hide;
		}
		static set includeRetweeters(t) {
			localStorage.setItem(M.retweeters, String(t));
		}
		static get hideBadgeShare() {
			return localStorage.getItem(M.hideBadgeShare) === x.hide;
		}
		static set hideBadgeShare(t) {
			localStorage.setItem(M.hideBadgeShare, String(t));
		}
		static get hideBadgeDonate() {
			return localStorage.getItem(M.hideBadgeDonate) === x.hide;
		}
		static set hideBadgeDonate(t) {
			localStorage.setItem(M.hideBadgeDonate, String(t));
		}
		static get hideBadgeFollow() {
			return localStorage.getItem(M.hideBadgeFollow) === x.hide;
		}
		static set hideBadgeFollow(t) {
			localStorage.setItem(M.hideBadgeFollow, String(t));
		}
		static get hideIdleWarning() {
			return localStorage.getItem(M.hideIdleWarning) === x.hide;
		}
		static set hideIdleWarning(t) {
			localStorage.setItem(M.hideIdleWarning, String(t));
		}
		static get installedNewReleaseDate() {
			const t = parseInt(localStorage.getItem(M.installedNewReleaseDate));
			return Number.isNaN(t) ? x.today : t;
		}
		static set installedNewReleaseDate(t) {
			localStorage.setItem(M.installedNewReleaseDate, String(t));
		}
		static get isNewRelease() {
			return x.today < T.installedNewReleaseDate + 3;
		}
		static storePackageVersion() {
			T.packageVersion !== _.runtime.getManifest().version &&
				((T.installedNewReleaseDate = x.today),
				localStorage.setItem(M.packageVersion, _.runtime.getManifest().version));
		}
	}
	const q = "undefined" == typeof browser ? chrome : browser,
		E = {
			mobile: "main > div > div > div > div > div > div",
			desktop: "[aria-labelledby=modal-header] > div > div > div > div > div > div > div > div > div",
		};
	class $ {
		constructor() {
			(this.isListLarge = () =>
				t(this, void 0, void 0, function* () {
					return (yield this.getTotalUsersCount()) > y;
				})),
				(this.handleKeydown = (e) =>
					t(this, void 0, void 0, function* () {
						"Escape" === e.key && (this.stopScrolling(), yield this.closePopup());
						window.setTimeout(() => {
							const t = this.popup.matches(":focus-within");
							"Tab" !== e.key || t || this.popup.focus();
						}, 0);
					})),
				(this.stopScrolling = () => {
					console.debug("stopScrolling()"), clearInterval(this.scrollInterval);
				}),
				(this.collectedUsers = []),
				(this.requestUrl = ""),
				(this.progressInPercent = 0),
				(this.uiIdleCounter = 0),
				(this.lastCollectedUserCount = []),
				(this.isLegacyTwitter = null !== document.getElementById("page-outer")),
				this.setUpBlockButton().then(),
				this.setUpExportButton().then(),
				T.storePackageVersion();
		}
		get isLegacyTwitter() {
			return this.legacyTwitter;
		}
		set isLegacyTwitter(t) {
			t && document.querySelector("body").classList.add("lb-legacy-twitter"), (this.legacyTwitter = t);
		}
		get tweetId() {
			return location.href.replace(/https:\/\/twitter.com\/.*\/status\//g, "").replace("/likes", "");
		}
		get loadingInfo() {
			return this.popup.querySelector(".lb-label");
		}
		get scrolly() {
			return C.isMobile ? new Promise((t) => t(document.querySelector("html"))) : this.getScrollList();
		}
		get textStyle() {
			return C.getTextStyle(this.isLegacyTwitter);
		}
		get users() {
			return Array.from(new Set(this.collectedUsers));
		}
		get hasStateChangedToConfirm() {
			return Array.from(this.popup.classList).some((t) => "lb-confirm" === t);
		}
		static run() {
			new $(),
				document.querySelector("body").addEventListener("click", () => new $()),
				window.addEventListener(
					"resize",
					(function (t, e, i) {
						let s;
						return function (...o) {
							let n = this,
								l = i && !s;
							clearTimeout(s),
								(s = window.setTimeout(function () {
									(s = null), i || t.apply(n, o);
								}, e)),
								l && t.apply(n, o);
						};
					})(() => new $(), 250)
				);
		}
		static getBadgeClass(t) {
			const e = { follow: T.hideBadgeFollow, share: T.hideBadgeShare, donate: T.hideBadgeDonate };
			if (Object.values(e).every((t) => t)) return;
			return t === Object.entries(e).find(([, t]) => !t)[0] ? "lb-footer__link--show-badge" : "";
		}
		getTotalUsersCount() {
			return t(this, void 0, void 0, function* () {
				function t(t) {
					const e = t.textContent.split("");
					return parseInt(e.filter((t) => !isNaN(Number(t))).join(""));
				}
				if (yield C.isBlockPage()) return -1;
				if (this.isLegacyTwitter) {
					const i = yield e("[data-tweet-stat-count].request-favorited-popup");
					return i.addEventListener("click", () => new $()), t(i.querySelector("strong"));
				}
				const i = yield C.isListPage();
				if (i) return t(yield e(`a[href$="${i}"] span span`));
				const s = yield e("a[href$=likes] > div > span > span");
				return s ? t(s) : -1;
			});
		}
		addIncludeRetweetersParam(t) {
			T.includeRetweeters = t;
			const e = Array.from(document.querySelectorAll(".lb-confirm-button")).map((t) => t),
				i = Array.from(document.querySelectorAll(".lb-textarea")).map((t) => t),
				s = e.every((t) => t.href.includes("tweet_id="));
			if (t === s) return;
			const o = (t) => `${s ? t.split("&")[0] : t}${s ? "" : `&tweet_id=${this.tweetId}`}`;
			e.forEach((t) => (t.href = o(t.href))), i.forEach((t) => (t.value = o(t.value)));
		}
		getLimitMessage() {
			return t(this, void 0, void 0, function* () {
				return (yield C.isBlockPage()) || this.isListLarge
					? `${q.i18n.getMessage("ui_takeAMoment")} ${q.i18n.getMessage("ui_urlLimit")}`
					: `${q.i18n.getMessage("ui_onlyListItems")}<br>${q.i18n.getMessage("ui_twitterHides")}`;
			});
		}
		getScrollableParent(t) {
			const e = t.parentElement;
			if (!e) return t;
			return "auto" === getComputedStyle(e).overflow ? e : this.getScrollableParent(e);
		}
		getScrollList() {
			return t(this, void 0, void 0, function* () {
				let t,
					e = document.querySelector("html");
				if (yield C.isBlockPage()) t = e;
				else {
					let e = this.getScrollableParent(yield this.getTopbar());
					t = this.isLegacyTwitter ? document.querySelector(".activity-popup-users") : e;
				}
				return t || (t = e), t;
			});
		}
		changeStateToConfirm() {
			return t(this, void 0, void 0, function* () {
				console.debug("changeStateToConfirm()"),
					this.popup.classList.add("lb-confirm"),
					(yield this.getScrollList()).classList.remove("lb-blur");
			});
		}
		closePopup() {
			return t(this, void 0, void 0, function* () {
				this.popup.classList.add("lb-hide"),
					this.popup.addEventListener("transitionend", () => {
						this.popup.remove();
					}),
					this.popupWrapper.remove(),
					(yield this.getScrollList()).classList.remove("lb-blur"),
					window.setTimeout(() => {
						const t = C.popupContainer.querySelector("[aria-modal='true']");
						t && t.focus();
					}, 0);
			});
		}
		collectUsers() {
			return t(this, void 0, void 0, function* () {
				const t = this.isLegacyTwitter
						? (yield this.getScrollList()).querySelectorAll("a.js-user-profile-link")
						: (yield this.getScrollList()).querySelectorAll(
								'[data-testid="UserCell"] a[aria-hidden="true"]'
						  ),
					e = L + Math.floor(this.users.length / 500),
					i = yield this.getTotalUsersCount(),
					s = i < 100 ? 70 : i < 200 ? 80 : 90;
				let o = Array.from(t);
				for (let t of o) {
					const e = t.href.replace("https://twitter.com/", "");
					this.collectedUsers.push(e);
				}
				let n = document.querySelector(".lb-user-counter");
				n && (n.innerText = `${this.users.length}`);
				const l = this.lastCollectedUserCount.at(-1) === this.lastCollectedUserCount.at(-2);
				if (
					(l || (this.uiIdleCounter = 0),
					document.hasFocus() &&
						l &&
						(this.uiIdleCounter++,
						this.uiIdleCounter > e && this.progressInPercent < s && this.createIdleWarning()),
					i > 0)
				) {
					this.progressInPercent = Math.ceil((this.users.length / i) * 100);
					const t = document.querySelector(".lb-progress-bar__label"),
						e = document.querySelector(".lb-progress-bar__inner");
					t && (t.innerHTML = `${this.progressInPercent}%`),
						e && (e.style.width = `${this.progressInPercent}%`);
				}
				this.lastCollectedUserCount.push(this.users.length);
			});
		}
		createBlockButton() {
			return t(this, void 0, void 0, function* () {
				let t = this.isLegacyTwitter
					? yield e("button.button-text.follow-text")
					: yield e("[role=button] [role=button]", !1, 1, yield this.getScrollList());
				if (document.querySelector("[data-testid=blockAll]")) return;
				(this.blockButton = document.createElement("a")),
					this.blockButton.classList.add("lb-block-button", ...t.classList),
					(this.blockButton.dataset.testid = "blockAll"),
					(this.blockButton.tabIndex = 0),
					(this.blockButton.innerHTML = t.innerHTML),
					(this.blockButton.style.color = C.highlightColor),
					(this.blockButton.style.borderColor = C.highlightColor);
				((this.isLegacyTwitter
					? this.blockButton
					: this.blockButton.querySelector("div > span > span")
				).innerHTML = q.i18n.getMessage("ui_blockAll")),
					(yield this.getTopbar()).appendChild(this.blockButton);
				const i = document.createElement("span");
				(i.innerHTML = s), (i.style.marginRight = ".3em");
				(this.isLegacyTwitter ? this.blockButton : this.blockButton.querySelector("div")).prepend(i),
					(i.querySelector("svg").style.color = C.highlightColor),
					this.blockButton.addEventListener("click", () => {
						this.setUpBlockPopup();
					}),
					this.blockButton.addEventListener("keyup", (t) => {
						"Enter" === t.key && this.setUpBlockPopup();
					});
			});
		}
		createCheckbox() {
			this.checkbox = document.createElement("input");
			const t = document.createElement("label"),
				e = document.createElement("div");
			e.classList.add("lb-label-wrapper"),
				e.appendChild(t),
				(this.checkbox.type = "checkbox"),
				(this.checkbox.checked = T.includeRetweeters),
				this.checkbox.classList.add("lb-checkbox"),
				this.checkbox.addEventListener("change", () => {
					this.addIncludeRetweetersParam(this.checkbox.checked);
				}),
				(t.innerHTML = `<span>${q.i18n.getMessage("ui_blockRetweeters")}</span>`),
				t.prepend(this.checkbox);
			const i = document.createElement("span");
			return (
				i.classList.add("lb-info"),
				(i.title = q.i18n.getMessage("ui_onlyDirectRetweeters")),
				(i.innerHTML = r),
				e.appendChild(i),
				e
			);
		}
		createCloseButton() {
			return t(this, void 0, void 0, function* () {
				const t = document.createElement("button");
				(t.innerHTML = l),
					(t.tabIndex = 0),
					t.classList.add("lb-close-button"),
					(t.title = q.i18n.getMessage("ui_cancel")),
					(t.style.backgroundColor = C.highlightColor.replace(")", ", 0.1)")),
					(t.style.color = C.highlightColor),
					this.popup.prepend(t),
					t.addEventListener("click", () => {
						this.closePopup(), this.stopScrolling();
					});
			});
		}
		createFinishButton() {
			return t(this, void 0, void 0, function* () {
				const t = document.createElement("button");
				(t.innerHTML = `${g}${m}`),
					(t.tabIndex = 0),
					t.classList.add("lb-finish-button"),
					(t.title = q.i18n.getMessage("ui_finish")),
					(t.style.backgroundColor = C.highlightColor.replace(")", ", 0.1)")),
					(t.style.color = C.highlightColor),
					this.popup.append(t),
					t.addEventListener("click", () => {
						t.classList.add("lb-finish-button--active");
						t.querySelector("svg").addEventListener(
							"transitionend",
							() => {
								(t.disabled = !0),
									this.popup.classList.remove("lb-popup--has-warning"),
									this.finishCollecting();
							},
							{ once: !0 }
						);
					});
			});
		}
		createConfirmButton() {
			return t(this, void 0, void 0, function* () {
				let e = document.createElement("div"),
					i = document.createElement("button");
				if (
					(e.classList.add("lb-copy-wrapper"),
					i.classList.add("lb-copy-button"),
					(i.style.color = this.textStyle.color),
					(i.innerHTML = `\n\t\t\t<span class="lb-copy-button__content">\n\t\t\t\t<span>${c}</span>\n\t\t\t\t<span class="lb-copy-button__label">${q.i18n.getMessage(
						"ui_copyToShare"
					)}</span>\n\t\t\t</span>\n\t\t\t<span class="lb-copy-button__content">\n\t\t\t\t<span>${d}</span>\n\t\t\t\t<span class="lb-copy-button__label">${q.i18n.getMessage(
						"ui_copied"
					)}</span>\n\t\t\t</span>\n\t\t`),
					(this.textarea = document.createElement("textarea")),
					(this.textarea.readOnly = !0),
					this.textarea.classList.add("lb-textarea"),
					e.appendChild(i),
					e.appendChild(this.textarea),
					i.addEventListener("click", () => {
						this.handleCopyClick(this.textarea, i);
					}),
					!(yield C.isBlockPage()))
				) {
					const i = this.blockButton;
					(this.confirmButton = i.cloneNode(!0)),
						this.confirmButton.classList.add("lb-confirm-button"),
						this.confirmButton.classList.remove("lb-block-button"),
						this.isLegacyTwitter || this.confirmButton.querySelector("div > span").remove();
					((this.isLegacyTwitter
						? this.confirmButton
						: this.confirmButton.querySelector("div > span > span")
					).innerText = q.i18n.getMessage("ui_ok")),
						this.confirmButton.setAttribute("target", "_blank"),
						this.confirmButton.addEventListener("click", () =>
							t(this, void 0, void 0, function* () {
								yield this.closePopup();
							})
						),
						e.appendChild(this.confirmButton);
				}
				return e;
			});
		}
		createConfirmMessageElement() {
			(this.confirmMessageElement = this.loadingInfo.cloneNode()),
				Object.assign(this.confirmMessageElement.style, this.textStyle),
				this.confirmMessageElement.classList.remove("lb-collecting"),
				this.confirmMessageElement.classList.add("lb-confirm-message"),
				(this.confirmMessageElement.innerHTML = `\n\t\t\t<h3>\n\t\t\t\t<span>${q.i18n.getMessage(
					"ui_usersFound"
				)}</span>\n\t\t\t\t<span>${q.i18n.getMessage(
					"ui_blockAll"
				)}?</span>\n\t\t\t</h3>\n\t\t\t<div class="lb-label__main"></div>`),
				this.popup.appendChild(this.confirmMessageElement);
		}
		createPopup(e) {
			return t(this, void 0, void 0, function* () {
				(this.popupWrapper = document.createElement("div")),
					C.popupContainer.appendChild(this.popupWrapper),
					this.popupWrapper.classList.add("lb-popup-wrapper", "lb-hide"),
					(this.popup = document.createElement("div")),
					this.popupWrapper.appendChild(this.popup),
					(this.popup.tabIndex = 0),
					this.popup.setAttribute("aria-modal", "true"),
					this.popup.setAttribute("aria-labeledby", "lb-popup-heading"),
					(this.popup.dataset.focusable = "true"),
					this.popup.classList.add("lb-popup"),
					(this.popup.style.background = C.backgroundColor),
					(this.popup.style.color = C.highlightColor),
					(this.popup.innerHTML = e),
					window.setTimeout(() => {
						this.popup.focus();
					}, 0),
					window.setTimeout(() => {
						this.popupWrapper.classList.remove("lb-hide");
					}, 250),
					document.addEventListener("keydown", this.handleKeydown);
			});
		}
		handleCopyClick(t, e) {
			t.select(),
				navigator.clipboard.writeText(t.value).then(() => {
					e.classList.add("lb-copy-button--active"), e.setAttribute("disabled", "true");
				}),
				window.setTimeout(() => {
					e.classList.remove("lb-copy-button--active"), e.removeAttribute("disabled");
				}, 5e3);
		}
		initBlockAction() {
			return t(this, void 0, void 0, function* () {
				const t = this.popup.querySelector(".lb-label");
				Object.assign(t.style, this.textStyle), yield this.startScrolling();
			});
		}
		scrollDown() {
			return t(this, void 0, void 0, function* () {
				console.debug("scrollDown()");
				const t = yield this.scrolly,
					e = t.scrollHeight < 2 * t.clientHeight,
					i = Math.ceil(t.scrollTop) >= t.scrollHeight - t.clientHeight,
					s = 100 === this.progressInPercent;
				t.scroll({ top: t.scrollTop + t.clientHeight, left: 0, behavior: "smooth" }),
					yield this.collectUsers(),
					(i || e || s) &&
						(console.info("finished collecting!", { scrolledToBottom: i, scrollListIsSmall: e }),
						this.finishCollecting());
			});
		}
		finishCollecting() {
			if (this.hasStateChangedToConfirm) return;
			console.debug("finishCollecting()"), (this.requestUrl = `${w}?users=${this.users}`);
			const e = this.requestUrl.length > f;
			if (
				(document.querySelector("body").classList.toggle("many", e),
				this.confirmButton && (this.confirmButton.href = this.requestUrl),
				this.textarea && (this.textarea.value = this.requestUrl),
				e)
			) {
				console.info("list is large");
				let t = this.requestUrl.length / f,
					e = this.users.length / t;
				const i = document.querySelector(".lb-confirm-message > h3 > span:last-of-type");
				(i.innerHTML = q.i18n.getMessage("ui_divided")), i.classList.add("lb-divided-msg");
				for (let i = 0; i <= t; i++) {
					let t = this.textarea.parentNode.cloneNode(!0);
					this.textarea.parentNode.parentNode.appendChild(t);
					const s = t.childNodes.item(1),
						o = s.parentElement.querySelector(".lb-copy-button"),
						l = s.parentElement.querySelector(".lb-confirm-button"),
						r = `${w}?users=${this.users.slice(e * i, e * (i + 1))}`;
					if (
						(o.addEventListener("click", () => {
							this.handleCopyClick(s, o);
						}),
						(s.value = r),
						l)
					) {
						(l.href = r),
							(l.querySelector("div > span > span").innerText = `${q.i18n.getMessage(
								"ui_confirmButtonLabel"
							)} ${i + 1}`);
						const t = document.createElement("span");
						(t.innerHTML = n),
							l.querySelector("div > span").prepend(t),
							l.addEventListener("mousedown", (t) => {
								t.target.closest("a").classList.add("lb-confirm-button--clicked");
							});
					}
				}
				this.textarea.parentNode.parentNode.removeChild(document.querySelector(".lb-copy-wrapper"));
			}
			this.checkbox && this.addIncludeRetweetersParam(this.checkbox.checked), this.stopScrolling();
			const i = this.popup.querySelector(".lb-confirm-message h3 span");
			i && (i.innerHTML = `${this.users.length} ${i.innerHTML}`),
				this.popup.classList.add("lb-check", "lb-collected"),
				setTimeout(
					() =>
						t(this, void 0, void 0, function* () {
							yield this.changeStateToConfirm();
						}),
					1200
				);
		}
		getTopbar() {
			return t(this, void 0, void 0, function* () {
				let t;
				return (
					this.topbar ||
						(this.isLegacyTwitter
							? ((t = yield e("#activity-popup-dialog-header")),
							  (this.isLegacyTwitter = !0),
							  (this.topbar = t.parentElement))
							: (this.topbar = yield e(E[C.viewport]))),
					this.topbar
				);
			});
		}
		setUpBlockButton() {
			return t(this, void 0, void 0, function* () {
				((yield C.isBlockPage()) || (yield C.isTweetPage()) || (yield C.isListPage())) &&
					(yield this.createBlockButton());
			});
		}
		setUpBlockPopup() {
			return t(this, void 0, void 0, function* () {
				const t = `\n\t\t\t<div class="lb-label lb-collecting">\n\t\t\t\t<h3 id="lb-popup-heading">\n\t\t\t\t\t<span>${q.i18n.getMessage(
					"ui_collectingUsernames"
				)}...</span>\n\t\t\t\t\t<span class="lb-user-counter"></span>\n\t\t\t\t</h3>\n\t\t\t\t<p class="lb-text">${yield this.getLimitMessage()}</p>\n\t\t\t\t<div class="lb-progress-bar">\n\t\t\t\t\t<div class="lb-progress-bar__inner" style="background-color: ${
					C.highlightColor
				}">\n\t\t\t\t\t\t<span class="lb-progress-bar__label">0%</span>\n\t\t\t\t\t\t${o}\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>`;
				yield this.createPopup(t), this.createConfirmMessageElement();
				let e = yield this.createConfirmButton();
				if (yield C.isTweetPage()) {
					let t = this.createCheckbox();
					this.confirmMessageElement.querySelector(".lb-label__main").appendChild(t);
				}
				this.confirmMessageElement.querySelector(".lb-label__main").appendChild(e),
					yield this.createCloseButton(),
					yield this.createFinishButton(),
					yield this.createFooter(),
					yield this.initBlockAction();
			});
		}
		createFooter() {
			return t(this, void 0, void 0, function* () {
				const t = document.createElement("footer");
				(t.innerHTML = `\n\t\t\t<ul class="lb-footer__inner">\n\t\t\t\t<li class="lb-footer__item">\n\t\t\t\t\t<a class="lb-footer__link lb-footer__link--new-release ${
					T.isNewRelease ? "sparkle" : ""
				}"\n\t\t\t\t\t\thref="https://github.com/dmstern/likers-blocker/releases" target="_blank" title="${q.i18n.getMessage(
					"ui_newRelease"
				)}">${v}</a>\n\t\t\t\t</li>\n\t\t\t\t<li class="lb-footer__item">\n\t\t\t\t\t<a class="lb-footer__link lb-footer__link--donate ${$.getBadgeClass(
					"donate"
				)}" href="https://github.com/dmstern/likers-blocker#donate" target="_blank" title="${q.i18n.getMessage(
					"popup_tip"
				)}">${p}</a>\n\t\t\t\t</li>\n\t\t\t\t<li class="lb-footer__item">\n\t\t\t\t\t<a class="lb-footer__link lb-footer__item--report ${$.getBadgeClass(
					"report"
				)}" href="https://github.com/dmstern/likers-blocker/issues/new" target="_blank" title="${q.i18n.getMessage(
					"popup_reportBug"
				)}">${u}</a>\n\t\t\t\t</li>\n\t\t\t\t<li class="lb-footer__item">\n\t\t\t\t\t<a class="lb-footer__link lb-footer__link--share ${$.getBadgeClass(
					"share"
				)}" href="https://twitter.com/share?text=With the @LikersBlocker you can block people that like hate speech.&url=https://dmstern.github.io/likers-blocker&hashtags=LikersBlocker,sayNoToHateSpeech,ichbinhier" target="_blank" title="${q.i18n.getMessage(
					"popup_share"
				)}">${a}</a>\n\t\t\t\t</li>\n\t\t\t\t<li class="lb-footer__item">\n\t\t\t\t\t<a class="icon--twitter lb-footer__link lb-footer__link--follow ${$.getBadgeClass(
					"follow"
				)}" href="https://twitter.com/LikersBlocker" target="_blank" title="${q.i18n.getMessage(
					"popup_follow"
				)}">${h}</a>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t\t`),
					(t.style.backgroundColor = C.backgroundColor),
					(t.style.color = C.highlightColor),
					this.popup.appendChild(t),
					t.querySelectorAll(".lb-footer__link.lb-footer__link--show-badge").forEach((t) => {
						t.addEventListener("click", (t) => {
							const e = "lb-footer__link--",
								i = t.target.closest("a"),
								s = Array.from(i.classList)
									.find((t) => t.startsWith(e))
									.replace(e, "");
							switch ((i.classList.remove("lb-footer__link--show-badge"), s)) {
								case "follow":
									T.hideBadgeFollow = !0;
									break;
								case "share":
									T.hideBadgeShare = !0;
									break;
								case "donate":
									T.hideBadgeDonate = !0;
							}
						});
					});
			});
		}
		setUpExportButton() {
			return t(this, void 0, void 0, function* () {
				if (!(yield C.isBlockPage())) return;
				if (document.querySelector(".lb-btn--export")) return;
				let t = yield e("section", !0, 3);
				if (!t) return;
				if (!(yield C.isBlockPage())) return;
				let i = document.createElement("button");
				(i.innerHTML = a),
					i.setAttribute("aria-label", q.i18n.getMessage("ui_export")),
					i.setAttribute("title", q.i18n.getMessage("ui_export")),
					i.classList.add("lb-btn--export"),
					(i.style.backgroundColor = C.twitterBrandColor),
					t.appendChild(i),
					i.addEventListener("click", () => {
						this.setUpBlockPopup();
					});
			});
		}
		startScrolling() {
			return t(this, void 0, void 0, function* () {
				(yield this.getScrollList()).classList.add("lb-blur"),
					(yield this.scrolly).scrollTo(0, 0),
					(this.collectedUsers = []),
					(this.scrollInterval = window.setInterval(
						() =>
							t(this, void 0, void 0, function* () {
								yield this.scrollDown();
							}),
						k
					));
			});
		}
		createIdleWarning() {
			if (
				T.hideIdleWarning ||
				Array.from(this.popup.classList).includes("lb-popup--has-warning") ||
				this.hasStateChangedToConfirm
			)
				return;
			const t = document.createElement("div");
			(t.style.backgroundColor = C.backgroundColor),
				t.classList.add("lb-warning"),
				(t.innerHTML = `\n\t\t\t<h4 class="lb-warning__heading">${b}<span>${q.i18n.getMessage(
					"ui_warningHeading"
				)}</span></h4>\n\t\t\t<span class="lb-warning__text">${q.i18n.getMessage(
					"ui_warningText"
				)}</span>\n\t\t\t<div class="lb-warning__buttons">\n\t\t\t\t<button class="lb-warning__button lb-warning__button--ok">${q.i18n.getMessage(
					"ui_ok"
				)}</button>\n\t\t\t\t<button class="lb-warning__button lb-warning__button--hide">${q.i18n.getMessage(
					"ui_doNotShowAgain"
				)}</button>\n\t\t\t</div>\n\t\t`),
				this.popup.append(t),
				this.popup.classList.add("lb-popup--has-warning"),
				(t.style.color = this.textStyle.color),
				(t.style.fontFamily = this.textStyle.fontFamily),
				(t.style.fontStyle = this.textStyle.fontStyle),
				(t.style.fontWeight = this.textStyle.fontWeight),
				this.popup.querySelectorAll(".lb-warning__button").forEach((e) => {
					e.addEventListener("click", () => {
						this.popup.classList.remove("lb-popup--has-warning"),
							(this.uiIdleCounter = -1),
							t.addEventListener("transitionend", () => {
								this.popup.removeChild(t);
							});
					});
				}),
				this.popup.querySelector(".lb-warning__button--hide").addEventListener("click", () => {
					T.hideIdleWarning = !0;
				});
		}
	}
	$.run();
})();
