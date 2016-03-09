Class(CV, 'Check').inherits(Widget)({

	ELEMENT_CLASS : 'cv-check',

    HTML : '\
        <div>\
            <input type="checkbox">\
            <span class="label"></span>\
        </div>\
    ',

    prototype        : {
        id              : null,
        type            : null,
        style           : null,
        label           : null,

        init : function(config){
            Widget.prototype.init.call(this, config);
            this.labelEl = this.element.find('.label');
            this.checkboxEl = this.element.find('input');

            if (this.label){ this.labelEl.text(this.label) };

            this.element.attr('data-id', this.id);

            this.checkboxEl.on('click', function(){
                this.checked(this.checkboxEl);
            }.bind(this));
        },

        checked : function(check) {
            if (check[0].checked)
            {
                this.dispatch('checked');
            }else{
                this.dispatch('unchecked');
            }
        }

    }

});



