Class(CV, 'FeedOnboarding').inherits(Widget)({
  HTML: '\
    <div class="profile-onboarding -mid-height -rel">\
      <h1>Nothing to show yet</h1>\
      <p>Follow voices, users and organzations to view all their recent activity.\
      This will also help you discover more of them to contact, contribute, join and follow.</p>\
      <a class="ui-btn -primary -lg -mt2 -text-center" href="/discover/browse">Explore and Discover!</a>\
    </div>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
    }
  }
});
