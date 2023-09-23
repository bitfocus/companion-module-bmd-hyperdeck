import { runEntrypoint, InstanceBase, InstanceStatus } from '@companion-module/base'
import { Hyperdeck, Commands, TransportStatus, VideoFormat, ErrorCode } from 'hyperdeck-connection'
import {
	initVariables,
	updateTransportInfoVariables,
	updateSlotInfoVariables,
	updateTimecodeVariables,
	updateClipVariables,
	updateConfigurationVariables,
	updateRemoteVariable,
} from './variables.js'
import { initActions } from './actions.js'
import { initFeedbacks } from './feedbacks.js'
import { upgradeScripts } from './upgrades.js'
import { CONFIG_MODELS, ModelInfo } from './models.js'
import { HyperdeckConfig, getConfigFields } from './config.js'
import { protocolGte, stripExtension } from './util.js'
import { InstanceBaseExt, TransportInfoStateExt } from './types'

/**
 * Companion instance class for the Blackmagic HyperDeck Disk Recorders.
 *
 * @extends InstanceBase
 * @version 1.1.0
 * @since 1.0.0
 * @author Per Roine <per.roine@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class HyperdeckInstance extends InstanceBase<HyperdeckConfig> implements InstanceBaseExt {
	// TODO - make type safe
	private hyperDeck: Hyperdeck | undefined
	config!: HyperdeckConfig
	model!: ModelInfo

	private pollTimer: NodeJS.Timer | null = null

	protocolVersion: number = 0.0
	transportInfo: TransportInfoStateExt
	deckConfig: Commands.ConfigurationCommandResponse
	slotInfo: Commands.SlotInfoCommandResponse[] = []
	deviceName = 'Unknown'

	remoteInfo: Commands.RemoteInfoCommandResponse | null = null
	formatToken: string | null = null

	clipCount: number = 0
	clipsList: Commands.ClipInfo[] = []

	/**
	 * Create an instance of a HyperDeck module.
	 *
	 * @since 1.0.0
	 */
	constructor(internal: unknown) {
		super(internal)

		this.transportInfo = {
			status: TransportStatus.STOPPED,
			speed: 0,
			slotId: null,
			clipId: null,
			clipName: null,
			singleClip: false,
			displayTimecode: '--:--:--', // TODO
			timecode: '--:--:--', // TODO
			videoFormat: VideoFormat.NTSC,
			loop: false,
		}
		this.deckConfig = {
			audioInput: '',
			videoInput: '',
			fileFormat: '',
		}
	}

	/**
	 * Setup the actions.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	initActions() {
		const actions = initActions(this)
		this.setActionDefinitions(actions)
	}

	cancelFormat() {
		this.formatToken = null
	}

	/**
	 * Creates the configuration fields for web config.
	 * @access public
	 * @since 1.0.0
	 */
	getConfigFields() {
		return getConfigFields()
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

		if (this.pollTimer) {
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
	async init(config: HyperdeckConfig) {
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
		const feedbacks = initFeedbacks(this)
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

		if (this.pollTimer) {
			clearInterval(this.pollTimer)
		}

		// if (this.config.port === undefined) {
		// 	this.config.port = 9993
		// }

		if (this.config.host) {
			const hyperdeck = new Hyperdeck()
			this.hyperDeck = hyperdeck

			this.hyperDeck.on('error', (msg, e: any) => {
				this.log('error', `${msg}: ${e?.message ?? ''}`)
			})

			this.hyperDeck.on('connected', async (info) => {
				try {
					// c contains the result of 500 connection info
					this.protocolVersion = info.protocolVersion

					this.updateDevice(info)
					this.initActions()

					// set notification:
					const notify = new Commands.NotifySetCommand()
					notify.configuration = true
					notify.transport = true
					notify.slot = true
					notify.remote = true
					if (protocolGte(this.protocolVersion, '1.11') && this.config.timecodeVariables === 'notifications')
						notify.displayTimecode = true

					await hyperdeck.sendCommand(notify)

					try {
						let { slots } = await hyperdeck.sendCommand(new Commands.DeviceInfoCommand())
						if (slots === undefined) {
							slots = 2
						}
						for (let i = 0; i < slots; i++) {
							this.slotInfo[i + 1] = await hyperdeck.sendCommand(new Commands.SlotInfoCommand(i + 1))
						}
						//				this.debug('Slot info:', this.slotInfo)

						await this.refreshTransportInfo()

						this.deckConfig = await hyperdeck.sendCommand(new Commands.ConfigurationGetCommand())
						// this.debug('Initial config:', this.deckConfig)
						this.remoteInfo = await hyperdeck.sendCommand(new Commands.RemoteGetCommand())
					} catch (e: any) {
						if (e.code) {
							this.log('error', `Connection error - ${e.code} ${e.name}`)
						}
					}

					this.updateStatus(InstanceStatus.Ok)

					await this.updateClips()
					this.initVariables()
					this.checkFeedbacks()

					// If polling is enabled, setup interval command
					if (this.pollTimer) {
						clearInterval(this.pollTimer)
					}
					if (this.config.timecodeVariables === 'polling') {
						this.pollTimer = setInterval(this.sendPollCommand.bind(this), this.config.pollingInterval)
					}
				} catch (e: any) {
					if (e.code) {
						this.log('error', `Connection error - ${e.code} ${e.name}`)
					}
				}
			})

			this.hyperDeck.on('disconnected', () => {
				this.updateStatus(InstanceStatus.Disconnected)

				if (this.pollTimer) {
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
				this.refreshTransportInfo()

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
				this.transportInfo = {
					...this.extendTransportInfo(this.transportInfo),
					...res,
				}

				const newVariables = {}
				updateTransportInfoVariables(this, newVariables)
				updateTimecodeVariables(this, newVariables)
				updateSlotInfoVariables(this, newVariables)
				this.setVariableValues(newVariables)

				this.checkFeedbacks()
			})

			this.hyperDeck.on('notify.remote', async (res) => {
				this.log('debug', 'Remote Status Changed')
				this.remoteInfo = {
					...this.remoteInfo,
					...res,
				}

				const newVariables = {}
				updateRemoteVariable(this, newVariables)
				this.setVariableValues(newVariables)

				this.checkFeedbacks('remote_status')
			})

			this.hyperDeck.on('notify.configuration', async (res) => {
				this.log('debug', `Configuration Changed: ${JSON.stringify(res)}`)
				this.deckConfig = {
					...this.deckConfig,
					...res,
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

			this.hyperDeck.connect(this.config.host /*this.config.port*/)

			// hyperdeck-connection debug tool
			// this.hyperDeck.DEBUG = true;
		}
	}

	/**
	 * INTERNAL: Send a poll command to refresh status
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	sendPollCommand() {
		this.refreshTransportInfo()
			.then(() => {
				// TODO - refactor?
				const newVariables = {}
				updateTimecodeVariables(this, newVariables)
				this.setVariableValues(newVariables)
			})
			.catch((error) => {
				this.log('error', `Timecode polling failed: ${error}`)
				if (this.pollTimer) clearInterval(this.pollTimer)
			})
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	async configUpdated(config: HyperdeckConfig) {
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

		this.initActions()
		this.initFeedbacks()
		//this.initPresets();
		this.initVariables()

		// If polling is enabled, setup interval command
		if (this.pollTimer) clearInterval(this.pollTimer)
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
	updateDevice(object: Commands.ConnectionInfoResponse) {
		const value = object.model

		// TODO - can this be replaced?
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
	 * @access protected
	 */
	async updateClips() {
		try {
			const newVariableValues = {}

			if (!this.hyperDeck) throw new Error('TODO - no hyperdeck connection')

			let queryResponse: Commands.ClipsGetCommandResponse
			try {
				queryResponse = await this.hyperDeck.sendCommand(new Commands.ClipsGetCommand())
			} catch (e: any) {
				if (e.code === ErrorCode.TimelineEmpty) {
					// This error means there were no clips
					queryResponse = {
						clipCount: 0,
						clips: [],
					}
				} else {
					throw e
				}
			}

			// Check for a shorter list of clips, and unset variables if so
			const oldLength = this.clipsList.length
			this.clipsList = queryResponse.clips

			this.initActions() // reinit actions to update list
			this.initFeedbacks() // update feedback definitions

			if (oldLength !== this.clipsList.length) {
				// Update variables, as clip count can have changed. This will update all the values too
				this.initVariables()
			} else {
				// Selectively update variables
				updateTransportInfoVariables(this, newVariableValues) // Current clip name could have changed
				updateClipVariables(this, newVariableValues)
				this.setVariableValues(newVariableValues)
			}
		} catch (e: any) {
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
	extendTransportInfo(rawState: Commands.TransportInfoCommandResponse): TransportInfoStateExt {
		const res: TransportInfoStateExt = {
			...rawState,
			clipName: null,
		}

		if (res.clipId !== null) {
			const clipObj = this.clipsList.find(({ clipId }) => clipId == this.transportInfo.clipId)
			if (clipObj) {
				res.clipName = stripExtension(clipObj.name)
			}
		}

		return res
	}

	async sendCommand<TResponse>(cmd: Commands.AbstractCommand<TResponse>): Promise<TResponse> {
		if (this.hyperDeck && this.hyperDeck.connected) {
			try {
				return await this.hyperDeck.sendCommand(cmd)
			} catch (e: any) {
				if (e.code) {
					throw new Error(`${e.code} ${e.name}`)
				} else {
					throw e
				}
			}
		} else {
			throw new Error('not connected')
		}
	}

	async refreshTransportInfo(): Promise<void> {
		if (!this.hyperDeck) throw new Error('Hyperdeck not initialised')
		const rawInfo = await this.hyperDeck.sendCommand(new Commands.TransportInfoCommand())
		this.transportInfo = this.extendTransportInfo(rawInfo)
	}
}

runEntrypoint(HyperdeckInstance, upgradeScripts)
