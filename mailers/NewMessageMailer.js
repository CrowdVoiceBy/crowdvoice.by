

var messageContent = {
	html : '',
	subject : 'CrowdVoice.by - You have a new message',
	from_email : 'notifications@crowdvoice.by',
	from_name : 'CrowdVoice.by',
	to : [],
	important : true,
	auto_text : true,
	inline_css : true
};

var MessageNotificationMailer = Module('MessageNotificationMailer')({
	// Send message mail notification
	notificationMail : function (userInfo, messageInfo, callback){
		console.log(userInfo.sender + 'SENDER');
		console.log(userInfo.receiver + 'RECEIVER');
		console.log(messageInfo);

		var userUrl = '/user/' + userInfo.receiver;
		$.ajax({
			type : "GET",
			url : userUrl,
			headers : {'csrf-token' : this.token},
			success : function success(data){ callback(false,data);},
			error	: function error(err){ callback(true,err);}
		});
	}
});

module.exports = MessageNotificationMailer;