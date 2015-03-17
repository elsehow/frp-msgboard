var _ = require('lodash')
, bacon = require('baconjs')
, bjq = require('bacon.jquery')
, baconModel = require('bacon.model')
, embedLinks = require('../common/EmbedLinks')
, utils = require('../common/Utils')
, postBoxTemplates = require('./templates/PostBoxTemplate')

// TODO
// get-urls module isnt very good (doesnt trim off either side of the url)
// urls should return embed data (even if its fake) to practice ajax streams

// GRIPES! 
// YAY! no mutable state
// however, its important that we stop listening for new urls when embedProperty is truthy..........

exports.setup = function() {

  // get the value of #postInput on keydown
  var postInputProperty = bjq.textFieldValue($('#postBox input'))
    // limit the rate of updates
    .debounce(150)
    // skip items in the stream with the same text
    .skipDuplicates()

  // disable the post button unless postInputProperty is nonempty
  var postButtonDisabled = postInputProperty.map(utils.nonEmpty)
  postButtonDisabled.assign(utils.setEnabled, $('#postButton'))

  var urlsInPost = postInputProperty
    .map(embedLinks.getUrls)
    .skipDuplicates(_.isEqual)
    .filter(utils.nonEmpty)

  var embedRequests = urlsInPost
    // a list of all the unique urls weve seen
    .scan([], function(acc, urls) {return _.uniq(acc.concat(urls)) })
    .skipDuplicates(_.isEqual)
    .changes()
    .log('embedded urls')

  var clearEmbedButtonStream = $("#removePostEmbed")
    .asEventStream('click')
    .map(function () { return false })

  var embedProperty = embedRequests
    .map(_.last)
    .merge(clearEmbedButtonStream)
    .toProperty(false)
    .log('current-embed?')

  // TODO we should actually get some embed data w ajax()
  // ok! we got an embed
  embedProperty 
    .onValue(function (v) {
      // if the embed is real, show #embedContainer
      // if the embed is falsey, hide #embedContainer
        utils.setVisibility($('#embedContainer'), utils.truthy(v)) 
      // add it to the list of embeds we've embedded
      // and set #postEmbed to the embed content
        $("#postEmbed").html(
          postBoxTemplates.embedTemplate(v)
        )
    })
}