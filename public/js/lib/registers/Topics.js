/* CrowdVoice Topics Store.
 * fetch() => Fetch the data from the server. It will auto update itself after the response.
 * get(callback) => Returns the data stored. (err, res)
 */

var API = require('./../api');

module.exports = {
    _ : null,

    /* Fetch the data from the server
     * @method fetch <public>
     * @argument callback <optional> [Function]
     */
    fetch : function fetch(callback) {
        API.getTopics(this._fetchHandler.bind(this, callback));
    },

    /* Returns the stored data
     * @method get <public>
     * @argument callback <required> [Function]
     */
    get : function get(callback) {
        if (this._) {
            return callback(false, this._);
        }

        this.fetch(callback);
    },

    /* Updates the registry with the passed data
     * @method _set <private>
     */
    _set : function _set(data) {
        this._ = data;
    },

    /* Handles the API response after tying to fetch the data.
     * @method _fetchHandler <private>
     * @argument callback <optional> [Function]
     */
    _fetchHandler : function _fetchHandler(callback, err, res) {
        if (err) {
            if (callback) {
                callback(true, res);
            }

            throw new Error('Cannot get Topics');
        }

        if (callback) {
            callback(false, res);
        }

        this._set(res);
    }
};
