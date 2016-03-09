'use strict'

var readability = require(path.join(__dirname, '../node_modules/readability/index.js')),
  Readability = readability.Readability,
  JSDOMParser = readability.JSDOMParser,
  request = require('superagent'),
  xmlserializer = require('xmlserializer'),
  Parser = require('parse5').Parser

// From http://stackoverflow.com/a/21553982

var getLocation = function (href) {
  var match = href.match(new RegExp([
    '^(https?:)//', // protocol
    '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
    '(/[^?#]*)', // pathname
    '(\\?[^#]*|)', // search
    '(#.*|)$' // hash
  ].join('')))

  return match && {
    protocol: match[1],
    host: match[2],
    hostname: match[3],
    port: match[4],
    pathname: match[5],
    search: match[6],
    hash: match[7],
  }
}

var ReadabilityParser = Class('ReadabilityParser')({

  _document: null,

  prototype: {

    url: null,

    init: function (url) {
      this.url = url
    },

    fetch: function (callback) {
      var that = this

      var dom,
        xhtml,
        location = getLocation(this.url),
        doc,
        article

      var parser = new Parser()

      request
        .get(this.url)
        .end(function (err, response) {
          if (err) { return callback(err) }

          dom = parser.parse(response.text)
          xhtml = xmlserializer.serializeToString(dom)
          doc = new JSDOMParser().parse(xhtml)

          var uri = {
            spec: location.href,
            host: location.host,
            prePath: location.protocol + '//' + location.host,
            scheme: location.protocol.substr(0, location.protocol.indexOf(':')),
            pathBase: location.protocol + '//' + location.host + location.pathname.substr(0, location.pathname.lastIndexOf('/') + 1)
          }

          article = new Readability(uri, doc)

          that._document = article

          return callback(null, that)
        })
    },

    parse: function () {
      return this._document.parse()
    },

    isProbablyReaderable: function () {
      return this._document.isProbablyReaderable()
    },

  },

})

module.exports = ReadabilityParser
