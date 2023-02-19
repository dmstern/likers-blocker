import { BlockedUser, UserSet } from "./UserInfo";

export default class Exporter {
	static prepareDownloadBlockList(users: UserSet<BlockedUser>): {
		filename: string;
		url: string;
		mimeType: string;
		data: string;
		encoding: string;
	} {
		if (!users.size) {
			return;
		}

		// single column CSV file
		const filename = "blocklist.csv";
		const data = users
			.toArray()
			.map((user) => {
				const { screen_name, interacted_with } = user;
				return `${screen_name},https://twitter.com${interacted_with}`;
			})
			.join("\n");
		const mimeType = "text/csv";
		const encoding = "utf-8";
		const url = `data:${mimeType};charset=${encoding},${encodeURIComponent(data)}`;

		return { filename, url, mimeType, data, encoding };
	}
}
