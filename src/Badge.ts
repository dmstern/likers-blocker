import { action } from "webextension-polyfill";

export default class Badge {
	static setColor() {
		action?.setBadgeBackgroundColor({ color: "#e1285c" });
	}

	static async updateBadgeCount(length: number) {
		console.log("updateBadgeCount");

		const minifyProperties = [
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
		];

		const { suffix, divisor } = minifyProperties.find(({ divisor }) => length >= divisor);
		const prefix = suffix.length > 0 ? ">" : "";
		const text = length == 0 ? "" : `${prefix}${Math.floor(length / divisor)}${suffix}`;
		const details = {
			text: text,
		};
		action?.setBadgeText(details);
	}
}
