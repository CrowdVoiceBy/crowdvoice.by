require('./../css/embed.less');

window.WebFontConfig = {
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
window.CV = {UI: {}};
require('./lib/widget-utils');
require('./lib/Widget');
require('./app');
require('./lib/image-halt');

require('./widgets/ui/Button');
require('./widgets/ui/Checkbox');
require('./widgets/ui/Close');

require('./widgets/Dropdown');
require('./widgets/PopoverBlocker');
require('./widgets/popovers/PopoverShare');
require('./widgets/popovers/PopoverUnsave');

require('./widgets/voice/registry/VoicePagesRegistry');
require('./embed/helpers/Voice');

require('./embed/Embeddable');
require('./embed/header/EmbedHeader');
require('./embed/VoiceFilterPostsDropdown');
require('./embed/description/EmbedVoiceDescriptionController');
require('./embed/description/EmbedVoiceDescription');
require('./embed/header/EmbedHeaderViewButtons');
require('./embed/header/EmbedHeaderShareButton');
require('./embed/header/EmbedOpenVoiceButton');
require('./embed/EmbedLayersController');
require('./embed/jump-to-layer/EmbedJumpToLayer');
require('./embed/jump-to-layer/EmbedJumpToLayerLabel');
require('./embed/jump-to-layer/EmbedJumpToLayerItem');
require('./embed/EmbedLayer');
require('./embed/EmbedLayerPostIndicator');
require('./embed/timeline/Timeline');

require('./embed/posts/modules/PostModuleImages');
require('./embed/posts/Post');
require('./embed/posts/PostImage');
require('./embed/posts/PostVideo');
require('./embed/posts/PostLink');
require('./embed/posts/PostText');
require('./embed/posts/PostTweet');

require('./embed/post-details/controllers/PostDetailController');
require('./embed/post-details/PostDetail');
require('./embed/post-details/PostDetailNavigation');
require('./embed/post-details/PostDetailTimeline');
require('./embed/post-details/PostDetailSidebar');
require('./embed/post-details/PostDetailSidebarItem');
require('./embed/post-details/PostDetailInfo');
require('./embed/post-details/PostDetailInfoMedia');
require('./embed/post-details/PostDetailInfoArticle');
require('./embed/post-details/PostDetailInfoTweet');
require('./embed/post-details/actions/PostDetailActionsSave');
require('./embed/post-details/actions/PostDetailActionsShare');
