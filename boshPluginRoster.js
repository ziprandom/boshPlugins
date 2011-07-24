(function($) {
// standard icon bas64encoded 
config.options.txtBoshAnonymousIcon = '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'; 
boshPlugin = config.extensions.boshPlugin;
/*
	Manages the Roster, and the Rosterline, where (online) Contacts are displayed
*/
var roster;
roster = config.extensions.boshPlugin.roster = {
	contacts: {},   // stores roster contacts
	vCardQue: [],
	runningRecursiveVCardRequest: 0,
	// get it from the server
	queryRoster: function() {
		config.extensions.boshPlugin.log("querying Roster...");
		var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
		config.extensions.boshPlugin.connection.sendIQ(iq,config.extensions.boshPlugin.roster.onRoster);
	},
    // and when you got it, populate your contacts Object
	onRoster: function(iq) {
      	    config.extensions.boshPlugin.log("got Roster...");
	    var all_jids = new Array();
            // We add ourselves
            all_jids.push(boshPlugin.jid);
            config.extensions.boshPlugin.roster.contacts[boshPlugin.jid] = {}; // Roster Contact für uns selber 
	    config.extensions.boshPlugin.roster.contacts[boshPlugin.jid].jid = boshPlugin.jid;
	    config.extensions.boshPlugin.roster.contacts[boshPlugin.jid].name = boshPlugin.jid;
	    config.extensions.boshPlugin.roster.contacts[boshPlugin.jid].presence = "online";
	    config.extensions.boshPlugin.roster.contacts[boshPlugin.jid].resources = {};
	    config.extensions.boshPlugin.roster.contacts[boshPlugin.jid].photohash = "";              
   	    config.extensions.boshPlugin.roster.contacts[boshPlugin.jid].divid = Math.floor(Math.random() * 2000);
            // and the others
      		$(iq).find('item').each(function () {
                          var jid = $(this).attr('jid');
                          all_jids.push(jid);
			  var name = $(this).attr('name') || jid;
						  var id = jid;
						  config.extensions.boshPlugin.roster.contacts[id] = {};
						  config.extensions.boshPlugin.roster.contacts[id].jid = jid;
						  config.extensions.boshPlugin.roster.contacts[id].name = name;
						  config.extensions.boshPlugin.roster.contacts[id].presence = "offline";
						  config.extensions.boshPlugin.roster.contacts[id].resources = {};
						  config.extensions.boshPlugin.roster.contacts[id].photohash = "";              
						  config.extensions.boshPlugin.roster.contacts[id].divid = Math.floor(Math.random() * 2000);
			});
      		//config.extensions.boshPlugin.roster.refreshRosterTiddler();
      		//config.extensions.boshPlugin.roster.getRosterVCards(all_jids, function() {config.extensions.boshPlugin.connection.send($pres());});
		config.extensions.boshPlugin.connection.send($pres()); //sends its presence because the getRoster function is called after login, shouldnt be here ...
		config.extensions.boshPlugin.connection.addHandler(config.extensions.boshPlugin.roster.onPresence, null, "presence"); // ad a Handler for incomming Presence Stanzas

	},
	/*
	  	On Presence, exmines, if someone comes online, calls requestVCard to get the Icon, adds / removes contact to/from rosterline ...
	*/
	onPresence: function (presence) {
		var ptype = $(presence).attr('type');
		var from = $(presence).attr('from');
		var bare_jid = Strophe.getBareJidFromJid(from);
		var resource = Strophe.getResourceFromJid(from);
		var id = bare_jid;  
		var photohash = $("x > photo",presence).text();
		if (photohash != config.extensions.boshPlugin.roster.contacts[id].photohash) {   // check, wheter the avatar has changed 
			//config.extensions.boshPlugin.roster.requestVCard(id);
			config.extensions.boshPlugin.roster.contacts[id].photohash = photohash;
		}
		if (ptype !== 'error') {
			if (ptype == 'subscribe') {
				displayMessage(bare_jid +" wants to subscribe to your presence ...");
			}
			if (ptype == 'unavailable'){
				displayMessage(from + " went offline ...");
				delete config.extensions.boshPlugin.roster.contacts[id].resources[resource];

			}
			else {
					config.extensions.boshPlugin.roster.contacts[id].resources[resource] = {};
					var show = $(presence).find("show").text();
						displayMessage(id + " " +show);
						if (show === "" || show === "chat") {
							config.extensions.boshPlugin.roster.contacts[id].resources[resource].online = "online";
						} else {
							config.extensions.boshPlugin.roster.contacts[id].resources[resource].online = "away";
						}
					config.extensions.boshPlugin.roster.contacts[id].resources[resource].status = $(presence).find("status").text();
				}
		}
		
		var onlineResourcesExist = 0;
		for(var prop in config.extensions.boshPlugin.roster.contacts[id].resources) {
			onlineResourcesExist = 1;
		}
		if (onlineResourcesExist == 1) {
			//config.extensions.boshPlugin.roster.requestVCard(id);
			if (config.extensions.boshPlugin.roster.contacts[id].presence = "offline") {
				// Contact has been offline and just came online
				// and we add him to the rosterline
				config.extensions.boshPlugin.roster.addContactToRosterline(id);				
			}
			config.extensions.boshPlugin.roster.contacts[id].presence = "online";
			//config.extensions.boshPlugin.roster.refreshRosterLine();
		}
		else {
		    if (config.extensions.boshPlugin.roster.contacts[id].presence = "online") { 
				// contact was online and went offline, so we remove him from the rosterline
			    config.extensions.boshPlugin.roster.removeContactFromRosterline(id);
			}
			config.extensions.boshPlugin.roster.contacts[id].presence = "offline";
    	}
		//store.notify("MainMenu",1);
		//refreshDisplay(true);
		return true;
	},
	// add the image to the rosterline
	addContactToRosterline: function(id){
		if (config.extensions.boshPlugin.roster.contacts[id].photo) {
			var photo = config.extensions.boshPlugin.roster.contacts[id].photo;
    		roster = document.createElement("div");
    		$(roster).attr("style", "float:left;width:"+config.macros.bosh_rosterLine.width+";");
    		$(roster).addClass("rosterItem");
    		var img = document.createElement("img");
    		$(roster).attr("id",config.extensions.boshPlugin.roster.contacts[id].divid);
    		img.addEventListener('click',function(event){
    				jQuery(this).next().css("top",event.layerY-10);
    				jQuery(this).next().css("left",event.layerX-10);
    				jQuery(this).next().css("width","100px"); 
    				jQuery(this).next().toggle();
    				},true);
    		//$(img).addClass("rosterItem");
    		$(img).attr("width",config.macros.bosh_rosterLine.width);
    		$(img).attr("height",config.macros.bosh_rosterLine.width);
    		$(img).attr("title",config.extensions.boshPlugin.roster.contacts[id].jid);
    		$(img).attr("src",photo);
    		$(roster).append(img);
    		var menu = document.createElement("span");
       		$(menu).attr("id","menu");
       		$(menu).attr("style","background-color:#E8E8E8;z-index:2;margin:3px;position:absolute;width:0px;display:none;");
    		$(menu).append("<a onclick='config.extensions.boshPlugin.chat.createConversation(\"" + id + "\");jQuery(this).parent().hide();'>start chat</a><br><a onclick='config.extensions.boshPlugin.pubsub.displayNode(\"" + id + "/urn:xmpp:microblog:0\");jQuery(this).parent().hide();'>show dashboard</a>");
    		$(menu).bind('mouseout',function(e){
    				if (!e) var e = window.event;
					var tg = (window.event) ? e.srcElement : e.target;
					if (tg.id != 'menu') return;
					var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement;
					while (reltg != tg && reltg.nodeName != 'BODY')
						reltg= reltg.parentNode
					if (reltg== tg) return;
					jQuery(this).css("left","0px");
    				jQuery(this).hide();	
    			},false);
    		$(roster).append(menu);
		$('#'+config.extensions.boshPlugin.roster.contacts[id].divid).remove();  ///remove previous existing Entry
		$(roster).hide();
		$('#rosterline').append(roster);
		$('#'+config.extensions.boshPlugin.roster.contacts[id].divid).fadeIn('slow');  
		}
		else {
			config.extensions.boshPlugin.roster.recRequestVCard(id,config.extensions.boshPlugin.refreshRosterLine);
		}
	},
	// remove someone from roesterline
	
	removeContactFromRosterline: function(id) {
		$('#'+config.extensions.boshPlugin.roster.contacts[id].divid).fadeOut('slow');
		$('#'+config.extensions.boshPlugin.roster.contacts[id].divid).remove();
	},
	// rebuild the rosterline
	refreshRosterLine: function() {
		$('#rosterline > *').remove();
		for (buddy in config.extensions.boshPlugin.roster.contacts) {
			if (buddy.presence = 'online') {
				config.extensions.boshPlugin.roster.addContactToRosterline(buddy);
			}
		}
	},
	recRequestVCard: function(id,callback) {
		config.extensions.boshPlugin.roster.vCardQue.push(id);
		if (config.extensions.boshPlugin.roster.runningRecursiveVCardRequest == 0) {
			config.extensions.boshPlugin.roster.getRosterVCardsFromVCardQue(callback);
		}
	},
        getRosterVCardsFromVCardQue: function(callback) {
		var limit = 5;
		config.extensions.boshPlugin.roster.runningRecursiveVCardRequest = 1;
		if (config.extensions.boshPlugin.roster.vCardQue.length < limit) limit = config.extensions.boshPlugin.roster.vCardQue.length;
		for (var i = 0; i < limit;i++) {
			var iq = $iq({type: 'get',to: config.extensions.boshPlugin.roster.vCardQue.shift()}).c('vCard', {xmlns: 'vcard-temp'});
			if (i < limit) boshPlugin.connection.sendIQ(iq,config.extensions.boshPlugin.roster.requestVCardCallback,null);
			else {
				boshPlugin.connection.sendIQ(iq,function() {
					config.extensions.boshPlugin.roster.requestVCardCallback;
					config.extensions.boshPlugin.roster.getRosterVCardsFromVCardQue(config.extensions.boshPlugin.roster.vCardQue,callback);
				},function() {
					config.extensions.boshPlugin.roster.requestVCardCallback;
					config.extensions.boshPlugin.roster.getRosterVCardsFromVCardQue(config.extensions.boshPlugin.roster.vCardQue,callback);
				});
			}
		}
		if (config.extensions.boshPlugin.roster.vCardQue.length == 0 ) {
			config.extensions.boshPlugin.roster.runningRecursiveVCardRequest = 0;
			if(typeof callback == 'function'){
        			callback.call(this);
	      		}
		}
			
	},
	// request the VCard of a contact
	requestVCard: function(jid) {
		var iq = $iq({type: 'get',to: jid}).c('vCard', {xmlns: 'vcard-temp'});
		boshPlugin.connection.sendIQ(iq,config.extensions.boshPlugin.roster.requestVCardCallback,null);
	},
	// on VCard just extracts the base64 encoded icon and stores the data-url for the user in it´s contact
	// if no icon is found, the standard icon is used.
	requestVCardCallback: function(iq) {
		var jid = Strophe.getBareJidFromJid($(iq).attr("from"));
		//displayMessage("VCard success: "+jid);   
	 	var photo = $(iq).find('PHOTO');
		if (photo && $(photo).find('BINVAL').text()) {
			var type =  $(photo).find('TYPE').text();
			var binary = $(photo).find('BINVAL').text();
			binary.replace(/"|'/,"");
        		config.extensions.boshPlugin.roster.contacts[jid].photo = "data:"+type+";base64,"+binary;
			}	
		else {     
			config.extensions.boshPlugin.roster.contacts[jid].photo = "data:image/png;base64,"+config.options.txtBoshAnonymousIcon;
		}
		if (config.extensions.boshPlugin.roster.contacts[jid].presence == "online"){     // check wheter contact is online
				  config.extensions.boshPlugin.roster.addContactToRosterline(jid);	   //add/replace entry    
		}
		
},  
//addContactToRoster
addToRoster: function(name,jid,subscribe) {
		var iq = $iq({type: "set"}).c("query", {xmlns: "jabber:iq:roster"}).c("item", {name: name,jid: jid});
		boshPlugin.connection.sendIQ(iq);
		displayMessage("added "+jid+" to roster");
		if (subscribe) {
			var subscribe = $pres({to: jid, "type": "subscribe"});
			boshPlugin.connection.send(subscribe);
			displayMessage("requested Subscription for "+jid);
		}
	}

};

/*
	Roster Macros
*/
config.macros.bosh_rosterLine = {                                              //show the rostericons
        width: "",
		handler: function (place, macroName, params, wikifier, paramString, tiddler) {
				var prms = paramString.parseParams(null, null, true);
                config.macros.bosh_rosterLine.width = getParam(prms, "width");
				var roster = "";
				//var rosterLine = "";
				wikify("<html><span style='text-align:left;' id='rosterline'>"+roster+"</span></html>",place);
				config.extensions.boshPlugin.roster.refreshRosterLine();
				
		},

};  
config.macros.bosh_addContact = {
	 handler: function (place, macroName, params, wikifier, paramString, tiddler) {
		var form = "<html><form><label for='name'>Name</label><input name='name' type='text' id='name'/><label for='jid'>JID:</label><input name ='jid' type='text' id='jid'/><label for='jid'>Presence Abonnieren?</label><input type='checkbox' name='requestPres'><input type='button' id='Add' value='Add' onclick='config.extensions.boshPlugin.roster.addToRoster(this.form.name.value,this.form.jid.value,this.form.requestPres.checked)' /></form></html>";
		wikify(form,place);
	 }
};
})(jQuery);  
