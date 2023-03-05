import { downloads } from "webextension-polyfill";
import BlockListStorage from "./storage/BlockListStorage";
import QueueStorage from "./storage/QueueStorage";
import { BlockedUser, QueuedUser, UserSet } from "./User";

const filename = "blocklist.csv";
const mimeType = "text/csv";
const encoding = "utf-8";

export default class FileManager {
	static getDownloadLinkForBlockList(users: UserSet<BlockedUser>): {
		filename: string;
		url: string;
	} {
		const data = usersToCSV(users);
		const url = `data:${mimeType};charset=${encoding},${encodeURIComponent(data)}`;
		return { filename, url };
	}

	static async downloadBlockList() {
		const users = await BlockListStorage.getBlockedAccounts();
		const file = new File([usersToCSV(users)], filename, {
			type: mimeType,
		});
		const downloadUrl = URL.createObjectURL(file);
		await downloads.download({
			url: downloadUrl,
			conflictAction: "uniquify",
			filename: filename,
			saveAs: true,
		});
	}

	static async importBlockList(files: FileList): Promise<[QueuedUser[], number]> {
		return new Promise((resolve, reject) => {
			if (!files || !files[0]) {
				console.error("not a file");
				reject(new Error("not a file."));
				return;
			}

			try {
				const file = files[0];
				const reader = new FileReader();
				reader.onload = async (e) => {
					if (!e.target) {
						return;
					}

					const text = e.target.result as string;
					console.info("Importing: ", text);

					try {
						const blockedAccounts: QueuedUser[] = parseCSV(text);
						console.debug("⚙ parsed:", blockedAccounts);

						if (blockedAccounts.length) {
							const added = await QueueStorage.queueMulti(blockedAccounts);
							resolve([blockedAccounts, added]);
						} else {
							reject(new Error("empty"));
						}
					} catch (error) {
						reject(error);
						console.error(error);
					}
				};

				reader.readAsText(file);
			} catch (error) {
				console.error("Import failed.", error);
				reject(error);
			}
		});
	}
}

function isScreenName(value: string) {
	return /\D/.test(value);
}

function validateScreenName(screenName: string): boolean {
	const forbiddenCharacters = ["-", "}", "{", "[", "]", "$", "%", " ", "]"];
	if (forbiddenCharacters.some((char) => screenName.includes(char))) {
		// console.debug(
		// 	`%cforbiden characters in: ${screenName}`,
		// 	"background-color: OrangeRed; border-radius:2px;"
		// );
		return false;
	}

	if (/\s/.test(screenName)) {
		// console.log(
		// 	`%ccontains whitespace: ${screenName}`,
		// 	"background-color: OrangeRed; border-radius:2px;"
		// );
		return false;
	}

	return true;
}

function parseCSV(csv: string): QueuedUser[] {
	if (!csv) {
		return [];
	}

	const rows = csv.split("\n");

	return rows
		.map((row) => {
			const [firstColumn, secondColumn] = row.split(",");
			let interacted_with = "";
			let id: string;
			let screen_name = "";

			// Compatibility with RedBlock exports (fist column is the id):
			if (isScreenName(firstColumn)) {
				if (!validateScreenName(firstColumn)) {
					throw new Error("invalid blocklist format");
				}

				screen_name = firstColumn;
			} else {
				id = firstColumn;
			}

			const baseUser = id ? { id } : { screen_name };

			if (secondColumn && secondColumn.startsWith("https://twitter.com")) {
				interacted_with = secondColumn.replace("https://twitter.com", "");
				return { ...baseUser, interacted_with };
			}

			return baseUser;
		})
		.filter((user) => user && (user.screen_name || user.id));
}

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
