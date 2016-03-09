Class(CV, 'feedGenerator').inherits(Widget)({

	ELEMENT_CLASS : 'cv-feed-generator',

  HTML : '\
      <div>\
      </div>\
  ',

  prototype        : {
    type            	: null,
    tmpVoices 				: null,
    tmpPeople 				: null,
    tmpOrganizations 	: null,
		tmpFeed 					: null,
		feedItems 				: null,

    init : function(config){
      Widget.prototype.init.call(this, config);

			this.tmpFeed = [];

			this.getData('/discover/new/voices', 'voices');
			this.getData('/discover/new/people', 'people');
			this.getData('/discover/new/organizations', 'organizations');

    },

    getData : function (url, type){
    	var generator = this;
			$.ajax({
				type: "GET",
				url: url,
				headers: { 'csrf-token': $('meta[name="csrf-token"]').attr('content') },
				data : {},
				dataType : 'json',
				success: function(data) {
						if (type == 'voices'){
							generator.tmpVoices = data;
						} else if (type == 'people'){
							generator.tmpPeople = data;
						} else if (type == 'organizations'){
							generator.tmpOrganizations = data;
						}

						if (generator.tmpVoices && generator.tmpPeople && generator.tmpOrganizations){
							generator.createFeed();
						}
				  	//items = items.concat(data);
				  	//renderData(data, instance, className);

				}
			});
		},

    isEven : function (n) {
		  n = Number(n);
		  return n === 0 || !!(n && !(n%2));
		},

		shuffle : function(array) {
		  var currentIndex = array.length, temporaryValue, randomIndex ;

		  while (0 !== currentIndex) {

		    randomIndex = Math.floor(Math.random() * currentIndex);
		    currentIndex -= 1;

		    temporaryValue = array[currentIndex];
		    array[currentIndex] = array[randomIndex];
		    array[randomIndex] = temporaryValue;
		  }

		  return array;
		},

		createFeed : function (){

			var generator = this;

			//action: "changed avatar"
			//actionDoer: {}
			//createdAt: "2015-08-18T02:54:03.208Z"
			//entity/voice: {}
			//itemType: "entity/voice"

			var tmpFeedItem = {
				action: "changed description",
				actionDoer: generator.tmpPeople[ Math.floor(Math.random()*generator.tmpPeople.length) ],
				createdAt: "2015-08-18T02:54:03.208Z",
				voice: generator.tmpVoices[Math.floor(Math.random()*generator.tmpVoices.length)],
				itemType: "voice"
			};this.tmpFeed.push(tmpFeedItem);

			var tmpFeedItem = {
				action: "changed title",
				actionDoer: generator.tmpPeople[ Math.floor(Math.random()*generator.tmpPeople.length) ],
				createdAt: "2015-08-18T02:54:03.208Z",
				voice: generator.tmpVoices[Math.floor(Math.random()*generator.tmpVoices.length)],
				itemType: "voice"
			};this.tmpFeed.push(tmpFeedItem);

			var tmpFeedItem = {
				action: "new posts",
				actionDoer: generator.tmpPeople[ Math.floor(Math.random()*generator.tmpPeople.length) ],
				createdAt: "2015-08-18T02:54:03.208Z",
				voice: generator.tmpVoices[Math.floor(Math.random()*generator.tmpVoices.length)],
				itemType: "voice"
			};this.tmpFeed.push(tmpFeedItem);

			var tmpFeedItem = {
				action: "created",
				actionDoer: generator.tmpPeople[ Math.floor(Math.random()*generator.tmpPeople.length) ],
				createdAt: "2015-08-18T02:54:03.208Z",
				voice: generator.tmpVoices[Math.floor(Math.random()*generator.tmpVoices.length)],
				itemType: "voice"
			};this.tmpFeed.push(tmpFeedItem);

			var tmpFeedItem = {
				action: "created",
				actionDoer: generator.tmpPeople[ Math.floor(Math.random()*generator.tmpPeople.length) ],
				createdAt: "2015-08-18T02:54:03.208Z",
				entity: generator.tmpOrganizations[Math.floor(Math.random()*generator.tmpOrganizations.length)],
				itemType: "entity"
			};this.tmpFeed.push(tmpFeedItem);

			var tmpFeedItem = {
				action: "followed",
				actionDoer: generator.tmpPeople[ Math.floor(Math.random()*generator.tmpPeople.length) ],
				createdAt: "2015-08-18T02:54:03.208Z",
				entity: generator.tmpPeople[Math.floor(Math.random()*generator.tmpPeople.length)],
				itemType: "entity"
			};this.tmpFeed.push(tmpFeedItem);

			var tmpFeedItem = {
				action: "followed",
				actionDoer: generator.tmpPeople[ Math.floor(Math.random()*generator.tmpPeople.length) ],
				createdAt: "2015-08-18T02:54:03.208Z",
				entity: generator.tmpOrganizations[Math.floor(Math.random()*generator.tmpOrganizations.length)],
				itemType: "entity"
			};this.tmpFeed.push(tmpFeedItem);

			var tmpFeedItem = {
				action: "followed",
				actionDoer: generator.tmpPeople[ Math.floor(Math.random()*generator.tmpPeople.length) ],
				createdAt: "2015-08-18T02:54:03.208Z",
				voice: generator.tmpVoices[Math.floor(Math.random()*generator.tmpVoices.length)],
				itemType: "voice"
			};this.tmpFeed.push(tmpFeedItem);

			var tmpFeedItem = {
				action: "changed avatar",
				actionDoer: generator.tmpPeople[ Math.floor(Math.random()*generator.tmpPeople.length) ],
				createdAt: "2015-08-18T02:54:03.208Z",
				entity: generator.tmpPeople[Math.floor(Math.random()*generator.tmpPeople.length)],
				itemType: "entity"
			};this.tmpFeed.push(tmpFeedItem);

			var tmpFeedItem = {
				action: "changed background",
				actionDoer: generator.tmpPeople[ Math.floor(Math.random()*generator.tmpPeople.length) ],
				createdAt: "2015-08-18T02:54:03.208Z",
				entity: generator.tmpPeople[Math.floor(Math.random()*generator.tmpPeople.length)],
				itemType: "entity"
			};this.tmpFeed.push(tmpFeedItem);


			this.feedItems = this.shuffle(this.tmpFeed);

			var tmpStartHour = 7;
			var tmpStartMinute = 37;

			this.feedItems.forEach(function (item, index){

				if (tmpStartMinute < 10 ) {tmpStartMinute = '0' + tmpStartMinute}

				if (generator.isEven(index)){
					tmpStartHour--;
					if (tmpStartHour < 10 ) {tmpStartHour = '0' + tmpStartHour}
				}
				item.createdAt = '2015-08-18T' + tmpStartHour + ':'+ tmpStartMinute +':03.208Z';
				tmpStartMinute--;

			});

			this.dispatch('ready');

		}

  }

});



