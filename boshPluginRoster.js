(function($) {
// standard icon bas64encoded 
config.options.txtBoshAnonymousIcon = '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'
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
    		$(menu).append("<a onclick='config.extensions.boshPlugin.chat.createConversation(\"" + id + "\");jQuery(this).parent().hide();'>start chat</a><br><a onclick='config.extensions.boshPlugin.pubsub.displayNode(\"" + id + "//home\");jQuery(this).parent().hide();'>show dashboard</a>");
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
