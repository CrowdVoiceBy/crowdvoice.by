/* Help/Support - Help Desk Iframe */

Class(CV, 'HelpDeskOverlay').inherits(Widget)({
	HTML : '\
		<div class="help-desk-background"></div>\
		<div class="help-desk-overlay">\
			<div class="header">\
				<h3 class="title">Help/Support</h3>\
				<div class="line"></div>\
			</div>\
			<script type="text/javascript" src="https://d3itxuyrq7vzpz.cloudfront.net/assets/reamaze.js"></script>\
			<script type="text/javascript">var _support = _support || { "ui": {}, "user": {} };_support["account"] = "crowdvoice";</script>\
			<div data-reamaze-embed="kb"></div>\
		</div>\
	',

	prototype:{
		init : function init(config) {
			Widget.prototype.init.call(this, config);

			this.el = this.element;
			this.closeBtn = this.el.find('.header');

			this.appendChild(new CV.UI.Close({
                name : 'closeButton',
                className : '-abs',
                svgClassName : '-s16'
            })).render(this.closeBtn);

            this._bindEvents();
		},

		_bindEvents : function _bindEvents() {
			this.closeButton.el.addEventListener('click', this.deactivate.bind(this));
		}
	}
});
  