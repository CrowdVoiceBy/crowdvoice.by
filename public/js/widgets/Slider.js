var Events = require('./../lib/events');
var ScrollTo = require('./../lib/scrollto');

Class(CV, 'Slider').inherits(Widget)({
  ARROWS_HTML: '\
    <div class="slider-arrow-wrapper -prev">\
      <button class="slider-arrow slider-prev">\
        <svg class="slider-arrow-svg">\
          <use xlink:href="#svg-arrow-left"></use>\
        </svg>\
      </button>\
    </div>\
    <div class="slider-arrow-wrapper -next">\
      <button class="slider-arrow slider-next">\
        <svg class="slider-arrow-svg">\
          <use xlink:href="#svg-arrow-right"></use>\
        </svg>\
      </button>\
    </div>',

  prototype: {
    appendArrowsTo: null,
    appendDotsTo: null,
    itemsWidth: null,

    /* @param {Object} config
     * @property {NodeElement} config.appendArrowsTo
     * @property {Number} config.itemsWidth
     */
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      if (this.appendArrowsTo) {
        this._appendArrows(this.appendArrowsTo);
      }

      if (this.appendDotsTo) {
        this._appendDots(this.appendDotsTo);
      }

      this.sliderElement = this.el.querySelector('.slider-list');
      this.itemElements = this.sliderElement.querySelectorAll('.slider-item');
      this.itemsLen = this.itemElements.length;

      return this;
    },

    _bindEvents: function _bindEvents() {
      Events.on(window, 'resize', this.update.bind(this));

      if (this.prevButton) {
        this._prevButtonClickHandlerRef = this._prevButtonClickHandler.bind(this);
        Events.on(this.prevButton, 'click', this._prevButtonClickHandlerRef);

        this._nextButtonClickHandlerRef = this._nextButtonClickHandler.bind(this);
        Events.on(this.nextButton, 'click', this._nextButtonClickHandlerRef);
      }

      if (this.dotsWrapper) {
        this._dotsClickHandlerRef = this._dotsClickHandler.bind(this);
        Events.on(this.dotsWrapper, 'click', this._dotsClickHandlerRef);
      }
    },

    update: function update() {
      var sliderWidth = this.sliderElement.getBoundingClientRect().width;
      var slidesNumber = 1;

      if (this.itemsWidth) {
        if (sliderWidth > this.itemsWidth) {
          slidesNumber = Math.floor(sliderWidth / this.itemsWidth);
        }
      }

      this.index = 0;
      this._totalSlides = Math.ceil(this.itemsLen / slidesNumber) - 1;

      if (this.appendDotsTo) {
        this._createDots();
      }

      this._slidesShown = slidesNumber;
      this._updatePosition();

      return this;
    },

    _updatePosition: function _updatePosition() {
      var x = Math.abs(this.index * 100);

      if (this.index > 0) {
        x = (this._slidesShown * this.index + 1);
      }

      x = (x * this.itemsWidth);

      this._updateControls();

      ScrollTo(this.sliderElement.parentNode, {
        x: x,
        duration: 400
      });
    },

    _updateControls: function _updateControls() {
      if (this.appendDotsTo && this.dotsWrapper.childElementCount) {
        for (var i = 0; i < this.dotsWrapper.childElementCount; i++) {
          this.dotsWrapper.childNodes[i].classList.remove('active');
        }

        this.dotsWrapper.childNodes[this.index].classList.add('active');
      }

      if (this.index === 0) {
        this.prevButton.setAttribute('disabled', true);
        this.prevButton.classList.add('disabled');
      } else {
        this.prevButton.removeAttribute('disabled');
        this.prevButton.classList.remove('disabled');
      }

      if (this.index === this._totalSlides) {
        this.nextButton.setAttribute('disabled', true);
        this.nextButton.classList.add('disabled');
      } else {
        this.nextButton.removeAttribute('disabled');
        this.nextButton.classList.remove('disabled');
      }
    },

    /* Add the arrows inside the specified element.
     * @private
     * @param {NodeElement} element - the element to append the arrows to.
     */
    _appendArrows: function _appendArrows(element) {
      element.insertAdjacentHTML('beforeend', this.constructor.ARROWS_HTML);
      this.prevButton = element.querySelector('.slider-prev');
      this.nextButton = element.querySelector('.slider-next');
    },

    /* Add the dots inside the specified element.
     * @private
     * @param {NodeElement} element - the element to append the dots to.
     */
    _appendDots: function _appendDots(element) {
      this.dotsWrapper = document.createElement('div');
      this.dotsWrapper.className = 'slider-dots';
      element.appendChild(this.dotsWrapper);
    },

    _createDots: function _createDots() {
      var fragment = document.createDocumentFragment();
      var i = 0;

      this.dotsWrapper.innerHTML = "";

      if (!this._totalSlides) {
        return this;
      }

      for (i = 0; i <= this._totalSlides; i++) {
        var dot = document.createElement('button');
        fragment.appendChild(dot);
      }

      this.dotsWrapper.appendChild(fragment);

      fragment = null;

      return this;
    },

    /* Handles the `previous` button click.
     * @private
     */
    _prevButtonClickHandler: function _prevButtonClickHandler() {
      if (this.index <= 0) { return; }

      this.index--;
      this._updatePosition();
    },

    /* Handles the `next` button click.
     * @private
     */
    _nextButtonClickHandler: function _nextButtonClickHandler() {
      if (this.index >= this._totalSlides) { return; }

      this.index++;
      this._updatePosition();
    },

    _dotsClickHandler: function _dotsClickHandler(ev) {
      var child = ev.target;
      var i = 0;

      if (child.nodeName !== "BUTTON") {return;}
      while((child = child.previousSibling) != null) {i++;}

      if (i === this.index) {return;}

      this.index = i;
      this._updatePosition();
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);

      Events.off(window, 'resize', this.update.bind(this));

      if (this.prevButton) {
        Events.off(this.prevButton, 'click', this._prevButtonClickHandlerRef);
        this._prevButtonClickHandlerRef = null;

        Events.off(this.nextButton, 'click', this._nextButtonClickHandlerRef);
        this._nextButtonClickHandlerRef = null;
      }

      if (this.dotsWrapper) {
        Events.off(this.dotsWrapper, 'click', this._dotsClickHandlerRef);
        this._dotsClickHandlerRef = null;
      }

      return null;
    }
  }
});
