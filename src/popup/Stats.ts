import Storage from "../Storage";

export default class Status {
	static queueLength: number;
	static blockedLength: number;
	static blockListNode: HTMLElement;
	static queueListNode: HTMLElement;
	static main: HTMLElement;
	static blockListLabel: HTMLElement;
	static queueListLabel: HTMLElement;

	private static async init() {
		// Values:
		const queue = await Storage.getQueue();
		const blockedAccounts = await Storage.getBlockedAccounts();
		const queueLength = queue.size || 0;
		const blockedLength = blockedAccounts.size || 0;

		this.queueLength = queueLength;
		this.blockedLength = blockedLength;

		this.blockListNode = document.querySelector("#blockListStats") as HTMLElement;
		this.queueListNode = document.querySelector("#blockQueueStats") as HTMLElement;
		this.main = document.querySelector("main") as HTMLElement;
		this.blockListLabel = this.blockListNode.parentElement;
		this.queueListLabel = this.queueListNode.parentElement;
	}

	static async update() {
		await this.init();
		const hasQueue = this.queueLength > 0;
		const hasBlocked = this.blockedLength > 0;

		this.queueListNode.innerHTML = this.queueLength.toLocaleString();
		this.blockListNode.innerHTML = this.blockedLength.toLocaleString();
		this.main.classList.toggle("has-queue", hasQueue);
		this.queueListLabel.classList.toggle("active", hasQueue);
		this.blockListLabel.classList.toggle("active", hasBlocked);
	}
}
