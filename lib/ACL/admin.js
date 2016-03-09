ACL.addRole(new ACL.Role('Admin'), ['Person']);

ACL.allow(['index'], 'admin', 'Admin', function(acl, args, next) {
  return next(null, true);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.people', 'Admin', function(acl, args, next) {
  return next(null, true);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.organizations', 'Admin', function(acl, args, next) {
  return next(null, true);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.users', 'Admin', function(acl, args, next) {
  return next(null, true);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.voices', 'Admin', function(acl, args, next) {
  return next(null, true);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.topics', 'Admin', function(acl, args, next) {
  return next(null, true);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy', 'updatePositions', 'searchVoices'], 'admin.featuredVoices', 'Admin', function (acl, args, next) {
  return next(null, true);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy', 'updatePositions', 'searchEntities'], 'admin.featuredEntities', 'Admin', function (acl, args, next) {
  return next(null, true);
});
