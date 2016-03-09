/** @jsx NeoWidget.h */

Class('HomepageStats').inherits(Widget)({
  prototype : {
    init : function(config) {
      Widget.prototype.init.call(this, config);

      var stats = this;

      // DATA
      // {
      //   cities : 0,
      //   organizations : 0,
      //   voices : 0,
      //   posts : 0
      // }
      this.element = new NeoWidget({
        data : config.data,

        template : function() {
          return <article role="article" className="stats -row">
              <div className="stats-col -inline-block">
                <p className="stats-number -font-bold -color-white">{this.data.cities}</p>
                <p className="stats-label">Cities</p>
              </div>
              <div className="stats-col -inline-block">
                <p className="stats-number -font-bold -color-white">{this.data.organizations}</p>
                <p className="stats-label">Organizations</p>
              </div>
              <div className="stats-col -inline-block">
                <p className="stats-number -font-bold -color-white">{this.data.voices}</p>
                <p className="stats-label">Voices Created</p>
              </div>
              <div className="stats-col -inline-block">
                <p className="stats-number -font-bold -color-white">{this.data.posts}</p>
                <p className="stats-label">Posts Published</p>
              </div>
            </article>
        }
      });

      this.render(document.querySelector('section.home-stats > .stats'));

      var socket = App.getSocket();

      setInterval(function() {
        socket.emit('getStats');
      }, 1000);

      socket.on('stats', function(data) {
        stats.element.update(data);
      });
    },

    render : function(element) {
      this.element.render(element);
    }
  }
});
