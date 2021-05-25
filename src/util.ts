function debounce(func: Function, wait: number, immediate?: boolean) {
	let timeout: number;

	return function(...args) {
		let context = this;

		let later = function() {
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
	context?: HTMLElement,
): Promise<HTMLElement> {
	let elementToExpect = null;
	let tryCounter = 0;
	let tryMax = 10;
	let interval = undefined;

	return new Promise((resolve) => {
		function tryIt() {
			tryCounter++;

			if (tryCounter >= tryMax || elementToExpect) {
				clearInterval(interval);
			}

			if (multiple) {
				let elements = context
					? context.querySelectorAll(selector)
					: document.querySelectorAll(selector);

				if (elements.length >= expectedCount) {
					elementToExpect = elements.item(elements.length - 1);
				}
			} else {
				elementToExpect = context
					? context.querySelector(selector)
					: document.querySelector(selector);
			}

			if (
				!elementToExpect ||
				elementToExpect.style.display === "none" ||
				elementToExpect.offsetParent === null
			) {
				return;
			}

			clearInterval(interval);
			resolve(elementToExpect);
		}

		interval = setInterval(tryIt, 500);
	});
}

export {debounce, tryToAccessDOM};
