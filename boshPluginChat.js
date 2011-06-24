(function($) {
/*
	this object handles all the chat functionality (no MUC at the moment), also rendering a chat window and setting intervalls on incomming 
	messages for user notification	
*/ 
boshPlugin = config.extensions.boshPlugin;

var chat;
chat = config.extensions.boshPlugin.chat = {
conversations: {}, //stores all open conversations
/*
   Callback for incomming Messages
*/
messageIn: function (msg) {      
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
   	var bare_from = Strophe.getBareJidFromJid(from);
   	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');
	if (type == "chat" && elems.length > 0) {       //andere Messages sind denkbar, vor allem Error ...
        	var body = elems[0];
        	config.extensions.boshPlugin.log(from + ': ' + Strophe.getText(body)); 		   
		if (chat.conversations.hasOwnProperty(bare_from)) {chat.addMessageToConversation(bare_from,msg)}      // conversation is already created
		else {
  				chat.createConversation(bare_from);                    // new conversation, create it
				chat.addMessageToConversation(bare_from,msg);          // and add the message
		}
		// if the conversation is not visible in the moment, register an Intervall for alerting via blinking icon
		if ($("#outer"+chat.conversations[bare_from].id).css('display') == "none" || $("#chatAreaTabs").css('display') == "none" ) {        
			   chat.conversations[bare_from].alerter = setInterval("config.extensions.boshPlugin.chat.alerter('"+bare_from+"')",1000);
		}
	}
	   // displayMessage("here");
	//}
	return true;
},
alerter: function(jid) {         // blinking icon alerter    
    //$("#choice"+config.extensions.boshPlugin.chat.conversations[jid].id).slideToggle('slow',null);
    $("#choice"+config.extensions.boshPlugin.chat.conversations[jid].id).fadeOut('slow', function() {
	        // Animation complete
			$("#choice"+config.extensions.boshPlugin.chat.conversations[jid].id).fadeIn('fast');
	      });
},                       
/*
  	create a conversation
*/
createConversation: function(from) {
	if (!chat.conversations[from]) {
		chat.conversations[from] = {};
		chat.conversations[from].body = "";
		var id = new Date;
		chat.conversations[from].id = id.getTime();                                                          
		$("#chatAreaTabs").append("<div id='outer"+chat.conversations[from].id+
									"' >" + 
									wikifyStatic("<<bosh_chat to:"+from+">>")+
									"</div>");
		$("#outer"+chat.conversations[from].id).hide();
	    //$("#chatAreaTabsChoice").append("<div id='choice"+chat.conversations[from].id+"' value='"+from+"' onclick='config.extensions.boshPlugin.chat.chatTabsShow(\"" + chat.conversations[from].id + "\")'>"+from+"</div>");
		$("#chatAreaTabsChoice").append("<img  id='choice" + chat.conversations[from].id + "' onclick='config.extensions.boshPlugin.chat.chatTabsShow(\"" + from + "\")'" 
				+ "\") width='30"
				+"' height='30'"
				+  + "' title='"
				+ config.extensions.boshPlugin.roster.contacts[from].jid + "' src='" 
				+ config.extensions.boshPlugin.roster.contacts[from].photo + "'>");
		
		chat.chatTabsShow(from);
	}
},
// ...
deleteConversation: function(conv) {
  $("#outer"+chat.conversations[conv].id).siblings().last().show();
  $("#outer"+chat.conversations[conv].id).remove();   
  $("#choice"+chat.conversations[conv].id).remove();  
  if (!document.getElementById("chatAreaTabs").hasChildNodes()) {
	$("#chatAreaTabs").hide();
  }
  clearInterval(chat.conversations[conv].alerter);
  delete chat.conversations[conv];
},
// add a Message to the conversation
addMessageToConversation: function(conv,msg) {
	var from = msg.getAttribute('from');
	var elems = msg.getElementsByTagName('body');
	var body = elems[0];
	var bare_from = Strophe.getBareJidFromJid(from);
	chat.conversations[conv].body = chat.conversations[conv].body + "\n";
	chat.conversations[conv].body = chat.conversations[conv].body + from + ":  " + Strophe.getText(body);
    var chat_display=document.getElementById(chat.conversations[conv].id); 
	if (chat_display) {
		chat_display.innerHTML = chat.conversations[conv].body;
		chat_display.scrollTop = chat_display.scrollHeight
	}
	//story.refreshAllTiddlers();
},
// show a conversation in the chatTabs window
chatTabsShow: function(from) {
	clearInterval(config.extensions.boshPlugin.chat.conversations[from].alerter);
	if ($("#outer"+config.extensions.boshPlugin.chat.conversations[from].id).css('display') == 'block') {  
   		$("#chatAreaTabs").slideToggle('slow'); ;
	}
	else {
		if ($("#chatAreaTabs").css('display') == 'none') {
		      $("#chatAreaTabs").slideToggle('slow');
		}
		$("#chatAreaTabs > div").hide();          
		$("#outer"+config.extensions.boshPlugin.chat.conversations[from].id).show();
	}
	$("#outer"+config.extensions.boshPlugin.chat.conversations[from].id).find("#text").focus();
},
// send a Message
sendMessage: function(to, body) {
	if (!to) {displayMessage("Error: no Recipient for Message");}
	else {
		var iq = new Strophe.Builder('message', {to: to,from: boshPlugin.jid, type: 'chat'})
           		.c('body').t(body);
        	config.extensions.boshPlugin.connection.send(iq.tree());
		var bare_to = Strophe.getBareJidFromJid(to);
		if (!chat.conversations.hasOwnProperty(bare_to)) {chat.createConversation(bare_to);}
		chat.addMessageToConversation(bare_to,iq.tree());
	}
},
// notify the other end that you left the conversation
sendGone: function(to, body) {
        if (!to) {displayMessage("Error: no Recipient for Message");}
        else {
                var iq = new Strophe.Builder('message', {to: to,from: boshPlugin.jid})
                        .c('gone',{xmlns: "http://jabber.org/protocol/chatstates"});
                config.extensions.boshPlugin.connection.send(iq.tree());
                var bare_to = Strophe.getBareJidFromJid(to);
                if (!chat.conversations.hasOwnProperty(bare_to)) {chat.createConversation(bare_to);}
                chat.addMessageToConversation(bare_to,iq.tree());
        }
},
}; 
/*
  	Chat Macros
*/
// Renders just an input field for sending a message to someon
config.macros.bosh_writer = {
	handler: function (place, macroName, params, wikifier, paramString, tiddler) {
		var prms = paramString.parseParams(null, null, true);
		var to = getParam(prms, "to");
		var form = "<html><form>";
		if (!to) {to = ""; form = form + "<label for='jid'>JID:</label><input name ='jid' type='text' id='jid' value='"+to+"'/>";}
		else {form = form + "<input type='hidden' name='jid' id='jid' value='"+to+"'/>";}
		form = form + "<label for='pass'>Text:</label><input name='text' width='80%' type='text' id='text' onkeypress='if (event.keyCode == 13){config.extensions.boshPlugin.chat.sendMessage(this.form.jid.value,this.form.text.value)}' /><input type='button' id='send' value='send' onclick='config.extensions.boshPlugin.chat.sendMessage(this.form.jid.value,this.form.text.value)' /></form></html>";
		wikify(form,place);
	}
};

// Renders a single chat Tab
config.macros.bosh_chat = {
        handler: function (place, macroName, params, wikifier, paramString, tiddler) {
                var prms = paramString.parseParams(null, null, true);
                var to = getParam(prms, "to");
		if (!config.extensions.boshPlugin.chat.conversations[to]) {
			config.extensions.boshPlugin.chat.createConversation(to);
		}
		var form = "<div style='font-size:large;float: left;'>"+to+"</div><form name='chat_window' id='chat_window'>";
                form = form + "<div><textarea style='width:100%;' name='chat' id='"+config.extensions.boshPlugin.chat.conversations[to].id+"' rows='6' readonly>";
		form = form + config.extensions.boshPlugin.chat.conversations[to].body;
		form = form + "</textarea></div><br>";
                if (!to) {to = ""; form = form + "<label for='jid'>JID:</label><input name ='jid' type='text' id='jid' value='"+to+"'/>";}
                else {form = form + "<input type='hidden' name='jid' id='jid' value='"+to+"'/>";}
                form = form + "<div height='8px'><input style='width:100%;' rows='1' name='text' width='80%' type='area' id='text' onkeypress='if (event.keyCode == 13){config.extensions.boshPlugin.chat.sendMessage(this.form.jid.value,this.form.text.value);this.form.text.value=null;return false;}' /></div><input type='button' id='send' value='send' onclick='config.extensions.boshPlugin.chat.sendMessage(this.form.jid.value,this.form.text.value);this.form.text.value=null;' /><input type='button' id='close' value='close' onclick='config.extensions.boshPlugin.chat.sendGone(this.form.jid.value);config.extensions.boshPlugin.chat.deleteConversation(this.form.jid.value)' /></form></html>";
                var source = "";
		if (config.extensions.boshPlugin.roster.contacts[to].photo) {
			source = "<html><img style='font-size:large;float: left;top:50%;left:10%;' width='40px' height='40px' src='"+config.extensions.boshPlugin.roster.contacts[to].photo+"'/>";
		}
		source = source + form;
		wikify(source,place);
        }
};

// subscribe to presence of XMPP Jid
config.macros.bosh_presenceSubscribe = {                    
       handler: function (place, macroName, params, wikifier, paramString, tiddler) {
                var prms = paramString.parseParams(null, null, true);
				var jid = getParam(prms, "jid");
				form = "<form >";
				if (!jid) {
					form = form + "<label for='node'>Jid</label><input type='text' id='jid'>";
				}
				else {form = form + "<input type='hidden' id='jid' value='"+jid<+"'>";}
				form = form + "<input type='button' value='authorize jid' onClick='var iq = $pres({to: form.jid.value, type: \"subscribed\"});config.extensions.boshPlugin.connection.sendIQ(iq,null,null);'><input type='button' value='deauthorize jid' onClick='var iq = $pres({to: form.jid.value, type: \"unsubscribe\"});config.extensions.boshPlugin.connection.sendIQ(iq,null,null)'></form>";
				wikify("<html>"+form+"</html>",place);
	}
};

/*
		renders the open Conversations inside the chatArea Div, 
		which should be specified in the PageTemplateTiddler
*/
config.macros.bosh_chatAll = {                                                 //open all conversation in tabbed view
         handler: function (place, macroName, params, wikifier, paramString, tiddler) {
        	var header = "<<tabs conversationsView ";
		var sections = "/%\n";
		for (conv in config.extensions.boshPlugin.chat.conversations) {
			header = header+ '"' + conv + '" " ... " "' + "chatWindowTabs" + "##"+conv+'" ';
			sections = sections + "!"+conv+"\n"+"<<bosh_chat to:"+conv+">>\n!end\n";
			}
		header = header + ">>\n";
		sections = sections + "%/";
		var text = tiddler.text;
		text = sections;
		config.shadowTiddlers.chatWindowTabs= text;	     
		$(".chatArea").replaceWith(wikifyStatic("<div id='chatArea'>"+header+sections+"</div>"));
		wikify(header,place);
		} 
	
};

// Show / Hide the chat Tabs Window
config.macros.bosh_chatToggle = {
		handler: function (place, macroName, params, wikifier, paramString, tiddler) {
		      	// $("#chatArea").toggle('slow');
				var button = "<html><input type='button' text='click' onClick='config.macros.bosh_chatToggle.toggle()'></html>";
				wikify(button,place);
		},
		toggle: function() {
				$("#chatAreaTabs").slideToggle('slow');
		},
	
};
})(jQuery);  
