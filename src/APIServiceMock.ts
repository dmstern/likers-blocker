import Messenger from "./Messages";
import BlockListStorage from "./storage/BlockListStorage";
import QueueStorage from "./storage/QueueStorage";
import { QueuedUser } from "./User";

export default class APIServiceMock {
	static async block(user: QueuedUser): Promise<{ ok: boolean; status: number } | undefined> {
		console.info(`MOCK 👊 blocking ${user.screen_name}...`);
		const isAlreadyBlocked: boolean = (await BlockListStorage.getBlockedAccounts()).has(user);

		if (isAlreadyBlocked) {
			console.warn(`MOCK ${user.screen_name} is already blocked.`);
			return;
		}

		// const body = user.screen_name ? this.getScreenNameBody(user.screen_name) : this.getIdBody(user.id);
		const response = { ok: true, status: 200 };
		const wasSuccessful = response && response.ok;

		if (wasSuccessful) {
			console.info("%c MOCK ✔ user blocked.", "color: YellowGreen");
			BlockListStorage.addBlocked(user);
		} else {
			console.error("MOCK 🛑 did not block", response);
			QueueStorage.queue(user);
		}

		Messenger.sendBlock({ success: wasSuccessful, status: response.status });
		return response;
	}
}
