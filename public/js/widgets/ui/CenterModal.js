var transitionEnd = require('./../../lib/ontransitionend');

Class(CV.UI, 'CenterModal').inherits(Widget)({
    ELEMENT_CLASS : 'cv-center-modal-container ui-modal',

	HTML : '\
		<div>\
			<div class="cv-modal__backdrop"></div>\
			<div class="cv-modal__inner">\
				<div class="cv-center-modal">\
					<div class="cv-center-modal__header">\
						<h3 class="title"></h3>\
					</div>\
					<div class="body-wrapper">\
						<div class="body">\
                        </div>\
					</div>\
				</div>\
			</div>\
		</div>\
	',

	prototype : {
		title : null,
		buttonLabel : null,
		imageContent : null,
        textContent : null,
        checkbox : null,
        checkboxCookieName : null,

		init : function(config){
			Widget.prototype.init.call(this, config);

			this.el = this.element[0];

			this.innerElement = this.el.querySelector('.cv-modal__inner');
			this.bodyElement = this.el.querySelector('.body');
			this.modalElement = this.el.querySelector('.cv-center-modal');
			this.titleElement = this.el.querySelector('.title');

			this._setup()._bindEvents();
		},

		_setup : function _setup(){
            this.titleElement.innerHTML = this.title;

            if(this.imageContent !== null){
                var imageContainer = document.createElement('img');
                imageContainer.setAttribute('src', this.imageContent);
                this.bodyElement.appendChild(imageContainer);
            }

            if(this.textContent !== null){
                var textContainer = document.createElement('p');
                textContainer.innerHTML = this.textContent;
                this.bodyElement.appendChild(textContainer);
            }

            this.appendChild(new CV.UI.Button({
                name : 'closeButton',
                className : 'primary',
                data : {value: this.buttonLabel }
            })).render(this.bodyElement);

            if (this.checkbox !== null){
                this.appendChild(new CV.UI.Checkbox({
                    name : 'cookieCheckbox',
                    data : {label : 'Don’t show this again' }
                })).render(this.bodyElement);

                this.cookieCheckbox.activate();
            }
            
            
            return this;
		},

        _bindEvents : function _bindEvents(){
            this.closeButton.el.addEventListener('click', this._closeModal.bind(this));
            this.innerElement.addEventListener('click', this._backgroundClickHandler.bind(this));

            if(this.checkbox !== null){
                this.cookieCheckbox.bind('changed', this._checkHandler.bind(this));
            }
            
        },

        _closeModal : function _closeModal(){
            this.deactivate();
            transitionEnd(this.modalElement, function() {
                this.destroy();
            }.bind(this));
        },

        _checkHandler : function _checkHandler(){
            document.cookie = this.checkboxCookieName+"=false";
        },

        _backgroundClickHandler : function _backgroundClickHandler(ev){
            if(ev.target === this.innerElement){
                this._closeModal();
            }
        },

        destroy : function destroy(){
            Widget.prototype.destroy.call(this); 
            return null;
        }
	}
});