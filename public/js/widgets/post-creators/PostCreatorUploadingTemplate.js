/* jshint multistr: true */
Class(CV, 'PostCreatorUploadingTemplate').inherits(Widget)({
    HTML : '\
        <div class="cv-post-creator__uploading-template -rel -br1">\
        </div>\
    ',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.appendChild(new CV.Loading({
                name : 'loader'
            })).render(this.element).center();
        }
    }
});
