import { downloads } from "webextension-polyfill";
import Storage from "./Storage";
import { BlockedUser, QueuedUser, UserSet } from "./UserInfo";

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

function parseCSV(csv: string): QueuedUser[] {
	const rows = csv.split("\n");

	return rows.map((row) => {
		const [firstColumn, secondColumn] = row.split(",");
		let interacted_with = "";
		let id: string;
		let screen_name = "";

		// Compatibility with RedBlock exports (fist column is the id):
		if (isScreenName(firstColumn)) {
			screen_name = firstColumn;
		} else {
			id = firstColumn;
		}

		if (secondColumn && secondColumn.startsWith("https://twitter.com")) {
			interacted_with = secondColumn.replace("https://twitter.com", "");
		}

		const baseUser = id ? { id } : { screen_name };

		return {
			...baseUser,
			interacted_with,
			profile_image_url_https: "",
		};
	});
}

function isScreenName(value: string) {
	return /\D/.test(value);
}

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

	static async importBlockList(): Promise<QueuedUser[]> {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = ".csv";
		fileInput.style.display = "none";
		document.body.appendChild(fileInput);
		fileInput.click();

		return new Promise((resolve, reject) => {
			fileInput.addEventListener("change", () => {
				if (!fileInput.files || !fileInput.files[0]) {
					console.error("not a file");
					reject();
					return;
				}

				try {
					const file = fileInput.files[0];
					const reader = new FileReader();
					reader.onload = async (e) => {
						if (!e.target) {
							return;
						}

						const text = e.target.result as string;
						console.info("Importing: ", text);

						try {
							const blockedAccounts = parseCSV(text);
							console.debug("⚙ parsed:", blockedAccounts);
							await Storage.queueMulti(blockedAccounts);
							resolve(blockedAccounts);
						} catch (error) {
							reject(error);
							console.error(error);
						}
					};

					reader.readAsText(file);
				} catch (error) {
					console.error("Import failed.", error);
					reject(error);
				} finally {
					fileInput.remove();
				}
			});
		});
	}
}
