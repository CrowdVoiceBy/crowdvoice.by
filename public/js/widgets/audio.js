/* Ensures SoundManager2 is initialized once.
 * Register the sound and expose the SoundManager instance as 'sound', so you
 * can manually bind to the events you are interested in.
 * This is basically a wrapper for SoundManager2. To know what you can do with
 * the exposed 'sound' property, check SoundManager2 documentation.
 *
 * @ocumentation: http://www.schillmania.com/projects/soundmanager2/doc/
 */
Class(CV, 'Audio').includes(CustomEventSupport)({

    _loading : false,

    /* Start soundManager. Once is loaded, it will notify any Audio instances
     * so they can start using its API.
     * @method setup <static> [Function]
     * @dispatch 'ready'
     * @dispath 'error'
     * @return CV.Audio Class
     */
    setup : function() {
        if (this._loading) {
            return;
        }

        this._loading = true;

        soundManager.setup({
            url : '/node_modules/SoundManager2/swf/',
            preferFlash: false,
            onready : function() {
                console.log('SM ready');
                CV.Audio.dispatch('ready');
            },
            ontimeout : function() {
                console.log('Uh-oh. No HTML5 support, SWF missing, Flash blocked or other issue');
                CV.Audio.dispatch('error');
            }
        });

        return this;
    },

    prototype : {

        /* config */
        URLString : "",

        /* public props */
        sound : null,
        paused : true,

        init : function init(URLString) {
            this.URLString = URLString;

            if (soundManager.enabled) { /* SoundManager2 is already loaded*/
                return this._createSound();
            }

            CV.Audio.setup();
            CV.Audio.bind('ready', this._createSound.bind(this));
        },

        /* this method is called after SoundManager2 is loaded
         * @method _createSound <private> [Function]
         */
        _createSound : function _createSound() {
            this.sound = soundManager.createSound({
                url : this.URLString
            });

            return this;
        },

        /* By deafult the sound is created but not loaded. To play a sound you
         * need to tell SoundManager2 to actually load the sound file, which is
         * exactly what this method does. It will also regiter the events we
         * are interested on listening from SoundManager2.
         * @method load <public>
         */
        load : function() {
            var audioInstance = this;

            this.sound.options = {
                onload : function() {audioInstance.dispatch('onload');},
                whileplaying : function() {audioInstance.dispatch('whileplaying');},
                onfinish : function() {audioInstance.dispatch('onfinish');}
            };

            this.sound.load();
        },

        /* @method play <public>
         */
        play : function() {
            this.sound.play();
            this.paused = false;

            return this;
        },

        /* @method pause <public>
         */
        pause : function() {
            this.sound.pause();
            this.paused = true;

            return this;
        },

        setPosition : function(position) {
            this.sound.setPosition(position);
        },

        /* Returns the audio file duration in milliseconds
         * @method getDuration <public>
         */
        getDuration : function() {
            return this.sound.duration;
        },

        /* Returns the audio-file currentTime in milliseconds.
         * @method getCurrentTime <public>
         */
        getCurrentTime : function() {
            return this.sound.position;
        },

        /* Returns the progress in percetamge (0-100)
         * @method getProgressPercentage <public>
         */
        getProgressPercentage : function() {
            return this.getCurrentTime() / this.getDuration() * 100;
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.sound.destruct();
        }
    }
});
