import { initFeedbacks } from './feedbacks.js'
import { InstanceBaseExt } from './types.js'
import { CONFIG_MODELS } from './models.js'

// Define types for the feedback callback events
interface CompanionFeedbackAdvancedEvent {
	options: Record<string, any>
	type: 'boolean' | 'advanced'
	id: string
	controlId: string
	feedbackId: string
}

interface CompanionFeedbackContext {
	parseVariablesInString: (str: string) => Promise<string>
}

// Mock the @companion-module/base module
jest.mock('@companion-module/base', () => ({
	Regex: {
		SIGNED_NUMBER: /^-?\d+$/,
		SOMETHING: /.+/,
	},
	combineRgb: jest.fn((r, g, b) => (r << 16) | (g << 8) | b),
}))

// Create a mock InstanceBaseExt
const createMockInstance = (): InstanceBaseExt => {
	return {
		model: CONFIG_MODELS.hdStudio, // Use a real model from models.ts instead of a string
		transportInfo: {
			status: 'playing',
			clipId: 1,
			slotId: 1,
			clipName: 'SampleClip',
			loop: 'enabled',
			singleClip: 'disabled',
			speed: 0,
			displayTimecode: '00:00:00:00',
			timecode: '00:00:00:00',
			videoFormat: '1080i5994',
			inputVideoFormat: '1080i5994',
		},
		slotInfo: [
			undefined, // index 0 - corresponds to slot 0 (unused)
			{ slotId: 1, status: 'mounted', volumeName: 'Volume1', recordingTime: 0, videoFormat: '1080i5994' },
			{ slotId: 2, status: 'empty', volumeName: 'Volume2', recordingTime: 0, videoFormat: '1080i5994' }
		],
		deckConfig: {
			videoInput: 1,
			audioInput: 'analog',
			audioCodec: 'AAC',
			audioInputChannels: 2,
			fileFormat: 'H.264',
		},
		formatToken: null,
		remoteInfo: {
			enabled: true,
		},
		simpleClipsList: [
			{ clipId: 1, name: 'TestClip' },
			{ clipId: 2, name: 'AnotherClip' }
		],
		log: jest.fn(),
	} as unknown as InstanceBaseExt
}

// Create mock parseVariablesInString context
const createContext = (variableMap: Record<string, string> = {}) => ({
	parseVariablesInString: jest.fn(async (str: string) => {
		// In a real scenario, this would parse variables like $(var)$
		// For testing purposes, we'll just return the string as-is or use variableMap if provided
		let result = str
		Object.entries(variableMap).forEach(([key, value]) => {
			result = result.replace(`\${${key}}$`, value)
		})
		return result
	}),
})

describe('initFeedbacks', () => {
	let mockSelf: InstanceBaseExt

	beforeEach(() => {
		mockSelf = createMockInstance()
		jest.clearAllMocks()
	})

	test('should initialize feedback definitions correctly', () => {
		const feedbacks = initFeedbacks(mockSelf)

		expect(feedbacks).toBeDefined()
		expect(typeof feedbacks).toBe('object')
		expect(Object.keys(feedbacks).length).toBeGreaterThan(0)
	})

	describe('transport_status feedback', () => {
		test('should return true when transport status matches', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_status']

			expect(feedback).toBeDefined()
			expect(feedback?.type).toBe('boolean')
			expect(feedback?.name).toBe('Transport status')

			const options = { status: 'playing' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when transport status does not match', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_status']

			const options = { status: 'stopped' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(false)
		})
	})

	describe('transport_clip feedback', () => {
		test('should return true when clip ID matches and slot is either', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_clip']

			const options = { clipID: '1', slotID: 'either' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext()
			const result = await (feedback as any)?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return true when clip ID and slot ID match', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_clip']

			const options = { clipID: '1', slotID: '1' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext()
			mockSelf.transportInfo.slotId = 1 // Make sure slot IDs match
			const result = await (feedback as any)?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when clip ID does not match', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_clip']

			const options = { clipID: '2', slotID: 'either' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext()
			const result = await (feedback as any)?.callback(event, context)

			expect(result).toBe(false)
		})

		test('should handle variable parsing for clip ID', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_clip']

			const options = { clipID: '${variable}$', slotID: 'either' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext({ variable: '1' })
			const result = await (feedback as any)?.callback(event, context)

			expect(context.parseVariablesInString).toHaveBeenCalledWith('${variable}$')
			expect(result).toBe(true)
		})
	})

	describe('transport_clip_name feedback', () => {
		test('should return true when clip name matches and slot is either', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_clip_name']

			const options = { clipName: 'SampleClip', slotID: 'either' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return true when clip name and slot ID match', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_clip_name']

			const options = { clipName: 'SampleClip', slotID: '1' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			mockSelf.transportInfo.slotId = 1 // Make sure slot IDs match
			const result = feedback?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when clip name does not match', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_clip_name']

			const options = { clipName: 'OtherClip', slotID: 'either' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(false)
		})
	})

	describe('transport_slot feedback', () => {
		test('should return true when slot ID matches', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_slot']

			const options = { setting: '1' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext()
			const result = await (feedback as any)?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when slot ID does not match', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_slot']

			const options = { setting: '2' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext()
			const result = await (feedback as any)?.callback(event, context)

			expect(result).toBe(false)
		})

		test('should handle variable parsing for slot ID', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_slot']

			const options = { setting: '${variable}$' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext({ variable: '1' })
			const result = await (feedback as any)?.callback(event, context)

			expect(context.parseVariablesInString).toHaveBeenCalledWith('${variable}$')
			expect(result).toBe(true)
		})
	})

	describe('slot_status feedback', () => {
		test('should return true when slot status matches', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['slot_status']

			const options = { status: 'mounted', slotId: '1' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext()
			const result = await (feedback as any)?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when slot status does not match', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['slot_status']

			const options = { status: 'mounted', slotId: '2' } // slot 2 is empty
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext()
			const result = await (feedback as any)?.callback(event, context)

			expect(result).toBe(false)
		})

		test('should return false for non-existent slot', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['slot_status']

			const options = { status: 'mounted', slotId: '99' } // non-existent slot
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext()
			const result = await (feedback as any)?.callback(event, context)

			expect(result).toBe(false)
		})

		test('should handle variable parsing for slot ID', async () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['slot_status']

			const options = { status: 'mounted', slotId: '${variable}$' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context = createContext({ variable: '1' })
			const result = await (feedback as any)?.callback(event, context)

			expect(context.parseVariablesInString).toHaveBeenCalledWith('${variable}$')
			expect(result).toBe(true)
		})
	})

	describe('transport_loop feedback', () => {
		test('should return true when loop setting matches', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_loop']

			const options = { setting: 'enabled' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when loop setting does not match', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_loop']

			const options = { setting: 'disabled' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(false)
		})
	})

	describe('transport_singleClip feedback', () => {
		test('should return true when single clip setting matches', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_singleClip']

			const options = { setting: 'disabled' } // matches initial value
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when single clip setting does not match', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['transport_singleClip']

			const options = { setting: 'enabled' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(false)
		})
	})

	describe('video_input feedback', () => {
		test('should return true when video input matches', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['video_input']

			const options = { setting: '1' } // matches initial value
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when video input does not match', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['video_input']

			const options = { setting: '2' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(false)
		})
	})

	describe('audio_input feedback', () => {
		test('should return true when audio input matches (for models with audio inputs)', () => {
			// Add a mock model with more than one audio input
			const mockSelfWithAudio = {
				...mockSelf,
				model: CONFIG_MODELS.hdPlus, // Use a model that supports audio inputs
			} as any

			const feedbacks = initFeedbacks(mockSelfWithAudio)
			
			// audio_input feedback only exists for certain models
			if (feedbacks['audio_input']) {
				const feedback = feedbacks['audio_input']
				
				const options = { setting: 'analog' } // matches initial value
				const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
				const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
				const result = feedback?.callback(event, context)
				
				expect(result).toBe(true)
			}
		})

		test('should return false when audio input does not match', () => {
			// Add a mock model with more than one audio input
			const mockSelfWithAudio = {
				...mockSelf,
				model: CONFIG_MODELS.hdPlus, // Use a model that supports audio inputs
			} as any

			const feedbacks = initFeedbacks(mockSelfWithAudio)
			
			// audio_input feedback only exists for certain models
			if (feedbacks['audio_input']) {
				const feedback = feedbacks['audio_input']
				
				const options = { setting: 'digital' }
				const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
				const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
				const result = feedback?.callback(event, context)
				
				expect(result).toBe(false)
			}
		})
	})

	describe('audio_channels feedback', () => {
		test('should return true for AAC codec matching', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['audio_channels']

			const options = { audioCodec: 'AAC', audioChannels: '2' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return true for PCM channel matching', () => {
			const mockSelfPCM = {
				...mockSelf,
				deckConfig: {
					...mockSelf.deckConfig,
					audioCodec: 'PCM',
				},
			} as any

			const feedbacks = initFeedbacks(mockSelfPCM)
			const feedback = feedbacks['audio_channels']

			const options = { audioCodec: 'PCM', audioChannels: '2' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when audio channels do not match', () => {
			const mockSelfPCM = {
				...mockSelf,
				deckConfig: {
					...mockSelf.deckConfig,
					audioCodec: 'PCM',
					audioInputChannels: 4,
				},
			} as any

			const feedbacks = initFeedbacks(mockSelfPCM)
			const feedback = feedbacks['audio_channels']

			const options = { audioCodec: 'PCM', audioChannels: '2' }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(false)
		})
	})

	describe('format_ready feedback', () => {
		test('should return true when format token exists', () => {
			const mockSelfReady = {
				...mockSelf,
				formatToken: 'some-token',
			} as any

			const feedbacks = initFeedbacks(mockSelfReady)
			const feedback = feedbacks['format_ready']

			const options = {}
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when format token is null', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['format_ready']

			const options = {}
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(false)
		})
	})

	describe('remote_status feedback', () => {
		test('should return true when remote status matches', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['remote_status']

			const options = { status: true }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(true)
		})

		test('should return false when remote status does not match', () => {
			const feedbacks = initFeedbacks(mockSelf)
			const feedback = feedbacks['remote_status']

			const options = { status: false }
			const event: CompanionFeedbackAdvancedEvent = { options, type: 'boolean', id: 'test', controlId: 'test', feedbackId: 'test' }
			const context: CompanionFeedbackContext = { parseVariablesInString: jest.fn(async (s) => s) }
			const result = feedback?.callback(event, context)

			expect(result).toBe(false)
		})
	})
})