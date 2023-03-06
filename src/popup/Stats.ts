import BlockListStorage from "../storage/BlockListStorage";
import QueueStorage from "../storage/QueueStorage";
import Storage from "../storage/Storage";

export default class Status {
	static queueLength: number;
	static blockedLength: number;
	static blockListNode: HTMLElement;
	static queueListNode: HTMLElement;
	static main: HTMLElement;
	static blockListLabel: HTMLElement;
	static queueListLabel: HTMLElement;

	static async update() {
		await this.init();
		const hasQueue = this.queueLength > 0;
		const hasBlocked = this.blockedLength > 0;
		const isBlockerRunning = await Storage.isBlockerRunning();

		document.body.classList.toggle("is-blocker-running", isBlockerRunning);
		this.queueListNode.innerHTML = this.queueLength.toLocaleString();
		this.blockListNode.innerHTML = this.blockedLength.toLocaleString();
		this.main.classList.toggle("has-queue", hasQueue);
		this.queueListLabel.classList.toggle("active", hasQueue);
		this.blockListLabel.classList.toggle("active", hasBlocked);
	}

	private static async init() {
		const queueLength = await QueueStorage.getQueueLength();
		const blockedLength = await BlockListStorage.getBlockListLength();

		this.queueLength = queueLength;
		this.blockedLength = blockedLength;

		this.blockListNode = document.querySelector("#blockListStats") as HTMLElement;
		this.queueListNode = document.querySelector("#blockQueueStats") as HTMLElement;
		this.main = document.querySelector("main") as HTMLElement;
		this.blockListLabel = this.blockListNode.parentElement;
		this.queueListLabel = this.queueListNode.parentElement;
	}
}
