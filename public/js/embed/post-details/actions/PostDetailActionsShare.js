var origin = require('get-location-origin');
var moment = require('moment');

Class(CV, 'PostDetailActionsShare').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS : 'post-detail-action-item cv-button tiny',
    HTML : '\
      <button>\
        <svg class="-s14">\
            <use xlink:href="#svg-share"></use>\
        </svg>\
      </button>',

  prototype: {
    tooltipPostition : 'top',

    init : function init (config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      this.appendChild(new CV.PopoverShare({
        name : 'share'
      }));

      this.appendChild(new CV.PopoverBlocker({
        name : 'popover',
        className : 'post-detail-share-popover share-popover -text-left',
        placement : this.tooltipPostition,
        toggler : this.el,
        content : this.share.el
      })).render(this.el);
    },

    update : function update(data) {
      var url = origin + '/' + data.voice.owner.profileName + '/';
      url += data.voice.slug + '/';
      url += '#!' + moment(data.publishedAt).format('YYYY-MM') + '/';
      url += data.id;

      this.share.update({
        url : url,
        title : data.title
      });
    }
  }
});

