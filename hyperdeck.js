var instance_skel = require('../../instance_skel');
var HyperdeckLib = require("hyperdeck-js-lib");
var debug;
var log;

function instance(system, id, config) {
	var self = this;
	// super-constructor
	instance_skel.apply(this, arguments);
	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.config = config;
	self.destroy();
	self.connect();
};

instance.prototype.connect = function() {
	var self = this;
	self.status(self.STATE_WARNING,'Connecting');
	self.actions(); // export actions

	self.destroy();

	if (self.config.host !== undefined && self.config.host != "") {
		debug("trying to connect to",self.config.host);
		self.hyperdeck;
		self.hyperdeck = new HyperdeckLib.Hyperdeck(self.config.host);
		self.hyperdeck.onConnected().then(function() {
			self.debug('onConnected().then');
			self.status(self.STATE_OK);
			self.log('info', "Connected to " + self.config.host);
			self.connected = true;

	    self.hyperdeck.getNotifier().on("connectionLost", function() {
				self.debug('getNotifier().on(connectionLost)');
				self.log('error', 'disconnected');
	    });

		}).catch(function() {
			self.debug('onConnected().catch()');
			self.status(self.STATE_ERROR, "disconnected");
			self.connected = false;
			self.destroy();

			if (self.reconnect_timer !== undefined) {
				clearTimeout(self.reconnect_timer);
			}

			self.debug('set reconnect timer');

			self.reconnect_timer = setTimeout(function() {
				self.debug('reconnect timer done', self.config);
				self.connect();
			}, 5000);

		});
	}
	else {
		self.status(self.STATE_ERROR, "no ip configured");
	}
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_WARNING,'Connecting');
	self.connected = false;
	self.connect();

	return true;

};

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
	self.connected = false;

	if (self.hyperdeck !== undefined) {
		self.hyperdeck.destroy();
		delete self.hyperdeck;
	}

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
