var Clipboard = require('clipboard');
var Origin = require('get-location-origin');
require('jquery-colpick');

Class(CV.UI, 'EmbedOverlay').inherits(Widget)({
  ELEMENT_CLASS : 'cv-embed-overlay-main',
  HTML: '\
    <div>\
      <div class="cv-embed-overlay__background"></div>\
      <div class="cv-embed_overlay_main">\
        <div class="cv-embed-overlay__body">\
            <div class="cv-embed-overlay__iframe">\
              <div class="cv-embed-iframe-wraper">\
              </div>\
            </div>\
            <div class="cv-embed-overlay__options">\
              <p class="cv-embed-overlay__title ">Widget Settings</p>\
              <div class="cv-embed-overlay__height ui-form-field">\
                <p class="option-title ui-input__label -upper -font-bold">Widget Height:</p>\
              </div>\
              <div class="cv-embed-overlay__view ui-form-field">\
                <p class="option-title ui-input__label -upper -font-bold">Default view:</p>\
              </div>\
              <div class="cv-embed-overlay__theme ui-form-field">\
                <p class="option-title ui-input__label -upper -font-bold">Theme</p>\
              </div>\
              <div class="cv-embed-overlay__accent ui-form-field">\
                <p class="option-title ui-input__label -upper -font-bold">Pick Accent Color</p>\
                <div class="input-background" >\
                <input class="color" type="text" value="#ff9400" disabled>\
                  <svg class="ui-dropwdown-arrow">\
                    <use xlink:href="#svg-arrow-down"></use>\
                  </svg>\
                </div>\
              </div>\
              <div class="cv-embed-overlay__share"></div>\
              <div class="cv-embed-overlay__code"></div>\
            </div>\
        </div>\
      </div>\
    </div>\
  ',

  prototype : {
    defaultViewValue : 'cards',
    changeViewValue : false,
    voiceDescriptionValue : false,
    voiceBackgroundValue : false,
    enableShareValue : false,
    widgetHeightValue : '400',
    widgetThemeValue : 'light',
    accentValue : 'ff9400',
    iframeUrl : null,

    init : function(config) {
      Widget.prototype.init.call(this, config);

      this.el = this.element[0];
      this.embedWidgetBackground = this.el.querySelector('.cv-embed_overlay_main');

      this.embedWidgetContainer = this.el.querySelector('.cv-embed-overlay__iframe');
      this.iframeInner = this.el.querySelector('.cv-embed-iframe-wraper');

      this.optionsContainer = this.el.querySelector('.cv-embed-overlay__options');
      this.optionHeight = this.optionsContainer.querySelector('.cv-embed-overlay__height');
      this.optionView = this.optionsContainer.querySelector('.cv-embed-overlay__view');
      this.optionTheme = this.optionsContainer.querySelector('.cv-embed-overlay__theme');
      this.optionAccent = this.optionsContainer.querySelector('.cv-embed-overlay__accent');
      this.inputBackground = this.optionAccent.querySelector('.input-background');
      this.inputSVG = this.inputBackground.querySelector('svg');
      this.optionShare = this.optionsContainer.querySelector('.cv-embed-overlay__share');
      this.optionCode = this.optionsContainer.querySelector('.cv-embed-overlay__code');

      this._setup()._bindEvents();
      this._checkHandler();

      this.clipboard = new Clipboard(this.codeClipboardButton.el);

    },

    _setup : function _setup() {

      this.appendChild(new CV.UI.EmbedOverlayIframe({
        name : 'embedableIFrame',
        description : 'Widget Width is set to 100% (min width 320 px)'
      })).render(this.iframeInner);

      this.appendChild(new CV.Loading({
        name : 'loader'
      })).render(this.iframeInner);

      this.appendChild(new CV.UI.Close({
        name : 'closeButton',
        className : '-clickable -color-white -abs cv-embed-overlay__closebtn',
        svgClassName : '-s18'
      })).render(this.embedWidgetBackground);

      /*
       * Widget Height Radios
       */
      this.appendChild(new CV.UI.Radio({
        name : 'shortRadio',
        data : {
          label : 'Short',
          checked : true,
          attr : {
            name : 'heightRadios',
            value : '400'
          }
        }
      })).render(this.optionHeight);

      this.shortPixels = document.createElement('i');
      this.shortPixels.innerHTML = '400px';

      this.shortRadio.el.querySelector('.ui-radio-label').appendChild(this.shortPixels);

      this.appendChild(new CV.UI.Radio({
        name : 'mediumRadio',
        data : {
          label : 'Medium',
          checked : false,
          attr : {
            name : 'heightRadios',
            value : '500'
          }
        }
      })).render(this.optionHeight);

      this.mediumPixels = document.createElement('i');
      this.mediumPixels.innerHTML = '500px';

      this.mediumRadio.el.querySelector('.ui-radio-label').appendChild(this.mediumPixels);


      this.appendChild(new CV.UI.Radio({
        name : 'tallRadio',
        data : {
          label : 'Tall',
          checked : false,
          attr : {
            name : 'heightRadios',
            value : '650'
          }
        }
      })).render(this.optionHeight);

      this.tallPixels = document.createElement('i');
      this.tallPixels.innerHTML = '650px';

      this.tallRadio.el.querySelector('.ui-radio-label').appendChild(this.tallPixels);

      /*
       * Default View Radios
       */
      this.appendChild(new CV.UI.Radio({
        name : 'cardView',
        data : {
          label : 'Cards',
          checked : true,
          attr : {
            name : 'viewRadios',
            value : 'cards'
          }
        }
      })).render(this.optionView);

      this.appendChild(new CV.UI.Radio({
        name : 'listView',
        data : {
          label : 'List',
          checked : false,
          attr : {
            name : 'viewRadios',
            value : 'list'
          }
        }
      })).render(this.optionView);

      this.appendChild(new CV.UI.Checkbox({
        name : 'changeView',
        data : {
          label : 'Allow users to change view',
          checked : true,
          attr : {
            name : 'viewRadios',
            value : 'true'
          }
        }
      })).render(this.optionView);

      this.appendChild(new CV.UI.Checkbox({
        name : 'showDescription',
        data : {
          label : 'Show Voice Description',
          checked : false,
          attr : {
            name : 'viewRadios',
            value : 'true'
          }
        }
      })).render(this.optionView);

      /*
       * Theme radios
       */
      this.appendChild(new CV.UI.Radio({
        name : 'lightTheme',
        data : {
          label : 'Light',
          checked : true,
          attr : {
            name : 'themeRadios',
            value : 'light'
          }
        }
      })).render(this.optionTheme);

      this.appendChild(new CV.UI.Radio({
        name : 'darkTheme',
        data : {
          label : 'Dark',
          checked : false,
          attr : {
            name : 'themeRadios',
            value : 'dark'
          }
        }
      })).render(this.optionTheme);

      this.appendChild(new CV.UI.Checkbox({
        name : 'voiceBackgrond',
        data : {
          label : 'Include voice background',
          checked : true,
          attr : {
            name : 'themeRadios',
            value : 'true'
          }
        }
      })).render(this.optionTheme);

      /*
       * Accent Color Picker
       */
      this.inputAccent = this.optionAccent.querySelector('input');

      $(this.inputBackground).colpick({
        color : 'ff9400',
        onChange : function(hsb, hex, rgb, el){
          var input = $(el).children('.color');
          input.val('#'+hex).trigger('changed');
        },
        submit : false,
        layout : 'full'
      });

      /*
       * Allow to share Radios
       */
      this.appendChild(new CV.UI.Checkbox({
        name : 'allowShare',
        data : {
          label : 'Allow to share',
          checked : true,
          attr : {
            name : 'shareRadio',
            value : 'true'
          }
        }
      })).render(this.optionShare);

      /*
       * Code snippet
       */
      this.appendChild(new CV.Input({
        name : 'codeClipboard',
        type : 'textarea',
        isArea : true,
        placeholder : 'Embedding code...'
      })).render(this.optionCode);

      this.codeClipboard.inputEl[0].querySelector('textarea').value = '<iframe style="height: 400px; width: 100%;" src="' + this.iframeUrl +' "></iframe>';
      this.codeClipboard.inputEl[0].querySelector('textarea').setAttribute('readonly', 'true');

      this.appendChild(new CV.UI.Button({
        name : 'codeClipboardButton',
        data : {
          value : 'Copy to clipboard',
          attr : {
            class : 'primary cv-button full'
          }
        }
      })).render(this.optionCode);

      this.codeClipboardButton.el.setAttribute('data-clipboard-text', '<iframe style="height: 400px; width: 100%;" src="' + location.protocol +'//' + location.hostname + this.iframeUrl +' "></iframe>');

      $(document.body).addClass('embed-no-scroll');

      return this;
    },

    _bindEvents : function _bindEvents(){
      this._checkHandlerRef = this._checkHandler.bind(this);
      this._deactivateOverlayRef = this._deactivateOverlay.bind(this);

      this.closeButton.bind('click', this._deactivateOverlayRef);

      this.shortRadio.bind('changed', this._checkHandlerRef);
      this.mediumRadio.bind('changed', this._checkHandlerRef);
      this.tallRadio.bind('changed', this._checkHandlerRef);

      this.cardView.bind('changed', this._checkHandlerRef);
      this.listView.bind('changed', this._checkHandlerRef);
      this.changeView.bind('changed', this._checkHandlerRef);
      this.showDescription.bind('changed', this._checkHandlerRef);

      this.lightTheme.bind('changed', this._checkHandlerRef);
      this.darkTheme.bind('changed', this._checkHandlerRef);
      this.voiceBackgrond.bind('changed', this._checkHandlerRef);

      this.allowShare.bind('changed', this._checkHandlerRef);

      $(this.inputAccent).bind('changed', this._checkHandlerRef);

      this.codeClipboardButton.el.addEventListener('click', this._copyToClipboard.bind(this));

      this.embedableIFrame.bind('removeLoader', this._disableLoader.bind(this));

    },

    _deactivateOverlay : function _deactivateOverlay(){
      $(document.body).removeClass('embed-no-scroll');
      this._destroy();
    },

    _checkHandler : function _checkHandler(){
      var hexColor = this.inputAccent.value.replace("#","");
      var background = this.inputBackground;
      var SVG = this.inputSVG;
      this.accentValue = hexColor;

      if ( this.accentValue === 'ffffff' || this.accentValue === 'FFFFFF' ){
        background.style.color = '#a1b0b3';
        SVG.style.fill = '#a1b0b3';
        SVG.style.color = '#a1b0b3';
      } else {
        background.style.color = '#FFFFFF';
        SVG.style.fill = '#FFFFFF';
        SVG.style.color = '#FFFFFF';
      }

      this.inputBackground.style.backgroundColor = '#' + this.accentValue;
      this.inputBackground.style.borderColor = '#' + this.accentValue;

      if (this.shortRadio.isChecked() === true ){
        this.widgetHeightValue = this.shortRadio.data.attr.value;
      } else if ( this.mediumRadio.isChecked() === true ){
        this.widgetHeightValue = this.mediumRadio.data.attr.value;
      } else {
        this.widgetHeightValue = this.tallRadio.data.attr.value;
      }

      if (this.cardView.isChecked() === true){
        this.defaultViewValue = this.cardView.data.attr.value;
      } else {
        this.defaultViewValue = this.listView.data.attr.value;
      }

      if (this.changeView.isChecked() === true){
        this.changeViewValue = this.changeView.data.attr.value;
      } else {
        this.changeViewValue = false;
      }

      if (this.showDescription.isChecked() === true){
        this.voiceDescriptionValue = this.showDescription.data.attr.value;
      } else {
        this.voiceDescriptionValue = false;
      }


      if (this.lightTheme.isChecked() === true){
        this.widgetThemeValue = this.lightTheme.data.attr.value;
      } else {
        this.widgetThemeValue = this.darkTheme.data.attr.value;
      }

      if (this.voiceBackgrond.isChecked() === true){
        this.voiceBackgroundValue = this.voiceBackgrond.data.attr.value;
      } else {
         this.voiceBackgroundValue = false;
      }

      if (this.allowShare.isChecked() === true){
        this.enableShareValue = this.allowShare.data.attr.value;
      } else {
        this.enableShareValue = false;
      }

      if (this.embedableIFrame.active === true){
        this.embedableIFrame.deactivate();
      }

      this._enableLoader();

      setTimeout(function(){
          this.iframeUrl = Origin + '/embed/' + App.Voice.data.owner.profileName + '/' + App.Voice.data.slug + '/?default_view=' + this.defaultViewValue + '&change_view=' + this.changeViewValue + '&description=' + this.voiceDescriptionValue + '&background=' + this.voiceBackgroundValue + '&share=' + this.enableShareValue + '&theme=' + this.widgetThemeValue + '&accent=' + this.accentValue;
          this.embedableIFrame.updateUrl(this.iframeUrl);

          this.codeClipboard.inputEl[0].querySelector('textarea').value = '<iframe style="height:' + this.widgetHeightValue + 'px; width: 100%;" src="' + this.iframeUrl + ' " frameBorder="0"></iframe>';
          this.codeClipboardButton.el.setAttribute('data-clipboard-text', '<iframe style="height:' + this.widgetHeightValue + 'px; width: 100%;" src="' + this.iframeUrl +' " frameBorder="0"></iframe>');
          this.codeClipboardButton.el.innerText = 'Copy to clipboard';
          this.codeClipboardButton.el.classList.add('primary');
          this.codeClipboardButton.el.classList.remove('positive');
          this.codeClipboardButton.el.disabled = false;

          this.iframeInner.style.height = this.widgetHeightValue + 'px';
          this.iframeInner.style.width = '100%';
      }.bind(this), 100);

    },

    _enableLoader : function _enableLoader(){
      this.loader.enable();
    },

    _disableLoader : function _disableLoader(){
      this.loader.disable();
    },

    _copyToClipboard : function _copyToClipboard(){
      var button = this.codeClipboardButton;
      var textarea = this.codeClipboard.inputEl[0].querySelector('textarea');

      this.codeClipboardButton.el.classList.remove('primary');
      this.codeClipboardButton.el.classList.add('positive');
      this.codeClipboardButton.el.disabled = true;

      this.clipboard.on('success', function(e) {
          button.el.innerText = 'Copied! Now paste the code into the HTML of your site.';
          e.clearSelection();
      });

      this.clipboard.on('error', function() {
         var instructions = null;

          if (navigator.appVersion.indexOf("Win")!== -1) {
              instructions = 'Press CTRL + C to copy! And paste the code into the HTML of your site.';
          } else if (navigator.appVersion.indexOf("Mac")!== -1) {
              instructions = 'Press ⌘ + C to copy! And paste the code into the HTML of your site.';
          }

          textarea.select();
          button.el.innerText = instructions;
      });
    },

    destroy : function destroy(){
      Widget.prototype.destroy.call(this);
      this._checkHandlerRef = null;
      this._deactivateOverlayRef = null;
      this.codeClipboardButton.el.removeEventListener('click', this._copyToClipboard.bind(this));

      return null;
    }

  }
});
