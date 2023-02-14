import Storage from "./Storage";

const client = typeof browser === "undefined" ? chrome : browser;

export default class Badge {
	static setColor() {
		client.action?.setBadgeBackgroundColor({color: "#e1285c"});
	}

	static async updateBadgeCount() {
		console.log("updateBadgeCount");
		const queue = await Storage.getQueue();
		const count = queue.length;
		const text = count > 0 ? count.toString() : null;
		client.action?.setBadgeText({ text: text });
	}
}
