import { action } from "webextension-polyfill";
import settings from "./settings";

export default class Badge {
	static setColor() {
		if (!action) {
			return;
		}

		action.setBadgeBackgroundColor({ color: settings.BRAND_COLOR_DARK });
		action.setBadgeTextColor({ color: "#FFFFFF" });
	}

	static async updateBadgeCount(length: number) {
		if (!action) {
			return;
		}

		console.debug("🏷️ updateBadgeCount:", length);

		const minifyProperties: { suffix: string; divisor: number }[] = [
			{
				suffix: "M",
				divisor: 1_000_000,
			},
			{
				suffix: "k",
				divisor: 1_000,
			},
			{
				suffix: "",
				divisor: 1,
			},
			{
				suffix: "",
				divisor: 0,
			},
		];

		const { suffix, divisor } = minifyProperties.find(({ divisor }) => length >= divisor);
		const prefix = suffix.length > 0 ? ">" : "";
		const text = length == 0 ? "" : `${prefix}${Math.floor(length / divisor)}${suffix}`;
		const details = {
			text: text,
		};
		action.setBadgeText(details);
	}
}
