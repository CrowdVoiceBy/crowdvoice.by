require('krypton-orm')
Krypton.Model.knex(db)

require('glob').sync('lib/krypton/models/*.js').forEach(function (file) {
  logger.log('Loading ' + file + '...')
  require(path.join(process.cwd(), file))
})

// Relations

logger.info('Defining Krypton models\' relations')

K.Entity.relations = {
  user: {
    type: 'HasOne',
    relatedModel: K.User,
    ownerCol: 'id',
    relatedCol: 'entity_id'
  },

  anonymousEntity: {
    type: 'HasManyThrough',
    relatedModel: K.Entity,
    ownerCol: 'id',
    relatedCol: 'id',
    scope: ['Entities.is_anonymous', '=', true],
    through: {
      tableName: 'EntityOwner',
      ownerCol: 'owner_id',
      relatedCol: 'owned_id',
      scope: null
    }
  },

  voices: {
    type: 'HasMany',
    relatedModel: K.Voice,
    ownerCol: 'id',
    relatedCol: 'owner_id'
  },

  listableVoices: {
    type: 'HasMany',
    relatedModel: K.Voice,
    ownerCol: 'id',
    relatedCol: 'owner_id',
    scope: ['Voices.status', '=', Voice.STATUS_PUBLISHED]
  },

  viewableVoices: {
    type: 'HasMany',
    relatedModel: K.Voice,
    ownerCol: 'id',
    relatedCol: 'owner_id',
    scope: ['Voices.status', 'in', [Voice.STATUS_PUBLISHED, Voice.STATUS_UNLISTED]]
  },

  organizations: {
    type: 'HasManyThrough',
    relatedModel: K.Entity,
    ownerCol: 'id',
    relatedCol: 'id',
    scope: ['Entities.type', '=', 'organization'],
    through: {
      tableName: 'EntityOwner',
      ownerCol: 'owner_id',
      relatedCol: 'owned_id',
      scope: null
    }
  },

  contributedVoices: {
    type: 'HasManyThrough',
    relatedModel: K.Voice,
    ownerCol: 'id',
    relatedCol: 'id',
    through: {
      tableName: 'VoiceCollaborator',
      ownerCol: 'collaborator_id',
      relatedCol: 'voice_id',
      scope: null
    }
  },

  memberOrganizations: {
    type: 'HasManyThrough',
    relatedModel: K.Entity,
    ownerCol: 'id',
    relatedCol: 'id',
    through: {
      tableName: 'EntityMembership',
      ownerCol: 'member_id',
      relatedCol: 'entity_id',
      scope: null
    }
  },

  followedVoices: {
    type: 'HasManyThrough',
    relatedModel: K.Voice,
    ownerCol: 'id',
    relatedCol: 'id',
    through: {
      tableName: 'VoiceFollowers',
      ownerCol: 'entity_id',
      relatedCol: 'voice_id',
      scope: null
    }
  },

  followedEntities: {
    type: 'HasManyThrough',
    relatedModel: K.Entity,
    ownerCol: 'id',
    relatedCol: 'id',
    through: {
      tableName: 'EntityFollower',
      ownerCol: 'follower_id',
      relatedCol: 'followed_id',
      scope: null
    }
  }
}

K.Post.relations = {
  voice: {
    type: 'HasOne',
    relatedModel: K.Voice,
    ownerCol: 'voice_id',
    relatedCol: 'id'
  },

  owner: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'owner_id',
    relatedCol: 'id'
  },

  saves: {
    type: 'HasMany',
    relatedModel: K.SavedPost,
    ownerCol: 'id',
    relatedCol: 'post_id'
  },

  votes: {
    type: 'HasMany',
    relatedModel: K.Vote,
    ownerCol: 'id',
    relatedCol: 'post_id'
  }
}

K.User.relations = {
  entity: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'entity_id',
    relatedCol: 'id'
  }
}

K.Slug.relations = {
  voice: {
    type: 'HasOne',
    relatedModel: K.Voice,
    ownerCol: 'voice_id',
    relatedCol: 'id'
  }
}

K.Voice.relations = {
  owner: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'owner_id',
    relatedCol: 'id'
  },

  slug: {
    type: 'HasOne',
    relatedModel: K.Slug,
    ownerCol: 'id',
    relatedCol: 'voice_id'
  },

  collaborators: {
    type: 'HasManyThrough',
    relatedModel: K.Entity,
    ownerCol: 'id',
    relatedCol: 'id',
    through: {
      tableName: 'VoiceCollaborator',
      ownerCol: 'voice_id',
      relatedCol: 'collaborator_id',
      scope: null
    }
  },

  approvedPosts: {
    type: 'HasMany',
    relatedModel: K.Post,
    ownerCol: 'id',
    relatedCol: 'voice_id',
    scope: ['Posts.approved', '=', true]
  },

  unapprovedPosts: {
    type: 'HasMany',
    relatedModel: K.Post,
    ownerCol: 'id',
    relatedCol: 'voice_id',
    scope: ['Posts.approved', '=', false]
  },

  followers: {
    type: 'HasManyThrough',
    relatedModel: K.Entity,
    ownerCol: 'id',
    relatedCol: 'id',
    through: {
      tableName: 'VoiceFollowers',
      ownerCol: 'voice_id',
      relatedCol: 'entity_id',
      scope: null
    }
  },

  topics: {
    type: 'HasManyThrough',
    relatedModel: K.Topic,
    ownerCol: 'id',
    relatedCol: 'id',
    through: {
      tableName: 'VoiceTopic',
      ownerCol: 'voice_id',
      relatedCol: 'topic_id',
      scope: null
    }
  },

  relatedVoices: {
    type: 'HasManyThrough',
    relatedModel: K.Voice,
    ownerCol: 'id',
    relatedCol: 'id',
    through: {
      tableName: 'RelatedVoices',
      ownerCol: 'voice_id',
      relatedCol: 'related_id',
      scope: null
    }
  }
}

K.Topic.relations = {
  voices: {
    type: 'HasManyThrough',
    relatedModel: K.Voice,
    ownerCol: 'id',
    relatedCol: 'id',
    through: {
      tableName: 'VoiceTopic',
      ownerCol: 'topic_id',
      relatedCol: 'voice_id',
      scope: null
    }
  }
}

K.VoiceTopic.relations = {
  voice: {
    type: 'HasOne',
    relatedModel: K.Voice,
    ownerCol: 'voice_id',
    relatedCol: 'id'
  },

  topic: {
    type: 'HasOne',
    relatedModel: K.Topic,
    ownerCol: 'topic_id',
    relatedCol: 'id'
  }
}

K.RelatedVoice.relations = {
  voice: {
    type: 'HasOne',
    relatedModel: K.Voice,
    ownerCol: 'voice_id',
    relatedCol: 'id'
  },

  relatedVoice: {
    type: 'HasOne',
    relatedModel: K.Voice,
    ownerCol: 'related_id',
    relatedCol: 'id'
  }
}

K.EntityOwner.relations = {
  owner: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'owner_id',
    relatedCol: 'id'
  },

  owned: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'owned_id',
    relatedCol: 'id'
  }
}

K.EntityMembership.relations = {
  organization: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'entity_id',
    relatedCol: 'id'
  },

  member: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'member_id',
    relatedCol: 'id'
  }
}

K.VoiceCollaborator.relations = {
  voice: {
    type: 'HasOne',
    relatedModel: K.Voice,
    ownerCol: 'voice_id',
    relatedCol: 'id'
  },

  collaborator: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'collaborator_id',
    relatedCol: 'id'
  }
}

K.EntityFollower.relations = {
  follower: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'follower_id',
    relatedCol: 'id'
  },

  followed: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'followed_id',
    relatedCol: 'id'
  }
}

K.VoiceFollower.relations = {
  follower: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'entity_id',
    relatedCol: 'id'
  },

  voice: {
    type: 'HasOne',
    relatedModel: K.Voice,
    ownerCol: 'voice_id',
    relatedCol: 'id'
  }
}

K.SavedPost.relations = {
  entity: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'entity_id',
    relatedCol: 'id'
  },

  post: {
    type: 'HasOne',
    relatedModel: K.Post,
    ownerCol: 'post_id',
    relatedCol: 'id'
  }
}

K.Vote.relations = {
  post: {
    type: 'HasOne',
    relatedModel: K.Post,
    ownerCol: 'post_id',
    relatedCol: 'id'
  },

  entity: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'entity_id',
    relatedCol: 'id'
  }
}

K.MessageThread.relations = {
  messages: {
    type: 'HasMany',
    relatedModel: K.Message,
    ownerCol: 'id',
    relatedCol: 'thread_id',
    orderBy: ['created_at', 'asc']
  },

  senderEntity: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'sender_entity_id',
    relatedCol: 'id'
  },

  senderPerson: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'sender_person_id',
    relatedCol: 'id'
  },

  receiverEntity: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'receiver_entity_id',
    relatedCol: 'id'
  }
}

K.Message.relations = {
  thread: {
    type: 'HasOne',
    relatedModel: K.MessageThread,
    ownerCol: 'thread_id',
    relatedCol: 'id'
  },

  senderEntity: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'sender_entity_id',
    relatedCol: 'id'
  },

  senderPerson: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'sender_person_id',
    relatedCol: 'id'
  },

  receiverEntity: {
    type: 'HasOne',
    relatedModel: K.Entity,
    ownerCol: 'receiver_entity_id',
    relatedCol: 'id'
  }
}
