Class(CV, 'Report').inherits(Widget)({

	ELEMENT_CLASS : 'cv-form-report',

    HTML : '<div></div>',

    FORM : '\
	        <form>\
		        <div class="-col-12 placeholder-main">\
		        </div>\
		        <div class="-col-12 placeholder-send"></div>\
	        </form>\
    ',

    SENT : '\
        <div class="sent-form">\
        <h2>The report has been sent!</h2>\
        <p>We will review it as soon as possible and may contact with a response.</p>\
        <br>\
        <button class="cv-button ok small">Ok</button>\
        </div>\
    ',

    REPORTED : '\
        <div class="sent-form">\
        <h2>This organization has been already reported.</h2>\
        <p>Please wait until the report is reviewed and you may get a response.</p>\
        <br>\
        <button class="cv-button ok small">Ok</button>\
        </div>\
    ',

    prototype        : {
        type            : null,
        style           : null,
        voices          : null,
        reportTitle 	: "",

        init : function(config){
            Widget.prototype.init.call(this, config);

			this.setup();
        },

        setup : function (){
        	var report = this;
        	this.element.empty();
            this.element.append(this.constructor.FORM);

            var allVoices = {
			  "1": {label: 'This Organization is not authorized/official.', name: 'report1', active: true},
			  "2": {label: 'I am the owner of this organization.', name: 'report2'},
			  "3": {label: 'This same organization already exists.', name: 'report3'}
			};

			var reportOptions = new CV.Select({
			  	label 		: 'Select one',
			  	name  		: 'select',
			  	style 		: 'full',
			  	options 	: allVoices,
			  	hasTitle 	: true,
		    	title 		: "Why are you reporting?"
			}).render(this.element.find('.placeholder-main'));

			reportOptions.report1.on('click', function(){
				report.reportTitle = reportOptions.optionSelected.label;
			});

			reportOptions.report2.on('click', function(){
				report.reportTitle = reportOptions.optionSelected.label;
			});

			reportOptions.report3.on('click', function(){
				report.reportTitle = reportOptions.optionSelected.label;
			});

        	new CV.Input({
			    type    	: '',
			    name  		: '',
			    style 		: '',
			    isArea 		: true,
			    hasTitle 	: true,
			    title 		: "State your case",
			    subTitle 	: "Be as detailed as possible"
			}).render(this.element.find('.placeholder-main'));

            var formButton = new CV.UI.Button({
			    name    : 'buttonSend',
			    className   : 'primary full',
			    data : {value : 'Submit Request'}
			}).render(this.element.find('.placeholder-send'));

			formButton.element.click(function(e){
                e.preventDefault();
                this.sendMessage();
            }.bind(this));

        },

        sendMessage : function(){
        	var sendmessage = this;

            var textData = {
                message : this.reportTitle + ' ' + this.element.find('form textarea').val()
            };

            $.ajax({
                method : 'POST',
                url : '/' + this.data.profileName + '/report',
                headers: { 'csrf-token': $('meta[name="csrf-token"]').attr('content') },
                data : textData,
                success : function(data) {
                	console.log(data);
                    sendmessage.element.find('form').remove();
                    if (data.status === 'ok'){
                    	sendmessage.element.append(sendmessage.constructor.SENT);
                	}else {
                    	sendmessage.element.append(sendmessage.constructor.REPORTED);
                	}
                    sendmessage.element.find('button').on('click', function(){
                        sendmessage.dispatch('close');
                        sendmessage.setup();
                    });
                },
                error : function(data) {
                  console.error(data);
                }
            });

        }

    }

});
