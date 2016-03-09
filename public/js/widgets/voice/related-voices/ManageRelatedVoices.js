/* Class ManageRelatedVoices
 * Handles the Related Voices (search/add/remove) for voices.
 * It should receive a `relatedVoices` Array via data to display the current related
 * voices lists. That array will be passed to the RelatedVoicesList widget
 * to render them.
 * This Widget also acts as a Controller because it will listen for when a voice
 * gets removed and it will also tell when a new voice was added.
 */
var Events = require('./../../../lib/events');
var API = require('./../../../lib/api');
var GeminiScrollbar = require('gemini-scrollbar');

Class(CV, 'ManageRelatedVoices').inherits(Widget)({
    ELEMENT_CLASS : 'cv-related-voices',
    HTML : '\
        <div>\
            <div data-main></div>\
            <div data-list-wrapper>\
                <div>\
                    <div class="cv-related-voices__list">\
                        <div class="gm-scrollbar -vertical"><span class="thumb"></span></div>\
                        <div class="gm-scrollbar -horizontal"><span class="thumb"></span></div>\
                        <div data-voices-list class="gm-scroll-view"></div>\
                    </div>\
                </div>\
            </div>\
        </div>',

    LABEL_HTML : '\
        <div class="form-field -mt2">\
            <label>Related Voices to “{title}”</label>\
        </div>',

    prototype : {
        data : {
            /* VoiceEntities Models
             * @property relatedVoices <required> [Array]
             */
            relatedVoices : null,
            /* Will include the search voices handler and the remove button on
             * each voice item.
             * @property editMode <optional> [Boolean]
             */
            editMode : false
        },

        /* Holds the data of the selected voice. (for editMode)
         * @property _selectedVoice <private>
         */
        _selectedVoice : null,

        /* Array of related voices ids (plus the current voice id).
         * Used to exclude this voices from the search voices results.
         * @property _relatedVoicesIds <private>
         */
        _relatedVoicesIds : null,

        init : function(config){
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._setup()._bindEvents();
        },

        /* Initialilize the custom scrollbars.
         * @method setup <public>
         */
        setup : function setup() {
            this.scrollbar = new GeminiScrollbar({
                element : this.el.querySelector('.cv-related-voices__list'),
                createElements : false
            }).create();

            return this;
        },

        /* Creates and appends its children.
         * @return ManageRelatedVoices
         */
        _setup : function _setup() {
            if (!this.data.relatedVoices) {
                throw Error('ManageRelatedVoices require data.voices Array to be passed.');
            }

            this._relatedVoicesIds = this.data.relatedVoices.map(function(voice) {
                return voice.id;
            });
            this._relatedVoicesIds.push(this.data.voice.id);

            if (this.data.editMode) {
                var labelString = this.constructor.LABEL_HTML;
                labelString = labelString.replace(/{title}/, this.data.voice.title);
                this.el.querySelector('[data-list-wrapper]').insertAdjacentHTML('afterbegin', labelString);

                this.appendChild(new CV.UI.InputButton({
                    name : 'searchInput',
                    data : {label : 'Add voices that are related to this voice (?)'},
                    inputData : {
                        inputClassName : '-lg -block -btrr0 -bbrr0',
                        attr : {
                            placeholder : 'Search voices...',
                            autofocus : true
                        }
                    },
                    buttonData : {
                        value : 'Add Voice',
                        className : 'primary'
                    }
                })).render(this.el.querySelector('[data-main]'));
                this.searchInput.button.disable();
            }

            this.appendChild(new CV.RelatedVoicesList({
                name : 'list',
                data : {
                    voices : this.data.relatedVoices,
                    editMode : this.data.editMode
                }
            })).render(this.el.querySelector('[data-voices-list]'));

            return this;
        },

        /* Subscribe its events.
         * @method _bindEvents <private>
         */
        _bindEvents : function _bindEvents() {
            if (this.data.editMode && this.searchInput) {
                this._searchKeyUpHandlerRef = this._searchKeyUpHandler.bind(this);
                Events.on(this.searchInput.input.el, 'keyup', this._searchKeyUpHandlerRef);

                this._setSelectedVoiceRef = this._setSelectedVoice.bind(this);
                this.searchInput.bind('results:item:clicked', this._setSelectedVoiceRef);

                this._addVoiceClickHandlerRef = this._addVoiceClickHandler.bind(this);
                Events.on(this.searchInput.button.el, 'click', this._addVoiceClickHandlerRef);

                this._removeItemRef = this._removeItem.bind(this);
                this.list.bind('related:voices:remove:item', this._removeItemRef);
            }
        },

        _removeItem : function _removeItem(ev) {
            var widget = ev.widget;
            var id = widget.data.id;

            widget.button.disable();

            API.voiceRemoveRelatedVoice({
                profileName : this.data.voice.owner.profileName,
                voiceSlug : this.data.voice.slug,
                data : {relatedVoiceId : id}
            }, function (err, res) {
                if (err) {
                    widget.button.enable();
                    return;
                }

                var index = this._relatedVoicesIds.indexOf(id);
                if (index > -1) {
                    this._relatedVoicesIds.splice(index, 1);
                }
                this.list.removeVoice(widget);
                this.scrollbar.update();
            }.bind(this));
        },

        /* Search Input Key Up Handler. Checks if we should call the
         * searchVoices API endpoint.
         * @method _searchKeyUpHandler <private>
         */
        _searchKeyUpHandler : function  _searchKeyUpHandler(ev) {
            if (ev.which === 40 || ev.which === 38 || ev.which === 13) {
                return;
            }

            var searchString = ev.target.value.trim().toLocaleLowerCase();
            if (!searchString || (searchString.length < 2)) {
                return;
            }

            this.searchInput.button.disable();
            this._selectedVoice = null;

            API.searchVoices({
                query : searchString,
                exclude : this._relatedVoicesIds
            }, this._searchVoicesResponseHandler.bind(this));
        },

        /* Handles the searchVoices API response.
         * @method _searchVoicesResponseHandler <private>
         */
        _searchVoicesResponseHandler : function _searchVoicesResponseHandler(err, res) {
            this.searchInput.results.deactivate().clear();

            if (!res.voices.length) {
                return;
            }

            res.voices.forEach(function(voice) {
                this.searchInput.results.add({
                    element : new CV.VoiceCoverMiniClean({data: voice}).el,
                    data : voice
                });
            }, this);

            this.searchInput.results.activate();
        },

        /* Sets the this._selectedVoice data.
         * @method _setSelectedVoice <private>
         */
        _setSelectedVoice : function _setSelectedVoice(ev) {
            this._selectedVoice = ev.data;

            this.searchInput.button.enable();
            this.searchInput.input.setValue(ev.data.title);
            this.searchInput.results.deactivate().clear();
        },

        _addVoiceClickHandler : function _addVoiceClickHandler() {
            this.searchInput.button.disable();

            if (!this._selectedVoice) {
                return;
            }

            API.voiceAddRelatedVoice({
                profileName : this.data.voice.owner.profileName,
                voiceSlug : this.data.voice.slug,
                data : {relatedVoiceId : this._selectedVoice.id}
            }, function(err, res) {
                if (err) {
                    this.searchInput.button.enable();
                    return;
                }

                this._relatedVoicesIds.push(this._selectedVoice.id);
                this.searchInput.input.setValue('');
                this.list.addVoice(this._selectedVoice);
                this.scrollbar.update();
                this._selectedVoice = null;
            }.bind(this));
        },

        /* Unsubscribe its events, nullify DOM references, destroy children, etc.
         * @method destroy <public> (inherited from Widget)
         */
        destroy : function destroy() {
            if (this.scrollbar) {
                this.scrollbar = this.scrollbar.destroy();
            }

            if (this.searchInput) {
                Events.off(this.searchInput.input.el, 'keyup', this._searchKeyUpHandlerRef);
                this._searchKeyUpHandlerRef = null;

                Events.on(this.searchInput.button.el, 'click', this._addVoiceClickHandlerRef);
                this._addVoiceClickHandlerRef = null;
            }

            Widget.prototype.destroy.call(this);
            return null;
        }
    }
});
