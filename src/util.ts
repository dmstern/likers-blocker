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

/**
 * Select an HTMLElement from the asynchronous loaded reactive Twitter UI.
 * @param selector string css selector
 * @param multiple expect to be multiple elements of this selector on the page
 * @param expectedCount get the last one of multiple expected occurrences
 * @param context parent context element
 * @param tryMax how often should UI be searched for a specific selector
 * @returns A Promise of null if nothing is found, the found HTMLElement or a NodeList if expectedCount is not set but multiple is true
 */
function tryToAccessDOM(
	selector: string,
	multiple?: boolean,
	expectedCount?: number,
	context?: HTMLElement,
	tryMax = 10
): Promise<HTMLElement | NodeListOf<HTMLElement> | null> {
	let elementToExpect: HTMLElement | null = null;
	let elements: NodeListOf<HTMLElement>;
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
				elements = context ? context.querySelectorAll(selector) : document.querySelectorAll(selector);

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

			if (multiple && !expectedCount && elements && elements.length) {
				clearInterval(interval);
				resolve(elements);
			}

			// console.debug("found element", selector, elementToExpect);
		}

		interval = setInterval(tryIt, 500);
	});
}

export { debounce, tryToAccessDOM };
