var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

/**
 * Companion instance class for the Blackmagic HyperDeck Disk Recorders.
 *
 * @extends instance_skel
 * @version 1.1.0
 * @since 1.0.0
 * @author Per Roine <per.roine@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of a HyperDeck module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.stash        = [];
		this.command      = null;
		this.selected     = 0;
		this.deviceName   = '';

		// v1.0.* -> v1.1.0
		/* TODO: finish upgrade conversion of old play commands
		this.addUpgradeScript(function (config, actions) {
			// Presets were actions instead of choices
			var changed = false;

			for (var k in actions) {
				var action = actions[k];

				var actionid = action.action;
				var match;

				if (match = actionid.match(/^recall_preset_pvw_id_(\d+)/)) {
					if (action.options === undefined) {
						action.options = {};
					}
					action.options.preset_in_pvw = match[1];
					action.action = 'preset_in_pvw';
					action.label = self.id + ':' + action.action;

					changed = true;
				}

				if (match = actionid.match(/^recall_preset_pgm_id_(\d+)/)) {
					if (action.options === undefined) {
						action.options = {};
					}
					action.options.preset_in_pgm = match[1];
					action.action = 'preset_in_pgm';
					action.label = self.id + ':' + action.action;

					changed = true;
				}
			}

			return changed;
		});
		*/

		this.CONFIG_MODEL = {
			hdStudio: {
				id:          'hdStudio',
				label:       'HyperDeck Studio',
				videoInputs: ['SDI','HDMI'],
				audioInputs: ['embedded'],
				formats:     ['uncompressed','prores','proxy','DNxHD220'],
				maxShuttle:  1600
			},
			hdStudioPro: {
				id:          'hdStudioPro',
				label:       'HyperDeck Studio Pro',
				videoInputs: ['SDI','HDMI','component'],
				audioInputs: ['embedded','XLR','RCA'],
				formats:     ['uncompressed','prores','proxy','DNxHD220'],
				maxShuttle:  1600
			},
			hdStudio12G: {
				id:          'hdStudio12G',
				label:       'HyperDeck Studio 12G',
				videoInputs: ['SDI','HDMI'],
				audioInputs: ['embedded'],
				formats:     ['uncompressed','prores','proxy','DNx','DNxHD220','DNxHR_HQX'],
				maxShuttle:  1600
			},
			bmdDup4K: {
				id:          'bmdDup4K',
				label:       'Blackmagic Duplicator 4K',
				videoInputs: ['SDI','optical'],
				audioInputs: ['embedded'],
				formats:     ['H.264','H.265'],
				maxShuttle:  100
			},
			hdStudioMini: {
				id:          'hdStudioMini',
				label:       'HyperDeck Studio Mini',
				videoInputs: ['SDI'],
				audioInputs: ['embedded'],
				formats:     ['uncompressed','prores','proxy','DNx','DNxHD220','DNxHR_HQX','H.264'],
				maxShuttle:  1600
			},
			hdExtreme8K: {
				id:          'hdExtreme8K',
				label:       'HyperDeck Extreme 8K',
				videoInputs: ['SDI','HDMI','component','composite','optical'],
				audioInputs: ['embedded','XLR','RCA'],
				formats:     ['prores','H.265'],
				maxShuttle:  5000
			}
		};

		this.CONFIG_AUDIOINPUTS = {
			embedded: { id: 'embedded', label: 'Embedded' },
			XLR:      { id: 'XLR',      label: 'XLR'      },
			RCA:      { id: 'RCA',      label: 'RCA'      }
		};

		this.CONFIG_VIDEOINPUTS = {
			SDI:       { id: 'SDI',       label: 'SDI'       },
			HDMI:      { id: 'HDMI',      label: 'HDMI'      },
			component: { id: 'component', label: 'Component' },
			composite: { id: 'composite', label: 'Composite' },
			optical:   { id: 'optical',   label: 'Optical'   }
		};

		this.CONFIG_FILEFORMATS = [
			{ id: 'QuickTimeUncompressed', label: 'QuickTime Uncompressed', family: 'uncompressed' },
			{ id: 'QuickTimeProResHQ',     label: 'QuickTime ProRes HQ',    family: 'prores'       },
			{ id: 'QuickTimeProRes',       label: 'QuickTime ProRes',       family: 'prores'       },
			{ id: 'QuickTimeProResLT',     label: 'QuickTime ProRes LT',    family: 'prores'       },
			{ id: 'QuickTimeProResProxy',  label: 'QuickTime ProRes Proxy', family: 'proxy'        },
			{ id: 'QuickTimeDNxHD45',      label: 'QuickTime DNxHD 45',     family: 'DNx'          },
			{ id: 'DNxHD45',               label: 'MXF DNxHD 45',           family: 'DNx'          },
			{ id: 'QuickTimeDNxHR_LB',     label: 'QuickTime DNxHR LB',     family: 'DNx'          },
			{ id: 'DNxHR_LB',              label: 'MXF DNxHR LB',           family: 'DNx'          },
			{ id: 'QuickTimeDNxHD145',     label: 'QuickTime DNxHD 145',    family: 'DNx'          },
			{ id: 'DNxHD145',              label: 'MXF DNxHD 145',          family: 'DNx'          },
			{ id: 'QuickTimeDNxHR_SQ',     label: 'QuickTime DNxHR SQ',     family: 'DNx'          },
			{ id: 'DNxHR_SQ',              label: 'MXF DNxHR SQ',           family: 'DNx'          },
			{ id: 'QuickTimeDNxHD220',     label: 'QuickTime DNxHD 220',    family: 'DNxHD220'     },
			{ id: 'DNxHD220',              label: 'MXF DNxHD 220',          family: 'DNxHD220'     },
			{ id: 'QuickTimeDNxHR_HQX',    label: 'QuickTime DNxHR HQX',    family: 'DNxHR_HQX'    },
			{ id: 'DNxHR_HQX',             label: 'MXF DNxHR HQX',          family: 'DNxHR_HQX'    },
			{ id: 'H.264Low',              label: 'H.264 Low',              family: 'H.264'        },
			{ id: 'H.264Medium',           label: 'H.264 Medium',           family: 'H.264'        },
			{ id: 'H.264High',             label: 'H.264 High',             family: 'H.264'        },
			{ id: 'H.265Low',              label: 'H.265 Low',              family: 'H.264'        },
			{ id: 'H.265Medium',           label: 'H.265 Medium',           family: 'H.265'        },
			{ id: 'H.265High',             label: 'H.265 High',             family: 'H.265'        }
		];

		this.CHOICES_MODEL = Object.values(this.CONFIG_MODEL);
		// Sort alphabetical
		this.CHOICES_MODEL.sort(function(a, b){
			var x = a.label.toLowerCase();
			var y = b.label.toLowerCase();
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;
		});

		this.CHOICES_AUDIOINPUTS = [];
		this.CHOICES_FILEFORMATS = [];
		this.CHOICES_VIDEOINPUTS = [];

		this.CHOICES_DYNAMICRANGE = [
			{ id: 'auto',        label: 'Auto'         },
			{ id: 'Rec709',      label: 'Rec.709'      },
			{ id: 'Rec2020_SDR', label: 'Rec.2020 SDR' },
			{ id: 'HLG',         label: 'HLG'          },
			{ id: 'ST2084_300',  label: 'ST2084 300'   },
			{ id: 'ST2084_500',  label: 'ST2084 500'   },
			{ id: 'ST2084_800',  label: 'ST2084 800'   },
			{ id: 'ST2084_1000', label: 'ST2084 1000 ' },
			{ id: 'ST2084_2000', label: 'ST2084 2000'  },
			{ id: 'ST2084_4000', label: 'ST2084 4000'  },
			{ id: 'ST2048',      label: 'ST2048'       }
		];

		this.CHOICES_ENABLEDISABLE = [
			{ id: 'true',  label: 'Enable'  },
			{ id: 'false', label: 'Disable' }
		];

		this.CHOICES_STARTEND = [
			{ id: 'start', label: 'Start' },
			{ id: 'end',   label: 'End'   }
		];

		this.CHOICES_TRUEFALSE = [
			{ id: 'none',  label: 'No change' },
			{ id: 'true',  label: 'Yes'       },
			{ id: 'false', label: 'No'        }
		];

		if (this.config.modelID !== undefined){
			this.model = this.CONFIG_MODEL[this.config.modelID];
		}
		else {
			this.config.modelID = 'hdStudio';
			this.model = this.CONFIG_MODEL['hdStudio'];
		}

		this.actions(); // export actions
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {

		this.setupChoices();
		var actions = {};

		if (this.config.modelID != 'bmdDup4K') {
			actions['play'] = {
				label: 'Play',
				options: [
					{
						type: 'number',
						label: 'Speed %',
						id: 'speed',
						default: 100,
						min: (0 - this.model.maxShuttle),
						max: this.model.maxShuttle,
						required: true,
						range: true
					},
					{
						type: 'dropdown',
						id: 'loop',
						default: 'none',
						choices: this.CHOICES_TRUEFALSE
					},
					{
						type: 'dropdown',
						id: 'single',
						default: 'none',
						choices: this.CHOICES_TRUEFALSE
					}
				]
			};
		}

		actions['rec'] = { label: 'Record' };

		if (this.config.modelID == 'bmdDup4K') {
			actions['recAppend'] = { label: 'Append Record' };
		}

		if (this.config.modelID != 'bmdDup4K') {
			actions['recName'] = {
				label: 'Record (with name)',
				options: [
					{
						type: 'textinput',
						label: 'Filename (without extension)',
						id: 'name',
						default: '',
						regex: this.REGEX_SOMETHING
					}
				]
			};
			actions['recTimestamp'] = {
				label: 'Record (with name and current date/time)',
				options: [
					{
						type: 'textinput',
						label: 'Filename (optional)',
						id: 'prefix',
						default: '',
					}
				]
			};
			actions['recCustom'] = {
				label: 'Record (with custom reel)',
				options: [
					{
						type: 'text',
						id: 'info',
						label: 'Set \'Reel\' in instance config'
					}
				]
			};
		}

		actions['stop'] = { label: 'Stop' };

		if (this.config.modelID != 'bmdDup4K') {
			actions['goto'] = {
				label: 'Goto (TC)',
				options: [
					{
						type: 'textinput',
						label: 'Timecode hh:mm:ss:ff',
						id: 'tc',
						default: "00:00:01:00",
						regex: this.REGEX_TIMECODE
					}
				]
			};
			actions['gotoN'] = {
				label: 'Goto Clip (n)',
				options: [
					{
						type: 'textinput',
						label: 'Clip Number',
						id: 'clip',
						default: 1,
						min: 1,
						max: 999,
						required: true,
						range: false
					}
				]
			};
			actions['goFwd'] = {
				label: 'Go forward (n) clips',
				options: [
					{
						type: 'number',
						label: 'Number of clips',
						id: 'clip',
						default: 1,
						min: 1,
						max: 999,
						required: true,
						range: false
					}
				]
			};
			actions['goRew'] = {
				label: 'Go backward (n) clips',
				options: [
					{
						type: 'number',
						label: 'Number of clips',
						id: 'clip',
						default: 1,
						min: 1,
						max: 999,
						required: true,
						range: false
					}
				]
			};
			actions['goStartEnd'] = {
				label: 'Go to (start|end) of clip',
				options: [
					{
						type: 'dropdown',
						id: 'startEnd',
						default: 'start',
						choices: this.CHOICES_STARTEND
					}
				]
			};
			actions['jogFwd'] = {
				label: 'Jog forward (TC) duration',
				options: [
					{
						type: 'textinput',
						label: 'Timecode hh:mm:ss:ff',
						id: 'jogFwdTc',
						default: "00:00:00:01",
						regex: this.REGEX_TIMECODE
					}
				]
			};
			actions['jogRew'] = {
				label: 'Jog backward (TC) duration',
				options: [
					{
						type: 'textinput',
						label: 'Timecode hh:mm:ss:ff',
						id: 'jogRewTc',
						default: "00:00:00:01",
						regex: this.REGEX_TIMECODE
					}
				]
			};
			actions['shuttle'] = {
				label: 'Shuttle with speed',
				options: [
					{
						type: 'number',
						label: 'Speed %',
						id: 'speed',
						default: 100,
						min: (0 - this.model.maxShuttle),
						max: this.model.maxShuttle,
						required: true,
						range: true
					}
				]
			};
			actions['select'] = {
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
			};
		}

		if (this.CHOICES_VIDEOINPUTS.length > 1) {
			actions['videoSrc'] = {
				label: 'video source',
				options: [
					{
						type: 'dropdown',
						label: 'Input',
						id: 'videoSrc',
						default: 'SDI',
						choices: this.CHOICES_VIDEOINPUTS
					}
				]
			};
		}

		if (this.CHOICES_AUDIOINPUTS.length > 1) {
			actions['audioSrc'] = {
				label: 'Audio source',
				options: [
					{
						type: 'dropdown',
						label: 'Input',
						id: 'audioSrc',
						default: 'embedded',
						choices: this.CHOICES_AUDIOINPUTS
					}
				]
			};
		}

		if (this.CHOICES_FILEFORMATS.length > 1) {
			actions['fileFormat'] = {
				label: 'File format',
				options: [
					{
						type: 'dropdown',
						label: 'Format',
						id: 'format',
						default: 'QuickTimeProRes',
						choices: this.CHOICES_FILEFORMATS
					}
				]
			};
		}

		if (this.config.modelID == 'hdExtreme8K') {
			actions['dynamicRange'] = {
				label: 'Set playback dyanmic range',
				options: [
					{
						type: 'dropdown',
						label: 'Dynamic Range',
						id: 'format',
						default: 'auto',
						choices: this.CHOICES_DYNAMICRANGE
					}
				]
			};
		}

		actions['remote'] = {
			label: 'Remote Control (enable/disable)',
			options: [
				{
					type: 'dropdown',
					label: 'Enable/Disable',
					id: 'remoteEnable',
					default: "true",
					choices: this.CHOICES_ENABLEDISABLE
				}
			]
		};

		this.setActions(actions);
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	action(action) {
		var cmd;
		var opt = action.options;

		switch (action.action) {
			/*case 'vplay':
				cmd = 'play: speed: '+ opt.speed;
				break;
			case 'vplaysingle':
				cmd = 'play: single clip: true: speed: '+ opt.speed;
				break;
			case 'vplayloop':
				cmd = 'play: loop: true: speed: '+ opt.speed;
				break;
			case 'playSingle':
				cmd = 'play: single clip: true';
				break;
			case 'playLoop':
				cmd = 'play: loop: true';
				break;*/
			case 'play':
				if (opt.speed != 100 || opt.loop != 'none' || opt.single != 'none') {
					cmd = 'play:\nspeed: ' + opt.speed + '\n';
					cmd .= (opt.loop != 'none' ? 'loop: ' + opt.loop + '\n' : '');
					cmd .= (opt.single != 'none' ? 'single clip: ' + opt.single + '\n' : '');
				}
				else {
					cmd = 'play';
				}
				break;
			case 'stop':
				cmd = 'stop';
				break;
			case 'rec':
				cmd = 'record';
				break;
			case 'recAppend':
				cmd = 'record: append: true';
				break;
			case 'recName':
				cmd = 'record: name: ' + opt.name;
				break;
			case 'recTimestamp':
				var timeStamp = this.getTimestamp();
				if (opt.prefix !== '') {
					cmd = 'record: name: ' + opt.prefix + '-' + timeStamp + '-';
				}
				else {
					cmd = 'record: name: ' + timeStamp + '-';
				}
				break;
			case 'recCustom':
				cmd = 'record: name: ' + this.config.reel + '-';
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
			case 'shuttle':
				cmd = 'shuttle: speed: -'+ opt.speed;
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

			if (this.socket !== undefined && this.socket.connected) {
				this.socket.send(cmd);
			}
			else {
				this.debug('Socket not connected :(');
			}
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	config_fields() {
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
				regex: this.REGEX_IP
			},
			{
				type:    'dropdown',
				id:      'modelID',
				label:   'Model',
				width:   6,
				choices: this.CHOICES_MODEL,
				default: 0
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
				regex: this.REGEX_SOMETHING
			}
		]
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	destroy() {

		if (this.socket !== undefined) {
			this.socket.destroy();
		}

		debug("destroy", this.id);
	}

	/**
	 * Creates a string with the current date/time
	 *
	 * @returns {string} the current date/time in format 'YYYYMMDD_HHMM'
	 * @access public
	 * @since 1.0.3
	 */
	getTimestamp() {
		var d          = new Date();
		var curr_date  = ('0' + d.getDate()).slice(-2);
		var curr_month = ('0' + (d.getMonth()+1)).slice(-2);
		var curr_year  = d.getFullYear();
		var h          = ('0' + d.getHours()).slice(-2);
		var m          = ('0' + d.getMinutes().slice(-2));
		var stamp      = curr_year + "" + curr_month + "" + curr_date + "_" + h + m;

		return stamp;
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		debug = this.debug;
		log = this.log;

		this.status(this.STATUS_WARNING,'Connecting'); // status ok!

		this.initTCP();
	}

	/**
	 * INTERNAL: use setup data to initalize the tcp socket object.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initTCP() {
		var receivebuffer = '';

		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}

		if (this.config.port === undefined) {
			this.config.port = 9993;
		}

		if (this.config.host) {
			this.socket = new tcp(this.config.host, this.config.port);

			this.socket.on('status_change', (status, message) => {
				this.status(status, message);
			});

			this.socket.on('error', (err) => {
				this.debug("Network error", err);
				this.log('error',"Network error: " + err.message);
			});

			this.socket.on('connect', () => {
				this.debug("Connected");
				this.socket.send('notify:\ntransport: true\nslot: true\nremote: true\nconfiguration: true\n\n');
			});

			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				var i = 0, line = '', offset = 0;
				receivebuffer += chunk;

				while ( (i = receivebuffer.indexOf('\n', offset)) !== -1) {
					line = receivebuffer.substr(offset, i - offset);
					offset = i + 1;
					this.socket.emit('receiveline', line.toString());
				}

				receivebuffer = receivebuffer.substr(offset);
			});

			this.socket.on('receiveline', (line) => {

				if (this.command === null && line.match(/:/) ) {
					this.command = line;
				}
				else if (this.command !== null && line.length > 0) {
					this.stash.push(line.trim());
				}
				else if (line.length === 0 && this.command !== null) {
					var cmd = this.command.trim().split(/:/)[0];

					this.processHyperdeckInformation(cmd, this.stash);

					this.stash = [];
					this.command = null;
				}
				else {
					this.debug("weird response from hyperdeck", line, line.length);
				}
			});
		}
	}

	/**
	 * INTERNAL: Routes incoming data to the appropriate function for processing.
	 *
	 * @param {string} key - the command/data type being passed
	 * @param {Object} data - the collected data
	 * @access protected
	 * @since 1.1.0
	 */
	processHyperdeckInformation(key,data) {

		if (key.match(/connection info/)) {
			this.updateDevice(key,data);
			this.actions();
			this.initVariables();
			this.initFeedbacks();
			this.initPresets();
		}
		else {
			// TODO: find out more about the hyperdeck from stuff that comes in here
		}
	}

	/**
	 * INTERNAL: use config data to define the choices for the dropdowns.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupChoices() {
		this.CHOICES_AUDIOINPUTS = [];
		this.CHOICES_FILEFORMATS = [];
		this.CHOICES_VIDEOINPUTS = [];

		for (var id in this.model.audioInputs) {
			this.CHOICES_AUDIOINPUTS.push( this.CONFIG_AUDIOINPUTS[ this.model.audioInputs[id] ] );
		}

		for (var id in this.model.fileFormats) {
			for (var frmt in this.CONFIG_FILEFORMATS) {
				if (this.CONFIG_FILEFORMATS[frmt].family == this.model.fileFormats[id]) {
					this.CHOICES_FILEFORMATS.push( this.CONFIG_FILEFORMATS[frmt] );
				}
			}
		}

		for (var id in this.model.videoInputs) {
			this.CHOICES_VIDEOINPUTS.push( this.CONFIG_VIDEOINPUTS[ this.model.videoInputs[id] ] );
		}
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		var resetConnection = false;

		if (this.config.host != config.host)
		{
			resetConnection = true;
		}

		this.config = config;

		this.actions();
		this.initFeedbacks();
		this.initPresets();
		this.initVariables();

		if (resetConnection === true || this.socket === undefined) {
			this.initTCP();
		}
	}

	/**
	 * INTERNAL: Updates device data from the HyperDeck
	 *
	 * @param {string} labeltype - the command/data type being passed
	 * @param {Object} object - the collected data
	 * @access protected
	 * @since 1.1.0
	 */
	updateDevice(labeltype, object) {

		for (var key in object) {
			var parsethis = object[key];
			var a = parsethis.split(/: /);
			var attribute = a.shift();
			var value = a.join(" ");

			switch (attribute) {
				case 'model':
					if (value.match(/Extreme/)) {
						this.config.modelID = 'hdExtreme8K';
					}
					else if (value.match(/Mini/)) {
						this.config.modelID = 'hdStudioMini';
					}
					else if (value.match(/Duplicator/)) {
						this.config.modelID = 'bmdDup4K';
					}
					else if (value.match(/12G/)) {
						this.config.modelID = 'hdStudio12G';
					}
					else if (value.match(/Pro/)) {
						this.config.modelID = 'hdStudioPro';
					}
					else {
						this.config.modelID = 'hdStudio';
					}
					this.deviceName = value;
					this.log('info', 'Connected to a ' + this.deviceName);
					break;
			}
		}

		this.saveConfig();
	}
}

exports = module.exports = instance;
