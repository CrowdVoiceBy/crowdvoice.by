/* globals WebFontConfig */

require('./../css/postShow.less');

WebFontConfig = {
  google: { families: [ 'Open+Sans:400,300,600,700,800:latin' ] }
};

(function() {
  var wf = document.createElement('script');
  wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
    '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
  wf.type = 'text/javascript';
  wf.async = 'true';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(wf, s);
})();

// JS » deps
window.jQuery = window.$ = require('jquery');

// JS » Our stack, namespace, lib
require('neon');
require('neon/stdlib');
window.CV = {UI: {}, Views: {}};
require('./lib/widget-utils.js');
require('./lib/Widget.js');
require('./app');

require('./views/PostShow');
require('./widgets/PopoverBlocker');
require('./widgets/popovers/PopoverShare');
require('./widgets/popovers/PopoverUnsave');
require('./widgets/post-details/actions/PostDetailActionsSave');
require('./widgets/post-details/actions/PostDetailActionsShare');
