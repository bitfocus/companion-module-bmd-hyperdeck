var instance_skel = require('../../instance_skel');
var HyperdeckLib = require("hyperdeck-js-lib");
var Logger = HyperdeckLib.Logger;
Logger.setLevel(Logger.DEBUG);

var debug;
var log;

function instance(system, id, config) {
	var self = this;
	// super-constructor
	instance_skel.apply(this, arguments);
	self.actions(); // export actions
	self.connect();
	return self;
}

instance.prototype.connect = function() {
	var self = this;
	self.hyperdeck = new HyperdeckLib.Hyperdeck(self.config.host);
};

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
};

instance.prototype.init = function() {
	var self = this;
	self.status(self.STATE_OK); // report status ok!
	debug = self.debug;
	log = self.log;

};

/*
self.hyperdeck.onConnected().then(function() {
	self.hyperdeck.makeRequest("device info").then(function(response) {
	  console.log("Got response with code "+response.code+".");
	  console.log("Hyperdeck unique id: "+response.params["unique id"]);
	}).catch(function(errResponse) {
	  if (!errResponse) {
	    console.error("The request failed because the hyperdeck connection was lost.");
	  }
	  else {
	    console.error("The hyperdeck returned an error with status code "+errResponse.code+".");
	  }
	});

	self.hyperdeck.getNotifier().on("asynchronousEvent", function(response) {
	  console.log("Got an asynchronous event with code "+response.code+".");
	});

	self.hyperdeck.getNotifier().on("connectionLost", function() {
	  console.error("Connection lost.");
	});
}).catch(function() {
	console.error("Failed to connect to hyperdeck.");
});

*/

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			tooltip: 'The IP of the HyperDeck',
			regex: self.REGEX_IP
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destory", self.id);;
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'vplay':	{
			 label: 'Play (Speed %)',
			 options: [
				{
					 type: 'textinput',
					 label: 'Speed %',
					 id: 'speed',
					 default: "1"
				}
			 ]
			 },

		'play':     { label: 'Play' },
		'rec':      { label: 'Record' },
		'stop':     { label: 'Stop' },
		'goto':     {
			 label: 'Goto (Tc)',
			 options: [
				{
					type: 'textinput',
					label: 'Timecode hh:mm:ss:ff',
					id: 'tc',
					default: "00:00:01:00",
					regex: self.REGEX_TIMECODE
				 }
			]
			},
		'select':   {
			label: 'select (slot)',
			options: [
				{
					type: 'dropdown',
						 label: 'Slot (1/2)',
						 id: 'slot',
						 default: "1",
						 choices: [
			 				{ id: 1, label: 'Slot 1' },
			 				{ id: 2, label: 'Slot 2' }
			 			]
				}
			]
		}

	});
}

instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;

	switch (action.action) {

		case 'vplay':
			self.hyperdeck.play(action.options.speed);
			break;

		case 'play':
			self.hyperdeck.play();
			self.hyperdeck.transportInfo();
			break;

		case 'stop':
			self.hyperdeck.stop()
			break;

		case 'rec':
			self.hyperdeck.record();
			break;

		case 'goto':
			self.hyperdeck.goTo(action.options.tc);
			break;

		case 'select':
			self.hyperdeck.slotSelect(action.options.slot);
			break;



	};

};

instance.module_info = {
	label: 'BMD Hyperdeck',
	id: 'hyperdeck',
	version: '0.0.1'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
