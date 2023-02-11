const defaultExpireDays = 3;

export enum Name {
	lang = "lang",
}

export default class Cookies {
	static set(cookieName: Name, cookieValue: string, expireDays: number = defaultExpireDays): void {
		const d = new Date();
		d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
		let expires = "expires=" + d.toUTCString();
		document.cookie = `${cookieName}=${cookieValue};${expires};path=/`;
	}

	static get(cookieName: Name): string {
		let name = cookieName + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(";");

		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];

			while (c.charAt(0) == " ") {
				c = c.substring(1);
			}

			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}

		return "";
	}
}
