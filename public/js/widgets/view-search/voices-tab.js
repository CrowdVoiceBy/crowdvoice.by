Class(CV, 'SearchVoicesTab').inherits(Widget)({
    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            var fragment = document.createDocumentFragment();
            this.data.forEach(function(voice, index) {
                this.appendChild(new CV.VoiceCover({
                    name : 'voice_' + index,
                    className : '-inline-block -pl1 -pr1',
                    data : voice
                }));
                fragment.appendChild(this['voice_' + index].el);
            }, this);

            this.el.appendChild(fragment);

            this.r = new CV.ResponsiveWidth({
                container : this.el,
                items : [].slice.call(this.el.querySelectorAll('.cv-voice-cover'), 0),
                minWidth : 300
            });
        },

        update : function update() {
            this.r.setup();
        },

        _activate : function _activate() {
            Widget.prototype._activate.call(this);
            this.update();
        }
    }
});
