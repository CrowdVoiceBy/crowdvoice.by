Class(CV, 'Select').inherits(Widget)({

	ELEMENT_CLASS : '',

    HTML : '\
        <div class="form-field">\
            <label><span></span></label>\
            <div class="cv-select">\
                <div class="cv-select-head">\
                  <span class="label"></span>\
                </div>\
                <div class="cv-select-mask"></div>\
                <div class="cv-select-body">\
                  <ul>\
                  </ul>\
                </div>\
            </div>\
        </div>\
    ',

    prototype        : {
        type            : null,
        style           : null,
        label           : null,
        options         : null,
        optionSelected  : null,
        checkedCount    : 0,
        labelEl         : null,
        optionsEl       : null,
        headEl          : null,
        bodyEl          : null,
        hasArrow        : true,
        hasTitle        : false,
        title           : "",
        subTitle        : "",
        actionType      : null,
        enabled         : true,

        init : function(config){
            Widget.prototype.init.call(this, config);

            this.headEl = this.element.find('.cv-select-head');
            this.bodyEl = this.element.find('.cv-select-body');
            this.maskEl = this.element.find('.cv-select-mask');

            this.selectEl = this.element.find('.cv-select');

            this.labelEl = this.element.find('.label');
            this.optionsEl = this.element.find('ul');

            if (this.actionType){
                this.selectEl.addClass(this.actionType);
            }

            if(!this.hasArrow){
                this.selectEl.addClass('no-arrow');
            }
            if (this.hasTitle){
                this.element.find('label').text(this.title).append('<span>' + this.subTitle + '</span>');
            } else {
                this.element.find('label').remove();
            }

            if (this.style){ this.selectEl.addClass(this.style) };


            if (this.label){ this.labelEl.text(this.label) };

            if(this.type == 'icon'){
                this.labelEl.html('<svg>\
                                    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-' + this.icon + '"></use>\
                                    </svg>');
            }

            if (this.type){
                this.selectEl.addClass(this.type);
            }

            this.fillOptions();
            this.bindActions();

        },

        fillOptions : function(){

            for (var key in this.options) {
                if (this.options.hasOwnProperty(key)) {

                    switch(this.type) {
                        case 'check':

                            var optionEl = $('<li></li>');
                            var check = this.appendChild(new CV.Check({
                                id          : key,
                                label       : this.options[key].label,
                                name        : this.name + '-' + key,
                            })).render(optionEl);

                            check.bind('checked', function(){
                                this.updateCount(true);
                            }.bind(this));
                            check.bind('unchecked', function(){
                                this.updateCount(false);
                            }.bind(this));
                            break;

                        case 'icon':

                            var optionEl = $('<li>\
                                                <svg>\
                                                    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#svg-' + this.options[key].icon + '"></use>\
                                                </svg>\
                                                <div data-id="'+ key +'" class="option">'+this.options[key].label+'</div>\
                                            </li>');
                            this[this.options[key].name] = optionEl;

                            break;
                        default:
                        //console.log(this.options[key].label);
                            var optionEl = $('<li><div data-id="'+ key +'" class="option">'+this.options[key].label+'</div></li>');
                            optionEl.attr('name', this.options[key].name);
                            this[this.options[key].name] = optionEl;

                    }

                    if (this.options[key].active){
                        optionEl.addClass('selected');
                        this.labelEl.text(this.options[key].label);
                        this.optionSelected = this.options[key];
                    }

                    if(this.options[key].sub){
                        optionEl.addClass('has-children');
                        var subOptions = this.options[key].sub;
                        var subListEl = $('<ul></ul>');

                        for (var subkey in subOptions) {
                            var subOptionEl = $('<li><div data-id="'+ subkey +'" class="option">'+subOptions[subkey].label+'</div></li>');
                            this[subOptions[subkey].name] = subOptionEl;
                            subListEl.append(subOptionEl);
                        }
                        optionEl.append(subListEl);
                    }

                    this.optionsEl.append(optionEl);
                }
            }

            if (this.type == "check" && Object.keys(this.options).length > 9){
                this.bodyEl.css('min-width', '280px');
                this.optionsEl.find('li').css({ 'width' : '50%','float' : 'left', 'margin': '0px' });
                this.optionsEl.find('li.default').css({ 'width' : '100%'});
                this.optionsEl.find('li .check').css({ 'margin' : '4px auto'});
            }
        },

        bindActions : function(){

            this.headEl.on('click', function(){
                if(this.enabled){
                    this.open();
                }
            }.bind(this));

            this.maskEl.on('click', function(){
                this.close();
            }.bind(this));

            var that = this;

            switch(this.type) {
                case 'icon':
                    this.element.find('li').bind('click', function(el){
                        //that.optionSelected = $(this).find('> div').attr('data-id');
                        that.optionSelected = that.options[ $(this).find('> div').attr('data-id') ];
                        that.close();
                    });
                break;

                default:
                    this.element.find('li').bind('click', function(el){
                        that.element.find('li').removeClass('selected');
                        //that.optionSelected = $(this).find('> div').attr('data-id');
                        that.optionSelected = that.options[ $(this).find('> div').attr('data-id') ];
                        that.labelEl.text($(this).find('> div').text());
                        $(this).addClass('selected');
                        that.close();
                    });
            }


        },

        updateCount : function(added){

            if (added){
                this.checkedCount++;
            } else {
                this.checkedCount--;
            }

            if(this.checkedCount){
                //this.countEl.text(this.checkedCount);
                //this.countEl.css('opacity', 1);
                this.selectEl.addClass('activated');
            } else {
                //this.countEl.css('opacity', 0);
                this.selectEl.removeClass('activated');
            }

        },

        open : function(){
            this.bodyEl.toggle();
            this.selectEl.toggleClass('active');
            this.maskEl.show();
        },

        close : function(){
            this.bodyEl.toggle();
            this.selectEl.toggleClass('active');
            this.maskEl.hide();
        },

        enable : function(){
            this.enabled = true;
            this.selectEl.removeClass('disabled');
            this.selectEl.attr('disabled', false);
        },
        disable : function(){
            this.enabled = false;
            this.selectEl.addClass('disabled');
            this.selectEl.attr('disabled', true);
            this.bodyEl.detach();
        }


    }

});



