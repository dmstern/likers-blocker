import { BlockedUser, UserSet } from "./UserInfo";

export default class Exporter {
	static async prepareDownloadBlockList(
		users: UserSet<BlockedUser>
	): Promise<[string, string, string]> {
		if (!users.size) {
			return;
		}

		// single column CSV file
		const csvFilename = "blocklist.csv";
		const data = users
			.toArray()
			.map((user) => user.screen_name)
			.join("\n");
		const file = new File([data], csvFilename, {
			type: "text/csv",
		});
		const downloadUrl = URL.createObjectURL(file);
		return [csvFilename, downloadUrl, data];
	}
}
