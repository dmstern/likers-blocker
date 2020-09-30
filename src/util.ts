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

export { debounce };
