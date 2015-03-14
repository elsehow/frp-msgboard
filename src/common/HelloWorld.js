//var Utils = require("./Utils");
//var _ = Utils.requireOrGlobal("lodash", "_");
var _ = require("lodash");

exports.hello = function hello() {
    return "hello";
};

exports.helloUnderscore = function helloUnderscore() {
    return _.escape('hello & hi');
};
