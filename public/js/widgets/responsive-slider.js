Class(CV, 'ResponsiveSlider').inherits(Widget)({
    HTML: '\
        <div class="widget-responsive-slider">\
          <div class="rs-list"></div>\
          <button class="rs-prev">\
            <svg class="rs-arrow rs-arrow-svg"><use xlink:href="#svg-arrow-left"></use></svg>\
          </button>\
          <button class="rs-arrow rs-next">\
            <svg class="rs-arrow-svg"><use xlink:href="#svg-arrow-right"></use></svg>\
          </button>\
          <div class="rs-dots"></div>\
        </div>\
    ',

    prototype : {

        arrows : true,
        dots : false,
        minSlideWidth : 0,

        index : 0,
        _slidesShown : 1,
        _totalSlides : 0,
        _itemsLen : 0,
        _window: null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element;
            this._window = window;

            this.sliderElement = this.el.querySelector('.rs-list');
            this.itemElements = this.sliderElement.querySelectorAll('.rs-item');
            this.dotsWrapper = this.el.querySelector('.rs-dots');
            this.prevButtonElement = this.el.querySelector('.rs-prev');
            this.nextButtonElement = this.el.querySelector('.rs-next');

            this.itemElements = this.sliderElement.querySelectorAll('.rs-item');
            this.itemsLen = this.itemElements.length;

            if (this.arrows) {
                this.prevButtonElement.classList.add('active');
                this.nextButtonElement.classList.add('active');
            }

            this._bindEvents()._setup();
        },

        _bindEvents : function _bindEvents() {
            this._window.addEventListener('resize', this._setup.bind(this));
            if (this.arrows) {
              this.prevButtonElement.addEventListener('click', this.prev.bind(this));
              this.nextButtonElement.addEventListener('click', this.next.bind(this));
            }
            if (this.dots) {
              this.dotsWrapper.addEventListener('click', this._dotsClickHandler.bind(this));
            }

            return this;
        },

        _setup : function _setup() {
            var sliderWidth = this.sliderElement.getBoundingClientRect().width;
            var slidesNumber = 1;

            if (this.minSlideWidth) {
                if (sliderWidth > this.minSlideWidth) {
                    slidesNumber = Math.floor(sliderWidth / this.minSlideWidth);
                }
            }

            this.index = 0;
            this._totalSlides = Math.ceil(this.itemsLen / slidesNumber) - 1;

            if (this.dots) {
              this._createDots();
            }

            this.updateSlidesWidth(slidesNumber);
            this.updatePosition();

            sliderWidth = slidesNumber = null;

            return this;
        },

        _dotsClickHandler : function _dotsClickHandler(ev) {
            var child = ev.target;
            var i = 0;

            if (child.nodeName !== "BUTTON") {return;}
            while((child = child.previousSibling) != null) {i++;}

            if (i === this.index) {return;}

            this.index = i;
            this.updatePosition();
        },

        _createDots : function _createDots() {
            var fragment = document.createDocumentFragment();
            var i = 0;

            this.dotsWrapper.innerHTML = "";
            for (i = 0; i <= this._totalSlides; i++) {
                var dot = document.createElement('button');
                fragment.appendChild(dot);
            }

            this.dotsWrapper.appendChild(fragment);

            fragment = null;

            return this;
        },

        _updateDots : function _updateDots() {
            if (!this.dots) {return this;}

            for (var i = 0; i < this.dotsWrapper.childElementCount; i++) {
                this.dotsWrapper.childNodes[i].classList.remove('active');
            }

            this.dotsWrapper.childNodes[this.index].classList.add('active');

            return this;
        },

        _updateButtons : function _updateButtons() {
            if (this.index === 0) {
                this.prevButtonElement.setAttribute('disabled', true);
                this.prevButtonElement.classList.add('disabled');
            } else {
                this.prevButtonElement.removeAttribute('disabled');
                this.prevButtonElement.classList.remove('disabled');
            }

            if (this.index === this._totalSlides) {
                this.nextButtonElement.setAttribute('disabled', true);
                this.nextButtonElement.classList.add('disabled');
            } else {
                this.nextButtonElement.removeAttribute('disabled');
                this.nextButtonElement.classList.remove('disabled');
            }

            return this;
        },

        prev : function prev() {
            if (this.index <= 0) {return this;}

            this.index--;

            return this.updatePosition();
        },

        next : function next() {
            if (this.index >= this._totalSlides) {return this;}

            this.index++;

            return this.updatePosition();
        },

        updateSlidesWidth : function updateSlidesWidth(numberOfSlides) {
            var slideWidth = 100 / numberOfSlides + '%';

            this._slidesShown = numberOfSlides;

            for (var i = 0; i < this.itemsLen; i ++) {
                this.itemElements[i].style.width = slideWidth;
            }

            return this;
        },

        updatePosition : function updatePosition() {
            var x, remainingPercentage, remain, missing;

            this._updateButtons()._updateDots();

            x = Math.abs(this.index * 100);
            remainingPercentage = 0;

            if (this.index > 0) {
                remain = this.itemsLen - ((this.index) * this._slidesShown);
            }

            if (remain < this._slidesShown) {
                missing = this._slidesShown - remain;
                remainingPercentage = (100 / (remain + missing)) * remain;
                x -= 100 - remainingPercentage;
            }

            x = x * -1;

            this.sliderElement.style.transform = 'translateX(' + x + '%)';

            return this;
        }
    }
});
