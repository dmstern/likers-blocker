import { downloads } from "webextension-polyfill";
import { BlockedUser, UserSet } from "./UserInfo";
import Storage from "./Storage";

const filename = "blocklist.csv";
const mimeType = "text/csv";
const encoding = "utf-8";

function usersToCSV(users: UserSet<BlockedUser>): string {
	return users.size
		? users
				.toArray()
				.map((user) => {
					const { screen_name, interacted_with } = user;
					return `${screen_name},https://twitter.com${interacted_with}`;
				})
				.join("\n")
		: "";
}

export default class Exporter {
	static prepareDownloadBlockList(users: UserSet<BlockedUser>): {
		filename: string;
		url: string;
	} {
		const data = usersToCSV(users);
		const url = `data:${mimeType};charset=${encoding},${encodeURIComponent(data)}`;
		return { filename, url };
	}

	static async downloadBlockList() {
		console.debug("downloadBlockList");
		const users = await Storage.getBlockedAccounts();
		const file = new File([usersToCSV(users)], filename, {
			type: mimeType,
		});
		const downloadUrl = URL.createObjectURL(file);
		await downloads.download({
			url: downloadUrl,
			conflictAction: "uniquify",
			filename: filename,
		});
	}
}
