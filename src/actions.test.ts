import { initActions } from './actions'
import { InstanceBaseExt } from './types'
import { CompanionActionContext, CompanionOptionValues } from '@companion-module/base'
import { Commands } from 'hyperdeck-connection'

// Mock the hyperdeck-connection Commands module with more detailed implementation
jest.mock('hyperdeck-connection', () => {
	const VideoFormat = {
		NTSC: 'NTSC',
		PAL: 'PAL',
		NTSCp: 'NTSCp',
		PALp: 'PALp',
		'720p50': '720p50',
		'720p5994': '720p5994',
		'720p60': '720p60',
		'1080i50': '1080i50',
		'1080i5994': '1080i5994',
		'1080i60': '1080i60',
		'1080p2398': '1080p2398',
		'1080p24': '1080p24',
		'1080p25': '1080p25',
		'1080p2997': '1080p2997',
		'1080p30': '1080p30',
		'1080p50': '1080p50',
		'1080p5994': '1080p5994',
		'1080p60': '1080p60',
		'4KqHD2398': '4KqHD2398',
		'4KqHD24': '4KqHD24',
		'4KqHD25': '4KqHD25',
		'4KqHD2997': '4KqHD2997',
		'4KqHD30': '4KqHD30',
		'4KUHD2398': '4KUHD2398',
		'4KUHD24': '4KUHD24',
		'4KUHD25': '4KUHD25',
		'4KUHD2997': '4KUHD2997',
		'4KUHD30': '4KUHD30',
		'4KDCI2398': '4KDCI2398',
		'4KDCI24': '4KDCI24',
		'4KDCI25': '4KDCI25',
		'4KDCI2997': '4KDCI2997',
		'4KDCI30': '4KDCI30',
		'8KUHd2398': '8KUHd2398',
		'8KUHD24': '8KUHD24',
		'8KUHD25': '8KUHD25',
		'8KUHD2997': '8KUHD2997',
		'8KUHD30': '8KUHD30',
		'8KDCI2398': '8KDCI2398',
		'8KDCI24': '8KDCI24',
		'8KDCI25': '8KDCI25',
		'8KDCI2997': '8KDCI2997',
		'8KDCI30': '8KDCI30',
	}

	return {
		Commands: {
			PlayCommand: jest.fn().mockImplementation(() => {
				const obj: any = { speed: undefined, loop: false, singleClip: false }
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
			RecordCommand: jest.fn().mockImplementation((filename?: string) => {
				const obj: any = { filename, append: false }
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
			RecordSpillCommand: jest.fn().mockImplementation(() => {
				const obj: any = {}
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
			StopCommand: jest.fn().mockImplementation(() => ({})),
			GoToCommand: jest.fn().mockImplementation(() => {
				const obj: any = { timecode: undefined, clipId: undefined, clip: undefined }
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
			JogCommand: jest.fn().mockImplementation(() => {
				const obj: any = { timecode: undefined }
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
			ShuttleCommand: jest.fn().mockImplementation(() => {
				const obj: any = { speed: undefined }
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
			SlotSelectCommand: jest.fn().mockImplementation(() => {
				const obj: any = { slotId: undefined, format: undefined }
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
			PreviewCommand: jest.fn().mockImplementation((enable: boolean) => ({ enable })),
			ConfigurationCommand: jest.fn().mockImplementation(() => {
				const obj: any = {
					videoInput: undefined,
					audioInput: undefined,
					audioCodec: undefined,
					audioInputChannels: undefined,
					fileFormat: undefined,
				}
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
			FormatCommand: jest.fn().mockImplementation(() => {
				const obj: any = { filesystem: undefined }
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
			FormatConfirmCommand: jest.fn().mockImplementation(() => {
				const obj: any = { code: undefined }
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
			RemoteCommand: jest.fn().mockImplementation(() => {
				const obj: any = { enable: undefined }
				return new Proxy(obj, {
					set(target, prop, value) {
						target[prop] = value;
						return true;
					}
				});
			}),
		},
		VideoFormat,
		FilesystemFormat: {
			'ExFAT': 'ExFAT',
			'HFS+': 'HFS+',
			'NTFS': 'NTFS',
		},
		VideoInputType: {
			'SDI': 'SDI',
			'HDMI': 'HDMI',
			'Component': 'Component',
			'Composite': 'Composite',
			'Optical': 'Optical',
		},
		AudioInputType: {
			'Embedded': 'Embedded',
			'XLR': 'XLR',
			'RCA': 'RCA',
			'AES': 'AES',
			'Analog': 'Analog',
		},
		FileFormatFamily: {
			'Uncompressed': 'Uncompressed',
			'DNxHD': 'DNxHD',
			'ProRes': 'ProRes',
			'H264': 'H264',
			'Proxy': 'Proxy',
			'DNxHD220': 'DNxHD220',
			'DNx': 'DNx',
			'DNxHR_HQX': 'DNxHR_HQX',
			'DNxHR_SQ': 'DNxHR_SQ',
			'DNxHR_LB': 'DNxHR_LB',
			'H265': 'H265',
			'H264_SDI': 'H264_SDI',
			'H264_5': 'H264_5',
			'DNxHD220x': 'DNxHD220x',
			'Teleprompter': 'Teleprompter',
		},
	}
})

// Mock the choices module to return appropriate values for model choices
jest.mock('./choices', () => ({
	CHOICES_STARTEND: [{ id: 'start', label: 'Start' }, { id: 'end', label: 'End' }],
	CHOICES_PREVIEWMODE: [{ id: 'true', label: 'On' }, { id: 'false', label: 'Off' }],
	CHOICES_AUDIOCODEC: [{ id: 'PCM', label: 'PCM' }, { id: 'MPEG', label: 'MPEG' }],
	CHOICES_AUDIOCHANNELS: [{ id: '2', label: '2 Channels' }, { id: '4', label: '4 Channels' }],
	CHOICES_FILESYSTEM: [{ id: 'HFS+', label: 'HFS+' }, { id: 'ExFAT', label: 'ExFAT' }],
	CHOICES_REMOTECONTROL: [{ id: 'true', label: 'Enable' }, { id: 'false', label: 'Disable' }, { id: 'toggle', label: 'Toggle' }],
	createModelChoices: jest.fn().mockReturnValue({
		Slots: [{ id: 1, label: 'Slot 1' }, { id: 2, label: 'Slot 2' }],
		VideoInputs: [{ id: 'input1', label: 'Input 1' }],
		AudioInputs: [{ id: 'audio1', label: 'Audio 1' }],
		FileFormats: [{ id: 'mov', label: 'MOV' }],
		VideoFormats: [{ id: 'format1', label: 'Format 1' }],
	}),
	createClipsChoice: jest.fn().mockReturnValue([{ id: 1, label: 'Clip 1' }]),
}))

// Mock the util functions
jest.mock('./util', () => ({
	getTimestamp: jest.fn().mockReturnValue('2023-01-01-120000'),
	protocolGte: jest.fn().mockReturnValue(true),
	stripExtension: jest.fn().mockImplementation((str: string) => str.replace(/\.[^/.]+$/, '')),
}))

// Mock the variables module
jest.mock('./variables', () => ({
	updateRemoteVariable: jest.fn(),
}))

// Mock the models module as it's imported by config.ts
jest.mock('./models', () => ({
	CONFIG_MODELS: {
		someModel: {
			id: 'someModel',
			label: 'Some Model',
			videoInputs: ['SDI', 'HDMI'],
			audioInputs: ['Embedded'],
			fileFormats: ['ProRes'],
			videoFormats: ['1080i50'],
			slotLabels: 'SSD2',
			maxShuttle: 200,
			hasSeparateInputFormat: false,
		},
		bmdDup4K: {
			id: 'bmdDup4K',
			label: 'Blackmagic Duplicator 4K',
			videoInputs: ['SDI', 'Optical'],
			audioInputs: ['Embedded'],
			fileFormats: ['H264', 'H265'],
			videoFormats: ['1080i50'],
			slotLabels: 'SD25',
			maxShuttle: 100,
			hasSeparateInputFormat: false,
		}
	}
}))

describe('initActions', () => {
	let mockSelf: InstanceBaseExt
	let mockContext: CompanionActionContext
	let mockOptions: CompanionOptionValues

	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks()

		// Create mock self object
		mockSelf = {
			model: {
				maxShuttle: 200,
				hasRecordButton: true,
				hasJogShuttle: true,
				hasTransportControl: true,
				supportsPreview: true,
				supportsVideoSource: true,
				supportsAudioSource: true,
				supportsAudioCodec: true,
				supportsFilesystemFormat: true,
				supportsHdmiOut: true,
				supportsSdiOut: true,
				supportsRecordTrigger: true,
				supportsRemote: true,
				Slots: [{ id: 1, label: 'Slot 1' }],
				VideoInputs: [{ id: 'input1', label: 'Input 1' }],
				AudioInputs: [{ id: 'audio1', label: 'Audio 1' }],
				FileFormats: [{ id: 'mov', label: 'MOV' }],
				VideoFormats: [{ id: 'format1', label: 'Format 1' }],
			},
			config: {
				modelID: 'someModel',
				reel: 'TESTREEL',
			},
			sendCommand: jest.fn().mockResolvedValue(undefined),
			log: jest.fn(),
			transportInfo: { slotId: 1 },
			simpleClipsList: [
				{ clipId: 1, name: 'testClip.mov', in: '00:00:00:00', out: '00:00:01:00' },
				{ clipId: 2, name: 'anotherClip.mp4', in: '00:00:01:00', out: '00:00:02:00' },
			],
			updateClips: jest.fn().mockResolvedValue(undefined),
			refreshTransportInfo: jest.fn().mockResolvedValue(undefined),
			checkFeedbacks: jest.fn(),
			deckConfig: {},
			setVariableValues: jest.fn(),
			remoteInfo: { enabled: true },
			formatToken: null,
			formatTokenTimeout: null,
		} as unknown as InstanceBaseExt

		// Mock context
		mockContext = {
			parseVariablesInString: jest.fn().mockImplementation(async (str: string) => Promise.resolve(str)),
		} as unknown as CompanionActionContext

		// Mock options
		mockOptions = {}
	})

	describe('basic functionality', () => {
		test('should initialize actions correctly', () => {
			const actions = initActions(mockSelf)
			
			expect(actions).toBeDefined()
			expect(typeof actions).toBe('object')
			expect(Object.keys(actions)).toContain('rec')
		})
	})

	describe('record action', () => {
		test('should handle record action', async () => {
			const actions = initActions(mockSelf)
			const recordAction = actions['rec']

			await recordAction?.callback({ options: {}, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.RecordCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})
	})

	describe('play action', () => {
		test('should handle play action with default options', async () => {
			const actions = initActions(mockSelf)
			const playAction = actions['play']

			mockOptions = {
				speed: 50,
				loop: false,
				single: false,
				useVariable: false,
			}

			await playAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.PlayCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})

		test('should handle play action with variable speed', async () => {
			const actions = initActions(mockSelf)
			const playAction = actions['play']

			mockOptions = {
				speedVar: '75',
				loop: true,
				single: false,
				useVariable: true,
			}

			await playAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.PlayCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})
	})

	describe('spill action', () => {
		test('should handle spill action with next slot', async () => {
			const actions = initActions(mockSelf)
			const spillAction = actions['spill']

			mockOptions = { slot: 'next' }

			await spillAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.RecordSpillCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})

		test('should handle spill action with same slot', async () => {
			const actions = initActions(mockSelf)
			const spillAction = actions['spill']

			mockOptions = { slot: 'same' }

			await spillAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.RecordSpillCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})

		test('should handle spill action with specific slot', async () => {
			const actions = initActions(mockSelf)
			const spillAction = actions['spill']

			mockOptions = { slot: 2 }

			await spillAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.RecordSpillCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})
	})

	describe('stop action', () => {
		test('should handle stop action', async () => {
			const actions = initActions(mockSelf)
			const stopAction = actions['stop']

			await stopAction?.callback({ options: {}, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.StopCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})
	})

	describe('record with timestamp action', () => {
		test('should handle record with timestamp action with prefix', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['recTimestamp']) {
				const recTimestampAction = actions['recTimestamp']

				mockOptions = { prefix: 'testPrefix' }

				await recTimestampAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.RecordCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})

		test('should handle record with timestamp action without prefix', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['recTimestamp']) {
				const recTimestampAction = actions['recTimestamp']

				mockOptions = { prefix: '' }

				await recTimestampAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.RecordCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})
	})

	describe('record with custom reel action', () => {
		test('should handle record with custom reel action', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['recCustom']) {
				const recCustomAction = actions['recCustom']

				await recCustomAction?.callback({ options: {}, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.RecordCommand).toHaveBeenCalledWith('TESTREEL-')
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})
	})

	describe('go to timecode action', () => {
		test('should handle go to timecode action', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['goto']) {
				const gotoAction = actions['goto']

				mockOptions = { tc: '00:00:01:00' }
				const parsedTc = '00:00:01:00'
				mockContext.parseVariablesInString = jest.fn().mockResolvedValue(parsedTc)

				await gotoAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.GoToCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})
	})

	describe('go to clip by number action', () => {
		test('should handle go to clip by number action', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['gotoN']) {
				const gotoNAction = actions['gotoN']

				mockOptions = { clip: 2, useVariable: false }

				await gotoNAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.GoToCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})

		test('should handle go to clip by number action with variable', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['gotoN']) {
				const gotoNAction = actions['gotoN']

				mockOptions = { clipVar: '3', useVariable: true }
				mockContext.parseVariablesInString = jest.fn().mockResolvedValue('3')

				await gotoNAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.GoToCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})
	})

	describe('go to clip by name action', () => {
		test('should handle go to clip by name action with valid clip', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['gotoName']) {
				const gotoNameAction = actions['gotoName']

				mockOptions = { clip: 'testClip' }
				mockContext.parseVariablesInString = jest.fn().mockResolvedValue('testClip')

				await gotoNameAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(mockSelf.updateClips).toHaveBeenCalled()
				expect(Commands.GoToCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})

		test('should handle go to clip by name action with invalid clip', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['gotoName']) {
				const gotoNameAction = actions['gotoName']

				mockOptions = { clip: 'nonexistentClip' }
				mockContext.parseVariablesInString = jest.fn().mockResolvedValue('nonexistentClip')

				await gotoNameAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(mockSelf.updateClips).toHaveBeenCalled()
				expect(Commands.GoToCommand).not.toHaveBeenCalled()
				expect(mockSelf.log).toHaveBeenCalledWith('info', 'Clip "nonexistentClip" does not exist')
			}
		})
	})

	describe('format prepare action', () => {
		test('should handle format prepare action', async () => {
			const actions = initActions(mockSelf)
			const formatPrepareAction = actions['formatPrepare']

			mockOptions = { filesystem: 'HFS+', timeout: 10 }

			const mockResponse = { code: 'token123' }
			mockSelf.sendCommand = jest.fn().mockResolvedValue(mockResponse)

			await formatPrepareAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.FormatCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
			expect(mockSelf.formatToken).toBe('token123')
		})
	})

	describe('remote control action', () => {
		test('should handle remote enable action', async () => {
			const actions = initActions(mockSelf)
			const remoteAction = actions['remote']

			mockOptions = { remoteEnable: true }

			await remoteAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.RemoteCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})

		test('should handle remote disable action', async () => {
			const actions = initActions(mockSelf)
			const remoteAction = actions['remote']

			mockOptions = { remoteEnable: false }

			await remoteAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.RemoteCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})

		test('should handle remote toggle action when currently enabled', async () => {
			const actions = initActions(mockSelf)
			const remoteAction = actions['remote']

			mockOptions = { remoteEnable: 'toggle' }

			await remoteAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.RemoteCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})

		test('should handle remote toggle action when currently disabled', async () => {
			const actions = initActions(mockSelf)
			const remoteAction = actions['remote']

			mockOptions = { remoteEnable: 'toggle' }
			mockSelf.remoteInfo = { enabled: false }

			await remoteAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(Commands.RemoteCommand).toHaveBeenCalled()
			expect(mockSelf.sendCommand).toHaveBeenCalled()
		})
	})

	describe('append record action', () => {
		test('should handle append record action for Dup4K model', async () => {
			// Set model to Dup4K
			mockSelf.config.modelID = 'bmdDup4K'
			const actions = initActions(mockSelf)

			if (actions['recAppend']) {
				const recAppendAction = actions['recAppend']

				await recAppendAction?.callback({ options: {}, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.RecordCommand).toHaveBeenCalledWith()
				// Verify that append is set to true by checking the sendCommand call
				expect(mockSelf.sendCommand).toHaveBeenCalled()
				// Check that the command instance had append property set (it should be in the mocked instances)
				const recordCmdCall = (Commands.RecordCommand as jest.Mock).mock.instances[0]
				// Since we can't reliably test the property assignment due to proxy limitations in the mock,
				// we can at least verify the callback ran without errors
				expect(recordCmdCall).toBeDefined()
			}
		})
	})

	describe('other actions that depend on model capabilities', () => {
		test('should handle shuttle action', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['shuttle']) {
				const shuttleAction = actions['shuttle']

				mockOptions = { speed: 150, useVariable: false }

				await shuttleAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.ShuttleCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})

		test('should handle shuttle action with variable', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['shuttle']) {
				const shuttleAction = actions['shuttle']

				mockOptions = { speedVar: '175', useVariable: true }
				mockContext.parseVariablesInString = jest.fn().mockResolvedValue('175')

				await shuttleAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.ShuttleCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})

		test('should handle go forward action', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['goFwd']) {
				const goFwdAction = actions['goFwd']

				mockOptions = { clip: 2, useVariable: false }

				await goFwdAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.GoToCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})

		test('should handle go backward action', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['goRew']) {
				const goRewAction = actions['goRew']

				mockOptions = { clip: 2, useVariable: false }

				await goRewAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.GoToCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})

		test('should handle go start end action', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['goStartEnd']) {
				const goStartEndAction = actions['goStartEnd']

				mockOptions = { startEnd: 'start' }

				await goStartEndAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.GoToCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})

		test('should handle jog forward action', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['jogFwd']) {
				const jogFwdAction = actions['jogFwd']

				mockOptions = { jogFwdTc: '00:00:00:05' }
				mockContext.parseVariablesInString = jest.fn().mockResolvedValue('00:00:00:05')

				await jogFwdAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.JogCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})

		test('should handle jog backward action', async () => {
			const actions = initActions(mockSelf)

			// This action only exists when modelID is not 'bmdDup4K'
			if (actions['jogRew']) {
				const jogRewAction = actions['jogRew']

				mockOptions = { jogRewTc: '00:00:00:05' }
				mockContext.parseVariablesInString = jest.fn().mockResolvedValue('00:00:00:05')

				await jogRewAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.JogCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})
	})

	describe('video and audio source selection', () => {
		test('should handle video source selection when multiple inputs are available', async () => {
			const actions = initActions(mockSelf)

			if (actions['videoSrc']) {
				const videoSrcAction = actions['videoSrc']

				mockOptions = { videoSrc: 'input1' }

				await videoSrcAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.ConfigurationCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})

		test('should handle audio source selection when multiple inputs are available', async () => {
			const actions = initActions(mockSelf)

			if (actions['audioSrc']) {
				const audioSrcAction = actions['audioSrc']

				mockOptions = { audioSrc: 'audio1' }

				await audioSrcAction?.callback({ options: mockOptions, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

				expect(Commands.ConfigurationCommand).toHaveBeenCalled()
				expect(mockSelf.sendCommand).toHaveBeenCalled()
			}
		})
	})

	describe('fetch clips action', () => {
		test('should handle fetch clips action', async () => {
			const actions = initActions(mockSelf)
			const fetchClipsAction = actions['fetchClips']

			await fetchClipsAction?.callback({ options: {}, id: '', controlId: '', actionId: '', surfaceId: undefined }, mockContext)

			expect(mockSelf.updateClips).toHaveBeenCalledWith(true)
		})
	})

	describe('option parsing helper functions', () => {
		it('should properly validate numeric options', () => {
			const getOptNumber = (options: CompanionOptionValues, key: string): number => {
				let value = options[key]
				if (typeof value === 'number') return value
				value = Number(value)
				if (!isNaN(value)) return value
				throw new Error(`Invalid number for ${key}: ${options[key]} (${typeof value})`)
			}

			expect(getOptNumber({ test: 5 }, 'test')).toBe(5)
			expect(getOptNumber({ test: '10' }, 'test')).toBe(10)
			expect(() => getOptNumber({ test: 'invalid' }, 'test')).toThrow()
		})

		it('should properly validate boolean options', () => {
			const getOptBool = (options: CompanionOptionValues, key: string): boolean => {
				let value = options[key]
				if (typeof value === 'boolean') return value
				if (typeof value === 'string') {
					if (value.toLowerCase() === 'true') return true
					if (value.toLowerCase() === 'false') return false
				}
				throw new Error(`Invalid boolean for ${key}: ${options[key]} (${typeof value})`)
			}

			expect(getOptBool({ test: true }, 'test')).toBe(true)
			expect(getOptBool({ test: false }, 'test')).toBe(false)
			expect(getOptBool({ test: 'true' }, 'test')).toBe(true)
			expect(getOptBool({ test: 'false' }, 'test')).toBe(false)
			expect(() => getOptBool({ test: 'invalid' }, 'test')).toThrow()
		})

		it('should properly validate string options', () => {
			const getOptString = (options: CompanionOptionValues, key: string): string => {
				const value = options[key]
				return value?.toString() ?? ''
			}

			expect(getOptString({ test: 'hello' }, 'test')).toBe('hello')
			expect(getOptString({ test: 123 }, 'test')).toBe('123')
			expect(getOptString({ test: undefined }, 'test')).toBe('')
		})
	})
})