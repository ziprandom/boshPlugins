(function($) {
//standard bosh server & base64 encoded icon for buddies, that don´t ship one viea VCard
config.options.txtXmppBoshServerUrl = 'http://127.0.0.1:5280/xmpp-bind';

var boshPlugin;
boshPlugin = config.extensions.boshPlugin = {               //basic functions for connecting 
	connection: null,
	tiddler: null,
	jid: null,
	rosterTiddler: "Roster",


log: function(msg) {
    displayMessage(msg);
},

rawInput: function(data) {
  //  config.extensions.boshPlugin.log('RECV: ' + data);
    config.extensions.boshPlugin.rawLog = config.extensions.boshPlugin.rawLog + "\n\nIN: " + data;
},

rawOutput: function(data) {
 //   config.extensions.boshPlugin.log('SENT: ' + data);
    config.extensions.boshPlugin.rawLog = config.extensions.boshPlugin.rawLog + "\n\nOUT: " + data;
},

xmlInput: function(elem) {
//    config.extensions.boshPlugin.log('SENT: ' + elem.body);
},

xmlOutput: function(elem) {
//    config.extensions.boshPlugin.log('SENT: ' + elem.body);
},

onConnect: function(status) {
    if (status == Strophe.Status.CONNECTING) {
        var tid=store.getTiddler("rawLog");
        tid.set(null,"");
	config.extensions.boshPlugin.log('Strophe is connecting.',"rawLog");
    } else if (status == Strophe.Status.CONNFAIL) {
	config.extensions.boshPlugin.log('Strophe failed to connect.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
	config.extensions.boshPlugin.log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
	config.extensions.boshPlugin.log('Strophe is disconnected.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
	config.extensions.boshPlugin.roster.queryRoster();
	// register Handlers for events, this should be done in the respectiv Sub-Objects (chat,pubsub chat)
	config.extensions.boshPlugin.connection.addHandler(boshPlugin.chat.messageIn,null, 'message', null, null,  null);
	config.extensions.boshPlugin.connection.addHandler(boshPlugin.roster.queryRoster,"jabber:iq:roster", "iq", "set");
	config.extensions.boshPlugin.connection.addHandler(boshPlugin.onForm,"jabber:x:data", null, null);
		config.extensions.boshPlugin.log('Strophe is connected.');
	}
},
disconnect: function() {
config.extensions.boshPlugin.connection.disconnect();
},

connect: function(form) {
    //config.extensions.boshPlugin.connection = new Strophe.Connection("https://bosh.jabber.systemli.org/");
	config.extensions.boshPlugin.rawLog = "";
    config.extensions.boshPlugin.connection = new Strophe.Connection(config.options.txtXmppBoshServerUrl);
    config.extensions.boshPlugin.connection.rawInput = config.extensions.boshPlugin.rawInput;
    config.extensions.boshPlugin.connection.rawOutput = config.extensions.boshPlugin.rawOutput;
    config.extensions.boshPlugin.connection.xmlInput =  config.extensions.boshPlugin.xmlInput;
    config.extensions.boshPlugin.connection.xmlOutput = config.extensions.boshPlugin.xmlOutput;
    config.extensions.boshPlugin.jid = form.jid.value;
    if (!store.getTiddler) 
      {
         store.getTiddler=function(title) {return this.tiddlers[title];};
      }
  //  config.extensions.boshPlugin.tiddler = window.story.findContainingTiddler(form).id.substr(7);
    config.options.txtUserName = form.jid.value;
    config.extensions.boshPlugin.connection.connect(form.jid.value+"/web",
	       form.pwd.value,
			       config.extensions.boshPlugin.onConnect);

},
/*
      this is not finished, but should be an universial handler for incomming forms, saving the Outer stanza, render the form to html and 
	  and send it back to where it cam From
*/
onForm: function(iq) {          
	displayMessage("receivedForm");
	var ReturnFrame = iq;
	displayMessage(Strophe.serialize(ReturnFrame));
	$(ReturnFrame).attr('to',$(ReturnFrame).attr('from'));
	$(ReturnFrame).removeAttr('from');
	displayMessage(Strophe.serialize(ReturnFrame));
	$(ReturnFrame).find('x').detach();
	displayMessage(Strophe.serialize("IQ: "+Strophe.serialize(iq)));
	
}
};

/*
   Macros to User with BoshPlugin
*/
// login form
config.macros.bosh = {
	handler: function (place, macroName, params, wikifier, paramString, tiddler) {
		form = "<html><form><label for='jid'>JID:</label><input name ='jid' type='text' id='jid' value=''/><label for='pass'>Password:</label><input name='pwd' type='password' id='pass'/><input type='button' id='connect' value='connect' onclick='config.extensions.boshPlugin.connect(this.form)' /><input type='button' id='disconnect' value='disconnect' onclick='config.extensions.boshPlugin.disconnect()' /></form></html>";
		wikify(form,place);
	}
};
})(jQuery);              
