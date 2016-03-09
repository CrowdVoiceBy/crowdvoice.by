var SavedPost = Class('SavedPost').inherits(Argon.KnexModel)({

  validations : {
    entityId: ['required'],
    postId: ['required']
  },

  storage : (new Argon.Storage.Knex({
    tableName : 'SavedPosts'
  })),

  prototype : {
    entityId: null,
    postId: null,
    post: function post (done) {
      Post.find({id: this.postId}, function (err, result) {
        if (err) { done(err); return; }

        done(null, new Post(result[0]));
      });
    }
  }
});

module.exports = SavedPost;
