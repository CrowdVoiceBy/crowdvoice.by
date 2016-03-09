Class(CV, 'PopoverTwitterHelp').inherits(Widget)({
  HTML: '\
    <div>\
      <p class="twitter-help-description">Look for the kind of information you wish to find and adapt the <span>(examples)</span> to your needs</p>\
      <div class="line"></div>\
      <div class="list-containers">\
        <div class="operators-row">\
          <div class="-inline-block -mr1 -text-right -font-bold">Words</div>\
          <div class="-inline-block">\
            <ul>\
              <li>Containing all words in any position <span>(Crowd Voice)</span></li>\
              <li>Containing exact phrases <span>(“Crowd Voice”)</span></li>\
              <li>Containing any of the words <span>(“Crowd” OR “Voice”)</span></li>\
              <li>Excluding specific words <span>(Crowd -Voice)</span></li>\
              <li>With a specific hashtag <span>(#crowdvoiceby)</span></li>\
            </ul>\
          </div>\
        </div>\
        <div class="operators-row">\
          <div class="-inline-block -mr1 -text-right -font-bold">People</div>\
          <div class="-inline-block">\
            <ul>\
              <li>Sent from person “@USERNAME” <span>(from:USERNAME)</span></li>\
              <li>To person “@USERNAME” <span>(to:USERNAME)</span></li>\
              <li>Referencing a person “USERNAME” <span>(@USERNAME)</span></li>\
            </ul>\
          </div>\
        </div>\
        <div class="operators-row">\
          <div class="-inline-block -mr1 -text-right -font-bold">Places</div>\
          <div class="-inline-block">\
            <ul>\
              <li>Containing a exact phrase “Crowd Voice” and sent near “san francisco” <span>(“crowd voice” near:”san francisco”)</span></li>\
              <li>Sent Within 15 miles of “NYC”  <span>(“near:NYC within:15mi”)</span></li>\
            </ul>\
          </div>\
        </div>\
        <div class="operators-row">\
          <div class="-inline-block -mr1 -text-right -font-bold">Dates</div>\
          <div class="-inline-block">\
            <ul>\
              <li>Containing “activism” and sent since date “2010-12-27” <span>(activism since:2010-12-17)</span></li>\
              <li>Containing “human” and sent up to date “2010-12-27” <span>(human since:2010-12-17)</span></li>\
            </ul>\
          </div>\
        </div>\
        <div class="operators-row">\
          <div class="-inline-block -mr1 -text-right -font-bold">Twitter Feed</div>\
          <div class="-inline-block">\
            <ul>\
              <li>Containing “news” and entered via TwitterFeed <span>(news source:twitterfeed)</span></li>\
            </ul>\
          </div>\
        </div>\
      </div>\
    </div>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
    }
  }
});
