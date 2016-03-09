Class(CV, 'Modal').inherits(Widget)({

	ELEMENT_CLASS : 'cv-modal-container',

    HTML : '\
        <div>\
            <div class="cv-modal">\
                <div class="header">\
                    <h3 class="title"></h3>\
                    <div class="line"></div>\
                    <svg class="close">\
                        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-close"></use>\
                    </svg>\
                </div>\
                <div class="body-wrapper">\
                    <div class="body -clear-after"></div>\
                </div>\
            </div>\
        </div>\
    ',

    prototype        : {
        type            : null,
        style           : null,
        title           : null,
        action          : null,
        data            : null,
        width           : null,
        modalElement    : null,

        init : function(config){
            Widget.prototype.init.call(this, config);
            var modal = this;
            this.modalElement = this.element.find('.cv-modal');
            this.closeElement = this.element.find('.close');
            this.bodyElement = this.element.find('.body');

            if( this.style ){ this.element.addClass(this.style) };
            if( this.width ){
                this.modalElement.css('width', this.width + 'px');
            };

            this.element.find('.title').text(this.title);
            this.bodyElement = this.element.find('.body');


            this.closeElement.bind('click', function(){
                this.hide();
            }.bind(this));

            this.element.bind('click', function(e){
                if( e.target !== this ){
                   return;
               }
                modal.hide();
            });

            var bubbleAction = this.appendChild(
                new this.action({
                    data   : this.data,
                    name    : 'bubbleAction',
                })
            ).render(this.bodyElement);

            bubbleAction.bind('close', function(){
                this.hide();
            }.bind(this));


        },

        show : function(){
            this.render('body');
            this.element.show();
            this.modalElement.css({
                'margin-left': -1*(this.modalElement.width()/2),
                //'margin-top': -1*(this.modalElement.height()/2)
            });
        },
        hide : function(){
            this.element.hide();
        }

    }

});



