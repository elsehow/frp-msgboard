/* global window: false */

var embedLinks  = require('../../../src/common/EmbedLinks');
var _ = require('lodash')

describe("EmbedLinks", function() {

	beforeEach(function() {

		this.dataset = { 
			text: 'ayyyy https://github.com/baconjs/bacon.js/wiki/Diagrams is tite but so is https://github.com/substack/substack-flavored-webapp'
			, first_url: 'https://github.com/baconjs/bacon.js/wiki/Diagrams'
			, second_url: 'https://github.com/substack/substack-flavored-webapp'
		}
	})

    it("should pick the first new URL in the text", function() {
    	// we pass some text with no 'already seen' urls
		expect(embedLinks.getFirstNewURL(this.dataset.text, []))
			.toEqual(this.dataset.first_url)
		expect(embedLinks.getFirstNewURL(this.dataset.text, [this.dataset.first_url]))
			.toEqual(this.dataset.second_url)
    });
});
