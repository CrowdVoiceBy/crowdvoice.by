Class(CV, 'InputButton').inherits(Widget)({
    HTML : '\
        <div class="form-field cv-input-search ">\
            <label><span></span></label>\
            <div class="-clear-after -rel ib-container">\
            </div>\
            <div class="search-results"></div>\
        </div>',

    INPUT_ELEMENT : '\
        <button class="cv-button -m0 -float-right">Search</button>\
        <div class="cv-input -overflow-hidden">\
            <input type="text">\
        </div>',

    AREA_ELEMENT : '\
        <button class="cv-button primary -m0 -float-right">Reply</button>\
        <div class="cv-input is-area -overflow-hidden">\
            <textarea rows="" cols=""></textarea>\
        </div>',

    prototype : {
        style           : null,
        placeholder     : null,
        isArea          : false,
        title           : "",
        subTitle        : "",
        buttonLabel     : "",

        init : function(config){
            Widget.prototype.init.call(this, config);
            var inputButton = this;

            this.el = this.element[0];
            this.resultsElement = this.element.find('.search-results');

            if (this.title) {
                this.element.find('label').text(this.title).append('<span>' + this.subTitle + '</span>');
            } else {
                this.element.find('label').remove();
            }

            if (this.isArea){
                this.element.find('.ib-container').append(this.constructor.AREA_ELEMENT);
            } else {
                this.element.find('.ib-container').append(this.constructor.INPUT_ELEMENT);
            }

            this.inputEl = this.element.find('.cv-input');
            this.buttonEl = this.element.find('button');

            if (this.style){
                this.inputEl.addClass(this.style);
                this.buttonEl.addClass(this.style);
            }

            if (this.placeholder){
                this.inputEl.find('input').attr('placeholder', this.placeholder);
            }

            if( this.buttonLabel){
                this.buttonEl.text(this.buttonLabel);
            }

            $(document).keyup(function(e) {
                 if (e.keyCode == 27) { // escape key maps to keycode `27`
                    inputButton.reset();
                }
            });
        },

        reset : function reset (){
            this.disableButton();
            this.element.find('.search-results').empty();
            this.element.find('.search-results').hide();
            this.inputEl.find('input').val('');
        },

        getResults : function getResults() {
            return this.resultsElement;
        },

        disableButton : function(){
            this.buttonEl.addClass('disabled');
            this.buttonEl.attr('disabled', true);
        },

        enableButton : function(){
            this.buttonEl.removeClass('disabled');
            this.buttonEl.attr('disabled', false);
        }
    }
});
