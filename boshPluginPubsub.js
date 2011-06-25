(function($) {
// hijacking saveTiddler & removeTiddler, looking for the extended field "node" and optionally "id" for publishing  
// or retracting tiddlers as items. ToDo: modularize the code, pack a function tiddlerToItem(Tiddler) and itemToTiddler(Item)
boshPlugin = config.extensions.boshPlugin;

TiddlyWiki.prototype.saveTiddler_original = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created) {
	if (fields && fields.node) {      // does the tiddler have a node field, then update the node
		var published = modified;
		var updated = new Date();
		var id;
		if (fields.id) {               // is there already an ID (means the tiddler has already been published)
			id = fields.id;
		}
		else {            // No? create one! 
			id = config.extensions.boshPlugin.connection.getUniqueId('post');
			newTitle = id;
			fields.id = id;   // and add an id field
			tags = tags + " blog " + fields.node;  // an update the tags
		}
		var post = {title: fields.itemtitle,                            // construct the post
							content: newBody, published: published.formatString("YYYY-0MM-0DDT0hh:0mm:0ssZ"),
							updated: updated.formatString("YYYY-0MM-0DDT0hh:0mm:0ssZ"),author: config.options.txtUserName, id: id}
		config.extensions.boshPlugin.pubsub.publishToNode(fields.node,post);  // Post
   		var tiddler = this.saveTiddler_original(title,newTitle,newBody,modifier,modified,tags,fields); // save the tiddler to the wiki
		tiddler.fields['doNotSave'] = true;   // ... we dont want this tiddler to be persistently stored in the wiki, do we?
	  	return tiddler;
	}
	else {                       // no node field, normal tiddler
		return this.saveTiddler_original(title,newTitle,newBody,modifier,modified,tags,fields);
	}
	
}
TiddlyWiki.prototype.removeTiddler_original = TiddlyWiki.prototype.removeTiddler;
TiddlyWiki.prototype.removeTiddler = function(title) {
	var tiddler = store.fetchTiddler(title);
	if (tiddler.fields.node && config.extensions.boshPlugin.pubsub.deleteFromNode(tiddler.fields.node,tiddler.fields.id)) {
		displayMessage("Successfully removed Item from Node.");
	}
	this.removeTiddler_original(title);
}
/*
	PubSub Functionality  XEP 0060
*/
var pubsub;
pubsub = config.extensions.boshPlugin.pubsub = {
	iqFrames: {},    // Stores the outer Frames of incomming Nod Config Forms for sending back the answer (could be replaced by boshPlugin.onForm later)
	nodes: {},      // stores discovered nodes (gets overwritten with each discovery attempt)
	// find nodes
	findNodes: function(node) {
		var iq = $iq({type: 'get',to: Strophe.getBareJidFromJid(node)});
		if (Strophe.getResourceFromJid(node)){
			iq.c('query', {xmlns: 'http://jabber.org/protocol/disco#items', node: Strophe.getResourceFromJid(node)});
		}
		else {
			iq.c('query', {xmlns: 'http://jabber.org/protocol/disco#items'});			
		}
		config.extensions.boshPlugin.connection.sendIQ(iq,config.extensions.boshPlugin.pubsub.findNodesCallback);
	},
	findNodesCallback: function(iq) {
		var nodes = [];
		var from = $(iq).attr('from');
		$(iq).find('item').each(function () {
			var node = $(this).attr('node');
            var name = $(this).attr('name') || node;
            displayMessage(name + " -- " + node)
			config.extensions.boshPlugin.pubsub.nodes[from+"/"+node] = name;
		});
	}, 
	// subscribe
	subscribeToNode: function(node, jid) {
		if (!jid) {
			jid = config.extensions.boshPlugin.jid;
		}
		var iq = $iq({type: 'set', to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub'}).c('subscribe',{node: Strophe.getResourceFromJid(node),jid: jid});	
		config.extensions.boshPlugin.connection.sendIQ(iq,function (iq) {displayMessage('sucess subscribing to Node');},function (iq) {displayMessage("Error subscribing to Node: "+Strophe.serialize(iq));});
	},
	// unsubscribe
	unsubscribeFromNode: function(node, jid) {
		if (!jid) {
			jid = config.extensions.boshPlugin.jid;
		}
		var iq = $iq({type: 'set', to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub'}).c('unsubscribe',{node: Strophe.getResourceFromJid(node),jid: jid});	
		config.extensions.boshPlugin.connection.sendIQ(iq,function (iq) {displayMessage('sucess unsubscribing to Node');},function (iq) {displayMessage("Error unsubscribing to Node: "+Strophe.serialize(iq));});
	},
	// retrieve Node items, give the result to the specified callback function ...
	getItemsFromNode: function(node,callback) {
		var iq = $iq({type: 'get', to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub'}).c('items',{node: Strophe.getResourceFromJid(node)});	
		config.extensions.boshPlugin.connection.sendIQ(iq,callback);
	},
    // gets the result of a getItemsFromNode run, converts Atom-ActivityStrea.ms (only small subset: author,title,content,published,modified) 
	// to Tiddler and saves tiddler to the store
	mapItemsToTiddlers: function(iq) {
		//story.closeAllTiddlers();
		var service =  $(iq).attr('from'); 
		var pubsubnode;
		var counter = 0;
		$(iq).find('items').each(function () {
			pubsubnode = $(this).attr('node');
		 $(iq).find('item').each(function () {
			var id = $(this).attr('id');
			$(this).find('entry').each(function () {
				counter = counter + 1;
				var author = "anonymous";
				var itemtitle = "";
				var content = "";
				var published = null;
				var updated = null;
				
				if (this.getElementsByTagName("title")) {
					if (this.getElementsByTagName("title")[0].childNodes[0]) {
						itemtitle = this.getElementsByTagName("title")[0].childNodes[0].nodeValue;
					}                                                                             
					else {itemtitle = 'undefined'}
				}	
				if (this.getElementsByTagName("content")[0]){
                                        if (content = this.getElementsByTagName("content")[0].childNodes[0]){
                                        	content = this.getElementsByTagName("content")[0].childNodes[0].nodeValue;
                                        	}
                                        else {content = "";}
                                }
				if (this.getElementsByTagName("author")[0]){
                                        author = this.getElementsByTagName("author")[0];
					if (author.getElementsByTagName("name")[0]) {
						author = author.getElementsByTagName("name")[0].nodeValue;
					}
					else {
						author = this.getElementsByTagName("author")[0].childNodes[0].nodeValue;
					}					
                                }
				if (this.getElementsByTagName("summary")[0]){
                                        content = this.getElementsByTagName("summary")[0].childNodes[0].nodeValue;
                                }
				  if (this.getElementsByTagName("published")[0]){
                                        published = this.getElementsByTagName("published")[0].childNodes[0].nodeValue;
                                	published = new Date(published);
				}
  				if (this.getElementsByTagName("updated")[0]){
                                        updated = this.getElementsByTagName("updated")[0].childNodes[0].nodeValue;
                                	updated = new Date(updated);
				}
				var tiddler = store.createTiddler(id);
				tiddler.fields['doNotSave'] = true;                     // temporary ...
				tiddler.set(null,content,author,updated,"blog excludeLists "+service+"/"+pubsubnode,published,{id: id,node: service+"/"+pubsubnode,itemtitle: itemtitle,template: 'blog'});
				//story.displayTiddler(null,tiddler.title);
                	});
			});
			displayMessage("loaded "+ counter + " entries.");
		});
	},
	// doesnt work ...
	retrieveNodeInfo: function(node,callback) {
		//var iq = $iq({type: 'get', to: Strophe.getBareJidFromJid(node)}).c('query',{xmlns: "http://jabber.org/protocol/disco#info", node: Strophe.getResourceFromJid(node)});
		var iq = $iq({type: 'get', to: 'pubsub.jabber.systemli.org'}).c('query',{xmlns: "http://jabber.org/protocol/disco#info", node: "gaga@jabber.systemli.org/"+Strophe.getResourceFromJid(node)+"/"});
		
		config.extensions.boshPlugin.connection.sendIQ(iq,function(iq,callback) {
		   			var fields = {};
					$('x > field',iq).each(function() {
			        	       var search = /pubsub#(.+)/gi;
							   var result = search.exec($(this).attr('var'));
							   $('value',this).each(function(){
								  fields[result[1]].append($(this).text());
							    	displayMessag(result[1]);
							   }); 
					});
					
			},null);
	},
	// retrieve Items, display them in chronilogical order & render a post input panel on top for posting
	displayNode: function(node) {
					   var title = "";
					   var description = "";
					/* if (!config.extensions.boshPlugin.pubsub.nodes[node]) {              // get Node Info if there is no in the cache ...
							config.extensions.boshPlugin.pubsub.retrieveNodeInfo(node, function() {
								   config.extensions.boshPlugin.pubsub.displayNode(node);
							});
					   }
					   else { 
					     	title = config.extensions.boshPlugin.pubsub.nodes[node].title;
							description = config.extensions.boshPlugin.pubsub.nodes[node].description;	*/				   
					   		config.extensions.boshPlugin.pubsub.getItemsFromNode(node,function(iq){
					   			displayMessage("working on it");
					   			config.extensions.boshPlugin.pubsub.mapItemsToTiddlers(iq);
					   			var tids=store.getTiddlers();
					   			tids=store.sortTiddlers(tids,"modified");                     
					   			story.closeAllTiddlers();
					   			for (var t=0; t<tids.length; t++) {
									if (tids[t].isTagged(node)) {
										story.displayTiddler(null,tids[t].title,'blogViewTemplate',true,true);
									}
					   			}
					   			$('#nodePublishForm').replaceWith(config.extensions.boshPlugin.pubsub.nodePublishForm(node));
					   			if ($('#tiddlerDisplayHeader').css('display') == 'none') {
						 			$('#tiddlerDisplayHeader').slideToggle('slow');
								}
							});
					/*   }   */
	},
	//create the publish Form for a node
	nodePublishForm: function(node) {  
		var form = "<div id='nodePublishForm' style='padding-right:5%;padding-left:5%;margin: 0px auto;width:80%;' ><form name='form' id='form'>";
		form = form + " <input type='hidden' id='node' name='node' value='" + node  + "'/>"
	    form = form + "<label for='title'>Title</label><br/><input style='width:100%;' id='title' name='title'/><br/>";
		form = form + "<label for='content'>Message</label><br/><textarea style='width:100%;' name='content' id'='content'></textarea><br/>";
		form = form + "<input type='button' id='post' value='post' onClick='if (form.node.value && form.title.value && form.content.value) {var published = new Date();var updated = new Date();config.extensions.boshPlugin.pubsub.publishToNode(this.form.node.value,{title: this.form.title.value, content: this.form.content.value, published: published.formatString(\"YYYY-0MM-0DDT0hh:0mm:0ssZ\"),updated: updated.formatString(\"YYYY-0MM-0DDT0hh:0mm:0ssZ\"),author: config.options.txtUserName},function(iq) {displayMessage(\"hier muss eine funktion hin, die die id aus der stanza zieht: \"+Strophe.serialize(iq));config.extensions.boshPlugin.pubsub.displayNode(\""+node+"\")});} else {displayMessage(\"Not all variables set ...\")}'</div>";
		return form;
	},
	// publish a post to a node
	publishToNode: function(node,post,callback) { // post object has post.title,post.content, post.author, post.published,post.updated
		var iq;
		if (post.id) {
			iq = $iq({type: 'set',to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub'}).c('publish',{node: Strophe.getResourceFromJid(node)}).c('item',{id: post.id}).c('entry',{xmlns: 'http://www.w3.org/2005/Atom',xmlnsactivity: "http://activitystrea.ms/spec/1.0/"});	
		}
	    else {
			iq = $iq({type: 'set',to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub'}).c('publish',{node: Strophe.getResourceFromJid(node)}).c('item').c('entry',{xmlns: 'http://www.w3.org/2005/Atom',xmlnsactivity: "http://activitystrea.ms/spec/1.0/"});
		}
		//             <entry xmlns="http://www.w3.org/2005/Atom" xmlns:activity="http://activitystrea.ms/spec/1.0/"> 
        if (!callback) {
	    	callback = function (iq) {displayMessage("sucessfully published article");};
		}
		iq = iq.c('title').t(post.title).up().c('content').t(post.content).up().c('author').c('name').t(post.author).up().c('uri').t(post.author).up().up().c('published').t(post.published).up().c('updated').t(post.updated);
				config.extensions.boshPlugin.connection.sendIQ(iq,callback,function (iq) {displayMessage("Error while Publishing Article: "+Strophe.serialize(iq));});
	},
	// retract a post from a node
	deleteFromNode: function(node,itemId) { // post object has post.title,post.content, post.author, post.published,post.updated
	var iq = $iq({type: 'set',to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub'}).c('retract',{node: Strophe.getResourceFromJid(node)}).c('item',{id: itemId});
				config.extensions.boshPlugin.connection.sendIQ(iq,function (iq) {displayMessage('succesfully deleted Item');return false;},function (iq) {displayMessage("Error while Deleting Article: "+Strophe.serialize(iq));});
		return true;
	},
	//configure a node
	configureNode: function (node) {
		var iq = $iq({type: 'get', to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub#owner'}).c('configure',{node: Strophe.getResourceFromJid(node)});
		config.extensions.boshPlugin.connection.sendIQ(iq,config.extensions.boshPlugin.pubsub.configureNodeCallback, function (iq) {displayMessage("Error configuring node: "+Strophe.serialize(iq));})
	},
	//callback for configure node
	configureNodeCallback: function(iq) {
		var node;
		$(iq).find('configure').each(function() {
				node = $(this).attr('node');	
			});
		var returnFrame = $iq({type: 'set', to: $(iq).attr('from'), 
				//id: $(iq).attr('id')
				}).c('pubsub',
				 {xmlns: 'http://jabber.org/protocol/pubsub#owner'}).c('configure',{node: node});
		var id = new Date;
		iqFrameId = id.getTime();
		config.extensions.boshPlugin.pubsub.iqFrames[iqFrameId] = returnFrame;
		$(iq).find('x').each(function () {
				config.extensions.boshPlugin.pubsub.renderForm(this,iqFrameId);
			});
	},
	// get node Affiliations
	getAffiliations: function(node) {
		var iq = $iq({type: 'get',to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub#owner'}).c('affiliations',{node: Strophe.getResourceFromJid(node)});
		config.extensions.boshPlugin.connection.sendIQ(iq,config.extensions.boshPlugin.pubsub.getAffiliationsCallback,function (iq) {displayMessage("Error getting Node Affiliations, are you Owner?" + Strophe.serialize(iq));});
	},
	// Callback
	getAffiliationsCallback: function(iq) {
		$(iq).find('affiliation').each(function (){
			//var row = "<tr id='"+$(this).attr('jid')+"'><td>"+$(this).attr('jid')+"</td><td id=>" + $(this).attr + "</td></tr>";
			var oprow = "";
			var affiliation = $(this).attr('affiliation');
			["owner","member","publisher","none","outcat"].forEach(function(option){
				if (option == affiliation) {
					oprow = oprow + "<option selected='yes'>" + option +"</option>";
				}
				else {
					oprow = oprow + "<option>" + option +"</option>";
				}
			});
			var row = "<br>" + $(this).attr('jid') + " " + "<select id='"+$(this).attr('jid')+"'>"+oprow+"</select>";
			$("#affiliationsdiv").append(row);
		});
		
	},
	// create Node
	createNode: function(node) {
		var iq = $iq({type: 'set', to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub'}).c('create',{node: Strophe.getResourceFromJid(node)});
		config.extensions.boshPlugin.connection.sendIQ(iq,function (iq) {displayMessage("sucessfully created node");},function (iq) {displayMessage("Error while creating node: "+Strophe.serialize(iq));});
	},
	// delete Node
	deleteNode: function(node) {
		var iq = $iq({type: 'set', to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub#owner'}).c('delete',{node: Strophe.getResourceFromJid(node)});
		config.extensions.boshPlugin.connection.sendIQ(iq,function (iq) {displayMessage("sucessfully deleted node");},function (iq) {displayMessage("Error while deleting node: "+Strophe.serialize(iq));});
	},
	//associate Node (Collection Nodes)
    associateNode: function(affiliationnode,affiliatednode) {
	  	var iq = $iq({type: 'set', to: Strophe.getBareJidFromJid(affiliationnode)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub#owner'}).c('collection',{node: Strophe.getResourceFromJid(affiliationnode)}).c('associate', {node: affiliatednode});
		config.extensions.boshPlugin.connection.sendIQ(iq,function (iq) {displayMessage("Success associating Nodes.");},function (iq) {displayMessage("Success associating Nodes.");});
	},
	/*
	render an XMPP Data Form to Html, gets the iqFrameIndex of the Iq frame, 
	the filled form should be attached to for sending it back ...
	*/
	renderForm: function(iq, iqFrameIndex) {
	var title;
	var form = "";
	$(iq).find('field').each(function () {              // convert each field type to html Input types ... mybe buggy
		if ($(this).attr('type') == 'boolean') {//form = form + "bool ";
			form = form + "<br><label>"+$(this).attr('label')+"</label><input type='checkbox' id='"
						+$(this).attr('var')+"'  ";
			if (this.getElementsByTagName("value")[0].childNodes[0].nodeValue == 1) {
				form = form + "checked='checked'";
			}
			form = form + "/>";
		}
		if ($(this).attr('type') == 'fixed') {//form = form + "fixed ";
			form = form + "<br><br><label>"+$(this).attr('var')
					+"' value='"+this.getElementsByTagName("value")[0].childNodes[0].nodeValue+"</label><br>";
		}
		if ($(this).attr('type') == 'hidden') {//form = form + "hidden ";
			form = form + "<br><input type='hidden' id='"+$(this).attr('var')
					+"' value='"+this.getElementsByTagName("value")[0].childNodes[0].nodeValue+"'/>";
		}
		if ($(this).attr('type') == 'jid-multi') {//form = form + "jid-multi ";
			var value = "";
			if (this.getElementsByTagName("value")[0].childNodes[0]) {
					value = this.getElementsByTagName("value")[0].childNodes[0].nodeValue;
			}
			form = form + "<br><label>Jid-Multi "+$(this).attr('label')
					+"</label><input type='textarea' rows='2' id='"+$(this).attr('var')+"' value='"+value+"'/>";
		}
		if ($(this).attr('type') == 'jid-single') {//form = form + "jid-single ";
			form = form + "<br><label>Jid-Single "+$(this).attr('label')+"</label><input type='textarea' rows='2' id='"+$(this).attr('var')+"' value='"+this.getElementsByTagName("value")[0].childNodes[0].nodeValue+"'/>";
		}
		if ($(this).attr('type') == 'list-multi') {//form = form + "list-multi ";
			form = form + "<br><label>"+$(this).attr('label')+"</label><select id='"+$(this).attr('var')+"' multiple>";
			var def;
			if ( $('> value', this) ) {   /// get already set values
				def = $('> value', this);
			}
			$(this).find('option').each(function(){
				form = form + "<option value='"+this.getElementsByTagName("value")[0].childNodes[0].nodeValue+"'";
				if (def.has(this.getElementsByTagName("value")[0])) {form = form + "selected='selected'"}
				form = form + ">";
				if ($(this).attr('label')) {form = form +$(this).attr('label');}
				else {form = form + this.getElementsByTagName("value")[0].childNodes[0].nodeValue;}
				form = form +"</option>";
			});
			form = form + "</select>";
		}
		if ($(this).attr('type') == 'list-single') {//form = form + "list-single ";
			form = form + "<br><label>"+$(this).attr('label')+"</label><select id='"+$(this).attr('var')+"'>";
			var def;
			if ( $('> value', this) ) {   /// get already set values
				def = $('> value', this)[0].childNodes[0].nodeValue;
			}
			$(this).find('option').each(function(){
				form = form + "<option value='"+this.getElementsByTagName("value")[0].childNodes[0].nodeValue+"'";
				if (this.getElementsByTagName("value")[0].childNodes[0].nodeValue == def) {
					form = form + " selected='selected'";
				} 
				form = form +">";
				if ($(this).attr('label')) {form = form +$(this).attr('label');}
				else {form = form + this.getElementsByTagName("value")[0].childNodes[0].nodeValue;}
				form = form +"</option>";
			});
			form = form + "</select>";
		}
		if ($(this).attr('type') == 'text-multi') {//form = form + "text-multi ";
				var value = "";
				if (this.getElementsByTagName("value")[0] && this.getElementsByTagName("value")[0].childNodes[0]) {value = this.getElementsByTagName("value")[0].childNodes[0].nodeValue;}
				form = form + "<br><label>TextMulti: "+$(this).attr('label')+"</label><input type='textarea' rows='2' id='"+$(this).attr('var')+"' value='"+ value+"'/>";
		}
		if ($(this).attr('type') == 'text-private') {//form = form + "text-private ";
				var value = "";
				if (this.getElementsByTagName("value")[0].childNodes[0]) {value = this.getElementsByTagName("value")[0].childNodes[0].nodeValue;}
				form = form + "<br><label>TextPrivate "+$(this).attr('label')+"</label><input type='textarea' rows='2' id='"+$(this).attr('var')+"' value='"+ value+"'/>";
		}
		if ($(this).attr('type') == 'text-single') {//form = form + "text-single ";
				var value = "";
				if (this.getElementsByTagName("value")[0].childNodes[0]) {value = this.getElementsByTagName("value")[0].childNodes[0].nodeValue;}
				form = form + "<br><label>textSingle "+$(this).attr('label')+"</label><input type='text' id='"+$(this).attr('var')+"' value='"+ value+"'/>";
		}
	});
	var tiddler = store.createTiddler('form');             // create a tiddler with the form
	tiddler.fields['doNotSave'] = true;
	tiddler.set(null,"<html><div id='"+iqFrameIndex        // add the button to call sendForm to send it away
				+"'><input id='iqFrameForm' type='hidden' value='" 
				+ iqFrameIndex + "'><form id='DataForm'>"+form 
				+"</form><br><input type='button' label='send' value='send' onClick='config.extensions.boshPlugin.pubsub.sendForm(\""
				+iqFrameIndex+"\");story.closeTiddler(\"form\");store.removeTiddler(\"form\")'></div></html>");
	story.displayTiddler(null,tiddler.title);              // display the form tiddler with the form
    },
    /*
		converts the HTML Form back to XMPP Data Form and sends it away
	*/
	sendForm: function(iqFrameIndex){                      
			displayMessage("gotit");
    		var iq = $iq({type: 'set'}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub'}).configure;
    		var returnIq = config.extensions.boshPlugin.pubsub.iqFrames[iqFrameIndex];
    		delete config.extensions.boshPlugin.pubsub.iqFrames[iqFrameIndex];
    		returnIq.c('x',{type: 'form', xmlns: 'jabber:x:data', type: 'submit'});
     		var form = $('#'+iqFrameIndex);        // finds the form via the id attribute not a good solution i quess ...
			$('select',form).each(function() {
    			var id = $(this).attr('id');
    			returnIq.c('field',{var: id});
    			$('option:selected',this).each(function(option,selected){ 
  					returnIq.c('value').t($(selected).text()).up();
  				});
  				returnIq.up();
  			});
	  		$("input[type=checkbox]",form).each(function() {
				var value;
				if ($(this).attr('checked')) {
				returnIq.c('field',{var: $(this).attr('id')}).c('value').t('1').up().up();
				}
				else {
				returnIq.c('field',{var: $(this).attr('id')}).c('value').t('0').up().up();
				}
			});
			$("input[type!=checkbox]",form).each(function() {
				returnIq.c('field',{var: $(this).attr('id')}).c('value').t($(this).attr('value')).up().up();
			});

       		config.extensions.boshPlugin.connection.sendIQ(returnIq, function() {
			displayMessage("success updating node Configuration");},function(iq) {displayMessage("error updating node Configuration: " + Strophe.serialize(iq));});
    }

};
/*
  		PubSub Macros
*/  
config.macros.bosh_retrieveNodeItems = {
	 handler: function (place, macroName, params, wikifier, paramString, tiddler) {
		var prms = paramString.parseParams(null, null, true);
		var node = getParam(prms, "node");
		var form = "<html><form>";
		if (!node) {
			form = form + "<label for='name'>Nodename (eg. shouts@pubsub.<br/>jabber.mydomain.org)</label><input name='jid' type='text' id='name'/>";
		}
		else {
			form = form + "<input name='jid' type='hidden' value='"+node+"' id='name'/>";
		}
			
		form = form + "<input type='button' id='Add' value='Get Items from Node' onclick='config.extensions.boshPlugin.pubsub.getItemsFromNode(this.form.jid.value)' /></form></html>";
		wikify(form,place);
	 }
};

config.macros.bosh_createNode = {                            ///create a pubsub node
         handler: function (place, macroName, params, wikifier, paramString, tiddler) {
                var prms = paramString.parseParams(null, null, true);
				var node = getParam(prms, "node");    
				var form = "<html><form>";
			   	if (!node) {
						form = form + "<label for='node'>pubsub node: </label><input name='node' type='text' id='node'/>";
					}
					else {
						form = form + "<input name='node:' type='hidden' id='node' value='"+node+"'/>";
				}
				form = form + "<input type='button' value='create Node' onclick='config.extensions.boshPlugin.pubsub.createNode(form.node.value);'></form></html>";
				wikify(form,place);
         }
};

config.macros.bosh_Subscriber = {                        //subscripe unsubscribe to a node
	handler: function (place, macroName, params, wikifier, paramString, tiddler) {
		var prms = paramString.parseParams(null, null, true);
		var node = getParam(prms, "node");
		var form = "<html><form name='form' id='form'>";
		if (!node) {
			form = form + "<label for='node'>pubsub node</label><input name='node' type='text' id='node'/>";
		}
		else {
			form = form + "<input name='node' type='hidden' id='node' value='"+node+"'/>";
		}
		form = form + "<input type='button' value='subscribe' onclick='config.extensions.boshPlugin.pubsub.subscribeToNode(form.node.value,config.extensions.boshPlugin.jid)'/><input type='button' value='unsubscribe' onclick='config.extensions.boshPlugin.pubsub.unsubscribeFromNode(form.node.value,config.extensions.boshPlugin.jid)'/> </form></html>";
		wikify(form,place);
	}
};
config.macros.bosh_configureNode = {                 // configure a node
         handler: function (place, macroName, params, wikifier, paramString, tiddler) {
                var prms = paramString.parseParams(null, null, true);
				var node = getParam(prms, "node");
				var form = "<form id='form'>";
				if (!node) {form = form + "<label for='node'>pubsub node</label><input type='text' id='node'>";}
				else {form = form + "<input type='hidden' id='node' value='"+node+"'>";}
				form = form + '<input type="button" id="configure node" value="configure node" onClick="config.extensions.boshPlugin.pubsub.configureNode(form.node.value)" ></form>';
				wikify("<html>"+form+"</html>",place);
		}
};

config.macros.bosh_publish = {
        handler: function (place, macroName, params, wikifier, paramString, tiddler) {
		var prms = paramString.parseParams(null, null, true);
		var node = getParam(prms, "node");
		var form = "<html><div width='100%' ><form name='form' id='form'>";
		if (!node) {
                        form = form + "<label for='node'>PubSub Node</label><input id='node' name='node'/><br/>";
                }
		else {
                        form = form + " <input type='hidden' id='node' name='node' value='" + node  + "'/>"
                }
		form = form + "<label for='title'>Title</label><br/><input width='100%' id='title' name='title'/><br/>";
		form = form + "<label for='content'>Message</label><br/><textarea width='100%' name='content' id'='content'></textarea><br/>";
		form = form + "<input type='button' id='post' value='post' onClick='if (form.node.value && form.title.value && form.content.value) {var published = new Date();var updated = new Date();config.extensions.boshPlugin.pubsub.publishToNode(this.form.node.value,{title: this.form.title.value, content: this.form.content.value, published: published.formatString(\"YYYY-0MM-0DDT0hh:0mm:0ssZ\"),updated: updated.formatString(\"YYYY-0MM-0DDT0hh:0mm:0ssZ\"),author: config.options.txtUserName});} else {displayMessage(\"Not all variables set ...\")}'</div></html>";
		wikify(form,place);
	}
};

config.macros.bosh_lLog = {
        handler: function (place, macroName, params, wikifier, paramString, tiddler) {
		html = "<html><textarea>" + config.extensions.boshPlugin.rawLog + "</textarea></html>";
		wikify(html,place);
		}
};
config.macros.bosh_pubsubManager = {
		getNodes:  function (form) {
			config.extensions.boshPlugin.pubsub.findNodes(form.service.value);
			var options = "";
			for (var node in config.extensions.boshPlugin.pubsub.nodes){
				options = options + "<option id='" + node + "'>"+node+"</options>"
			}
			$('#form_pubsubmanager_NodeSelect').replaceWith("<select id='form_pubsubmanager_NodeSelect' onchange='config.macros.bosh_pubsubManager.renderFormForNode(this.value)'>" + options + "</select>");
			
		},
		renderFormForNode: function (node) {
			var form =  "<html><input type='button' value='delete node' onClick='config.extensions.boshPlugin.pubsub.deleteNode(\""+node+"\")'></html>"
			form = form + wikifyStatic("<<bosh_retrieveNodeItems node:'"+node+"'>>");
			form = form + wikifyStatic("<<bosh_Subscriber node:'"+node+"'>>");
			form = form + wikifyStatic("<<bosh_configureNode node:'"+node+"'>>");
			form = form + wikifyStatic("<<bosh_publish node:'"+node+"'>>");
			form = form + wikifyStatic("<<bosh_affiliationsManager node:'"+node+"'>>");      
			
			$('#FormForNode').replaceWith("<div id='FormForNode'> <h2>Node: " + node + "</h2><br>"+form + "</div>");
		
		},
        handler: function (place, macroName, params, wikifier, paramString, tiddler) {
			var form = "<html><form id='form_pubsubmanager'><label for='service'>pubsubserver:</label><input type='text' id='service'><input type='button' value='discover nodes' onClick='config.macros.bosh_pubsubManager.getNodes(form);'/><select id='form_pubsubmanager_NodeSelect' onchange='' ></select><div id='FormForNode'></div></form></html>";
			form = form + "<<bosh_createNode>>";
			wikify(form,place);
	},
};	

config.macros.bosh_affiliationsManager = {
		handler: function (place, macroName, params, wikifier, paramString, tiddler) {
			var prms = paramString.parseParams(null, null, true);
			var node = getParam(prms, "node");
			config.extensions.boshPlugin.pubsub.getAffiliations(node);
			var form = "<html><div id='affiliationsdiv'></div><form id='addJidForm'><label for='jid'>Add Jid:</label><input type='text' id='jid'><input type='button' value='add' onClick='config.macros.bosh_affiliationsManager.addJid(form.jid.value)'><input type='button' value='save user affiliations' onClick='config.macros.bosh_affiliationsManager.sendForm(form,\""+node+"\")'><form></html>";
	
			wikify(form,place);
		},
		addJid: function(jid) {
			$("#affiliationsdiv").append("<br>" + jid + " <select id='" + jid + "''><option>owner</option><option>member</option><option>publisher</option><option>publish-only</option><option>none</option><option>outcast</option></select>");
		},
		sendForm: function(form,node) {
			var iq = $iq({type: 'set', to: Strophe.getBareJidFromJid(node)}).c('pubsub',{xmlns: 'http://jabber.org/protocol/pubsub#owner'}).c('affiliations',{node: Strophe.getResourceFromJid(node)});
			$("#affiliationsdiv").find('select').each(function() {
				iq.c('affiliation',{jid: $(this).attr('id'),affiliation: $(this).attr('value')}).up();
			});
			boshPlugin.connection.sendIQ(iq,function (){displayMessage("success updating Affiliations");},function (iq){displayMessage("Error updating Affiliations " + Strophe.serialize(iq));});
	//		displayMessage(Strophe.serialize(iq));
		},
	};
                                              

})(jQuery);
