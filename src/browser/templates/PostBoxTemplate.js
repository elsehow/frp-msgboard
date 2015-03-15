var _ = require('underscore')

exports.embedTemplate = function (url) { 
	return _.template('ayy: <%= url %>')({'url':url})
}