/* Help/Support - Help Desk Iframe */

Class(CV.UI, 'EmbedOverlayIframe').inherits(Widget)({
	ELEMENT_CLASS : 'cv-embed-iframe-wraper__main',
	HTML : '\
		<div>\
			<div class="iframe-container"><iframe></iframe></div>\
			<p><i></i></p>\
		</div>\
	',

	prototype:{
		iframeUrl : null,
		description : null,
		init : function init(config) {
			Widget.prototype.init.call(this, config);

			this.el = this.element[0];
			this.iframeContainer = this.el.querySelector('iframe');
			this.adviceContainer = this.el.querySelector('i');

			//this.iframeContainer.setAttribute('onload', this.updateUrl);
			this.adviceContainer.innerHTML = this.description;
		},

		updateUrl : function updateUrl(url){
			this.iframeContainer.src = url;

			var iframe = this.iframeContainer;
			var scope = this;
			$(this.iframeContainer).load(function(){
				var iframeContent = iframe.contentWindow.document;
	    
	      setTimeout(function(){ 
	      	scope.activate();
	      	var anchors = iframeContent.getElementsByTagName('a');
	      	for(var i=0; i < anchors.length; i++){
	      		anchors[i].setAttribute('href', 'javascript:;'); 
	      	}
	      	scope.dispatch('removeLoader');
	      }, 50);

			});
		}
	}
});
  