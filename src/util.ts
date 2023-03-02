function debounce(func: (...args) => void, wait: number, immediate?: boolean) {
	let timeout: number;

	return function (...args) {
		const later = () => {
			timeout = 0;
			if (!immediate) {
				func.apply(this, args);
			}
		};

		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = window.setTimeout(later, wait);

		if (callNow) {
			func.apply(this, args);
		}
	};
}

function tryToAccessDOM(
	selector: string,
	multiple?: boolean,
	expectedCount?: number,
	context?: HTMLElement,
	tryMax = 10
): Promise<HTMLElement | null> {
	let elementToExpect: HTMLElement | null = null;
	let tryCounter = 0;
	let interval: NodeJS.Timeout | undefined = undefined;

	return new Promise((resolve) => {
		function tryIt() {
			tryCounter++;

			// Nothing found, clear interval:
			if (tryCounter >= tryMax) {
				clearInterval(interval);
				resolve(null);
			}

			if (multiple) {
				const elements = context
					? context.querySelectorAll(selector)
					: document.querySelectorAll(selector);

				if (expectedCount && elements.length >= expectedCount) {
					elementToExpect = elements.item(elements.length - 1) as HTMLElement;
				}
			} else {
				elementToExpect = context ? context.querySelector(selector) : document.querySelector(selector);
			}

			if (
				elementToExpect &&
				elementToExpect.style.display !== "none" &&
				elementToExpect.offsetParent !== null
			) {
				// element found, clear interval and resolve promise:
				clearInterval(interval);
				resolve(elementToExpect);
			}
		}

		interval = setInterval(tryIt, 500);
	});
}

export { debounce, tryToAccessDOM };
