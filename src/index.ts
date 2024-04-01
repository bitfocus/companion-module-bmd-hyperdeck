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
	updateSlateVariables,
} from './variables.js'
import { initActions } from './actions.js'
import { initFeedbacks } from './feedbacks.js'
import { upgradeScripts } from './upgrades.js'
import { CONFIG_MODELS, ModelInfo } from './models.js'
import { HyperdeckConfig, getConfigFields } from './config.js'
import { mergeState, protocolGte, stripExtension } from './util.js'
import { InstanceBaseExt, IpAndPort, TransportInfoStateExt, SlateInfoStateExt } from './types.js'

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

	private pollTimer: NodeJS.Timeout | null = null

	protocolVersion: number = 0.0
	transportInfo: TransportInfoStateExt
	deckConfig: Commands.ConfigurationCommandResponse
	slotInfo: Commands.SlotInfoCommandResponse[] = []

	remoteInfo: Commands.RemoteInfoCommandResponse | null = null
	formatToken: string | null = null
	formatTokenTimeout: NodeJS.Timeout | null = null

	clipsList: Commands.ClipInfo[] = []
	
	slate: SlateInfoStateExt

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
			displayTimecode: '00:00:00:00',
			timecode: '00:00:00:00',
			videoFormat: VideoFormat.NTSC,
			loop: false,
			inputVideoFormat: null,
		}
		this.deckConfig = {
			audioInput: '',
			videoInput: '',
			fileFormat: '',
		}
		this.slate = {
			slateFor: null,
			reel: null,
			sceneId: null,
			shotType: null,
			take: null,
			takeScenario: null,
			goodTake: null,
			environment: null,
			dayNight: null,
			takeAutoInc: null,
			projectName: null,
			camera: null,
			director: null,
			cameraOperator: null,
		}
	}

	private initActionsAndFeedbacks() {
		this.setActionDefinitions(initActions(this))
		this.setFeedbackDefinitions(initFeedbacks(this))
	}

	/**
	 * Creates the configuration fields for web config.
	 */
	getConfigFields() {
		return getConfigFields()
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 */
	async init(config: HyperdeckConfig) {
		this.config = config

		if (this.config.modelID !== undefined) {
			this.model = CONFIG_MODELS[this.config.modelID]
		} else {
			this.config.modelID = 'hdStudio'
			this.model = CONFIG_MODELS['hdStudio']
		}
		if (!this.model) {
			this.model = Object.values(CONFIG_MODELS)[0]
		}

		this.updateStatus(InstanceStatus.Connecting)

		this.initActionsAndFeedbacks()
		//this.initPresets();
		this.initVariables()

		this.initHyperdeck()
	}

	/**
	 * Clean up the instance before it is destroyed.
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
	 * INTERNAL: initialize variables.
	 */
	private initVariables() {
		initVariables(this)
	}

	/**
	 * INTERNAL: use setup data to initalize the hyperdeck library.
	 */
	private initHyperdeck() {
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

		const targetAddress = this.parseIpAndPort()

		if (!targetAddress) {
			this.updateStatus(InstanceStatus.BadConfig)
			return
		}
		this.updateStatus(InstanceStatus.Connecting)

		const hyperdeck = new Hyperdeck()
		this.hyperDeck = hyperdeck

		this.hyperDeck.on('error', (msg, e: any) => {
			this.log('error', `${msg}: ${e?.message ?? ''}`)
		})

		this.hyperDeck.on('connected', async (info) => {
			try {
				this.protocolVersion = info.protocolVersion

				try {
					this.updateDeviceModelId(info)

					// setup notification:
					const notify = new Commands.NotifySetCommand()
					notify.configuration = true
					notify.transport = true
					notify.slot = true
					notify.remote = true
					if (protocolGte(this.protocolVersion, '1.11')) {
						if (this.config.timecodeVariables === 'notifications') {
							notify.displayTimecode = true
						}
						notify.slateInfo = true
					}

					await hyperdeck.sendCommand(notify)

					let { slots } = await hyperdeck.sendCommand(new Commands.DeviceInfoCommand())
					if (!slots) slots = 2

					for (let i = 1; i <= slots; i++) {
						this.slotInfo[i] = await hyperdeck.sendCommand(new Commands.SlotInfoCommand(i))
						this.log('debug', `Slot info:${JSON.stringify(this.slotInfo)}`)
					}

					await this.refreshTransportInfo()

					this.deckConfig = await hyperdeck.sendCommand(new Commands.ConfigurationGetCommand())
					// this.debug('Initial config:', this.deckConfig)
					this.remoteInfo = await hyperdeck.sendCommand(new Commands.RemoteGetCommand())
				} catch (e: any) {
					if (e.code) {
						this.log('error', `Connection error - ${e.code} ${e.name}`)
					}

					this.updateStatus(InstanceStatus.ConnectionFailure)

					// Connection couldn't initialise, destroy it and try again
					hyperdeck.disconnect().catch(() => null)

					setTimeout(() => {
						this.initHyperdeck()
					}, 1000)

					return
				}

				this.updateStatus(InstanceStatus.Ok)
				
				await this.updateClips(true)
				this.checkFeedbacks()

				if (protocolGte(this.protocolVersion, '1.11')) {
					this.getSlate()
					this.setSlateProject()
				}

				// If polling is enabled, setup interval command
				if (this.pollTimer) clearInterval(this.pollTimer)
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

			if (this.pollTimer) clearInterval(this.pollTimer)
		})

		this.hyperDeck.on('notify.slot', async (res) => {
			this.log('debug', 'Slot Status Changed')

			this.slotInfo[res.slotId] = mergeState(this.slotInfo[res.slotId], res)

			// Update the transport status to catch slot changes
			await this.refreshTransportInfo()

			// Update slot variables
			const newVariables = {}
			updateTimecodeVariables(this, newVariables)
			updateSlotInfoVariables(this, newVariables)
			updateTransportInfoVariables(this, newVariables)
			this.setVariableValues(newVariables)

			// Update clip variables
			await this.updateClips()

			// Update internals
			this.initActionsAndFeedbacks()
			this.checkFeedbacks('slot_status', 'transport_slot')
		})

		this.hyperDeck.on('notify.transport', async (res) => {
			this.log('debug', `Transport status change: ${JSON.stringify(res)}`)
			this.transportInfo = this.extendTransportInfo(mergeState(this.transportInfo, res))

			const newVariables = {}
			updateTransportInfoVariables(this, newVariables)
			updateTimecodeVariables(this, newVariables)
			updateSlotInfoVariables(this, newVariables)
			this.setVariableValues(newVariables)

			this.checkFeedbacks()
		})

		this.hyperDeck.on('notify.remote', async (res) => {
			this.log('debug', 'Remote Status Changed')
			this.remoteInfo = mergeState(this.remoteInfo, res)

			const newVariables = {}
			updateRemoteVariable(this, newVariables)
			this.setVariableValues(newVariables)

			this.checkFeedbacks('remote_status')
		})

		this.hyperDeck.on('notify.configuration', async (res) => {
			this.log('debug', `Configuration Changed: ${JSON.stringify(res)}`)
			this.deckConfig = mergeState(this.deckConfig, res)

			// this.debug('Config:', this.deckConfig)
			this.checkFeedbacks('video_input', 'audio_input', 'audio_channels')

			const newVariables = {}
			updateConfigurationVariables(this, newVariables)
			this.setVariableValues(newVariables)
		})

		this.hyperDeck.on('notify.displayTimecode', (res) => {
			this.transportInfo.displayTimecode = res.displayTimecode

			const newVariables = {}
			updateTimecodeVariables(this, newVariables)
			this.setVariableValues(newVariables)
		})

		this.hyperDeck.on('notify.slateInfo', (res) => {
			this.log('debug', `Slate Info Changed: ${JSON.stringify(res)}`)
			this.slate = mergeState(this.slate, res)
			console.log(`Slate state: ${JSON.stringify(this.slate)}`)
			const newVariables = {}
			updateSlateVariables(this, newVariables)
			this.setVariableValues(newVariables)
		})

		this.hyperDeck.connect(targetAddress.ip, targetAddress.port)

		// hyperdeck-connection debug tool
			this.hyperDeck.DEBUG = true;
	}

	/**
	 * INTERNAL: Send a poll command to refresh status
	 */
	private sendPollCommand() {
		this.refreshTransportInfo()
			.then(() => {
				// Update slot variables
				const newVariables = {}
				updateTimecodeVariables(this, newVariables)
				updateSlotInfoVariables(this, newVariables)
				updateTransportInfoVariables(this, newVariables)
				this.setVariableValues(newVariables)
			})
			.catch((error) => {
				this.log('error', `Timecode polling failed: ${error}`)
				if (this.pollTimer) clearInterval(this.pollTimer)
			})
	}

	/**
	 * Process an updated configuration array.
	 */
	async configUpdated(config: HyperdeckConfig) {
		let resetConnection = false

		if (this.config.host !== config.host || this.config.bonjourHost !== config.bonjourHost) {
			resetConnection = true
		}

		// Enable/disable timecode notifications
		if (
			this.hyperDeck?.connected &&
			protocolGte(this.protocolVersion, '1.11') &&
			this.config.timecodeVariables !== config.timecodeVariables &&
			!resetConnection
		) {
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

		if (this.config.modelID !== config.modelID) {
			this.model = CONFIG_MODELS[config.modelID]
		}

		this.config = config

		this.initActionsAndFeedbacks()
		//this.initPresets();
		this.initVariables()

		// Update the slate project info
		if (this.hyperDeck?.connected && protocolGte(this.protocolVersion, '1.11')) {
			this.setSlateProject()
		}

		if (resetConnection || !this.hyperDeck) {
			this.initHyperdeck()
		} else {
			// If polling is enabled, setup interval command
			if (this.pollTimer) clearInterval(this.pollTimer)
			if (this.config.timecodeVariables === 'polling') {
				this.pollTimer = setInterval(this.sendPollCommand.bind(this), this.config.pollingInterval)
			}
		}
	}

	/**
	 * INTERNAL: Updates device data from the HyperDeck
	 */
	private updateDeviceModelId(info: Commands.ConnectionInfoResponse) {
		const modelName = info.model

		this.log('info', `Connected to a ${info.model}`)

		const oldModelId = this.config.modelID

		// TODO - can this be replaced?
		//	this.debug('Model value:', value)
		if (modelName.match(/Extreme/)) {
			this.config.modelID = 'hdExtreme8K'
		} else if (modelName.match(/Studio Mini/)) {
			this.config.modelID = 'hdStudioMini'
		} else if (modelName.match(/Duplicator/)) {
			this.config.modelID = 'bmdDup4K'
		} else if (modelName.match(/12G/)) {
			this.config.modelID = 'hdStudio12G'
		} else if (modelName.match(/Studio Pro/)) {
			this.config.modelID = 'hdStudioPro'
		} else if (modelName.match(/HD Mini/)) {
			this.config.modelID = 'hdStudioHDMini'
		} else if (modelName.match(/HD Plus/)) {
			this.config.modelID = 'hdStudioHDPlus'
		} else if (modelName.match(/HD Pro/)) {
			this.config.modelID = 'hdStudioHDPro'
		} else if (modelName.match(/4K Pro/)) {
			this.config.modelID = 'hdStudio4KPro'
		} else if (modelName.match(/Shuttle HD/)) {
			this.config.modelID = 'hdShuttleHD'
		} else {
			this.config.modelID = 'hdStudio'
		}

		if (this.config.modelID !== oldModelId) {
			this.saveConfig(this.config)
		}
	}

	/**
	 * INTERNAL: Get clip list from the hyperdeck
	 *
	 * @access protected
	 */
	async updateClips(doFullInit = false) {
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

			this.initActionsAndFeedbacks() // reinit due to clip list change

			if (doFullInit || oldLength !== this.clipsList.length) {
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
	 */
	private extendTransportInfo(rawState: Commands.TransportInfoCommandResponse): TransportInfoStateExt {
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

	// Set Slate Project metadata
	async setSlateProject() {
		try {
			const cmd = new Commands.SlateProjectCommand(
				this.config.projectName,
				this.config.camera,
				this.config.director,
				this.config.cameraOperator,
			)
			this.sendCommand(cmd)
			this.log('debug', `Project slate updated: Name: ${this.config.projectName}, Camera: ${this.config.camera}, Director: ${	this.config.director}, Operator: ${this.config.cameraOperator}`)
		} catch (e: any) {
			if (e.code) {
				this.log('error', `${e.code}: ${e.name}`)
			}
		}
	}

	// Get Slate metadata
	async getSlate() {
		try {
			const newVariableValues = {}

			if (!this.hyperDeck) throw new Error('TODO - no hyperdeck connection')

			let resProject: Commands.SlateProjectCommandResponse
			let resClips: Commands.SlateClipsCommandResponse
			try {
				resProject = await this.hyperDeck.sendCommand(new Commands.SlateProjectGetCommand())
				resClips = await this.hyperDeck.sendCommand(new Commands.SlateClipsGetCommand())
			} catch (e: any) {
				throw e
			}
			this.slate = mergeState(this.slate, resProject)
			this.slate = mergeState(this.slate, resClips)
			this.log('debug', `Slate Project Changed: ${JSON.stringify(resProject)}`)
			this.log('debug', `Slate Clips Changed: ${JSON.stringify(resClips)}`)

			console.log(`this.slate:\n ${JSON.stringify(this.slate)}`)
			// Update the received slate variables
			updateSlateVariables(this, newVariableValues)
			console.log(`newVariables: ${JSON.stringify(newVariableValues)}`)
			this.setVariableValues(newVariableValues)
			
		} catch (e: any) {
			if (e.code) {
				this.log('error', e.code + ' ' + e.name)
			}
		}
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

	parseIpAndPort(): IpAndPort | null {
		const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

		if (this.config.bonjourHost) {
			const [ip, rawPort] = this.config.bonjourHost.split(':')
			const port = Number(rawPort)
			if (ip.match(ipRegex) && !isNaN(port)) {
				return {
					ip,
					port,
				}
			}
		} else if (this.config.host) {
			if (this.config.host.match(ipRegex)) {
				return {
					ip: this.config.host,
					port: undefined,
				}
			}
		}
		return null
	}
}

runEntrypoint(HyperdeckInstance, upgradeScripts)
