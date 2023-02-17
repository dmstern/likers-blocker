import { action } from "webextension-polyfill";

export default class Badge {
	static setColor() {
		action?.setBadgeBackgroundColor({ color: "#e1285c" });
	}

	static async updateBadgeCount(length: number) {
		console.log("updateBadgeCount");
		const text = length > 0 ? length.toString() : "";
		const details = {
			text: text,
		};
		action?.setBadgeText(details);
	}
}
