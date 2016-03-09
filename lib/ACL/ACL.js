/**
-------
| ACL |
-------
*/
var ACL = {
  TYPE_ALLOW   : 'TYPE_ALLOW',
  TYPE_DENY    : 'TYPE_DENY',
  roles        : {},
  resources    : {},
  rules        : {
    allResources : {
      allRoles : {
        allPrivileges : {type : 'TYPE_DENY', assert : null},
      }
    }
  },

  //--------------------------------------------------------------
  Role :(function(){
    var Role       = function(id){this.id = id;};
    Role.prototype = {id : null};
    return Role;
  })(),

  //--------------------------------------------------------------
  Resource : (function(){
    var Resource       = function(id){this.id = id};
    Resource.prototype = {id : null};
    return Resource;
  })(),

  //--------------------------------------------------------------
  addRole : function( role, parents ){
    if( !this.roles[role.id] ){
      this.roles[role.id] = {
        instance : role,
        parents  : [],
        children : []
      };
    }

    if( parents ){
      if( parents.constructor == String ){
        parents = [parents];
      }

      for( var i = 0; i < parents.length; i++ ){
        if(!this.roles[parents[i]]){
          throw(new Error('role ' + parents[i] + ' does not exists'));
        }

        this.roles[role.id].parents.push( this.roles[parents[i]].instance );
        this.roles[parents[i]].children.push( this.roles[role.id].instance );
      }
    }

        return this;
  },

  //--------------------------------------------------------------
  addResource : function(resource, privileges){
    this.resources[resource.id] = resource;
  },

  //--------------------------------------------------------------
  setRule : function(action, resource, role, assert, type){
    if(!this.rules[resource]){
      this.rules[resource] = {};
    }
    if(!this.rules[resource][role]){
      this.rules[resource][role] = {};
    }
    if(!this.rules[resource][role][action]){
      this.rules[resource][role][action] = {};
    }
    this.rules[resource][role][action] = {type : type, assert : assert};
  },

  //--------------------------------------------------------------
  allow : function(actions, resource, role, assert) {
    var acl = this;

    if ((actions instanceof Array) === false) {
      actions = [actions];
    }

    actions.forEach(function(action) {
      acl.setRule(action, resource, role, assert, acl.TYPE_ALLOW);
    });
  },

  //--------------------------------------------------------------
  deny : function(action, resource, role, assert){
    this.setRule(action, resource, role, assert, this.TYPE_DENY);
  },

  //--------------------------------------------------------------
  isAllowed : function(action, resource, role, assertArguments, callback){
    var assertResult;

    rule = this.getRule(action, resource, role, true);

    return rule.assert(this, assertArguments, callback);
  },

  //--------------------------------------------------------------
  isDenied : function(action, resource, role){
    return this.isAllowed(action, resource, role) == false;
  },

  //--------------------------------------------------------------
  hasRule : function(action, resource, role){
    if(!this.rules[resource]){
      resource = 'allResources';
    }
    if(!this.rules[resource][role] && this.rules.allResources[role]){
      resource = 'allResources';
    }
    if(!this.rules[resource][role]){
      return false
    }
    if(!this.rules[resource][role][action] && !this.rules[resource][role].allPrivileges){
      return false
    }

    return true;
  },

  //--------------------------------------------------------------
  getRule : function(action, resource, role, init){
    if('allResources' != resource && !this.resources[resource]){
      throw new Error(resource + ' is not a resource');
    }

    if('allRoles' != role && !this.roles[role]){
      throw new Error(role + ' is not a role');
    }

    if(this.hasRule(action, resource, role)){
      if(!this.rules[resource]){
        resource = 'allResources';
      }
      if(!this.rules[resource][role] && this.rules.allResources[role]){
        resource = 'allResources';
      }
      if(!this.rules[resource][role]){
        role = 'allRoles';
      }
      if(!this.rules[resource][role][action]){
        action = 'allPrivileges';
      }

      return this.rules[resource][role][action];
    }

    var rule;

    for(var i = 0; i < this.roles[role].parents.length; i++){
      rule = this.getRule( action, resource, this.roles[role].parents[i].id );
      if(rule){
        return rule;
      }
    }

    if(!init || this.roles[role].parents.length == 0){
      return this.getRule(action, resource, 'allRoles');
    }
    else{
      return null;
    }

  }
}

module.exports = ACL;
