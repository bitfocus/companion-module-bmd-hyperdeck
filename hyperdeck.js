var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function addZero(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

function renameTimestamp(t_mask) {
	var d		= new Date();
	var curr_date	= addZero(d.getDate());
	var curr_month	= addZero(d.getMonth()+1);
	var curr_year	= addZero(d.getFullYear());
	var h		= addZero(d.getHours());
	var m		= addZero(d.getMinutes());
	var stamp	= '';
	if (t_mask == '') {
		stamp 	= curr_year + "" + curr_month + "" + curr_date + "_" + h + m;
	} else {
		var mask = t_mask.split(":");
		while (mask[0] != undefined) {
			switch (mask[0]) {
				case "YYYY" :
					stamp = stamp.concat(curr_year);
					break;
				case "MM" :
					stamp = stamp.concat(curr_month);
					break;
				case "DD" :
					stamp = stamp.concat(curr_date);
					break;
				case "HH" :
					stamp = stamp.concat(h);
					break;
				case "MI" :
					stamp = stamp.concat(m);
					break;
				case "-" :
					stamp = stamp.concat("-");
					break;
				case "_" :
					stamp = stamp.concat("_");
					break;
			}
			mask.shift();
		}
	}
	return stamp;
}

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

	self.status(self.STATUS_WARNING,'Connecting'); // status ok!

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
		},
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Custom Clip Record Naming',
			value: 'Companion is able to initiate recordings where the file names use a custom \'Reel-[####]\' naming convention.  The \'Reel\' is a custom name defined below and [####] is auto incremented from \'0\' by the HyperDeck.  <b>This naming is only used when starting records using the \'Record (with custom reel)\' action.</b>'
		},
		{
			type: 'textinput',
			id: 'reel',
			label: 'Custom Reel',
			width: 6,
			default: 'A001',
			regex: self.REGEX_SOMETHING
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'playCombined': {
			label: 'Play',
			options: [
				{
					type: 'dropdown',
					label: 'Single or all clips',
					id: 'single',
					default: 'true',
					choices: [{ id: 'true', label: 'single clip'},{ id: 'false', label: 'all clips'}]
				},
				{
					type: 'dropdown',
					label: 'Loop',
					id: 'loop',
					default: 'false',
					choices: [{ id: 'true', label: 'loop clips'},{ id: 'false', label: 'no loop'}]
				},
				{
					type: 'textinput',
					label: 'Speed %',
					id: 'speed',
					default: '1',
					regex: self.REGEX_NUMBER
				}
			]
		},
		/*
		'vplay': {
			label: 'Play (speed %)',
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
			label: 'Play single clip at (speed %)',
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
			label: 'Play clip in loop at (speed %)',
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
		*/
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
		'recTimestamp': {
			label: 'Record (with name and current date/time)',
			options: [
				{
					type: 'textinput',
					label: 'Filename (optional)',
					id: 'prefix',
					default: '',
				},
				{
					type: 'textinput',
					label: 'Time Mask (optional) Use ":" seperator. YYYY MM DD HH MI "-" "_" are recognized options.',
					id: 'time_mask',
					default: '',
				}
			]
		},
		'recCustom': {
			label: 'Record (with custom reel)',
			options: [
				{
					type: 'text',
					id: 'info',
					label: 'Set \'Reel\' in instance config'
				}
			]
		},
		'stop': {
			label: 'Stop'
		},
		'goto': {
			label: 'Goto (TC)',
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
		},
		'remote': {
			label: 'Remote Control (enable/disable)',
			options: [
				{
					type: 'dropdown',
					label: 'Enable/Disable',
					id: 'remoteEnable',
					default: "true",
					choices: [
						{ id: 'true', label: 'Enable' },
						{ id: 'false', label: 'Disable' }
					]
				}
			]
		}
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var opt = action.options;
	var cmd;

	switch (action.action) {

		case 'playCombined':
			cmd = `play: single clip: ${opt.single} loop: ${opt.loop} speed: ${opt.speed}`;
			break;

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

		case 'recTimestamp':
			var timeStamp = renameTimestamp(opt.time_mask);
			if (opt.prefix !== '')	{
				cmd = 'record: name: ' + opt.prefix + '-' + timeStamp + '-';
			}
			else {
				cmd = 'record: name: ' + timeStamp + '-';
			}
			break;

		case 'recCustom':
			cmd = 'record: name: ' + self.config.reel + '-';
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

		case 'remote':
			cmd = 'remote: enable: '+ opt.remoteEnable;
			break;
	}

	if (cmd !== undefined) {

		debug('sending',cmd,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\n");
			self.socket.send('notify: transport: true\n');
		} else {
			debug('Socket not connected :(');
		}
	}

	// debug('action():', action);
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
