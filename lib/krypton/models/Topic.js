var ImageUploader = require(path.join(process.cwd(), 'lib', 'image_uploader.js'))

K.Topic = Class(K, 'Topic').inherits(Krypton.Model).includes(ImageUploader)({
  tableName: 'Topics',

  attributes: [
    'id',
    'name',
    'slug',
    'imageBaseUrl',
    'imageMeta',
    'createdAt',
    'updatedAt',
    'deleted'
  ],

  validations: {
    name: ['required'],
    slug: ['required']
  },

  prototype: {
    init: function (config) {
      Krypton.Model.prototype.init.call(this, config)

      this.hasImage({
        propertyName: 'image',
        versions: {
          icon: function(readStream) {
            return readStream.pipe(
              sharp()
                .resize(192, 192)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .embed()
                .png()
                .quality(100)
            )
          }
        },
        bucket: 'crowdvoice.by',
        basePath: '{env}/{modelName}_{id}/{property}_{versionName}.{extension}'
      })
    }
  }
})

module.exports = new K.Topic()
