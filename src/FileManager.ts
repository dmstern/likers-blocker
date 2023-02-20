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

	static async importBlockList() {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = ".csv";
		fileInput.style.display = "none";
		document.body.appendChild(fileInput);
		fileInput.click();
		fileInput.addEventListener("change", () => {
			if (!fileInput.files || !fileInput.files[0]) {
				console.debug("not file");
				return;
			}

			const file = fileInput.files[0];
			const reader = new FileReader();
			reader.onload = async (e) => {
				if (!e.target) {
					return;
				}

				// TODO: parse csv to json:
				const text = e.target.result as string;
				console.log("Importing: ", text);
				const rows = text.split("\n");
				const blockedAccounts: QueuedUser[] = rows.map((row) => {
					const [screen_name, interacted_with] = row.split(",");

					return {
						screen_name,
						interacted_with: interacted_with.replace("https://twitter.com", ""),
						profile_image_url_https: "",
					};
				});

				await Storage.queueMulti(blockedAccounts);
			};
			reader.readAsText(file);
			fileInput.remove();
		});
	}
}
