Class(CV, 'Block').inherits(Widget)({

	ELEMENT_CLASS : 'cv-form-report',

    HTML : '\
        <div>\
	        <form>\
		        <div class="-col-12 placeholder-main center">\
		        <p>Blocking means that you will not be able to find any information, communicate with or perform any actions related to this user or organization. It is reversible via your account settings.</p>\
		        <br>\
		        <p><b>Are you sure you want to block this user/organization?</b></p>\
		        <br>\
		        </div>\
		        <div class="-col-12">\
		        	 <div class="-col-6 -pr1 placeholder-dont"></div>\
		        	 <div class="-col-6 -pl1 placeholder-block"></div>\
		        </div>\
	        </form>\
        </div>\
    ',

    prototype        : {
        type            : null,
        style           : null,
        voices          : null,

        init : function(config){
            Widget.prototype.init.call(this, config);

			new CV.UI.Button({
			    name : 'buttonSend',
			    className : 'full',
			    data : {value: 'Don\'t Block'}
			}).render(this.element.find('.placeholder-dont'));

            new CV.UI.Button({
			    name   : 'buttonSend',
			    className   : 'primary full',
			    data : {value: 'Block'}
			}).render(this.element.find('.placeholder-block'));

        }

    }

});
