// var Person = require('./../../../lib/currentPerson');

Class(CV, 'VoiceFollowController')({
    prototype : {
        /* Current Voice Model.
         * @property voice <required> [Object]
         */
        voice : null,

        init : function init() {
            console.log('follow multiple button');
            // console.log(Person.get());
        }
    }
});
