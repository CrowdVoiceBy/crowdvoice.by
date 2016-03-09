var rome = require('rome')
  , moment = require('moment')
  , Events = require('./../../../lib/events');

Class(CV, 'EditablePostTweet').inherits(CV.PostTweet)({
  HTML_DATE_PICKER: '\
    <div class="post-edit-date-picker -inline-block">\
      <button class="post-date-picker-button cv-button primary micro -m0 -float-right">\
        <svg class="post-edit-date-picker-calendar -color-white">\
          <use xlink:href="#svg-calendar"></use>\
        <svg>\
      </button>\
      <div class="-overflow-hidden">\
        <input class="cv-input micro"/>\
      </div>\
    </div>',

  prototype: {
    init: function init(config) {
      CV.PostTweet.prototype.init.call(this, config);
    },

    /* @public
     */
    edit: function edit() {
      this.dom.addClass(this.el, ['post-editable', 'edit-mode']);

      // add the date picker
      this.dateTimeElement.style.display = 'none';
      this.dateTimeElement.parentNode.insertAdjacentHTML('beforeend', this.constructor.HTML_DATE_PICKER);
      this.timePickerInput = this.dateTimeElement.parentNode.querySelector('.cv-input');
      this.timePickerButton = this.dateTimeElement.parentNode.querySelector('.post-date-picker-button');
      this.romeTime = rome(this.timePickerInput, {
        inputFormat: 'DD MMM, YYYY HH:mm',
        initialValue: moment(this.publishedAt || new Date())
      });

      this._bindEditEvents();
      return this;
    },

    /* @public
     */
    addImageControls: function addImageControls() {
      return this;
    },

    /* @public
     */
    unedit: function unedit() {
      Events.off(this.timePickerButton, 'click', this._showDatePickerRef);
      Events.off(this.romeTime.associated, 'click', this._showDatePickerRef);
      this._showDatePickerRef = null;
      this.romeTime.destroy();
      return this;
    },

    /* Returns the new Post modified data.
     * @public
     * @returns {Object} Modified Post Data
     */
    getEditedData: function getEditedData() {
      return {
        title: this.title,
        description: this.description,
        publishedAt: this.romeTime.getDate(),
        sourceType: this.sourceType,
        sourceService: this.sourceService,
        sourceUrl: this.sourceUrl,
        extras: this.extras
      };
    },

    /* Adds the delete post button (for moderation management)
     * @public
     * @return EditablePostTweet
     */
    addRemoveButton: function addRemoveButton() {
      this.appendChild(new CV.PostModerateRemoveButton({
        name: 'removeButton',
        postId: this.id,
        className: '-m0'
      }));
      this.el.appendChild(this.removeButton.el);
      return this;
    },

    /* Adds the publish post button (for moderation management)
     * @public
     */
    addButtonRow: function addButtonRow() {
      var buttonRow = document.createElement('div');
      buttonRow.className = 'post-moderate-button-row';
      this.el.classList.add('has-bottom-actions');

      this.appendChild(new CV.PostModeratePublishButton({
        name: 'publishButton',
        postId: this.id,
        className: '-m0'
      })).render(buttonRow);

      this.appendChild(new CV.PostModerateOriginalButton({
        name: 'viewOriginal',
        originalUrl: this.sourceUrl,
      })).render(buttonRow);

      this.el.appendChild(buttonRow);
      return this;
    },

    /* Binds the required events when the edit method is run.
     * @private
     * @return EditablePostTweet
     */
    _bindEditEvents: function _bindEditEvents() {
      this._showDatePickerRef = this._showDatePicker.bind(this);
      Events.on(this.timePickerButton, 'click', this._showDatePickerRef);
      Events.on(this.romeTime.associated, 'click', this._showDatePickerRef);
      return this;
    },

    _showDatePicker: function _showDatePicker(ev) {
      ev.stopPropagation();
      this.romeTime.show();
      this.romeTime.container.style.zIndex = 3;
    },

    destroy: function destroy() {
      CV.PostTweet.prototype.destroy.call(this);
      return null;
    }
  }
});
