/* jshint multistr: true */
Class(CV, 'PostCreatorWriteArticleEditorCoverButton').inherits(Widget)({

    HTML : '<button class="editor-add-cover cv-button tiny primary -abs">Add Cover</button>\
			<input type="file" name="image" accept="image/.jpg,.png,.jpeg" class="image-input -hide"/>\
    	',

    prototype : {
    	button : null,
    	inputBtn : null,
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.button = this.element[0];
            this.inputBtn = this.element[1];

            this._bindEvents();
        },
        _bindEvents : function _bindEvents(){
        	this._buttonClickHandlerRef = this._buttonClickHandler.bind(this);
        	$(this.button).on('click', this._buttonClickHandlerRef);

        	this._uploadFileRef = this._uploadFile.bind(this);
        	$(this.inputBtn).on('change', this._uploadFileRef);
        },

        _buttonClickHandler : function _buttonClickHandler(){
        	$(this.inputBtn).click();
        },

        _uploadFile : function _uploadFile(){
        	this.dispatch('fileUploaded', {data: this.inputBtn.files[0]});    	
        },
    }
});
