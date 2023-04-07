const { runEntrypoint, InstanceBase, InstanceStatus } = require('@companion-module/base')
const { Hyperdeck, Commands } = require('hyperdeck-connection')
const {
	initVariables,
	updateTransportInfoVariables,
	updateSlotInfoVariables,
	updateTimecodeVariables,
	updateClipVariables,
	updateConfigurationVariables,
	updateRemoteVariable,
} = require('./variables')
const { initActions } = require('./actions')
const { initFeedbacks } = require('./feedbacks')
const { upgradeScripts } = require('./upgrades')
const { CONFIG_MODELS } = require('./models')
const { ConfigFields } = require('./config')
const { protocolGte } = require('./util')

/**
 * Companion instance class for the Blackmagic HyperDeck Disk Recorders.
 *
 * @extends InstanceBase
 * @version 1.1.0
 * @since 1.0.0
 * @author Per Roine <per.roine@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class HyperdeckInstance extends InstanceBase {
	/**
	 * Create an instance of a HyperDeck module.
	 *
	 * @since 1.0.0
	 */
	constructor(internal) {
		super(internal)

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
			{ id: 'H.264High10_422', label: 'H.264 SDI', family: 'H.264_SDI' },
			{ id: 'H.264High', label: 'H.264 High', family: 'H.264' },
			{ id: 'H.264Medium', label: 'H.264 Medium', family: 'H.264' },
			{ id: 'H.264Low', label: 'H.264 Low', family: 'H.264' },
			{ id: 'H.265High', label: 'H.265 High', family: 'H.265' },
			{ id: 'H.265Medium', label: 'H.265 Medium', family: 'H.265' },
			{ id: 'H.265Low', label: 'H.265 Low', family: 'H.265' },
			{ id: 'H.264High10_422', label: 'H.264/5 SDI', family: 'H.264/5' },
			{ id: 'H.264High', label: 'H.264/5 High', family: 'H.264/5' },
			{ id: 'H.264Medium', label: 'H.264/5 Medium', family: 'H.264/5' },
			{ id: 'H.264Low', label: 'H.264/5 Low', family: 'H.264/5' },
			{ id: 'Teleprompter', label: 'Teleprompter', family: 'teleprompter' },
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
			SD_USB: [
				{ id: 1, label: '1: SD' },
				{ id: 2, label: '2: USB-C' },
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

		this.CHOICES_AUDIOINPUTS = []

		this.CHOICES_FILEFORMATS = []
		this.CHOICES_VIDEOINPUTS = []
		this.CHOICES_SLOTS = []
		this.CHOICES_CLIPS = []
	}

	/**
	 * Setup the actions.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	initActions() {
		this.setupChoices()

		const actions = initActions.bind(this)()
		this.setActionDefinitions(actions)
	}

	cancelFormat() {
		this.formatToken = null
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	getConfigFields() {
		return ConfigFields
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	async destroy() {
		if (this.hyperDeck !== undefined) {
			this.hyperDeck.disconnect()
			this.hyperDeck.removeAllListeners()
			this.hyperDeck = undefined
		}

		if (this.pollTimer !== undefined) {
			clearInterval(this.pollTimer)
		}
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	async init(config) {
		this.config = config

		if (this.config.modelID !== undefined) {
			this.model = CONFIG_MODELS[this.config.modelID]
		} else {
			this.config.modelID = 'hdStudio'
			this.model = CONFIG_MODELS['hdStudio']
		}

		this.updateStatus(InstanceStatus.Connecting)

		this.initActions()
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
				try {
					// c contains the result of 500 connection info
					this.protocolVersion = c.protocolVersion

					this.updateDevice(c)
					this.initActions()

					// set notification:
					const notify = new Commands.NotifySetCommand()
					notify.configuration = true
					notify.transport = true
					notify.slot = true
					notify.remote = true
					// if (isMinimumVersion(1, 11) && this.config.timecodeVariables === 'notifications') notify.displayTimecode = true
					if (protocolGte(this.protocolVersion, '1.11') && this.config.timecodeVariables === 'notifications')
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
						this.remoteInfo = await this.hyperDeck.sendCommand(new Commands.RemoteGetCommand())
					} catch (e) {
						if (e.code) {
							this.log('error', `Connection error - ${e.code} ${e.name}`)
						}
					}

					this.updateStatus(InstanceStatus.Ok)

					await this.updateClips(this.transportInfo.slotId)
					this.initVariables()
					this.checkFeedbacks()

					// If polling is enabled, setup interval command
					if (this.pollTimer !== undefined) {
						clearInterval(this.pollTimer)
					}
					if (this.config.timecodeVariables === 'polling') {
						this.pollTimer = setInterval(this.sendPollCommand.bind(this), this.config.pollingInterval)
					}
				} catch (e) {
					if (e.code) {
						this.log('error', `Connection error - ${e.code} ${e.name}`)
					}
				}
			})

			this.hyperDeck.on('disconnected', () => {
				this.updateStatus(InstanceStatus.Disconnected)

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
				// Update slot variables
				const newVariables = {}
				updateSlotInfoVariables(this, newVariables)
				this.setVariableValues(newVariables)

				// Update the disk list to catch changes in clip
				// TODO - not sure when the hyperdeck informs of us new clips being added...
				// await this.updateClips(res.slotId)

				// Update clip variables
				await this.updateClips()

				// Update internals
				this.initActions()
				this.initFeedbacks()
				this.checkFeedbacks('slot_status', 'transport_slot')
			})

			this.hyperDeck.on('notify.transport', async (res) => {
				this.log('debug', 'Transport Status Changed')
				for (var id in res) {
					if (res[id] !== undefined) {
						this.transportInfo[id] = res[id]
					}
				}
				this.updateTransportInfo()

				const newVariables = {}
				updateTransportInfoVariables(this, newVariables)
				updateTimecodeVariables(this, newVariables)
				updateSlotInfoVariables(this, newVariables)
				this.setVariableValues(newVariables)

				this.checkFeedbacks()
			})

			this.hyperDeck.on('notify.remote', async (res) => {
				this.log('debug', 'Remote Status Changed')
				if (res !== undefined) {
					this.remoteInfo = res
					const newVariables = {}
					updateRemoteVariable(this, newVariables)
					this.setVariableValues(newVariables)
				}
				this.checkFeedbacks('remote_status')
			})

			this.hyperDeck.on('notify.configuration', async (res) => {
				this.log('debug', `Configuration Changed: ${JSON.stringify(res)}`)
				for (var id in res) {
					if (res[id] !== undefined) {
						this.deckConfig[id] = res[id]
					}
				}
				// this.debug('Config:', this.deckConfig)
				this.checkFeedbacks('video_input', 'audio_input', 'audio_channels')

				const newVariables = {}
				updateConfigurationVariables(this, newVariables)
				this.setVariableValues(newVariables)
			})

			if (this.config.timecodeVariables === 'notifications') {
				this.hyperDeck.on('notify.displayTimecode', (res) => {
					this.transportInfo.displayTimecode = res.displayTimecode

					const newVariables = {}
					updateTimecodeVariables(this, newVariables)
					this.setVariableValues(newVariables)
				})
			}

			this.hyperDeck.connect(this.config.host, this.config.port)

			// hyperdeck-connection debug tool
			// this.hyperDeck.DEBUG = true;
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
			this.hyperDeck
				.sendCommand(new Commands.TransportInfoCommand())
				.then((transportInfo) => {
					this.transportInfo = transportInfo

					const newVariables = {}
					updateTimecodeVariables(this, newVariables)
					this.setVariableValues(newVariables)
				})
				.catch((error) => {
					this.log('error', 'Timecode polling failed')
					clearInterval(this.pollTimer)
				})
		}
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	async configUpdated(config) {
		let resetConnection = false

		if (this.config.host != config.host) {
			resetConnection = true
		}

		if (
			protocolGte(this.protocolVersion, '1.11') &&
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
			this.model = CONFIG_MODELS[config.modelID]
		}

		this.config = config

		this.setupChoices()
		this.initActions()
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

		if (resetConnection || !this.hyperDeck) {
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
		} else if (value.match(/Shuttle HD/)) {
			this.config.modelID = 'hdShuttleHD'
		} else {
			this.config.modelID = 'hdStudio'
		}

		this.deviceName = value
		this.log('info', 'Connected to a ' + this.deviceName)

		this.saveConfig(this.config)
	}

	/**
	 * INTERNAL: Get clip list from the hyperdeck
	 *
	 * @param {number} currentSlot hyperdeck slot id
	 * @access protected
	 */
	async updateClips(currentSlot) {
		try {
			const newVariableValues = {}

			const clipCount = await this.hyperDeck.sendCommand(new Commands.ClipsCountCommand())
			this.clipCount = clipCount.count
			if (this.clipCount == 0) {
				this.clipsList = null
				this.CHOICES_CLIPS.length = 0
			}
			if (this.clipCount > 0) {
				const queryClips = await this.hyperDeck.sendCommand(new Commands.ClipsGetCommand())

				// Check for a shorter list of clips, and unset variables if so
				if (
					queryClips.clips != undefined &&
					this.clipsList != undefined &&
					queryClips.clips.length < this.clipsList.length
				) {
					this.clipsList.forEach((clip) => {
						clip.name = '-'
					})
					updateClipVariables(this, newVariableValues)
					this.clipsList = null
				}

				this.clipsList = queryClips.clips

				// reset clip choices
				this.CHOICES_CLIPS.length = 0
				queryClips.clips.forEach(({ clipId, name }) => {
					this.CHOICES_CLIPS.push({ id: name, label: this._stripExtension(name), clipId: clipId })
				})
			}
			this.initActions() // reinit actions to update list
			this.initFeedbacks() // update feedback definitions
			this.initVariables() // update variables list, to build the current clip list

			updateTransportInfoVariables(this, newVariableValues)
			updateClipVariables(this, newVariableValues)
			this.setVariableValues(newVariableValues)
		} catch (e) {
			if (e.code) {
				this.log('error', e.code + ' ' + e.name)
			}
		}
	}

	/**
	 * INTERNAL: Strip file extensions from clip names
	 *
	 * @access protected
	 */
	_stripExtension(fileName) {
		if (fileName != undefined) {
			const re = /(.*?)(\.([a-z]|\d){3})?$/
			return fileName.replace(re, '$1')
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
				let clipObj = this.CHOICES_CLIPS.find(({ clipId }) => clipId == this.transportInfo['clipId'])

				if (clipObj) {
					this.transportInfo.clipName = clipObj.label
				}
			} catch (error) {
				if (error.code) {
					this.log('error', error.code + ' ' + error.name)
				}
			}
			// this.debug('Stored clip name:', this.transportInfo.clipName)
		}
	}
}

runEntrypoint(HyperdeckInstance, upgradeScripts)
