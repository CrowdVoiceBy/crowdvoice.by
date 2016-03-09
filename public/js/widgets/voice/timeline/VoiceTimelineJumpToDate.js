/* global App */
var moment = require('moment')
  , GeminiScrollbar = require('gemini-scrollbar')
  , Events = require('./../../../lib/events')
  , inlineStyle = require('./../../../lib/inline-style');

Class(CV, 'VoiceTimelineJumpToDate').inherits(Widget)({
  prototype: {
    /* OPTIONS */
    postsCount: 0,
    container: null,

    /* PRIVATE */
    el: null,
    _optionChilds: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._optionChilds = [];
      this._autoSetup()._bindEvents();
    },

    _autoSetup: function _autoSetup() {
      this.appendChild(new CV.PopoverBlocker({
        name: 'jumpToDatePopover',
        className: 'voice-timeline-popover',
        title: 'Jump to',
        placement: 'bottom',
        showCloseButton: true,
        hasScrollbar: true
      })).render(this.container);

      this.__createJumpToDateOptions(this.postsCount);

      return this;
    },

    /* Creates the menu options for all years and months including the total post counters.
     * @method __createJumpToDateOptions <private> [Function]
     */
    __createJumpToDateOptions: function __createJumpToDateOptions(postsCount) {
      var frag = document.createDocumentFragment()
        , _lastYear, optionWidget;

      Object.keys(postsCount).sort(function (a, b) {
        return a < b;
      }).forEach(function(year) {
        Object.keys(postsCount[year]).sort(function (a, b) {
          return a < b;
        }).forEach(function (month) {
          var date = moment(year + '-' + month + '-01', 'YYYY-MM-DD')
            , dateString = date.format('YYYY-MM')
            , monthString = date.format('MMMM');
          if (_lastYear !== year) {
            _lastYear = year;
            this.appendChild(new CV.VoiceTimelineJumpToDateLabel({
              name: 'label_' + year,
              label: year
            }));
            frag.appendChild(this['label_' + year].el);
          }
          optionWidget = new CV.VoiceTimelineJumpToDateItem({
            name: 'item_' + dateString,
            label: monthString,
            date: dateString,
            page: postsCount[year][month].page,
            totalPosts: postsCount[year][month].count
          });
          this.appendChild(optionWidget);
          this._optionChilds.push(optionWidget);
          frag.appendChild(optionWidget.el);
        }, this);
      }, this);

      this.jumpToDatePopover.getContent().className += ' ui-vertical-list hoverable';
      this.jumpToDatePopover.setContent(frag);
      this.scrollbar = new GeminiScrollbar({
        element: this.jumpToDatePopover.getContent()
      }).create();
    },

    /* Attach event handlers
     * @method _bindEvents <private> [Function]
     */
    _bindEvents: function _bindEvents() {
      // this._activatePopoverRef = this._activatePopover.bind(this);
      // Events.on(this.container, 'click', this._activatePopoverRef);
      this._handleActivateRef = this._handleActivate.bind(this);
      this.bind('jumpto:popover:position', this._handleActivateRef);
      this._handleDeactivateRef = this._handleDeactivate.bind(this);
      this.jumpToDatePopover.bind('deactivate', this._handleDeactivateRef);

      return this;
    },

    _activatePopover: function _activatePopover(ev) {
      this.jumpToDatePopover.activate();
      inlineStyle(this.jumpToDatePopover.el, {
        left: ev.pageX + 'px'
      });
      this.dispatch('jumpto:popover:position');
    },

    /* Popover activate handler
     * @method _handleActivate <private> [Function]
     */
    _handleActivate: function _handleActivate() {
      var popover = this.jumpToDatePopover.el;
      var left = popover.offsetLeft;
      var width = popover.offsetWidth;
      var farRight = left + width;
      var w = window.innerWidth;
      var diff = farRight - w;

      if (diff > 0) {
        var transform = 'translateX(' + ((diff + 10) * -1) + 'px)';
        inlineStyle(popover, {
          msTransform: transform,
          webkitTransform: transform,
          transform: transform
        });
      }

      if (left < 0) {
        popover.style.left = '10px';
      }

      this.parent.activate();
      this.updateActivateOption(App.Voice.voicePostLayersManager.getCurrentMonthLayer().page);
      this.scrollbar.update();
    },

    /* Popover deactivate handler
     * @method _handleDeactivate <private> [Function]
     */
    _handleDeactivate: function _handleActivate() {
      this.parent.deactivate();
      this.jumpToDatePopover.el.style.msTransform = '';
      this.jumpToDatePopover.el.style.webkitTransform = '';
      this.jumpToDatePopover.el.style.transform = '';
      this.jumpToDatePopover.arrowElement.style.transform = '';
    },

    /* Deactivate any active option and activates the first one that matches
     * the passed pageString with it’s prop `page`.
     * @public
     * @param {string} pageString - @ex `1`
     * @return {Object} VoiceTimelineJumpToDate
     */
    updateActivateOption: function updateActivateOption(pageString) {
      this._optionChilds.map(function(child) {
        child.deactivate();
        return child;
      }).some(function (option) {
        if (option.page === pageString) {
          option.activate();
          return true;
        }
      });
      return this;
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);

      this.jumpToDatePopover.unbind('activate', this._handleActivateRef);
      this._handleActivateRef = null;
      this.jumpToDatePopover.unbind('deactivate', this._handleDeactivateRef);
      this._handleDeactivateRef = null;

      this.postsCount = null;
      this.container = null;

      this.el = null;
      this._optionChilds = [];
    }
  }
});
