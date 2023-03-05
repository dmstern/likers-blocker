import settings from "../settings";
import Storage, { Key } from "./Storage";

export enum AnimationLevel {
	off = "off",
	mild = "mild",
	frisky = "frisky",
}

export const animationLevelValues: Record<AnimationLevel, -1 | 0 | 1> = {
	off: -1,
	mild: 0,
	frisky: 1,
};

export default class OptionsStorage extends Storage {
	static async resetSettings() {
		await super.remove(Key.blocksPerMinute, false);
		await super.remove(Key.scrollsPerMinute, false);
		await super.remove(Key.animationLevel, false);
		await super.remove(Key.adBlockerActive, false);
	}

	static async getAnimationLevel(): Promise<AnimationLevel> {
		let animationLevel = (await this.get(Key.animationLevel, false)) as AnimationLevel;

		if (animationLevel === undefined) {
			animationLevel = AnimationLevel.frisky;
			this.setAnimationLevel(animationLevel);
		}

		return animationLevel;
	}

	static setAnimationLevel(value: AnimationLevel) {
		this.set(Key.animationLevel, value, false);
	}

	static async isAdBlockerActive(): Promise<boolean> {
		let isAdBlockerActive = (await this.get(Key.adBlockerActive, false)) as boolean;

		if (isAdBlockerActive === undefined) {
			isAdBlockerActive = true;
			this.setAdBlockerActive(isAdBlockerActive);
		}

		return isAdBlockerActive as boolean;
	}

	static async setAdBlockerActive(shouldBeActive: boolean) {
		this.set(Key.adBlockerActive, shouldBeActive, false);
	}

	static async setBlocksPerMinute(value: number) {
		this.set(Key.blocksPerMinute, value, false);
	}

	static async getBlocksPerMinute(): Promise<number> {
		let blocksPerMinute: number = await (this.get(Key.blocksPerMinute, false) as Promise<
			number | undefined
		>);

		if (blocksPerMinute === undefined || blocksPerMinute === null) {
			blocksPerMinute = settings.BLOCKS_PER_MINUTE;
			this.setBlocksPerMinute(blocksPerMinute);
		}

		return blocksPerMinute;
	}

	static async setScrollsPerMinute(value: number) {
		this.set(Key.scrollsPerMinute, value, false);
	}

	static async getScrollsPerMinute(): Promise<number> {
		let scrollsPerMinute: number = await (this.get(Key.scrollsPerMinute, false) as Promise<
			number | undefined
		>);

		if (scrollsPerMinute === undefined || scrollsPerMinute === null) {
			scrollsPerMinute = Math.round(60_000 / settings.SCROLL_INTERVAL);
			this.setScrollsPerMinute(scrollsPerMinute);
		}

		return scrollsPerMinute;
	}
}
