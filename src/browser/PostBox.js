var _ = require('lodash')
, bacon = require('baconjs')
, bjq = require('bacon.jquery')
, baconModel = require('bacon.model')
, embedLinks = require('../common/EmbedLinks')
, utils = require('../common/Utils')
, postBoxTemplates = require('./templates/PostBoxTemplate')

// SPECS
// while typing, should embed URLs the user types in
// but, only one URL at a time
// an X button should remove the url
// and, once an url is removed, it shouldn't be added again

// TODO
// get-urls module isnt very good (doesnt trim off either side of the url)
// urls should return embed data (even if its fake) to practice ajax streams

// GRIPES
// there is still some model with mutating states
// embeddedURLs could easily be a stream (of reqs made to the api)
// currentEmbed could easily be a stream of responses from the api

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

  var urlsInPost = postInputProperty
    .map(embedLinks.getUrls)
    .filter(utils.nonEmpty)
    .skipDuplicates(_.isEqual)

  var urlsToEmbed = urlsInPost
    .scan([], function (acc, urls) {
      // should return the first url that ends with .com 
      console.log('url i see ', urls)
      return _.find(urls, function (url) {
        
      })
    }).log()

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
    .onValue(function (url) {
      // if the embed is real, show #embedContainer
      // if the embed is falsey, hide #embedContainer
        utils.setVisibility($('#embedContainer'), utils.truthy(url)) 
      // add it to the list of embeds we've embedded
        postBoxModel.appendToEmbeddedURLs(url)
      // and set #postEmbed to the embed content
        $("#postEmbed").html(
          postBoxTemplates.embedTemplate(url)
        )
    })
}