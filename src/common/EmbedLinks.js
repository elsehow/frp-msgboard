var getUrls = require('get-urls')
var _ = require('lodash')

exports.getFirstNewURL = function(text, oldURLs) {
	return _.find(getUrls(text), function (url) {
	// find the first url that is not in old URLs
			return !(_.includes(oldURLs, url))
		}
	)
}