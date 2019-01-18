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
			self.status(self.STATUS_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATUS_OK);
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
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Warning',
			value: 'Hyperdeck only supports 1 connection at any given time. Be sure to disconect any other devices controling it. Remember to press the remote button on the frontpanel of the Hyperdeck to enable remote control.'
		},
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
		'vplay': {
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
		'vplaysingle': {
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
		'vplayloop': {
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
		'play': {
			label: 'Play'
		},
		'playSingle': {
			label: 'Play Single Clip'
		},
		'playLoop': {
			label: 'Play Clip in Loop'
		},
		'rec': {
			label: 'Record'
		},
		'recName': {
			label: 'Record (with name)',
			options: [
				{
					type: 'textinput',
					label: 'Filename (without extension)',
					id: 'name',
					default: '',
					regex: self.REGEX_SOMETHING
				}
			]
		},
		'stop': {
			label: 'Stop'
		},
		'goto': {
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
		'gotoN': {
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
		'goFwd': {
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
		'goRew': {
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
		'goStartEnd': {
			label: 'Go to (start|end) of clip',
			options: [
				{
					type: 'dropdown',
					id: 'startEnd',
					default: 'start',
					choices: [
						{ id: 'start', label: 'Start'},
						{ id: 'end', label: 'End'}
					]
				}
			]
		},
		'jogFwd': {
			label: 'Jog forward (TC) duration',
			options: [
				{
					type: 'textinput',
					label: 'Timecode hh:mm:ss:ff',
					id: 'jogFwdTc',
					default: "00:00:00:01",
					regex: self.REGEX_TIMECODE
				}
			]
		},
		'jogRew': {
			label: 'Jog backward (TC) duration',
			options: [
				{
					type: 'textinput',
					label: 'Timecode hh:mm:ss:ff',
					id: 'jogRewTc',
					default: "00:00:00:01",
					regex: self.REGEX_TIMECODE
				}
			]
		},
		'select': {
			label: 'Select (slot)',
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
		},
		'videoSrc': {
			label: 'video source',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'videoSrc',
					default: 'SDI',
					choices: [
						{ id: 'SDI', label: 'SDI' },
						{ id: 'HDMI', label: 'HDMI' },
						{ id: 'component', label: 'Component' }
					]
				}
			]
		},
		'audioSrc': {
			label: 'Audio source',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'audioSrc',
					default: 'embedded',
					choices: [
						{ id: 'embedded', label: 'Embedded' },
						{ id: 'XLR', label: 'XLR' },
						{ id: 'RCA', label: 'RCA' }
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

		case 'recName':
			cmd = 'record: name: ' + opt.name;
			break;

		case 'goto':
			cmd = 'goto: timecode: '+ opt.tc;
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
				
		case 'goStartEnd':
			cmd = 'goto: clip: '+ opt.startEnd;
			break;

		case 'jogFwd':
			cmd = 'jog: timecode: +'+ opt.jogFwdTc;
			break;
				
		case 'jogRew':
			cmd = 'jog: timecode: -'+ opt.jogRewTc;
			break;
				
		case 'select':
			cmd = 'slot select: slot id: '+ opt.slot;
			break;
				
		case 'videoSrc':
			cmd = 'configuration: video input: '+ opt.videoSrc;
			break;
				
		case 'audioSrc':
			cmd = 'configuration: audio input: '+ opt.audioSrc;
			break;
	};

	if (cmd !== undefined) {

		debug('sending',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\n");
			self.socket.send('notify: transport: true\n')
		} else {
			debug('Socket not connected :(');
		}

	}

	// debug('action():', action);

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
