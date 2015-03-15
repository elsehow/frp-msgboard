var _ = require('lodash')
, bacon = require('baconjs')
, bjq = require('bacon.jquery')
, baconModel = require('bacon.model')
, embedLinks = require('../common/EmbedLinks')
, utils = require('../common/Utils')
, postBoxTemplates = require('./templates/PostBoxTemplate')

exports.setup = function() {

	// a bacon model representing the current embed
	var currentEmbed = baconModel.Model(undefined)
	var postBoxModel = {
		embeddedURLs: []
		// this is a bacon model
		, currentEmbed: currentEmbed 
		// functions	
		, setCurrentEmbed: function (value) {  currentEmbed.set(value) }
		, appendToEmbeddedURLs: function (url) { postBoxModel.embeddedURLs.push(url) }
		, clearCurrentEmbed: function () { currentEmbed.set(undefined) }
		, getFirstNewURL: function (text) { return embedLinks.getFirstNewURL(text, postBoxModel.embeddedURLs) }
		, embedExists: function () { return utils.truthy(currentEmbed.get())  }
		, setEmbedIfNoneExists: function (url) { if (!postBoxModel.embedExists()) postBoxModel.setCurrentEmbed(url) }
	} 

	// get the value of #postInput on keydown
	var postInputProperty = bjq.textFieldValue($('#postBox input'))
		// limit the rate of updates
		.debounce(150)
		// skip items in the stream with the same text
		.skipDuplicates()

	// disable the post button unless postInputProperty is nonempty
 	var postButtonDisabled = postInputProperty.map(utils.nonEmpty)
	postButtonDisabled.assign(utils.setEnabled, $('#postButton'))

	// pressing the removeEmbed button removes postBoxModel.currentEmbed
	var clearEmbedStream = $("#removePostEmbed")
		.asEventStream('click')
		.onValue(postBoxModel.clearCurrentEmbed)

	// the first URL that appears in the post
	// that we haven't already embedded 
	var firstNewURLInPost = postInputProperty
		// skip items in the stream that are the same
		.skipDuplicates()
		.map(postBoxModel.getFirstNewURL) 
		.filter(utils.truthy)
		.toProperty()

	// TODO we should actually get some embed data w ajax()
	firstNewURLInPost
		.onValue(postBoxModel.setEmbedIfNoneExists)

	// ok! we got an embed
	currentEmbed
		// we can now set it to our previously seen embeds
		.onValue(function (url) {
			// if the embed is falsey, hide #embedContainer
			if (!url) { 
				utils.setVisibility($('#embedContainer'), false) 
			} else {
			// if the embed is real, show #embedContainer
				utils.setVisibility($('#embedContainer'), true) 
			// add it to the list of embeds we've embedded
				postBoxModel.appendToEmbeddedURLs(url)
			// and set #postEmbed to the embed content
				$("#postEmbed").html(
					postBoxTemplates.embedTemplate(url)
				)
			}
		})
}