const instance_skel = require('../../instance_skel');
const { Hyperdeck, Commands, SlotStatus, TransportStatus } = require('hyperdeck-connection')

var debug;

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

		this.stash         = [];
		this.command       = null;
		this.selected      = 0;
		this.deviceName    = '';
		this.slotInfo      = [];
		this.transportInfo = {
			"status":          '',
			"speed":           '',
			"slotId":          '',
			"clipId":          '',
			"singleClip":      '',
			"timecode":        '',
			"displayTimecode": '',
			"videoFormat":     '',
			"loop":            ''
		};
		this.pollTimer    = null;

		// v1.0.* -> v1.1.0 (combine old play actions)
		this.addUpgradeScript(function (config, actions, releaseActions, feedbacks) {
			var changed = false;

			let upgradePass = function(action, changed) {
				if (action.options === undefined) {
					action.options = {};
				}

				switch (action.action) {
					case 'vplay':
						action.options.speed = opt.speed;
						action.options.loop = false;
						action.options.single = false;
						action.action = 'play';
						action.label = this.id + ':' + action.action;
						changed = true;
						break;
					case 'vplaysingle':
						action.options.speed = opt.speed;
						action.options.loop = false;
						action.options.single = true;
						action.action = 'play';
						action.label = this.id + ':' + action.action;
						changed = true;
						break;
					case 'vplayloop':
						action.options.speed = opt.speed;
						action.options.loop = true;
						action.options.single = false;
						action.action = 'play';
						action.label = this.id + ':' + action.action;
						changed = true;
						break;
					case 'playSingle':
						action.options.speed = 100;
						action.options.loop = false;
						action.options.single = true;
						action.action = 'play';
						action.label = this.id + ':' + action.action;
						changed = true;
						break;
					case 'playLoop':
						action.options.speed = 100;
						action.options.loop = true;
						action.options.single = false;
						action.action = 'play';
						action.label = this.id + ':' + action.action;
						changed = true;
						break;
					case 'play':
						if (action.options.speed === undefined) {
							action.options.speed = 100;
							changed = true;
						}
						if (action.options.loop === undefined) {
							action.options.loop = false;
							changed = true;
						}
						if (action.options.single === undefined) {
							action.options.single = false;
							changed = true;
						}
						break;
				}

				return changed;
			}

			for (var k in actions) {
				changed = upgradePass(actions[k], changed);
			}

			for (var k in releaseActions) {
				changed = upgradePass(releaseActions[k], changed);
			}

			return changed;
		});

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

		this.CHOICES_SLOTSTATUS = [
			{ id: 'empty',    label: 'Empty'    },
			{ id: 'error',    label: 'Error'    },
			{ id: 'mounted',  label: 'Mounted'  },
			{ id: 'mounting', label: 'Mounting' }
		]

		this.CHOICES_TRANSPORTSTATUS = [
			{ id: 'preview', label: 'Preview' },
			{ id: 'stopped', label: 'Stopped' },
			{ id: 'play',    label: 'Playing' },
			{ id: 'forward', label: 'Forward' },
			{ id: 'rewind',  label: 'Rewind'  },
			{ id: 'jog',     label: 'Jog'     },
			{ id: 'shuttle', label: 'Shuttle' },
			{ id: 'record',  label: 'Record'  }
		]

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
						type:     'number',
						label:    'Speed %',
						id:       'speed',
						default:  100,
						min:      (0 - this.model.maxShuttle),
						max:      this.model.maxShuttle,
						required: true,
						range:    true
					},
					{
						type:     'checkbox',
						label:    'Loop clip',
						id:       'loop',
						default:  false
					},
					{
						type:     'checkbox',
						label:    'Single clip playback',
						id:       'single',
						default:  false
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
						type:     'dropdown',
						label:    'Go to',
						id:       'startEnd',
						default:  'start',
						choices:  this.CHOICES_STARTEND
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
			case 'play':
				cmd = new Commands.PlayCommand()
				cmd.speed = opt.speed;
				cmd.loop = opt.loop;
				cmd.singleClip = opt.single;
				break;
			case 'stop':
				cmd = new Commands.StopCommand();
				break;
			case 'rec':
				cmd = new Commands.RecordCommand();
				break;
			case 'recAppend':
				cmd = new Commands.RecordCommand();
				cmd.append = true
				break;
			case 'recName':
				cmd = new Commands.RecordCommand();
				cmd.filename = opt.name;
				break;
			case 'recTimestamp':
				cmd = new Commands.RecordCommand();
				var timeStamp = this.getTimestamp();
				if (opt.prefix !== '') {
					cmd.filename = opt.prefix + '-' + timeStamp + '-';
				}
				else {
					cmd.filename = timeStamp + '-';
				}
				break;
			case 'recCustom':
				cmd = new Commands.RecordCommand();
				cmd.filename = this.config.reel + '-';
				break;
			case 'goto':
				cmd = new Commands.GoToCommand()
				cmd.timecode = opt.tc;
				break;
			case 'gotoN':
				cmd = new Commands.GoToCommand()
				cmd.clipId = opt.clip;
				break;
			case 'goFwd':
				cmd = new Commands.GoToCommand()
				cmd.clipId = '+' + opt.clip;
				break;
			case 'goRew':
				cmd = new Commands.GoToCommand()
				cmd.clipId = '-' + opt.clip;
				break;
			case 'goStartEnd':
				cmd = new Commands.GoToCommand()
				cmd.clip = opt.startEnd;
				break;
			case 'jogFwd':
				cmd = new Commands.JogCommand()
				cmd.timecode = '+'+ opt.jogFwdTc;
				break;
			case 'jogRew':
				cmd = new Commands.JogCommand()
				cmd.timecode = '-'+ opt.jogRewTc;
				break;
			case 'shuttle':
				cmd = new Commands.ShuttleCommand()
				cmd.speed = opt.speed;
				break;
			case 'select':
				cmd = new Commands.SlotSelectCommand()
				cmd.slotId = opt.slot;
				break;
			case 'videoSrc':
				cmd = new Commands.ConfigurationCommand()
				cmd.videoInput = opt.videoSrc;
				break;
			case 'audioSrc':
				cmd = new Commands.ConfigurationCommand()
				cmd.audioInput = opt.audioSrc;
				break;
			case 'remote':
				cmd = new Commands.RemoteCommand()
				cmd.enable = opt.remoteEnable;
				break;
		}

		if (cmd !== undefined) {

			if (this.hyperDeck !== undefined && this.hyperDeck.connected) {
				this.hyperDeck.sendCommand(cmd).catch(e => {
					if (e.code) {
						this.log('error', e.code + ' ' + e.name)
					}
				});
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
				type:     'text',
				id:       'info',
				width:    12,
				label:    'Warning',
				value:    'Hyperdeck only supports 1 connection at any given time. Be sure to disconect any other devices controling it. Remember to press the remote button on the frontpanel of the Hyperdeck to enable remote control.'
			},
			{
				type:     'textinput',
				id:       'host',
				label:    'Target IP',
				width:    6,
				regex:    this.REGEX_IP
			},
			{
				type:     'dropdown',
				id:       'modelID',
				label:    'Model',
				width:    6,
				choices:  this.CHOICES_MODEL,
				default:  0
			},
			{
				type:     'text',
				id:       'info',
				width:    12,
				label:    'Custom Clip Record Naming',
				value:    'Companion is able to initiate recordings where the file names use a custom \'Reel-[####]\' naming convention.  The \'Reel\' is a custom name defined below and [####] is auto incremented from \'0\' by the HyperDeck.  <b>This naming is only used when starting records using the \'Record (with custom reel)\' action.</b>'
			},
			{
				type:     'textinput',
				id:       'reel',
				label:    'Custom Reel',
				width:    6,
				default:  'A001',
				regex:    this.REGEX_SOMETHING
			},
			{
				type:     'text',
				id:       'info',
				width:    12,
				label:    'Displaying Timecode Variable',
				value:    'If you want to use the timecode variable, you will need to enable this to retrieve the current timecode, and set the Polling Interval to an appropriate value.'
			},
			{
				type:     'checkbox',
				id:       'pollingOn',
				label:    'Enable Timecode Polling?',
				width:    6,
				default:  false
			},
			{
				type:     'number',
				id:       'pollingInterval',
				label:    'Polling Interval (in ms)',
				width:    6,
				min:      15,
				max:      10000,
				default:  500,
				required: true
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

		if (this.hyperDeck !== undefined) {
			this.hyperDeck.disconnect()
			this.hyperDeck.removeAllListeners()
			this.hyperDeck = undefined
		}

		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer);
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
		var m          = ('0' + d.getMinutes()).slice(-2);
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

		this.status(this.STATUS_WARNING,'Connecting'); // status ok!
		this.initFeedbacks();
		//this.initPresets();
		this.initVariables();

		this.initHyperdeck()
	}

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initFeedbacks() {
		var feedbacks = {};

		feedbacks['transport_status'] = {
			label: 'Transport status',
			description: 'Based on transport status, change colors of the bank',
			options: [
				{
					type:    'dropdown',
					label:   'Transport Status',
					id:      'status',
					choices: this.CHOICES_TRANSPORTSTATUS
				},
				{
					type:    'colorpicker',
					label:   'Foreground color',
					id:      'fg',
					default: this.rgb(255,255,255)
				},
				{
					type:    'colorpicker',
					label:   'Background color',
					id:      'bg',
					default: this.rgb(0,0,0)
				}
			],
			callback: ({ options }, bank) => {
				if (options.status === this.transportInfo.status) {
					return { color: options.fg, bgcolor: options.bg };
				}
			}
		}
		feedbacks['slot_status'] = {
			label: 'Slot/disk status',
			description: 'Based on disk status, change colors of the bank',
			options: [
				{
					type:    'dropdown',
					label:   'Disk Status',
					id:      'status',
					choices: this.CHOICES_SLOTSTATUS
				},
				{
					type:    'textinput',
					label:   'Slot Id',
					id:      'slotId',
					default: 1,
					regex:   this.REGEX_SIGNED_NUMBER
				},
				{
					type:    'colorpicker',
					label:   'Foreground color',
					id:      'fg',
					default: this.rgb(255,255,255)
				},
				{
					type:    'colorpicker',
					label:   'Background color',
					id:      'bg',
					default: this.rgb(0,0,0)
				}
			],
			callback: ({ options }, bank) => {
				const slot = this.slotInfo[options.slotId]
				if (slot && slot.status === options.status) {
					return { color: options.fg, bgcolor: options.bg };
				}
			}
		}
		feedbacks['transport_slot'] = {
			label: 'Active slot',
			description: 'Set the colour based on the which slot is active',
			options: [
				{
					type:    'textinput',
					label:   'Slot Id',
					id:      'setting',
					default: 1,
					regex:   this.REGEX_SIGNED_NUMBER
				},
				{
					type:    'colorpicker',
					label:   'Foreground color',
					id:      'fg',
					default: this.rgb(255,255,255)
				},
				{
					type:    'colorpicker',
					label:   'Background color',
					id:      'bg',
					default: this.rgb(0,0,0)
				}
			],
			callback: ({ options }, bank) => {
				if (options.setting == this.transportInfo.slotId) {
					return {
						color: options.fg,
						bgcolor: options.bg
					};
				}
			}
		}
		feedbacks['transport_loop'] = {
			label: 'Loop playback',
			description: 'Set the colour of the button based on the loop status',
			options: [
				{
					type:    'dropdown',
					label:   'Loop',
					id:      'setting',
					choices: this.CHOICES_ENABLEDISABLE
				},
				{
					type:    'colorpicker',
					label:   'Foreground color',
					id:      'fg',
					default: this.rgb(255,255,255)
				},
				{
					type:    'colorpicker',
					label:   'Background color',
					id:      'bg',
					default: this.rgb(0,0,0)
				}
			],
			callback: ({ options }, bank) => {
				if (options.setting === String(this.transportInfo.loop)) {
					return {
						color: options.fg,
						bgcolor: options.bg
					};
				}
			}
		}
		feedbacks['transport_singleClip'] = {
			label: 'Single clip playback',
			description: 'Set the colour of the button for single clip playback',
			options: [
				{
					type:    'dropdown',
					label:   'Single clip',
					id:      'setting',
					choices: this.CHOICES_ENABLEDISABLE
				},
				{
					type:    'colorpicker',
					label:   'Foreground color',
					id:      'fg',
					default: this.rgb(255,255,255)
				},
				{
					type:    'colorpicker',
					label:   'Background color',
					id:      'bg',
					default: this.rgb(0,0,0)
				}
			],
			callback: ({ options }, bank) => {
				if (options.setting === String(this.transportInfo.singleClip)) {
					return {
						color: options.fg,
						bgcolor: options.bg
					};
				}
			}
		}

		this.setFeedbackDefinitions(feedbacks);
	}

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initVariables() {
		var variables = [];

		variables.push({
			label: 'Transport status',
			name:  'status'
		});
		this.setVariable('status', this.transportInfo['status']);

		variables.push({
			label: 'Play speed',
			name:  'speed'
		});
		this.setVariable('speed', this.transportInfo['speed']);

		//Clip ID and Slot ID  null exceptions

		let clipIdVariable = '—';
		if (this.transportInfo['clipId'] != null) {
			clipIdVariable = this.transportInfo['clipId'];
		}

		let slotIdVariable = '—';
		if (this.transportInfo['slotId'] != null) {
			slotIdVariable = this.transportInfo['slotId'];
		}

		variables.push({
			label: 'Clip ID',
			name:  'clipId'
		});
		this.setVariable('clipId', clipIdVariable);

		variables.push({
			label: 'Slot ID',
			name:  'slotId'
		});
		this.setVariable('slotId', slotIdVariable);

		variables.push({
			label: 'Video format',
			name:  'videoFormat'
		});
		this.setVariable('videoFormat', this.transportInfo['videoFormat']);

		// Timecode variables
		let tcH    = '';
		let tcM    = '';
		let tcS    = '';
		let tcF    = '';
		let tcHMS  = '';
		let tcHMSF = '';

		let tc = this.transportInfo['displayTimecode'].match(/((\d\d):(\d\d):(\d\d))[:;](\d\d)/) || [];
		if (tc.length >= 6) {
			tcH    = tc[2];
			tcM    = tc[3];
			tcS    = tc[4];
			tcF    = tc[5];
			tcHMS  = tc[1];
			tcHMSF = tc[0];
		}
		variables.push({
			label: 'Timecode (HH:MM:SS)',
			name:  'timecodeHMS'
		});
		this.setVariable('timecodeHMS', tcHMS);

		variables.push({
			label: 'Timecode (HH:MM:SS:FF)',
			name:  'timecodeHMSF'
		});
		this.setVariable('timecodeHMSF', tcHMSF);

		variables.push({
			label: 'Timecode (HH)',
			name:  'timecodeH'
		});
		this.setVariable('timecodeH', tcH);

		variables.push({
			label: 'Timecode (MM)',
			name:  'timecodeM'
		});
		this.setVariable('timecodeM', tcM);

		variables.push({
			label: 'Timecode (SS)',
			name:  'timecodeS'
		});
		this.setVariable('timecodeS', tcS);

		variables.push({
			label: 'Timecode (FF)',
			name:  'timecodeF'
		});
		this.setVariable('timecodeF', tcF);

		this.setVariableDefinitions(variables);
	}

	/**
	 * INTERNAL: use setup data to initalize the hyperdeck library.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initHyperdeck() {

		if (this.hyperDeck !== undefined) {
			this.hyperDeck.disconnect();
			this.hyperDeck.removeAllListeners();
			delete this.hyperDeck;
		}

		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer);
		}

		if (this.config.port === undefined) {
			this.config.port = 9993;
		}

		if (this.config.host) {
			this.hyperDeck = new Hyperdeck()

			this.hyperDeck.on('error', e => {
				this.log('error', e.message)
			})

			this.hyperDeck.on('connected', async c => {
				// c contains the result of 500 connection info
				this.updateDevice(c)
				this.actions()

				// set notification:
				const notify = new Commands.NotifySetCommand()
				// notify.configuration = true // @todo: not implemented in hyperdeck-connection
				notify.transport = true
				notify.slot = true
				await this.hyperDeck.sendCommand(notify)

				let { slots } = await this.hyperDeck.sendCommand(new Commands.DeviceInfoCommand())

				if (slots === undefined) {
					slots = 2
				}

				for (let i = 0; i < slots; i++) {
					this.slotInfo[i + 1] = await this.hyperDeck.sendCommand(new Commands.SlotInfoCommand(i + 1))
				}

				this.transportInfo = await this.hyperDeck.sendCommand(new Commands.TransportInfoCommand())

				this.status(this.STATUS_OK,'Connected')

				this.initVariables()
				this.checkFeedbacks()

				// If polling is enabled, setup interval command
				if (this.config.pollingOn === true) {
					this.pollTimer = setInterval(
						this.sendPollCommand.bind(this),
						(this.config.pollingInterval)
					);
				}
			})

			this.hyperDeck.on('disconnected', () => {
				this.status(this.STATUS_ERROR,'Disconnected')

				if (this.pollTimer !== undefined) {
					clearInterval(this.pollTimer);
				}
			})

			this.hyperDeck.on('notify.slot', async res => {
				this.log('debug', 'Slot Status Changed')
				this.slotInfo[res.slotId] = {
					...this.slotInfo[res.slotId],
					...res
				}

				// Update the transport status to catch slot changes
				this.transportInfo = await this.hyperDeck.sendCommand(new Commands.TransportInfoCommand());
				this.checkFeedbacks('slot_status');
				this.checkFeedbacks('transport_slot');
				this.initVariables();
			})

			this.hyperDeck.on('notify.transport', res => {
				this.log('debug', 'Transport Status Changed')
				for (var id in res) {
					if (res[id] !== undefined) {
						this.transportInfo[id] = res[id];
					}
				}
				this.checkFeedbacks();
				this.initVariables();
			})

			this.hyperDeck.connect(this.config.host, this.config.port)
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
	 * INTERNAL: Send a poll command to refresh status
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	sendPollCommand() {
		let that = this;
		this.hyperDeck.sendCommand(new Commands.TransportInfoCommand()).then((transportInfo) => {
			that.transportInfo = transportInfo;
		})
		.catch((error) => {
			this.log('error', 'Timecode polling failed')
			clearInterval(this.pollTimer);
		});
		this.initVariables();
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
		//this.initPresets();
		this.initVariables();

		// If polling is enabled, setup interval command
		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer);
		}
		if (this.config.pollingOn === true) {
			this.pollTimer = setInterval(
				this.sendPollCommand.bind(this),
				(this.config.pollingInterval)
			)
		}

		if (resetConnection === true || this.hyperDeck === undefined) {
			this.initHyperdeck();
		}
	}

	/**
	 * INTERNAL: Updates device data from the HyperDeck
	 *
	 * @param {Object} object - the collected data
	 * @access protected
	 * @since 1.1.0
	 */
	updateDevice(object) {

		const value = object.model

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

		this.saveConfig();
	}
}

exports = module.exports = instance;
