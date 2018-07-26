var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(1,'Connecting'); // status ok!

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 9993);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
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
		'vplaysingle':	{
			label: 'Play single clip at (Speed %)',
			options: [
				{
					type: 'textinput',
					label: 'Speed %',
					id: 'speed',
					default: "1"
				}
			]
		},

		'vplayloop':	{
			label: 'Play clip in loop at (Speed %)',
			options: [
				{
					type: 'textinput',
					label: 'Speed %',
					id: 'speed',
					default: "1"
				}
			]
		},

		'play':      { label: 'Play' },
		'playSingle':{ label: 'Play Single Clip' },
		'playLoop':  { label: 'Play Clip in Loop' },
		'rec':       { label: 'Record' },
		'stop':      { label: 'Stop' },
		'goto':      {
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
		'gotoN':     {
			label: 'Goto Clip (n)',
			options: [
				{
					type: 'textinput',
					label: 'Clip Number',
					id: 'clip',
					default: '1',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'goFwd':     {
			label: 'Go forward (n) clips',
			options: [
				{
					type: 'textinput',
					label: 'Number of clips',
					id: 'clip',
					default: '1',
					regex: self.REGEX_NUMBER
				 }
			]
		},
		'goRew':     {
			label: 'Go backward (n) clips',
			options: [
				{
					type: 'textinput',
					label: 'Number of clips',
					id: 'clip',
					default: '1',
					regex: self.REGEX_NUMBER
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
};


	instance.prototype.action = function(action) {
		var self = this;
		var opt = action.options

		switch (action.action) {

			case 'vplay':
				cmd = 'play: speed: '+ opt.speed;
				break;

			case 'vplaysingle':
				cmd = 'play: single clip: true: speed: '+ opt.speed;
				break;

			case 'vplayloop':
				cmd = 'play: loop: true: speed: '+ opt.speed;
				break;

			case 'play':
				cmd = 'play';
				break;

			case 'playSingle':
				cmd = 'play: single clip: true';
				break;

			case 'playLoop':
				cmd = 'play: loop: true';
				break;

			case 'stop':
				cmd = 'stop';
				break;

			case 'rec':
				cmd = 'record';
				break;

			case 'goto':
				cmd = 'goto: timecode: '+ opt.tc;
				break;

			case 'select':
				cmd = 'slot select: slot id: '+ opt.slot;
				break;

			case 'gotoN':
				cmd = 'goto: clip id: '+ opt.clip;
				break;

			case 'goFwd':
				cmd = 'goto: clip id: +'+ opt.clip;
				break;

			case 'goRew':
				cmd = 'goto: clip id: -'+ opt.clip;
				break;
	};





	if (cmd !== undefined) {

		debug('sending ',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\n");
			self.socket.send('notify: transport: true'+ '\n')
		} else {
			debug('Socket not connected :(');
		}

	}

	// debug('action():', action);

};

instance.module_info = {
	label: 'BMD Hyperdeck',
	id: 'hyperdeck',
	version: '0.0.6'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
