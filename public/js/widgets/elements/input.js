Class(CV, 'Input').inherits(Widget)({

	ELEMENT_CLASS : '',

    HTML : '\
        <div class="form-field">\
            <label><span></span></label>\
            <div class="cv-input">\
                <svg class="search-svg">\
                  <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-search"></use>\
                </svg>\
            </div>\
        </div>\
    ',

    INPUT_ELEMENT : '<input type="text">',

    AREA_ELEMENT : '<textarea rows="" cols=""></textarea>',

    prototype        : {
        type            : null,
        style           : null,
        name            : null,
        placeholder     : null,
        isArea          : null,
        hasTitle        : false,
        title           : "",
        subTitle        : "",
        value           : "",

        init : function(config){
            Widget.prototype.init.call(this, config);
            var input = this;
            this.inputEl = this.element.find('.cv-input');

            if (this.style){ this.inputEl.addClass(this.style) };
            if (this.type == "search"){
                //add icon
                this.inputEl.addClass('search');

            }
            if (!this.isArea){
                this.inputEl.append(this.constructor.INPUT_ELEMENT);
                if (this.placeholder){
                    this.inputEl.find('input').attr('placeholder', this.placeholder);
                }
                if (this.value){
                    this.inputEl.find('input').val(this.value);
                }
                this.inputEl.find('input').attr('name', this.name);

            } else {
                this.inputEl.addClass('is-area');
                this.inputEl.append(this.constructor.AREA_ELEMENT);
                if (this.value){
                    this.inputEl.find('textarea').text(this.value);
                }
                this.inputEl.find('textarea').attr('name', this.name);
            }
            if (this.hasTitle){

                this.element.find('label').text(this.title).append('<span>' + this.subTitle + '</span>');
            } else {
                this.element.find('label').remove();
            }

            this.inputEl.find('input').on('focus', function(){
                input.inputEl.addClass('focused');
            });
            this.inputEl.find('input').on('blur', function(){
                input.inputEl.removeClass('focused success');
            });

        }

    }

});



