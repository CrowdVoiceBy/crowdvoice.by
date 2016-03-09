Class(CV, 'Bubble').inherits(Widget)({

	ELEMENT_CLASS : 'cv-bubble-container',

    HTML : '\
        <div>\
            <div class="cv-bubble">\
                <div class="header">\
                    <h3 class="title"></h3>\
                    <div class="line"></div>\
                    <svg class="close">\
                        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-close"></use>\
                    </svg>\
                </div>\
                <div class="body-wrapper">\
                    <div class="body"></div>\
                </div>\
                <div class="arrow"><div></div></div>\
            </div>\
        </div>\
    ',

    prototype        : {
        type            : null,
        style           : null,
        title           : null,
        action          : null,
        data            : null,
        width           : 300,
        anchorEl        : null,
        bubbleEl        : null,
        init : function(config){
            Widget.prototype.init.call(this, config);
            var bubble = this;
            this.bubbleEl = this.element.find('.cv-bubble');
            this.closeElement = this.element.find('.close');


            if( this.style ){ this.element.addClass(this.style) };
            if( this.width ){ this.bubbleEl.css('width', this.width + 'px') };

            this.element.find('.title').text(this.title);
            this.bodyElement = this.element.find('.body');

            this.closeElement.bind('click', function(){
                this.hide();
            }.bind(this));

            var bubbleAction = this.appendChild(
                new this.action({
                    data   : this.data,
                    name    : 'bubbleAction',
                })
            ).render(this.bodyElement);

            $(this.anchorEl).on('click', function(){
                bubble.show();
                return false;
            });

            this.element.bind('click', function(e){
                if( e.target !== this ){
                   return;
                }
                bubble.hide();
            });

            bubbleAction.bind('close', function(){
                this.hide();
            }.bind(this));

            this.render('body');
            this.hide();

        },

        position : function(){
            var bubble = this;

            var anchorPos = this.getOffset(this.anchorEl);

            var viewableOffsetTop = this.anchorEl.offset().top - $(window).scrollTop();
            var viewableOffsetLeft = this.anchorEl.offset().left - $(window).scrollLeft();

            this.bubbleEl.css('position', 'absolute');
            this.element.css('top', window.scrollY + 'px');

            var sidePadding = 10;

            var leftValue = viewableOffsetLeft - (bubble.width/2) + ($(bubble.anchorEl).width()/2);
            var topValue = viewableOffsetTop - (bubble.bubbleEl.height()) - (bubble.element.find('.arrow').height()/2);
            var arrowMargin = 0;

            var diff = $(window).width() - ( leftValue + parseInt(this.bubbleEl.css('width')) );

            if (leftValue < 0){
                arrowMargin = ($(bubble.bubbleEl).width()/2) + leftValue - sidePadding -12;
                leftValue = sidePadding;
            } else if (diff < 0){
                leftValue = leftValue + diff - sidePadding;
                arrowMargin = ($(bubble.bubbleEl).width()/2) + ( -1 * diff) + sidePadding - 12;
            } else {
                arrowMargin = 'auto';
            }

            this.bubbleEl.css({
                'position': 'absolute',
                'left': leftValue,
                'top': topValue
            });

            this.bubbleEl.find('.arrow div').css({
                'margin-left': arrowMargin
            });

        },

        getOffset : function( el ) {
            var _x = 0;
            var _y = 0;
            while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
                _x += el.offsetLeft - el.scrollLeft;
                _y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }
            return { top: _y, left: _x };
        },

        show : function(){
            this.element.show();

            this.position();
            console.log('show');
        },
        hide : function(){
            this.element.hide();
        }

    }

});



