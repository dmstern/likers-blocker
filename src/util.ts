function debounce(func: Function, wait: number, immediate?: boolean) {
	let timeout: number;

	return function (...args) {
		let context = this;

		let later = function () {
			timeout = null;
			if (!immediate) {
				func.apply(context, args);
			}
		};

		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = window.setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args);
		}
	};
}

function tryToAccessDOM(
	selector: string,
	multiple?: boolean,
	expectedCount?: number,
	context?: HTMLElement
): Promise<HTMLElement | null> {
	let elementToExpect: HTMLElement = null;
	let tryCounter = 0;
	let tryMax = 10;
	let interval: NodeJS.Timeout = undefined;

	return new Promise((resolve, reject) => {
		function tryIt() {
			tryCounter++;

			// Nothing found, clear interval and reject promise:
			if (tryCounter >= tryMax) {
				clearInterval(interval);
				resolve(null);
			}

			if (multiple) {
				let elements = context
					? context.querySelectorAll(selector)
					: document.querySelectorAll(selector);

				if (elements.length >= expectedCount) {
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
