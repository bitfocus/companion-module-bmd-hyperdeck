const instance_skel = require('../../instance_skel')
const { Hyperdeck, Commands, SlotStatus, TransportStatus } = require('hyperdeck-connection')
const {
	initVariables,
	updateTransportInfoVariables,
	updateSlotInfoVariables,
	updateTimecodeVariables,
	updateClipVariables,
	updateConfigurationVariables,
} = require('./variables')
const { initFeedbacks } = require('./feedbacks')
const { upgradeCombineOldPlayActions, upgradeTimecodeNotifications, upgrade126to127 } = require('./upgrades')

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
		super(system, id, config)

		this.stash = []
		this.command = null
		this.selected = 0
		this.deviceName = ''
		this.protocolVersion = 0.0
		this.slotInfo = []
		this.clipCount = 0
		this.clipsList = []
		this.transportInfo = {
			status: '',
			speed: '',
			slotId: '',
			clipId: '',
			clipName: '',
			singleClip: '',
			timecode: '',
			displayTimecode: '',
			videoFormat: '',
			loop: '',
		}
		this.deckConfig = {
			audioInput: '',
			videoInput: '',
			fileFormat: '',
			audioCodec: '',
			audioInputChannels: '',
		}
		this.remoteInfo = null
		this.pollTimer = null
		this.formatToken = null

		this.CONFIG_MODEL = {
			hdStudio: {
				id: 'hdStudio',
				label: 'HyperDeck Studio',
				videoInputs: ['SDI', 'HDMI'],
				audioInputs: ['embedded'],
				fileFormats: ['uncompressed', 'prores', 'proxy', 'DNxHD220'],
				slotLabels: 'SSD2',
				maxShuttle: 1600,
			},
			hdStudioPro: {
				id: 'hdStudioPro',
				label: 'HyperDeck Studio Pro',
				videoInputs: ['SDI', 'HDMI', 'component'],
				audioInputs: ['embedded', 'XLR', 'RCA'],
				fileFormats: ['uncompressed', 'prores', 'proxy', 'DNxHD220'],
				slotLabels: 'SSD2',
				maxShuttle: 1600,
			},
			hdStudio12G: {
				id: 'hdStudio12G',
				label: 'HyperDeck Studio 12G',
				videoInputs: ['SDI', 'HDMI'],
				audioInputs: ['embedded'],
				fileFormats: ['uncompressed', 'prores', 'proxy', 'DNx', 'DNxHD220', 'DNxHR_HQX', 'DNxHR_SQ', 'DNxHR_LB'],
				slotLabels: 'SSD2',
				maxShuttle: 1600,
			},
			bmdDup4K: {
				id: 'bmdDup4K',
				label: 'Blackmagic Duplicator 4K',
				videoInputs: ['SDI', 'optical'],
				audioInputs: ['embedded'],
				fileFormats: ['H.264', 'H.265'],
				slotLabels: 'SD25', //TODO check correct slots
				maxShuttle: 100,
			},
			hdStudioMini: {
				id: 'hdStudioMini',
				label: 'HyperDeck Studio Mini',
				videoInputs: ['SDI'],
				audioInputs: ['embedded'],
				fileFormats: ['prores', 'proxy', 'DNx', 'DNxHD220', 'DNxHR_HQX', 'DNxHR_SQ', 'DNxHR_LB', 'H.264'],
				slotLabels: 'SD2',
				maxShuttle: 1600,
			},
			hdStudioHDMini: {
				id: 'hdStudioHDMini',
				label: 'HyperDeck Studio HD Mini',
				videoInputs: ['SDI', 'HDMI'],
				audioInputs: ['embedded'],
				fileFormats: ['prores', 'proxy', 'DNx', 'DNxHD220', 'H.264'],
				slotLabels: 'SD2_USB',
				maxShuttle: 5000,
			},
			hdStudioHDPlus: {
				id: 'hdStudioHDPlus',
				label: 'HyperDeck Studio HD Plus',
				videoInputs: ['SDI', 'HDMI'],
				audioInputs: ['embedded'],
				fileFormats: ['prores', 'proxy', 'DNxHR_HQX', 'DNxHR_SQ', 'DNxHR_LB', 'H.264_SDI', 'H.264'],
				slotLabels: 'SD2_USB',
				maxShuttle: 5000,
			},
			hdStudioHDPro: {
				id: 'hdStudioHDPro',
				label: 'HyperDeck Studio HD Pro',
				videoInputs: ['SDI', 'HDMI'],
				audioInputs: ['embedded'],
				fileFormats: ['prores', 'proxy', 'DNxHR_HQX', 'DNxHR_SQ', 'DNxHR_LB', 'H.264_SDI', 'H.264'],
				slotLabels: 'SSD2_SD2_USB',
				maxShuttle: 5000,
			},
			hdStudio4KPro: {
				id: 'hdStudio4KPro',
				label: 'HyperDeck Studio 4K Pro',
				videoInputs: ['SDI', 'HDMI'],
				audioInputs: ['embedded'],
				fileFormats: ['prores', 'proxy', 'DNxHR_HQX', 'DNxHR_SQ', 'DNxHR_LB', 'H.264/5'],
				slotLabels: 'SSD2_SD2_USB',
				maxShuttle: 5000,
			},
			hdExtreme8K: {
				id: 'hdExtreme8K',
				label: 'HyperDeck Extreme 8K',
				videoInputs: ['SDI', 'HDMI', 'component', 'composite', 'optical'],
				audioInputs: ['embedded', 'XLR', 'RCA'],
				fileFormats: ['prores', 'H.265'],
				slotLabels: 'SD2_USB', //TODO check correct slots
				maxShuttle: 5000,
			},
		}

		this.CONFIG_AUDIOINPUTS = {
			embedded: { id: 'embedded', label: 'Embedded' },
			XLR: { id: 'XLR', label: 'XLR' },
			RCA: { id: 'RCA', label: 'RCA' },
		}

		this.CONFIG_VIDEOINPUTS = {
			SDI: { id: 'SDI', label: 'SDI' },
			HDMI: { id: 'HDMI', label: 'HDMI' },
			component: { id: 'component', label: 'Component' },
			composite: { id: 'composite', label: 'Composite' },
			optical: { id: 'optical', label: 'Optical' },
		}

		this.CONFIG_FILEFORMATS = [
			{ id: 'QuickTimeUncompressed', label: 'QuickTime Uncompressed', family: 'uncompressed' },
			{ id: 'QuickTimeProResHQ', label: 'QuickTime ProRes HQ', family: 'prores' },
			{ id: 'QuickTimeProRes', label: 'QuickTime ProRes', family: 'prores' },
			{ id: 'QuickTimeProResLT', label: 'QuickTime ProRes LT', family: 'prores' },
			{ id: 'QuickTimeProResProxy', label: 'QuickTime ProRes Proxy', family: 'proxy' },
			{ id: 'QuickTimeDNxHD45', label: 'DNxHD 45 QT', family: 'DNx' },
			{ id: 'DNxHD45', label: 'DNxHD 45 MXF', family: 'DNx' },
			{ id: 'QuickTimeDNxHD145', label: 'DNxHD 145 QT', family: 'DNx' },
			{ id: 'DNxHD145', label: 'DNxHD 145 MXF', family: 'DNx' },
			{ id: 'QuickTimeDNxHD220', label: 'DNxHD 220 QT', family: 'DNxHD220' },
			{ id: 'DNxHD220', label: 'MXF DNxHD 220', family: 'DNxHD220' },
			{ id: 'QuickTimeDNxHR_HQX', label: 'DNxHR HQX QT', family: 'DNxHR_HQX' },
			{ id: 'DNxHR_HQX', label: 'DNxHR HQX MXF', family: 'DNxHR_HQX' },
			{ id: 'QuickTimeDNxHR_SQ', label: 'DNxHR SQ QT', family: 'DNxHR_SQ' },
			{ id: 'DNxHR_SQ', label: 'DNxHR SQ MXF', family: 'DNxHR_SQ' },
			{ id: 'QuickTimeDNxHR_LB', label: 'DNxHR LB QT', family: 'DNxHR_LB' },
			{ id: 'DNxHR_LB', label: 'DNxHR LB MXF', family: 'DNxHR_LB' },
			{ id: "H.264High10_422", label: 'H.264 SDI', family: 'H.264_SDI' },
			{ id: 'H.264High', label: 'H.264 High', family: 'H.264' },
			{ id: 'H.264Medium', label: 'H.264 Medium', family: 'H.264' },
			{ id: 'H.264Low', label: 'H.264 Low', family: 'H.264' },
			{ id: 'H.265High', label: 'H.265 High', family: 'H.265' },
			{ id: 'H.265Medium', label: 'H.265 Medium', family: 'H.265' },
			{ id: 'H.265Low', label: 'H.265 Low', family: 'H.265' },
			{ id: "H.264High10_422", label: 'H.264/5 SDI', family: 'H.264/5' },
			{ id: 'H.264High', label: 'H.264/5 High', family: 'H.264/5' },
			{ id: 'H.264Medium', label: 'H.264/5 Medium', family: 'H.264/5' },
			{ id: 'H.264Low', label: 'H.264/5 Low', family: 'H.264/5' },
		]

		this.CONFIG_NOTIFICATION_METHOD = [
			{ id: 'disabled', label: 'Disabled' },
			{ id: 'notifications', label: 'Notifications' },
			{ id: 'polling', label: 'Polling' },
		]
		
		this.CONFIG_SLOT_LABELS = {
			SSD2: [
				{ id: 1, label: '1: SSD 1' },
				{ id: 2, label: '2: SSD 2' },
			],
			SD2: [
				{ id: 1, label: '1: SD 1' },
				{ id: 2, label: '2: SD 2' },
			],
			SD2_USB: [
				{ id: 1, label: '1: SD 1' },
				{ id: 2, label: '2: SD 2' },
				{ id: 3, label: '3: USB-C' },
			],
			SSD2_SD2_USB: [
				{ id: 1, label: '1: SSD 1' },
				{ id: 2, label: '2: SSD 2' },
				{ id: 3, label: '3: USB-C' },
				{ id: 4, label: '4: SD 1' },
				{ id: 5, label: '5: SD 2' },
			],
			SD25: [
				{ id: 1, label: '1: SD 1' },
				{ id: 2, label: '2: SD 2' },
				{ id: 3, label: '3: SD 3' },
				{ id: 4, label: '4: SD 4' },
				{ id: 5, label: '5: SD 5' },
				{ id: 6, label: '6: SD 6' },
				{ id: 7, label: '7: SD 7' },
				{ id: 8, label: '8: SD 8' },
				{ id: 9, label: '9: SD 9' },
				{ id: 10, label: '10: SD 10' },
				{ id: 11, label: '11: SD 11' },
				{ id: 12, label: '12: SD 12' },
				{ id: 13, label: '13: SD 13' },
				{ id: 14, label: '14: SD 14' },
				{ id: 15, label: '15: SD 15' },
				{ id: 16, label: '16: SD 16' },
				{ id: 17, label: '17: SD 17' },
				{ id: 18, label: '18: SD 18' },
				{ id: 19, label: '19: SD 19' },
				{ id: 20, label: '20: SD 20' },
				{ id: 21, label: '21: SD 21' },
				{ id: 22, label: '22: SD 22' },
				{ id: 23, label: '23: SD 23' },
				{ id: 24, label: '24: SD 24' },
				{ id: 25, label: '25: SD 25' },
			],
		}

		this.CHOICES_MODEL = Object.values(this.CONFIG_MODEL)
		// Sort alphabetical
		this.CHOICES_MODEL.sort(function (a, b) {
			var x = a.label.toLowerCase()
			var y = b.label.toLowerCase()
			if (x < y) {
				return -1
			}
			if (x > y) {
				return 1
			}
			return 0
		})

		this.CHOICES_AUDIOINPUTS = []
		this.CHOICES_AUDIOCODEC = [
			{ id: 'PCM', label: 'PCM' },
			{ id: 'AAC', label: 'AAC (2 channels only)' },
		]
		this.CHOICES_AUDIOCHANNELS = [
			{ id: '2', label: '2 Channels' },
			{ id: '4', label: '4 Channels' },
			{ id: '8', label: '8 Channels' },
			{ id: '16', label: '16 Channels' },
			{ id: 'cycle', label: 'Cycle' },
		]
		
		this.CHOICES_FILEFORMATS = []
		this.CHOICES_VIDEOINPUTS = []
		this.CHOICES_SLOTS = []
		this.CHOICES_CLIPS = []
		
		this.CHOICES_DYNAMICRANGE = [
			{ id: 'auto', label: 'Auto' },
			{ id: 'Rec709', label: 'Rec.709' },
			{ id: 'Rec2020_SDR', label: 'Rec.2020 SDR' },
			{ id: 'HLG', label: 'HLG' },
			{ id: 'ST2084_300', label: 'ST2084 300' },
			{ id: 'ST2084_500', label: 'ST2084 500' },
			{ id: 'ST2084_800', label: 'ST2084 800' },
			{ id: 'ST2084_1000', label: 'ST2084 1000 ' },
			{ id: 'ST2084_2000', label: 'ST2084 2000' },
			{ id: 'ST2084_4000', label: 'ST2084 4000' },
			{ id: 'ST2048', label: 'ST2048' },
		]

		this.CHOICES_ENABLEDISABLE = [
			{ id: true, label: 'Enable' },
			{ id: false, label: 'Disable' },
		]

		this.CHOICES_STARTEND = [
			{ id: 'start', label: 'Start' },
			{ id: 'end', label: 'End' },
		]

		this.CHOICES_SLOTSTATUS = [
			{ id: 'empty', label: 'Empty' },
			{ id: 'error', label: 'Error' },
			{ id: 'mounted', label: 'Mounted' },
			{ id: 'mounting', label: 'Mounting' },
		]
		
		this.CHOICES_PREVIEWMODE = [
			{ id: 'true', label: 'Preview' },
			{ id: 'false', label: 'Output' },
		]

		this.CHOICES_TRANSPORTSTATUS = [
			{ id: 'preview', label: 'Preview' },
			{ id: 'stopped', label: 'Stopped' },
			{ id: 'play', label: 'Playing' },
			{ id: 'forward', label: 'Forward' },
			{ id: 'rewind', label: 'Rewind' },
			{ id: 'jog', label: 'Jog' },
			{ id: 'shuttle', label: 'Shuttle' },
			{ id: 'record', label: 'Record' },
		]

		this.CHOICES_FILESYSTEM = [
			{ id: 'HFS+', label: 'HFS+' },
			{ id: 'exFAT', label: 'exFAT' },
		]

		if (this.config.modelID !== undefined) {
			this.model = this.CONFIG_MODEL[this.config.modelID]
		} else {
			this.config.modelID = 'hdStudio'
			this.model = this.CONFIG_MODEL['hdStudio']
		}

		this.actions() // export actions
	}

	static GetUpgradeScripts() {
		return [
			upgradeCombineOldPlayActions,
			upgradeTimecodeNotifications,
			upgrade126to127,
			instance_skel.CreateConvertToBooleanFeedbackUpgradeScript({
				'transport_status': true,
				'transport_clip': true,
				'transport_slot': true,
				'slot_status': true,
				'transport_loop': true,
				'transport_singleClip': true,
				'video_input': true,
				'audio_input': true,
				'format_ready': true,
			})
		]
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {
		this.setupChoices()
		var actions = {}

		try {
			if (this.config.modelID != 'bmdDup4K') {
				actions['play'] = {
					label: 'Play',
					options: [
						{
							type: 'number',
							label: 'Speed %',
							id: 'speed',
							default: 100,
							min: 0 - this.model.maxShuttle,
							max: this.model.maxShuttle,
							required: true,
							range: true,
						},
						{
							type: 'checkbox',
							label: 'Loop clip',
							id: 'loop',
							default: false,
						},
						{
							type: 'checkbox',
							label: 'Single clip playback',
							id: 'single',
							default: false,
						},
					],
				}
			}
	
			actions['rec'] = { label: 'Record' }
	
			if (this.config.modelID == 'bmdDup4K') {
				actions['recAppend'] = { label: 'Append Record' }
			}
	
			if (this.config.modelID != 'bmdDup4K') {
				actions['recName'] = {
					label: 'Record (with name)',
					options: [
						{
							type: 'textwithvariables',
							label: 'Filename (without extension)',
							id: 'name',
							default: '',
							regex: this.REGEX_SOMETHING,
						},
					],
				}
				actions['recTimestamp'] = {
					label: 'Record (with name and current date/time)',
					options: [
						{
							type: 'textwithvariables',
							label: 'Filename (optional)',
							id: 'prefix',
							default: '',
						},
					],
				}
				actions['recCustom'] = {
					label: 'Record (with custom reel)',
					options: [
						{
							type: 'text',
							id: 'info',
							label: "Set 'Reel' in instance config",
						},
					],
				}
			}
	
			actions['stop'] = { label: 'Stop' }
	
			if (this.config.modelID != 'bmdDup4K') {
				actions['goto'] = {
					label: 'Goto (TC)',
					options: [
						{
							type: 'textinput',
							label: 'Timecode hh:mm:ss:ff',
							id: 'tc',
							default: '00:00:01:00',
							regex: this.REGEX_TIMECODE,
						},
					],
				}
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
							range: false,
						},
					],
				}
				actions['gotoName'] = {
					label: 'Goto Clip (name)',
					options: [
						{
							type: 'dropdown',
							label: 'Clip Name - select from list or enter text (variables supported)',
							id: 'clip',
							default: '',
							required: true,
							choices: this.CHOICES_CLIPS,
							minChoicesForSearch: 0,
							allowCustom: true,
						},
					],
				}
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
							range: false,
						},
					],
				}
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
							range: false,
						},
					],
				}
				actions['goStartEnd'] = {
					label: 'Go to (start|end) of clip',
					options: [
						{
							type: 'dropdown',
							label: 'Go to',
							id: 'startEnd',
							default: 'start',
							choices: this.CHOICES_STARTEND,
						},
					],
				}
				actions['jogFwd'] = {
					label: 'Jog forward (TC) duration',
					options: [
						{
							type: 'textinput',
							label: 'Timecode hh:mm:ss:ff',
							id: 'jogFwdTc',
							default: '00:00:00:01',
							regex: this.REGEX_TIMECODE,
						},
					],
				}
				actions['jogRew'] = {
					label: 'Jog backward (TC) duration',
					options: [
						{
							type: 'textinput',
							label: 'Timecode hh:mm:ss:ff',
							id: 'jogRewTc',
							default: '00:00:00:01',
							regex: this.REGEX_TIMECODE,
						},
					],
				}
				actions['shuttle'] = {
					label: 'Shuttle with speed',
					options: [
						{
							type: 'number',
							label: 'Speed %',
							id: 'speed',
							default: 100,
							min: 0 - this.model.maxShuttle,
							max: this.model.maxShuttle,
							required: true,
							range: true,
						},
					],
				}
				actions['select'] = {
					label: 'Select (slot)',
					options: [
						{
							type: 'dropdown',
							label: 'Slot',
							id: 'slot',
							default: 1,
							choices: this.CHOICES_SLOTS,
						},
					],
				}
				actions['preview'] = {
					label: 'Preview',
					options: [
						{
							type: 'dropdown',
							label: 'Set preview/output mode',
							id: 'enable',
							default: 'true',
							choices: this.CHOICES_PREVIEWMODE,
						},
					],
				}
			} // endif (!= bmdDup4K)
	
			if (this.CHOICES_VIDEOINPUTS.length > 1) {
				actions['videoSrc'] = {
					label: 'Video source',
					options: [
						{
							type: 'dropdown',
							label: 'Input',
							id: 'videoSrc',
							default: 'SDI',
							choices: this.CHOICES_VIDEOINPUTS,
						},
					],
				}
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
							choices: this.CHOICES_AUDIOINPUTS,
						},
					],
				}
			}
			
			this.debug('Stored protocol version:', this.protocolVersion)
			if (this.protocolVersion >= 1.11) {
				actions['audioChannels'] = {
					label: 'Audio channels',
					options: [
						{
							type: 'dropdown',
							label: 'Codec',
							id: 'audioCodec',
							default: this.CHOICES_AUDIOCODEC[0].id,
							choices: this.CHOICES_AUDIOCODEC,
						},
						{
							type: 'dropdown',
							label: 'Channels',
							id: 'audioChannels',
							default: '2',
							choices: this.CHOICES_AUDIOCHANNELS,
							isVisible: (action) => action.options.audioCodec === 'PCM',
						},
					],
				}
			}
	
			if (this.CHOICES_FILEFORMATS.length > 1) {
				actions['fileFormat'] = {
					label: 'File format',
					options: [
						{
							type: 'dropdown',
							label: 'Format',
							id: 'fileFormat',
							default: 'QuickTimeProRes',
							choices: this.CHOICES_FILEFORMATS,
						},
					],
				}
			}
	
			actions['fetchClips'] = { label: 'Fetch Clips' }
	
			/**
				* Not currently implemented
				*
			if (this.config.modelID == 'hdExtreme8K') {
				actions['dynamicRange'] = {
					label: 'Set playback dyanmic range',
					options: [
						{
							type: 'dropdown',
							label: 'Dynamic Range',
							id: 'dynamicRange',
							default: 'auto',
							choices: this.CHOICES_DYNAMICRANGE
						}
					]
				};
			}
			*/
	
			actions['formatPrepare'] = {
				label: 'Format drive/card (prepare)',
				options: [
					{
						type: 'dropdown',
						label: 'Filesystem',
						id: 'filesystem',
						default: 'HFS+',
						choices: this.CHOICES_FILESYSTEM,
					},
					{
						type: 'number',
						label: 'Confirmation timeout (sec)',
						id: 'timeout',
						default: 10,
					},
				],
			}
	
			actions['formatConfirm'] = {
				label: 'Format drive/card (confirm)',
			}
	
			actions['remote'] = {
				label: 'Remote Control (enable/disable)',
				options: [
					{
						type: 'dropdown',
						label: 'Enable/Disable',
						id: 'remoteEnable',
						default: 'true',
						choices: this.CHOICES_ENABLEDISABLE,
					},
				],
			}
	
			this.setActions(actions)
			
		} catch (e) {
			if (e.code) {
				this.log('error', e.code + ' ' + e.name)
			}
		}
	}

	cancelFormat() {
		this.formatToken = null
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	async action(action) {
		var cmd
		var opt = action.options

		switch (action.action) {
			case 'play':
				cmd = new Commands.PlayCommand()
				cmd.speed = opt.speed
				cmd.loop = opt.loop
				cmd.singleClip = opt.single
				break
			case 'stop':
				cmd = new Commands.StopCommand()
				break
			case 'rec':
				cmd = new Commands.RecordCommand()
				break
			case 'recAppend':
				cmd = new Commands.RecordCommand()
				cmd.append = true
				break
			case 'recName':
				cmd = new Commands.RecordCommand()
				this.parseVariables(opt.name, function (name) {
					cmd.filename = name
				})
				break
			case 'recTimestamp':
				cmd = new Commands.RecordCommand()
				var timeStamp = this.getTimestamp()
				if (opt.prefix !== '') {
					this.parseVariables(opt.prefix, function (name) {
						cmd.filename = name + '-' + timeStamp + '-'
					})
				} else {
					cmd.filename = timeStamp + '-'
				}
				break
			case 'recCustom':
				cmd = new Commands.RecordCommand()
				cmd.filename = this.config.reel + '-'
				break
			case 'goto':
				cmd = new Commands.GoToCommand()
				cmd.timecode = opt.tc
				break
			case 'gotoN':
				cmd = new Commands.GoToCommand()
				cmd.clipId = opt.clip
				break
			case 'gotoName':
				this.updateClips(this.transportInfo.slotId)
				this.parseVariables(opt.clip, (parsed) => {
					const clip = this.CHOICES_CLIPS.find(
						({ label }) => label == parsed
					)
					if (clip === undefined) {
						this.log('info', `Clip "${parsed}" does not exist`)
					} else {
						cmd = new Commands.GoToCommand()
						cmd.clipId = clip.clipId
					}
				})
				break
			case 'goFwd':
				cmd = new Commands.GoToCommand()
				cmd.clipId = '+' + opt.clip
				break
			case 'goRew':
				cmd = new Commands.GoToCommand()
				cmd.clipId = '-' + opt.clip
				break
			case 'goStartEnd':
				cmd = new Commands.GoToCommand()
				cmd.clip = opt.startEnd
				break
			case 'jogFwd':
				cmd = new Commands.JogCommand()
				cmd.timecode = '+' + opt.jogFwdTc
				break
			case 'jogRew':
				cmd = new Commands.JogCommand()
				cmd.timecode = '-' + opt.jogRewTc
				break
			case 'shuttle':
				cmd = new Commands.ShuttleCommand()
				cmd.speed = opt.speed
				break
			case 'select':
				cmd = new Commands.SlotSelectCommand()
				cmd.slotId = opt.slot
				break
			case 'preview':
				cmd = new Commands.PreviewCommand()
				cmd.enable = opt.enable
				break
			case 'videoSrc':
				cmd = new Commands.ConfigurationCommand()
				cmd.videoInput = opt.videoSrc
				break
			case 'audioSrc':
				cmd = new Commands.ConfigurationCommand()
				cmd.audioInput = opt.audioSrc
				break
			case 'audioChannels': 
				cmd = new Commands.ConfigurationCommand()
				cmd.audioCodec = opt.audioCodec
				cmd.audioInputChannels = 2
				if (opt.audioCodec == 'PCM') {
					let channels = opt.audioChannels
					if (channels == 'cycle') {
						channels = this.deckConfig.audioInputChannels == 16 ? 2 : this.deckConfig.audioInputChannels * 2
					}
					cmd.audioInputChannels = channels
				}
				break
			case 'fileFormat':
				cmd = new Commands.ConfigurationCommand()
				cmd.fileFormat = opt.fileFormat
				break
			/**
			 * Not supported in hyperdeck-connection
			 *
			case 'dynamicRange':
				cmd = new Commands.ConfigurationCommand()
				cmd.dynamicRange = opt.dynamicRange;
				break;
			*/
			case 'formatPrepare':
				cmd = new Commands.FormatCommand()
				cmd.filesystem = opt.filesystem
				let cancel = setTimeout((releaseToken) => {
					this.formatToken = null
					this.checkFeedbacks('format_ready')
				}, opt.timeout * 1000)
				break
			case 'formatConfirm':
				if (this.formatToken !== null) {
					cmd = new Commands.FormatConfirmCommand()
					cmd.code = this.formatToken
					this.formatToken = null
				}
				break
			case 'remote':
				cmd = new Commands.RemoteCommand()
				cmd.enable = opt.remoteEnable
//			this.debug('Remote enable is: ', opt.remoteEnable)
				break
			case 'fetchClips':
				this.updateClips(this.transportInfo.slotId)
				break
		}

		if (cmd !== undefined) {
			if (this.hyperDeck !== undefined && this.hyperDeck.connected) {
				let response
				try {
					response = await this.hyperDeck.sendCommand(cmd)
				} catch (e) {
					if (e.code) {
						this.log('error', e.code + ' ' + e.name)
					}
				}
				// Handle any return values
				switch (action.action) {
					case 'formatPrepare':
						if (response && response.code) {
							this.log('debug', 'Format token: ' + response.code)
							this.formatToken = response.code
						}
						break
					case 'select':
						this.transportInfo = await this.hyperDeck.sendCommand(new Commands.TransportInfoCommand())
						// select will update internal cliplist so we should fetch those
						this.updateClips(this.transportInfo.slotId)
						break
				}
				this.checkFeedbacks()
			} else {
				this.log('debug', 'Socket not connected :(')
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
				value:
					'Hyperdeck only supports 1 connection at any given time. Be sure to disconect any other devices controling it. Remember to press the remote button on the frontpanel of the Hyperdeck to enable remote control.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: this.REGEX_IP,
			},
			{
				type: 'dropdown',
				id: 'modelID',
				label: 'Model',
				width: 6,
				choices: this.CHOICES_MODEL,
				default: 0,
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Custom Clip Record Naming',
				value:
					"Companion is able to initiate recordings where the file names use a custom 'Reel-[####]' naming convention.  The 'Reel' is a custom name defined below and [####] is auto incremented from '0' by the HyperDeck.  <b>This naming is only used when starting records using the 'Record (with custom reel)' action.</b>",
			},
			{
				type: 'textinput',
				id: 'reel',
				label: 'Custom Reel',
				width: 6,
				default: 'A001',
				regex: this.REGEX_SOMETHING,
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Displaying Timecode Variable',
				value:
					'Timecode variables have to be explicitly enabled by selecting "Notifications" or "Polling". Note that timecode notifications are not supported before hyperdeck firmware V7!',
			},
			{
				type: 'dropdown',
				id: 'timecodeVariables',
				label: 'Timecode Variables',
				width: 6,
				choices: this.CONFIG_NOTIFICATION_METHOD,
				default: 'disabled',
			},
			{
				type: 'number',
				id: 'pollingInterval',
				label: 'Polling Interval (in ms)',
				width: 6,
				min: 15,
				max: 10000,
				default: 500,
				required: true,
			},
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
			clearInterval(this.pollTimer)
		}

		self.debug('destroy', this.id)
	}

	/**
	 * Creates a string with the current date/time
	 *
	 * @returns {string} the current date/time in format 'YYYYMMDD_HHMM'
	 * @access public
	 * @since 1.0.3
	 */
	getTimestamp() {
		var d = new Date()
		var curr_date = ('0' + d.getDate()).slice(-2)
		var curr_month = ('0' + (d.getMonth() + 1)).slice(-2)
		var curr_year = d.getFullYear()
		var h = ('0' + d.getHours()).slice(-2)
		var m = ('0' + d.getMinutes()).slice(-2)
		var stamp = curr_year + '' + curr_month + '' + curr_date + '_' + h + m

		return stamp
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		this.status(this.STATUS_WARNING, 'Connecting') // status ok!
		this.initFeedbacks()
		//this.initPresets();
		this.initVariables()

		this.initHyperdeck()
	}

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initFeedbacks() {
		const feedbacks = initFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initVariables() {
		initVariables(this)
	}

	/**
	 * INTERNAL: use setup data to initalize the hyperdeck library.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initHyperdeck() {
		if (this.hyperDeck !== undefined) {
			this.hyperDeck.disconnect()
			this.hyperDeck.removeAllListeners()
			delete this.hyperDeck
		}

		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer)
		}

		if (this.config.port === undefined) {
			this.config.port = 9993
		}

		if (this.config.host) {
			this.hyperDeck = new Hyperdeck()

			this.hyperDeck.on('error', (e) => {
				this.log('error', e.message)
			})

			this.hyperDeck.on('connected', async (c) => {
				// c contains the result of 500 connection info
				this.protocolVersion = c.protocolVersion

				this.updateDevice(c)
				this.actions()

				// set notification:
				const notify = new Commands.NotifySetCommand()
				notify.configuration = true
				notify.transport = true
				notify.slot = true
				notify.remote = true
				// if (isMinimumVersion(1, 11) && this.config.timecodeVariables === 'notifications') notify.displayTimecode = true
				if (this.protocolVersion >= 1.11 && this.config.timecodeVariables === 'notifications')
					notify.displayTimecode = true
				await this.hyperDeck.sendCommand(notify)

				try {
					let { slots } = await this.hyperDeck.sendCommand(new Commands.DeviceInfoCommand())
					if (slots === undefined) {
						slots = 2
					}
					for (let i = 0; i < slots; i++) {
						this.slotInfo[i + 1] = await this.hyperDeck.sendCommand(new Commands.SlotInfoCommand(i + 1))
					}
//				this.debug('Slot info:', this.slotInfo)
					
					this.transportInfo = await this.hyperDeck.sendCommand(new Commands.TransportInfoCommand())

					this.deckConfig = await this.hyperDeck.sendCommand(new Commands.ConfigurationGetCommand())
					// this.debug('Initial config:', this.deckConfig)
					// TODO Requires support from hyperdeck-connection
					// this.remoteInfo = await this.hyperDeck.sendCommand(new Commands.RemoteCommand())
				} catch (e) {
					if (e.code) {
						this.log('error', `Connection error - ${e.code} ${e.name}`)
					}
				}

				this.status(this.STATUS_OK, 'Connected')

				this.updateClips(this.transportInfo.slotId)
				this.initVariables()
				this.checkFeedbacks()

				// If polling is enabled, setup interval command
				if (this.config.timecodeVariables === 'polling') {
					this.pollTimer = setInterval(this.sendPollCommand.bind(this), this.config.pollingInterval)
				}
			})

			this.hyperDeck.on('disconnected', () => {
				this.status(this.STATUS_ERROR, 'Disconnected')

				if (this.pollTimer !== undefined) {
					clearInterval(this.pollTimer)
				}
			})

			this.hyperDeck.on('notify.slot', async (res) => {
				if (this.config.modelID != 'hdStudioMini') {
					this.log('debug', 'Slot Status Changed')
				}
				this.slotInfo[res.slotId] = {
					...this.slotInfo[res.slotId],
					...res,
				}

				// Update the transport status to catch slot changes
				this.transportInfo = await this.hyperDeck.sendCommand(new Commands.TransportInfoCommand())
				this.checkFeedbacks('slot_status')
				this.checkFeedbacks('transport_slot')
				// Update slot variables
				updateSlotInfoVariables(this)

				// Update the disk list to catch changes in clip
				// TODO - not sure when the hyperdeck informs of us new clips being added...
				this.updateClips(res.slotId)
			})

			this.hyperDeck.on('notify.transport', async (res) => {
				this.log('debug', 'Transport Status Changed')
				for (var id in res) {
					if (res[id] !== undefined) {
						this.transportInfo[id] = res[id]
					}
				}
				this.updateTransportInfo()
				updateTransportInfoVariables(this)
				updateTimecodeVariables(this)
				updateSlotInfoVariables(this)
				this.checkFeedbacks()
			})
			
			this.hyperDeck.on('notify.remote', async (res) => {
				this.log('debug', 'Remote Status Changed')
				if (res !== undefined) {
					this.remoteInfo = res
				}
			})

			this.hyperDeck.on('notify.configuration', async (res) => {
				this.log('debug', `Configuration Changed: ${JSON.stringify(res)}`)
				for (var id in res) {
					if (res[id] !== undefined) {
						this.deckConfig[id] = res[id]
					}
				}
				// this.debug('Config:', this.deckConfig)
				this.checkFeedbacks('video_input')
				this.checkFeedbacks('audio_input')
				this.checkFeedbacks('audio_channels')
				updateConfigurationVariables(this)
			})

			if (this.config.timecodeVariables === 'notifications') {
				this.hyperDeck.on('notify.displayTimecode', (res) => {
					this.transportInfo.displayTimecode = res.displayTimecode
					updateTimecodeVariables(this)
				})
			}

			this.hyperDeck.connect(this.config.host, this.config.port)

			// hyperdeck-connection debug tool
			 this.hyperDeck.DEBUG = true;
		}
	}

	/**
	 * INTERNAL: use config data to define the choices for the dropdowns.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupChoices() {
		this.CHOICES_AUDIOINPUTS = []
		this.CHOICES_FILEFORMATS = []
		this.CHOICES_VIDEOINPUTS = []
		this.CHOICES_SLOTS = []

		if (this.model !== undefined) {
			for (var id in this.model.audioInputs) {
				this.CHOICES_AUDIOINPUTS.push(this.CONFIG_AUDIOINPUTS[this.model.audioInputs[id]])
			}

			for (var id in this.model.fileFormats) {
				for (var frmt in this.CONFIG_FILEFORMATS) {
					if (this.CONFIG_FILEFORMATS[frmt].family == this.model.fileFormats[id]) {
						this.CHOICES_FILEFORMATS.push(this.CONFIG_FILEFORMATS[frmt])
					}
				}
			}

			for (var id in this.model.videoInputs) {
				this.CHOICES_VIDEOINPUTS.push(this.CONFIG_VIDEOINPUTS[this.model.videoInputs[id]])
			}
			
			//TODO define CHOICES_SLOTS based on model
			this.CHOICES_SLOTS = this.CONFIG_SLOT_LABELS[this.model.slotLabels]
		}
	}

	/**
	 * INTERNAL: Send a poll command to refresh status
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	sendPollCommand() {
		if (this.hyperDeck) {
			let that = this
			this.hyperDeck
			.sendCommand(new Commands.TransportInfoCommand())
			.then((transportInfo) => {
				that.transportInfo = transportInfo
			})
			.catch((error) => {
				this.log('error', 'Timecode polling failed')
				clearInterval(this.pollTimer)
			})
			updateTimecodeVariables(this)
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
		var resetConnection = false

		if (this.config.host != config.host) {
			resetConnection = true
		}

		if (
			this.protocolVersion >= 1.11 &&
			this.config.timecodeVariables !== config.timecodeVariables &&
			!resetConnection
		) {
			if (this.hyperDeck !== undefined && this.hyperDeck.connected) {
				if (this.config.timecodeVariables === 'notifications') {
					// old config had notifications and new config does not
					const notify = new Commands.NotifySetCommand()
					notify.displayTimecode = false
					this.hyperDeck.sendCommand(notify)
				} else if (config.timecodeVariables === 'notifications') {
					// old config had no notifications and new config does have them
					const notify = new Commands.NotifySetCommand()
					notify.displayTimecode = true
					this.hyperDeck.sendCommand(notify)
				}
			}
		}

		if (this.config.modelID != config.modelID) {
			this.model = this.CONFIG_MODEL[config.modelID]
		}

		this.config = config

		this.setupChoices()
		this.actions()
		this.initFeedbacks()
		//this.initPresets();
		this.initVariables()

		// If polling is enabled, setup interval command
		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer)
		}
		if (this.config.timecodeVariables === 'polling') {
			this.pollTimer = setInterval(this.sendPollCommand.bind(this), this.config.pollingInterval)
		}

		if (resetConnection === true || this.hyperDeck === undefined) {
			this.initHyperdeck()
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

//	this.debug('Model value:', value)
		if (value.match(/Extreme/)) {
			this.config.modelID = 'hdExtreme8K'
		} else if (value.match(/Studio Mini/)) {
			this.config.modelID = 'hdStudioMini'
		} else if (value.match(/Duplicator/)) {
			this.config.modelID = 'bmdDup4K'
		} else if (value.match(/12G/)) {
			this.config.modelID = 'hdStudio12G'
		} else if (value.match(/Studio Pro/)) {
			this.config.modelID = 'hdStudioPro'
		} else if (value.match(/HD Mini/)) {
			this.config.modelID = 'hdStudioHDMini'
		} else if (value.match(/HD Plus/)) {
			this.config.modelID = 'hdStudioHDPlus'
		} else if (value.match(/HD Pro/)) {
			this.config.modelID = 'hdStudioHDPro'
		} else if (value.match(/4K Pro/)) {
			this.config.modelID = 'hdStudio4KPro'
		} else {
			this.config.modelID = 'hdStudio'
		}

		this.deviceName = value
		this.log('info', 'Connected to a ' + this.deviceName)

		this.saveConfig()
	}

	/**
	 * INTERNAL: Get clip list from the hyperdeck
	 *
	 * @param {number} currentSlot hyperdeck slot id
	 * @access protected
	 */
	async updateClips(currentSlot) {
		try {
//		this.debug("Slot info:", this.slotInfo)
			// TODO Add a check for clip count once the command is supported in hyperdeck-connection
			const count = new Commands.ClipsCountCommand()
			const clipCount = await this.hyperDeck.sendCommand(count)
			this.clipCount = clipCount.count
			//const clipCount = 1
			if (this.clipCount > 0) {
				const clips = new Commands.ClipsGetCommand()
				const queryClips = await this.hyperDeck.sendCommand(clips)

				this.clipsList[currentSlot] = queryClips.clips
//			console.log(currentSlot, this.clipsList[currentSlot])

				// reset clip choices
				this.CHOICES_CLIPS.length = 0
				queryClips.clips.forEach(({ clipId, name }) => {
					this.CHOICES_CLIPS.push({ id: name, label: name, clipId: clipId })
				})

				this.actions() // reinit actions to update list
				this.initFeedbacks() // update feedback definitions
			}
			updateTransportInfoVariables(this)
		} catch (e) {
			if (e.code) {
				this.log('error', e.code + ' ' + e.name)
			}
		}
	}

	/**
	 * INTERNAL: Update transportInfo object
	 *
	 * @access protected
	 */
	updateTransportInfo() {
		if (this.transportInfo['clipId'] != null) {
//		clipIdVariable = this.transportInfo['clipId']
			
			try {
				let clipObj = this.CHOICES_CLIPS.find(
					({ clipId }) => clipId == this.transportInfo['clipId']
				)
				
				if (clipObj) {
					this.transportInfo.clipName = clipObj.label
				}
			}
			catch(error) {
				if (error.code) {
					this.log('error', error.code + ' ' + error.name)
				}
			}
			this.debug('Stored clip name:', this.transportInfo.clipName)
		}	
	}
	
}
exports = module.exports = instance
