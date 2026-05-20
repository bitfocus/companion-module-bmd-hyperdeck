import { initPresets } from './presets'
import { InstanceBaseExt, TransportInfoStateExt } from './types'
import { HyperdeckConfig } from './config'
import { VideoFormat, TransportStatus } from 'hyperdeck-connection'

// Mock the @companion-module/base module
jest.mock('@companion-module/base', () => ({
	combineRgb: jest.fn((r, g, b) => (r << 16) + (g << 8) + b),
}))

// Helper function for type assertion failures
function fail(message: string): never {
	throw new Error(message)
}

// Mock InstanceBaseExt with proper types
class MockInstanceBaseExt {
	// InstanceBase<HyperdeckConfig> properties
	readonly [Symbol.toStringTag]: string = 'InstanceBaseExt'
	actions: any = {}
	config: HyperdeckConfig = {
		host: '127.0.0.1',
		modelID: 'model1',
		reel: 'test_reel',
		timecodeVariables: 'disabled',
		pollingInterval: 500
	}
	currentActions: any = {}
	currentFeedbacks: any = {}
	currentPresetUpgrades: any = {}
	feedbacks: any = {}
	partialConfig: any = {}

	// InstanceBaseExt properties
	transportInfo: TransportInfoStateExt = {
		videoFormat: VideoFormat._1080i5994,
		slotId: 1,
		clipId: 1,
		speed: 100,
		status: TransportStatus.STOPPED,
		loop: false,
		singleClip: false,
		displayTimecode: '00:00:00:00',
		timecode: '00:00:00:00',
		inputVideoFormat: null,
		clipName: 'test_clip'
	}
	deckConfig: any = {
		videoInput: '1',
		audioInput: 'embedded',
		fileFormat: 'HFS+',
		audioCodec: 'PCM',
		audioInputChannels: 2
	}
	slotInfo: any[] = []
	protocolVersion: number = 1
	model: any = { id: 'model1', label: 'Test Model', hasSeparateInputFormat: false }
	remoteInfo: any = null
	formatToken: string | null = null
	formatTokenTimeout: NodeJS.Timeout | null = null
	simpleClipsList: any[] = []
	fullClipsList: any[] = []

	// Methods
	log = jest.fn()
	regenerateFeedbacks = jest.fn()
	regeneratePresets = jest.fn()
	setActions = jest.fn()
	setActivity = jest.fn()
	setFeedbackDefinitions = jest.fn()
	setPresetDefinitions = jest.fn()
	showError = jest.fn()
	status = jest.fn()
	parseVariables = jest.fn()
	subscribeFeedbackStates = jest.fn()
	unsubscribeFeedbackStates = jest.fn()
	updateClips = jest.fn()
	sendCommand = jest.fn()
	refreshTransportInfo = jest.fn()
}

describe('presets.ts', () => {
	let mockInstance: InstanceBaseExt

	beforeEach(() => {
		mockInstance = new MockInstanceBaseExt() as unknown as InstanceBaseExt
	})

	describe('initPresets', () => {
		it('should return an object with all expected preset keys', () => {
			const presets = initPresets(mockInstance)

			expect(presets).toBeDefined()
			expect(Object.keys(presets)).toEqual(
				expect.arrayContaining([
					'play',
					'rec',
					'spill',
					'recName',
					'recTimestamp',
					'stop',
					'goto',
					'gotoN',
					'gotoName',
					'goFwd',
					'goRew',
					'fetchClips',
					'formatPrepare',
					'formatConfirm',
					'remote',
					'transportStatus',
					'clipInfo',
					'slotId',
					'videoFormat',
					'recordingTime',
					'timecode',
					'countdown',
					'audioFormat',
					'audioChannels',
					'remoteEnabled'
				])
			)
		})

		it('should log initialization message', () => {
			initPresets(mockInstance)
			
			expect(mockInstance.log).toHaveBeenCalledWith('info', 'Initializing Presets')
		})

		it('should initialize play preset correctly', () => {
			const presets = initPresets(mockInstance)
			const playPreset = presets.play

			expect(playPreset).toBeDefined()
			if (playPreset && playPreset.type === 'button') {
				expect(playPreset.type).toBe('button')
				expect(playPreset.category).toBe('Transport')
				expect(playPreset.name).toBe('Play')
				expect(playPreset.style).toBeDefined()
				expect(playPreset.style.text).toBe('▶\nPlay')
				expect(playPreset.style.size).toBe('14')
				expect(playPreset.feedbacks).toHaveLength(1)
				expect(playPreset.steps).toHaveLength(1)
				expect(playPreset.steps[0].down).toHaveLength(1)
				expect(playPreset.steps[0].up).toHaveLength(0)
				expect(playPreset.steps[0].down[0]).toEqual({
					actionId: 'play',
					options: { speed: 100, loop: false, single: false, useVariable: false }
				})
			} else {
				fail('playPreset is not a button preset')
			}
		})

		it('should initialize rec preset correctly', () => {
			const presets = initPresets(mockInstance)
			const recPreset = presets.rec

			expect(recPreset).toBeDefined()
			if (recPreset && recPreset.type === 'button') {
				expect(recPreset.type).toBe('button')
				expect(recPreset.category).toBe('Transport')
				expect(recPreset.name).toBe('Record')
				expect(recPreset.style).toBeDefined()
				expect(recPreset.style.text).toBe('●\nRec')
				expect(recPreset.feedbacks).toHaveLength(1)
				expect(recPreset.steps).toHaveLength(1)
				expect(recPreset.steps[0].down).toHaveLength(1)
				expect(recPreset.steps[0].up).toHaveLength(0)
				expect(recPreset.steps[0].down[0]).toEqual({
					actionId: 'rec',
					options: {}
				})
			} else {
				fail('recPreset is not a button preset')
			}
		})

		it('should initialize spill preset correctly', () => {
			const presets = initPresets(mockInstance)
			const spillPreset = presets.spill

			expect(spillPreset).toBeDefined()
			if (spillPreset && spillPreset.type === 'button') {
				expect(spillPreset.type).toBe('button')
				expect(spillPreset.category).toBe('Transport')
				expect(spillPreset.name).toBe('Spill')
				expect(spillPreset.style).toBeDefined()
				expect(spillPreset.style.text).toBe('⏺️\nSpill')
				expect(spillPreset.feedbacks).toHaveLength(0)
				expect(spillPreset.steps).toHaveLength(1)
				expect(spillPreset.steps[0].down).toHaveLength(1)
				expect(spillPreset.steps[0].up).toHaveLength(0)
				expect(spillPreset.steps[0].down[0]).toEqual({
					actionId: 'spill',
					options: { slot: 'next' }
				})
			} else {
				fail('spillPreset is not a button preset')
			}
		})

		it('should initialize stop preset correctly', () => {
			const presets = initPresets(mockInstance)
			const stopPreset = presets.stop

			expect(stopPreset).toBeDefined()
			if (stopPreset && stopPreset.type === 'button') {
				expect(stopPreset.type).toBe('button')
				expect(stopPreset.category).toBe('Transport')
				expect(stopPreset.name).toBe('Stop')
				expect(stopPreset.style).toBeDefined()
				expect(stopPreset.style.text).toBe('■\nStop')
				expect(stopPreset.feedbacks).toHaveLength(1)
				expect(stopPreset.steps).toHaveLength(1)
				expect(stopPreset.steps[0].down).toHaveLength(1)
				expect(stopPreset.steps[0].up).toHaveLength(0)
				expect(stopPreset.steps[0].down[0]).toEqual({
					actionId: 'stop',
					options: {}
				})
			} else {
				fail('stopPreset is not a button preset')
			}
		})

		it('should initialize goto preset correctly', () => {
			const presets = initPresets(mockInstance)
			const gotoPreset = presets.goto

			expect(gotoPreset).toBeDefined()
			if (gotoPreset && gotoPreset.type === 'button') {
				expect(gotoPreset.type).toBe('button')
				expect(gotoPreset.category).toBe('Transport')
				expect(gotoPreset.name).toBe('Goto TC')
				expect(gotoPreset.style).toBeDefined()
				expect(gotoPreset.style.text).toBe('Goto\n00:00:01:00')
				expect(gotoPreset.feedbacks).toHaveLength(0)
				expect(gotoPreset.steps).toHaveLength(1)
				expect(gotoPreset.steps[0].down).toHaveLength(1)
				expect(gotoPreset.steps[0].up).toHaveLength(0)
				expect(gotoPreset.steps[0].down[0]).toEqual({
					actionId: 'goto',
					options: { tc: '00:00:01:00' }
				})
			} else {
				fail('gotoPreset is not a button preset')
			}
		})

		it('should initialize formatPrepare preset correctly', () => {
			const presets = initPresets(mockInstance)
			const formatPreparePreset = presets.formatPrepare

			expect(formatPreparePreset).toBeDefined()
			if (formatPreparePreset && formatPreparePreset.type === 'button') {
				expect(formatPreparePreset.type).toBe('button')
				expect(formatPreparePreset.category).toBe('Utility')
				expect(formatPreparePreset.name).toBe('Format (Prepare)')
				expect(formatPreparePreset.style).toBeDefined()
				expect(formatPreparePreset.style.text).toBe('Format\nPrepare')
				expect(formatPreparePreset.feedbacks).toHaveLength(1)
				expect(formatPreparePreset.steps).toHaveLength(1)
				expect(formatPreparePreset.steps[0].down).toHaveLength(1)
				expect(formatPreparePreset.steps[0].up).toHaveLength(0)
				expect(formatPreparePreset.steps[0].down[0]).toEqual({
					actionId: 'formatPrepare',
					options: { filesystem: 'HFS+', timeout: 10 }
				})
			} else {
				fail('formatPreparePreset is not a button preset')
			}
		})

		it('should initialize formatConfirm preset correctly', () => {
			const presets = initPresets(mockInstance)
			const formatConfirmPreset = presets.formatConfirm

			expect(formatConfirmPreset).toBeDefined()
			if (formatConfirmPreset && formatConfirmPreset.type === 'button') {
				expect(formatConfirmPreset.type).toBe('button')
				expect(formatConfirmPreset.category).toBe('Utility')
				expect(formatConfirmPreset.name).toBe('Format (Confirm)')
				expect(formatConfirmPreset.style).toBeDefined()
				expect(formatConfirmPreset.style.text).toBe('Format\nConfirm')
				expect(formatConfirmPreset.feedbacks).toHaveLength(0)
				expect(formatConfirmPreset.steps).toHaveLength(1)
				expect(formatConfirmPreset.steps[0].down).toHaveLength(1)
				expect(formatConfirmPreset.steps[0].up).toHaveLength(0)
				expect(formatConfirmPreset.steps[0].down[0]).toEqual({
					actionId: 'formatConfirm',
					options: {}
				})
			} else {
				fail('formatConfirmPreset is not a button preset')
			}
		})

		it('should initialize remote preset correctly', () => {
			const presets = initPresets(mockInstance)
			const remotePreset = presets.remote

			expect(remotePreset).toBeDefined()
			if (remotePreset && remotePreset.type === 'button') {
				expect(remotePreset.type).toBe('button')
				expect(remotePreset.category).toBe('Config')
				expect(remotePreset.name).toBe('Remote Toggle')
				expect(remotePreset.style).toBeDefined()
				expect(remotePreset.style.text).toBe('Remote\nToggle')
				expect(remotePreset.feedbacks).toHaveLength(1)
				expect(remotePreset.steps).toHaveLength(1)
				expect(remotePreset.steps[0].down).toHaveLength(1)
				expect(remotePreset.steps[0].up).toHaveLength(0)
				expect(remotePreset.steps[0].down[0]).toEqual({
					actionId: 'remote',
					options: { remoteEnable: 'toggle' }
				})
			} else {
				fail('remotePreset is not a button preset')
			}
		})

		it('should initialize transportStatus monitor preset correctly', () => {
			const presets = initPresets(mockInstance)
			const transportStatusPreset = presets.transportStatus

			expect(transportStatusPreset).toBeDefined()
			if (transportStatusPreset && transportStatusPreset.type === 'button') {
				expect(transportStatusPreset.type).toBe('button')
				expect(transportStatusPreset.category).toBe('Monitor')
				expect(transportStatusPreset.name).toBe('Transport Status')
				expect(transportStatusPreset.style).toBeDefined()
				expect(transportStatusPreset.style.text).toBe('Status\n$(hyperdeck:status)')
				expect(transportStatusPreset.steps).toHaveLength(0)
				expect(transportStatusPreset.feedbacks).toHaveLength(0)
			} else {
				fail('transportStatusPreset is not a button preset')
			}
		})

		it('should initialize clipInfo monitor preset correctly', () => {
			const presets = initPresets(mockInstance)
			const clipInfoPreset = presets.clipInfo

			expect(clipInfoPreset).toBeDefined()
			if (clipInfoPreset && clipInfoPreset.type === 'button') {
				expect(clipInfoPreset.type).toBe('button')
				expect(clipInfoPreset.category).toBe('Monitor')
				expect(clipInfoPreset.name).toBe('Clip Info')
				expect(clipInfoPreset.style).toBeDefined()
				expect(clipInfoPreset.style.text).toBe('Clip\n$(hyperdeck:clipName)')
				expect(clipInfoPreset.steps).toHaveLength(0)
				expect(clipInfoPreset.feedbacks).toHaveLength(0)
			} else {
				fail('clipInfoPreset is not a button preset')
			}
		})

		it('should initialize slotId monitor preset correctly', () => {
			const presets = initPresets(mockInstance)
			const slotIdPreset = presets.slotId

			expect(slotIdPreset).toBeDefined()
			if (slotIdPreset && slotIdPreset.type === 'button') {
				expect(slotIdPreset.type).toBe('button')
				expect(slotIdPreset.category).toBe('Monitor')
				expect(slotIdPreset.name).toBe('Slot ID')
				expect(slotIdPreset.style).toBeDefined()
				expect(slotIdPreset.style.text).toBe('Slot\n$(hyperdeck:slotId)')
				expect(slotIdPreset.steps).toHaveLength(0)
				expect(slotIdPreset.feedbacks).toHaveLength(0)
			} else {
				fail('slotIdPreset is not a button preset')
			}
		})

		it('should initialize videoFormat monitor preset correctly', () => {
			const presets = initPresets(mockInstance)
			const videoFormatPreset = presets.videoFormat

			expect(videoFormatPreset).toBeDefined()
			if (videoFormatPreset && videoFormatPreset.type === 'button') {
				expect(videoFormatPreset.type).toBe('button')
				expect(videoFormatPreset.category).toBe('Monitor')
				expect(videoFormatPreset.name).toBe('Video Format')
				expect(videoFormatPreset.style).toBeDefined()
				expect(videoFormatPreset.style.text).toBe('Format\n$(hyperdeck:videoFormat)')
				expect(videoFormatPreset.steps).toHaveLength(0)
				expect(videoFormatPreset.feedbacks).toHaveLength(0)
			} else {
				fail('videoFormatPreset is not a button preset')
			}
		})

		it('should initialize recordingTime monitor preset correctly', () => {
			const presets = initPresets(mockInstance)
			const recordingTimePreset = presets.recordingTime

			expect(recordingTimePreset).toBeDefined()
			if (recordingTimePreset && recordingTimePreset.type === 'button') {
				expect(recordingTimePreset.type).toBe('button')
				expect(recordingTimePreset.category).toBe('Monitor')
				expect(recordingTimePreset.name).toBe('Recording Time')
				expect(recordingTimePreset.style).toBeDefined()
				expect(recordingTimePreset.style.text).toBe('Rec Time\n$(hyperdeck:recordingTime)')
				expect(recordingTimePreset.steps).toHaveLength(0)
				expect(recordingTimePreset.feedbacks).toHaveLength(0)
			} else {
				fail('recordingTimePreset is not a button preset')
			}
		})

		it('should initialize timecode monitor preset correctly', () => {
			const presets = initPresets(mockInstance)
			const timecodePreset = presets.timecode

			expect(timecodePreset).toBeDefined()
			if (timecodePreset && timecodePreset.type === 'button') {
				expect(timecodePreset.type).toBe('button')
				expect(timecodePreset.category).toBe('Monitor')
				expect(timecodePreset.name).toBe('Timecode')
				expect(timecodePreset.style).toBeDefined()
				expect(timecodePreset.style.text).toBe('TC\n$(hyperdeck:timecodeHMSF)')
				expect(timecodePreset.steps).toHaveLength(0)
				expect(timecodePreset.feedbacks).toHaveLength(0)
			} else {
				fail('timecodePreset is not a button preset')
			}
		})

		it('should initialize countdown monitor preset correctly', () => {
			const presets = initPresets(mockInstance)
			const countdownPreset = presets.countdown

			expect(countdownPreset).toBeDefined()
			if (countdownPreset && countdownPreset.type === 'button') {
				expect(countdownPreset.type).toBe('button')
				expect(countdownPreset.category).toBe('Monitor')
				expect(countdownPreset.name).toBe('Countdown TC')
				expect(countdownPreset.style).toBeDefined()
				expect(countdownPreset.style.text).toBe('⏳\n$(hyperdeck:countdownTimecodeHMSF)')
				expect(countdownPreset.steps).toHaveLength(0)
				expect(countdownPreset.feedbacks).toHaveLength(0)
			} else {
				fail('countdownPreset is not a button preset')
			}
		})

		it('should initialize audioFormat monitor preset correctly', () => {
			const presets = initPresets(mockInstance)
			const audioFormatPreset = presets.audioFormat

			expect(audioFormatPreset).toBeDefined()
			if (audioFormatPreset && audioFormatPreset.type === 'button') {
				expect(audioFormatPreset.type).toBe('button')
				expect(audioFormatPreset.category).toBe('Monitor')
				expect(audioFormatPreset.name).toBe('Audio Format')
				expect(audioFormatPreset.style).toBeDefined()
				expect(audioFormatPreset.style.text).toBe('Audio\n$(hyperdeck:audioCodec)')
				expect(audioFormatPreset.steps).toHaveLength(0)
				expect(audioFormatPreset.feedbacks).toHaveLength(0)
			} else {
				fail('audioFormatPreset is not a button preset')
			}
		})

		it('should initialize audioChannels monitor preset correctly', () => {
			const presets = initPresets(mockInstance)
			const audioChannelsPreset = presets.audioChannels

			expect(audioChannelsPreset).toBeDefined()
			if (audioChannelsPreset && audioChannelsPreset.type === 'button') {
				expect(audioChannelsPreset.type).toBe('button')
				expect(audioChannelsPreset.category).toBe('Monitor')
				expect(audioChannelsPreset.name).toBe('Audio Channels')
				expect(audioChannelsPreset.style).toBeDefined()
				expect(audioChannelsPreset.style.text).toBe('Channels\n$(hyperdeck:audioChannels)')
				expect(audioChannelsPreset.steps).toHaveLength(0)
				expect(audioChannelsPreset.feedbacks).toHaveLength(0)
			} else {
				fail('audioChannelsPreset is not a button preset')
			}
		})

		it('should initialize remoteEnabled monitor preset correctly', () => {
			const presets = initPresets(mockInstance)
			const remoteEnabledPreset = presets.remoteEnabled

			expect(remoteEnabledPreset).toBeDefined()
			if (remoteEnabledPreset && remoteEnabledPreset.type === 'button') {
				expect(remoteEnabledPreset.type).toBe('button')
				expect(remoteEnabledPreset.category).toBe('Monitor')
				expect(remoteEnabledPreset.name).toBe('Remote Status')
				expect(remoteEnabledPreset.style).toBeDefined()
				expect(remoteEnabledPreset.style.text).toBe('Remote\n$(hyperdeck:remoteEnabled)')
				expect(remoteEnabledPreset.steps).toHaveLength(0)
				expect(remoteEnabledPreset.feedbacks).toHaveLength(0)
			} else {
				fail('remoteEnabledPreset is not a button preset')
			}
		})

		it('should handle feedback properties for transport status correctly', () => {
			const presets = initPresets(mockInstance)
		
			// Check play preset feedback
			const playPreset = presets.play
			if (playPreset && playPreset.type === 'button') {
				expect(playPreset.feedbacks).toHaveLength(1)
				expect(playPreset.feedbacks[0]).toEqual({
					feedbackId: 'transport_status',
					options: { status: 'play' },
					style: {
						color: expect.any(Number),
						bgcolor: expect.any(Number),
					}
				})
			} else {
				fail('playPreset is not a button preset')
			}
		
			// Check record preset feedback
			const recPreset = presets.rec
			if (recPreset && recPreset.type === 'button') {
				expect(recPreset.feedbacks).toHaveLength(1)
				expect(recPreset.feedbacks[0]).toEqual({
					feedbackId: 'transport_status',
					options: { status: 'record' },
					style: {
						color: expect.any(Number),
						bgcolor: expect.any(Number),
					}
				})
			} else {
				fail('recPreset is not a button preset')
			}
		
			// Check stop preset feedback
			const stopPreset = presets.stop
			if (stopPreset && stopPreset.type === 'button') {
				expect(stopPreset.feedbacks).toHaveLength(1)
				expect(stopPreset.feedbacks[0]).toEqual({
					feedbackId: 'transport_status',
					options: { status: 'stopped' },
					style: {
						color: expect.any(Number),
						bgcolor: expect.any(Number),
					}
				})
			} else {
				fail('stopPreset is not a button preset')
			}
		})
	
		it('should handle feedback properties for clip tracking correctly', () => {
			const presets = initPresets(mockInstance)
		
			// Check gotoN preset feedback
			const gotoNPreset = presets.gotoN
			if (gotoNPreset && gotoNPreset.type === 'button') {
				expect(gotoNPreset.feedbacks).toHaveLength(1)
				expect(gotoNPreset.feedbacks[0]).toEqual({
					feedbackId: 'transport_clip',
					options: { clipID: 1, slotID: 'either' },
					style: {
						color: expect.any(Number),
						bgcolor: expect.any(Number),
					}
				})
			} else {
				fail('gotoNPreset is not a button preset')
			}
		
			// Check gotoName preset feedback
			const gotoNamePreset = presets.gotoName
			if (gotoNamePreset && gotoNamePreset.type === 'button') {
				expect(gotoNamePreset.feedbacks).toHaveLength(1)
				expect(gotoNamePreset.feedbacks[0]).toEqual({
					feedbackId: 'transport_clip_name',
					options: { clipName: '', slotID: 'either' },
					style: {
						color: expect.any(Number),
						bgcolor: expect.any(Number),
					}
				})
			} else {
				fail('gotoNamePreset is not a button preset')
			}
		})
	
		it('should handle feedback properties for config monitoring correctly', () => {
			const presets = initPresets(mockInstance)
		
			// Check formatPrepare preset feedback
			const formatPreparePreset = presets.formatPrepare
			if (formatPreparePreset && formatPreparePreset.type === 'button') {
				expect(formatPreparePreset.feedbacks).toHaveLength(1)
				expect(formatPreparePreset.feedbacks[0]).toEqual({
					feedbackId: 'format_ready',
					options: {},
					style: {
						color: expect.any(Number),
						bgcolor: expect.any(Number),
					}
				})
			} else {
				fail('formatPreparePreset is not a button preset')
			}
		
			// Check remote preset feedback
			const remotePreset = presets.remote
			if (remotePreset && remotePreset.type === 'button') {
				expect(remotePreset.feedbacks).toHaveLength(1)
				expect(remotePreset.feedbacks[0]).toEqual({
					feedbackId: 'remote_status',
					options: { status: true },
					style: {
						color: expect.any(Number),
						bgcolor: expect.any(Number),
					}
				})
			} else {
				fail('remotePreset is not a button preset')
			}
		})
	})
})