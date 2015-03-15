/* global window: false */ 

function isBrowser() {
    return typeof(window) !== 'undefined';
}

exports.isBrowser = isBrowser();

exports.requireOrGlobal = function (module, global) {
   if (isBrowser()) {
        return window[global];
    }
    else {
        return require(module);
    }
};

exports.nonEmpty = function (x) { return x.length > 0 }

exports.setVisibility = function (element, visible) { element.toggle(visible) }

exports.setEnabled = function (element, enabled) { element.attr("disabled", !enabled) }

exports.truthy = function (x) { if (x) return x }



