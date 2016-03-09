var mandrill = require('mandrill-api/mandrill');
var client = new mandrill.Mandrill(CONFIG.mandrill.key || false);

var message = {
  "html" : "",
  "subject" : "",
  "from_email" : "notifications@crowdvoice.by",
  "from_name"  : "CrowdVoice.by",
  "to" : [],
  "important" : true,
  "auto_text" : true,
  "inline_css": true,
}

var UserMailer = Module('UserMailer')({

  // Send Welcome email when creating a new user.
  new : function(user, entity, callback) {
    var mailer = this;

    var viewFile = fs.readFileSync('./views/mailers/user/new.html', 'utf8');

    var template = new Thulium({
      template : viewFile
    });

    template.parseSync().renderSync({user : user, entity : entity});

    var view = template.view;

    message.html = view;
    message.subject = "Welcome to CrowdVoice.by";
    message.to = [];

    message.to.push({
      "email" : user.email,
      "name" : entity.name,
      "type" : "to"
    })

    client.messages.send({"message": message, "async": true}, function(result) {
        logger.info('UserMailer new():');
        logger.info(result);
        callback(null, result);

    }, function(e) {
        logger.error('UserMailer new(): A mandrill error occurred: ' + e.name + ' - ' + e.message);
        callback(e);
    });
  },

  // Send Password reset instructions
  forgotPassword : function forgotPassword(user, callback) {
    var mailer = this;

    var viewFile = fs.readFileSync('./views/mailers/user/forgotPassword.html', 'utf8');

    var template = new Thulium({
      template : viewFile
    });

    template.parseSync().renderSync({user : user});

    var view = template.view;

    message.html = view;
    message.subject = "CrowdVoice.by - Reset password";
    message.to = [];

    message.to.push({
      "email" : user.email,
      "name" : user.email,
      "type" : "to"
    })

    client.messages.send({"message": message, "async": true}, function(result) {
        logger.info('UserMailer forgotPassword():');
        logger.info(result);
        callback(null, result);
    }, function(e) {
        logger.error('UserMailer forgotPassword(): A mandrill error occurred: ' + e.name + ' - ' + e.message);
        callback(e);
    });
  },

  // Password has been reset notification
  passwordReset: function (user, callback) {
    var mailer = this;

    var viewFile = fs.readFileSync('./views/mailers/user/passwordReset.html', 'utf8');

    var template = new Thulium({
      template : viewFile
    });

    template.parseSync().renderSync({user : user});

    var view = template.view;

    message.html = view;
    message.subject = 'CrowdVoice.by - Your password has been reset';
    message.to = [
      {
        email: user.email,
        name: user.email,
        type: 'to'
      }
    ];

    client.messages.send({ message: message, async: true }, function (result) {
      logger.info('UserMailer passwordReset():');
      logger.info(result);
      callback(null, result);
    }, function (err) {
      logger.error('A Mandrill error ocurred: ' + err.name + ' - ' + err.message);
      return callback(err);
    });
  }

});

module.exports = UserMailer;
