function debounce(func: Function, wait: number, immediate?: boolean) {
  var timeout: number;

  return function() {
    var context = this;
    var args = arguments;

    var later = function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };

    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

function tryToAccessDOM(
  selector: string,
  multiple?: boolean,
  expectedCount?: number
): Promise<HTMLElement> {
  var elementToExpect = null;
  var tryCounter = 0;
  var tryMax = 10;
  var interval = undefined;

  return new Promise((resolve, reject) => {
    const tryIt = () => {
      tryCounter++;

      if (tryCounter >= tryMax || elementToExpect) {
        clearInterval(interval);
      }

      if (multiple) {
        let elements = document.querySelectorAll(selector);

        if (elements.length >= expectedCount) {
          elementToExpect = elements.item(elements.length - 1);
        }
      } else {
        elementToExpect = document.querySelector(selector);
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
    };

    interval = setInterval(tryIt, 500);
  });
}

export { debounce, tryToAccessDOM };
