import {
	CompanionActionDefinitions,
	CompanionOptionValues,
	CompanionVariableValues,
	DropdownChoice,
	Regex,
} from '@companion-module/base'
import { Commands, FilesystemFormat, VideoFormat } from 'hyperdeck-connection'
import {
	CHOICES_STARTEND,
	CHOICES_PREVIEWMODE,
	CHOICES_AUDIOCODEC,
	CHOICES_AUDIOCHANNELS,
	CHOICES_FILESYSTEM,
	CHOICES_REMOTECONTROL,
	CHOICES_SLATE_SHOTTYPE,
	CHOICES_SLATE_TAKESCENARIO,
	CHOICES_SLATE_ENVIRONMENT,
	CHOICES_SLATE_DAYNIGHT,
	createModelChoices,
	createClipsChoice,
} from './choices.js'
import { getTimestamp, protocolGte, stripExtension } from './util.js'
import { updateRemoteVariable } from './variables.js'
import { InstanceBaseExt } from './types.js'

export function initActions(self: InstanceBaseExt) {
	const modelChoices = createModelChoices(self.model)
	const clipChoices = createClipsChoice(self)

	const actions: CompanionActionDefinitions = {}

	const maxShuttle = self.model?.maxShuttle ?? 0

	const getOptNumber = (options: CompanionOptionValues, key: string): number => {
		let value = options[key]
		if (typeof value === 'number') return value
		value = Number(value)
		if (!isNaN(value)) return value
		throw new Error(`Invalid number for ${key}: ${options[key]} (${typeof value})`)
	}
	const getOptString = (options: CompanionOptionValues, key: string): string => {
		const value = options[key]
		return value?.toString() ?? ''
	}
	const getOptBool = (options: CompanionOptionValues, key: string): boolean => {
		let value = options[key]
		if (typeof value === 'boolean') return value
		if (typeof value === 'string') {
			if (value.toLowerCase() === 'true')  return true
			if (value.toLowerCase() === 'false') return false
		}
		throw new Error(`Invalid boolean for ${key}: ${options[key]} (${typeof value})`)
	}
	const getNextChoiceId = (choices: DropdownChoice[], currentId: string): string => {
		const currentIndex = choices.findIndex(choice => choice.id === currentId);
		if (currentIndex === -1) {
			throw new Error(`Invalid ID value of ${currentId}`)
		}
		const nextIndex = (currentIndex + 1) % choices.length;
		return choices[nextIndex].id.toString();
	}
	const separateNumberAndText = (input: string): { numberPart: number | null, textPart: string } => {
		const match = input.match(/^(\d+)(.*)/);
		if (match) {
			const numberPart = parseInt(match[1]);
			const textPart = match[2];
			return { numberPart, textPart };
		} else {
			return { numberPart: null, textPart: input };
		}
	}

	if (self.config.modelID != 'bmdDup4K') {
		actions['play'] = {
			name: 'Play',
			options: [
				{
					type: 'number',
					label: 'Speed %',
					id: 'speed',
					default: 100,
					min: 0 - maxShuttle,
					max: maxShuttle,
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
			callback: async ({ options }) => {
				const cmd = new Commands.PlayCommand(
					getOptString(options, 'speed'),
					getOptBool(options, 'loop'),
					getOptBool(options, 'single')
				)
				await self.sendCommand(cmd)
			},
		}
	}

	actions['rec'] = {
		name: 'Record',
		options: [],
		callback: async () => {
			const cmd = new Commands.RecordCommand()
			await self.sendCommand(cmd)
		},
	}

	actions['spill'] = {
		name: 'Spill',
		description: 'Spill current recording to specified slot',
		options: [
			{
				type: 'dropdown',
				label: 'Slot',
				id: 'slot',
				default: 'next',
				choices: [
					{
						id: 'next',
						label: 'Next',
					},
					{
						id: 'same',
						label: 'Same Slot',
					},
					...modelChoices.Slots,
				],
			},
		],
		callback: async ({ options }) => {
			const cmd = new Commands.RecordSpillCommand()
			if (!options.slot || options.slot === 'next') {
				// No parameter
			} else if (options.slot === 'same') {
				// Split and continue on the same slot
				if (self.transportInfo.slotId) cmd.slot = self.transportInfo.slotId
			} else {
				cmd.slot = getOptNumber(options, 'slot')
			}

			await self.sendCommand(cmd)
		},
	}

	if (self.config.modelID == 'bmdDup4K') {
		actions['recAppend'] = {
			name: 'Append Record',
			options: [],
			callback: async () => {
				const cmd = new Commands.RecordCommand()
				cmd.append = true
				await self.sendCommand(cmd)
			},
		}
	}

	if (self.config.modelID != 'bmdDup4K') {
		actions['recName'] = {
			name: 'Record (with name)',
			options: [
				{
					type: 'textinput',
					label: 'Filename (without extension)',
					id: 'name',
					default: '',
					regex: Regex.SOMETHING,
					useVariables: true,
				},
			],
			callback: async ({ options }) => {
				const name = await self.parseVariablesInString(options.name + '')
				const cmd = new Commands.RecordCommand(name)
				await self.sendCommand(cmd)
			},
		}
		actions['recTimestamp'] = {
			name: 'Record (with name and current date/time)',
			options: [
				{
					type: 'textinput',
					label: 'Filename (optional)',
					id: 'prefix',
					default: '',
					useVariables: true,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.RecordCommand()
				const timeStamp = getTimestamp()
				if (options.prefix) {
					const name = await self.parseVariablesInString(options.prefix + '')
					cmd.filename = name + '-' + timeStamp + '-'
				} else {
					cmd.filename = timeStamp + '-'
				}
				await self.sendCommand(cmd)
			},
		}
		actions['recCustom'] = {
			name: 'Record (with custom reel)',
			options: [
				{
					type: 'static-text',
					id: 'info',
					label: "Set 'Reel' in instance config",
					value: '',
				},
			],
			callback: async () => {
				const cmd = new Commands.RecordCommand(self.config.reel + '-')
				await self.sendCommand(cmd)
			},
		}
	}

	actions['stop'] = {
		name: 'Stop',
		options: [],
		callback: async () => {
			const cmd = new Commands.StopCommand()
			await self.sendCommand(cmd)
		},
	}

	if (self.config.modelID != 'bmdDup4K') {
		actions['goto'] = {
			name: 'Goto (TC)',
			options: [
				{
					type: 'textinput',
					label: 'Timecode hh:mm:ss:ff',
					id: 'tc',
					default: '00:00:01:00',
					regex: Regex.TIMECODE,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.GoToCommand()
				cmd.timecode = getOptString(options, 'tc')
				await self.sendCommand(cmd)
			},
		}
		actions['gotoN'] = {
			name: 'Goto Clip (n)',
			options: [
				{
					type: 'number',
					label: 'Clip Number',
					id: 'clip',
					default: 1,
					min: 1,
					max: 999,
					range: false,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.GoToCommand()
				cmd.clipId = getOptNumber(options, 'clip')
				await self.sendCommand(cmd)
			},
		}
		actions['gotoName'] = {
			name: 'Goto Clip (name)',
			options: [
				{
					type: 'dropdown',
					label: 'Clip Name - select from list or enter text (variables supported)',
					id: 'clip',
					default: '',
					choices: clipChoices,
					minChoicesForSearch: 0,
					allowCustom: true,
				},
			],
			callback: async ({ options }) => {
				await self.updateClips()

				const parsedRaw = await self.parseVariablesInString(options.clip + '')
				const parsed = stripExtension(parsedRaw.trim())

				const clip = self.clipsList.find((clip) => stripExtension(clip.name) === parsed)
				if (!clip) {
					self.log('info', `Clip "${parsedRaw}" does not exist`)
				} else {
					const cmd = new Commands.GoToCommand()
					cmd.clipId = clip.clipId
					await self.sendCommand(cmd)
				}
			},
		}
		actions['goFwd'] = {
			name: 'Go forward (n) clips',
			options: [
				{
					type: 'number',
					label: 'Number of clips',
					id: 'clip',
					default: 1,
					min: 1,
					max: 999,
					range: false,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.GoToCommand()
				cmd.clipId = `+${options.clip}`
				await self.sendCommand(cmd)
			},
		}
		actions['goRew'] = {
			name: 'Go backward (n) clips',
			options: [
				{
					type: 'number',
					label: 'Number of clips',
					id: 'clip',
					default: 1,
					min: 1,
					max: 999,
					range: false,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.GoToCommand()
				cmd.clipId = `-${options.clip}`
				await self.sendCommand(cmd)
			},
		}
		actions['goStartEnd'] = {
			name: 'Go to (start|end) of clip',
			options: [
				{
					type: 'dropdown',
					label: 'Go to',
					id: 'startEnd',
					default: 'start',
					choices: CHOICES_STARTEND,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.GoToCommand()
				cmd.clip = options.startEnd as any
				await self.sendCommand(cmd)
			},
		}
		actions['jogFwd'] = {
			name: 'Jog forward (TC) duration',
			options: [
				{
					type: 'textinput',
					label: 'Timecode hh:mm:ss:ff',
					id: 'jogFwdTc',
					default: '00:00:00:01',
					regex: Regex.TIMECODE,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.JogCommand()
				cmd.timecode = `+${options.jogFwdTc}`
				await self.sendCommand(cmd)
			},
		}
		actions['jogRew'] = {
			name: 'Jog backward (TC) duration',
			options: [
				{
					type: 'textinput',
					label: 'Timecode hh:mm:ss:ff',
					id: 'jogRewTc',
					default: '00:00:00:01',
					regex: Regex.TIMECODE,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.JogCommand()
				cmd.timecode = `-${options.jogRewTc}`
				await self.sendCommand(cmd)
			},
		}
		actions['shuttle'] = {
			name: 'Shuttle with speed',
			options: [
				{
					type: 'number',
					label: 'Speed %',
					id: 'speed',
					default: 100,
					min: 0 - maxShuttle,
					max: maxShuttle,
					range: true,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.ShuttleCommand(getOptNumber(options, 'speed'))
				await self.sendCommand(cmd)
			},
		}
		actions['select'] = {
			name: 'Select slot or format',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'slot',
					default: 1,
					choices: [
						{
							id: 'unchanged',
							label: 'Unchanged',
						},
						...modelChoices.Slots,
					],
				},
				{
					type: 'dropdown',
					label: 'Format',
					id: 'format',
					default: 'unchanged',
					choices: [
						// nocommit - upgrade script
						{
							id: 'unchanged',
							label: 'Unchanged',
						},
						...modelChoices.VideoFormats,
					],
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.SlotSelectCommand()
				if (options.slot && options.slot !== 'unchanged') cmd.slotId = getOptNumber(options, 'slot')
				if (options.format && options.format !== 'unchanged') cmd.format = options.format as VideoFormat
				await self.sendCommand(cmd)

				// select will update internal cliplist so we should fetch those
				await self.refreshTransportInfo()
				await self.updateClips(true)

				self.checkFeedbacks()
			},
		}
		actions['preview'] = {
			name: 'Preview',
			options: [
				{
					type: 'dropdown',
					label: 'Set preview/output mode',
					id: 'enable',
					default: 'true',
					choices: CHOICES_PREVIEWMODE,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.PreviewCommand(getOptBool(options, 'enable'))
				await self.sendCommand(cmd)
			},
		}
	} // endif (!= bmdDup4K)

	if (modelChoices.VideoInputs.length > 1) {
		actions['videoSrc'] = {
			name: 'Video source',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'videoSrc',
					default: modelChoices.VideoInputs[0]?.id,
					choices: modelChoices.VideoInputs,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.ConfigurationCommand()
				cmd.videoInput = getOptString(options, 'videoSrc')
				await self.sendCommand(cmd)
			},
		}
	}

	if (modelChoices.AudioInputs.length > 1) {
		actions['audioSrc'] = {
			name: 'Audio source',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'audioSrc',
					default: modelChoices.AudioInputs[0]?.id,
					choices: modelChoices.AudioInputs,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.ConfigurationCommand()
				cmd.audioInput = getOptString(options, 'audioSrc')
				await self.sendCommand(cmd)
			},
		}
	}

	if (protocolGte(self.protocolVersion, '1.11')) {
		actions['audioChannels'] = {
			name: 'Audio channels',
			options: [
				{
					type: 'dropdown',
					label: 'Codec',
					id: 'audioCodec',
					default: CHOICES_AUDIOCODEC[0].id,
					choices: CHOICES_AUDIOCODEC,
				},
				{
					type: 'dropdown',
					label: 'Channels',
					id: 'audioChannels',
					default: '2',
					choices: CHOICES_AUDIOCHANNELS,
					isVisible: (options) => options.audioCodec === 'PCM',
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.ConfigurationCommand()
				cmd.audioCodec = getOptString(options, 'audioCodec') as any // TODO
				cmd.audioInputChannels = 2
				if (options.audioCodec == 'PCM') {
					let channels = 2
					if (options.audioChannels == 'cycle') {
						channels =
							self.deckConfig.audioInputChannels == 16 || typeof self.deckConfig.audioInputChannels !== 'number'
								? 2
								: self.deckConfig.audioInputChannels * 2
					} else {
						channels = getOptNumber(options, 'audioChannels')
					}
					cmd.audioInputChannels = channels
				}
				await self.sendCommand(cmd)
			},
		}
	
		// Slate clip actions
		
		actions['slateClipSet'] = {
			name: 'Slate Clip - Set metadata',
			options: [
				{
					type: 'checkbox',
					label: 'Set Reel',
					id: 'reelSet',
					default: false,
				},
				{
					type: 'number',
					label: 'Reel',
					tooltip: 'Number between 1-999',
					id: 'reel',
					min: 1,
					max: 999,
					default: 1,
					isVisible: (options) => options.reelSet === true,
				},
				{
					type: 'textinput',
					label: 'Scene ID',
					id: 'sceneId',
					tooltip: 'Should be a number, optionally with an appended letter',
					default: '',
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Shot Type',
					id: 'shotType',
					tooltip: '',
					choices: [
						{ id: 'unchanged', label: '-unchanged-' },
						{ id: 'none', label: 'None' },
						...CHOICES_SLATE_SHOTTYPE
					],
					default: 'unchanged',
				},
				{
					type: 'checkbox',
					label: 'Set Take',
					id: 'takeSet',
					default: false,
				},
				{
					type: 'number',
					label: 'Take',
					tooltip: 'Number between 1-99',
					id: 'take',
					min: 1,
					max: 99,
					default: 1,
					isVisible: (options) => options.takeSet === true,
				},
				{
					type: 'dropdown',
					label: 'Take Scenario',
					id: 'takeScenario',
					tooltip: '',
					choices: [
						{ id: 'unchanged', label: '-unchanged-' },
						{ id: 'none', label: 'None' },
						...CHOICES_SLATE_TAKESCENARIO
					],
					default: 'unchanged',
				},
				{
					type: 'dropdown',
					label: 'Environment',
					id: 'environment',
					tooltip: '',
					choices: [
						{ id: 'unchanged', label: '-unchanged-' },
						{ id: 'toggle', label: '-toggle-' },
						...CHOICES_SLATE_ENVIRONMENT
					],
					default: 'unchanged',
				},
				{
					type: 'dropdown',
					label: 'Day/Night',
					id: 'dayNight',
					tooltip: '',
					choices: [
						{ id: 'unchanged', label: '-unchanged-' },
						{ id: 'toggle', label: '-toggle-' },
						...CHOICES_SLATE_DAYNIGHT
					],
					default: 'unchanged',
				},
			],
			callback: async ({ options }) => {
				console.log(`options: ${JSON.stringify(options)}`)
				const sceneId = await self.parseVariablesInString(options.sceneId + '')
				const cmd = new Commands.SlateClipsCommand()
				if (options.reelSet === true) cmd.reel = Number(options.reel)
				if (sceneId != '') cmd.sceneId = sceneId
				if (options.shotType != 'unchanged') cmd.shotType = getOptString(options, 'shotType')
				if (options.takeSet === true) cmd.take = Number(options.take)
				if (options.takeScenario != 'unchanged') cmd.takeScenario = getOptString(options, 'takeScenario')
				if (options.environment != 'unchanged') {
					if (options.environment != 'toggle') {
						cmd.environment = getOptString(options, 'environment')
					} else {
						if (self.slate.environment != null) {
							cmd.environment = getNextChoiceId(CHOICES_SLATE_ENVIRONMENT, self.slate.environment)
						}
					}
				}
				if (options.dayNight != 'unchanged') {
					if (options.dayNight != 'toggle') {
						cmd.dayNight = getOptString(options, 'dayNight')
					} else {
						if (self.slate.dayNight != null) {
							cmd.dayNight = getNextChoiceId(CHOICES_SLATE_DAYNIGHT, self.slate.dayNight)
						}
					}
				}
				await self.sendCommand(cmd)
			}
		}
		actions['slateClipSetVariables'] = {
			name: 'Slate Clip - Set metadata with custom variables',
			description: 'Allows variables for all data, but will fail if invalid options are set',
			options: [
				{
					type: 'textinput',
					label: 'Reel',
					tooltip: 'Must be number between 1-999',
					id: 'reel',
					default: '',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Scene ID',
					id: 'sceneId',
					tooltip: 'Should be a number, optionally with an appended letter',
					default: '',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Shot Type',
					id: 'shotType',
					tooltip: 'Must be one of WS/MS/MCU/PU/CU/BCU/ECU/none',
					default: '',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Take',
					tooltip: 'Must be number between 1-99',
					id: 'take',
					default: '',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Take Scenario',
					id: 'takeScenario',
					tooltip: 'Must be one of PU/VFX/SER/none',
					default: '',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Environment',
					id: 'environment',
					tooltip: `Must be one of 'interior', 'exterior'`,
					default: '',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'Day/Night',
					id: 'dayNight',
					tooltip: `Must be one of 'day', 'night'`,
					default: '',
					useVariables: true,
				},
			],
			callback: async ({ options }) => {
				console.log(`options: ${JSON.stringify(options)}`)
				const reel = await self.parseVariablesInString(options.reel + '')
				const sceneId = await self.parseVariablesInString(options.sceneId + '')
				const shotType = await self.parseVariablesInString(options.shotType + '')
				const take = await self.parseVariablesInString(options.take + '')
				const takeScenario = await self.parseVariablesInString(options.takeScenario + '')
				const environment = await self.parseVariablesInString(options.environment + '')
				const dayNight = await self.parseVariablesInString(options.dayNight + '')
				const cmd = new Commands.SlateClipsCommand()
				try {
					if (reel != '') cmd.reel = Number(reel)
					if (sceneId != '') cmd.sceneId = sceneId
					if (shotType != '') cmd.shotType = shotType
					if (take != '') cmd.take = Number(take)
					if (takeScenario != '') cmd.takeScenario = takeScenario
					if (environment != '') cmd.environment = environment
					if (dayNight != '') cmd.dayNight = dayNight
				} catch (e) {
					self.log('error', `Invalid variable: ${e}`)
				}
				
				await self.sendCommand(cmd)
			}
		}
		actions['slateClipNumbers'] = {
			name: 'Slate Clip - Reel/Scene/Take',
			options: [
				{
					type: 'dropdown',
					label: 'Reel',
					id: 'reelOption',
					choices: [
						{ id: 'unchanged', label: '-unchanged-' },
						{ id: 'inc', label: 'Increment' },
						{ id: 'dec', label: 'Decrement' },
						{ id: 'set', label: 'Set' },
					],
					default: 'unchanged',
				},
				{
					type: 'number',
					label: 'Set Reel',
					id: 'reelSet',
					min: 1,
					max: 999,
					default: 1,
					isVisible: (options) => options.reelOption === 'set',
				},
				{
					type: 'dropdown',
					label: 'Scene',
					id: 'sceneOption',
					choices: [
						{ id: 'unchanged', label: '-unchanged-' },
						{ id: 'inc', label: 'Increment' },
						{ id: 'dec', label: 'Decrement' },
						{ id: 'set', label: 'Set' },
					],
					default: 'unchanged',
				},
				{
					type: 'textinput',
					label: 'Set Scene',
					id: 'sceneSet',
					isVisible: (options) => options.sceneOption === 'set',
				},
				{
					type: 'dropdown',
					label: 'Take',
					id: 'takeOption',
					choices: [
						{ id: 'unchanged', label: '-unchanged-' },
						{ id: 'inc', label: 'Increment' },
						{ id: 'dec', label: 'Decrement' },
						{ id: 'set', label: 'Set' },
					],
					default: 'unchanged',
				},
				{
					type: 'number',
					label: 'Set Take',
					id: 'takeSet',
					min: 1,
					max: 99,
					default: 1,
					isVisible: (options) => options.takeOption === 'set',
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.SlateClipsCommand()
				self.log('debug', `Current reel: ${self.slate.reel}`)
				switch (options.reelOption) {
					case "set":
						cmd.reel = Number(options.reelSet)
						break
					case "inc":
						if (self.slate.reel) cmd.reel = Math.min(self.slate.reel + 1, 999)
						break
					case "dec":
						if (self.slate.reel) cmd.reel = Math.max(self.slate.reel - 1, 1)
						break
					default:
						break
				}
				switch (options.sceneOption) {
					case "set":
						cmd.sceneId = getOptString(options, 'sceneSet')
						break
					case "inc":
						if (self.slate.sceneId) {
							const split = separateNumberAndText(self.slate.sceneId)
							if (split.numberPart != null)	cmd.sceneId = (split.numberPart + 1).toString() + split.textPart
						}
						break
					case "dec":
						if (self.slate.sceneId) {
							const split = separateNumberAndText(self.slate.sceneId)
							if (split.numberPart != null)	cmd.sceneId = (split.numberPart - 1).toString() + split.textPart
					}
					break
					default:
						break
				}
				switch (options.takeOption) {
					case "set":
						cmd.take = Number(options.takeSet)
						break
					case "inc":
						if (self.slate.take) cmd.take = Math.min(self.slate.take + 1, 99)
						break
					case "dec":
						if (self.slate.take) cmd.take = Math.max(self.slate.take - 1, 1)
						break
					default:
						break
				}
				await self.sendCommand(cmd)
			},
		}
	}

	if (modelChoices.FileFormats.length > 1) {
		actions['fileFormat'] = {
			name: 'File format',
			options: [
				{
					type: 'dropdown',
					label: 'Format',
					id: 'fileFormat',
					default: modelChoices.FileFormats[0]?.id,
					choices: modelChoices.FileFormats,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.ConfigurationCommand()
				cmd.fileFormat = getOptString(options, 'fileFormat')
				await self.sendCommand(cmd)
			},
		}
	}

	actions['fetchClips'] = {
		name: 'Fetch Clips',
		options: [],
		callback: async () => {
			await self.updateClips(true)
		},
	}

	/**
				* Not currently implemented
				*
			if (self.config.modelID == 'hdExtreme8K') {
				actions['dynamicRange'] = {
					name: 'Set playback dyanmic range',
					options: [
						{
							type: 'dropdown',
							label: 'Dynamic Range',
							id: 'dynamicRange',
							default: 'auto',
							choices: CHOICES_DYNAMICRANGE
						}
					],
                    callback: async ({options}) => {
                        const cmd = new Commands.ConfigurationCommand()
                        cmd.dynamicRange = action.options.dynamicRange
                        await self.sendCommand(cmd)
                    },
				};
			}
			*/

	actions['formatPrepare'] = {
		name: 'Format drive/card (prepare)',
		options: [
			{
				type: 'dropdown',
				label: 'Filesystem',
				id: 'filesystem',
				default: 'HFS+',
				choices: CHOICES_FILESYSTEM,
			},
			{
				type: 'number',
				label: 'Confirmation timeout (sec)',
				id: 'timeout',
				default: 10,
				min: 0,
				max: 600,
			},
		],
		callback: async ({ options }) => {
			const cmd = new Commands.FormatCommand()
			cmd.filesystem = getOptString(options, 'filesystem') as FilesystemFormat
			const response = await self.sendCommand(cmd)

			if (response && response.code) {
				self.log('debug', 'Format token: ' + response.code)
				self.formatToken = response.code
				self.checkFeedbacks('format_ready')
			}

			if (self.formatTokenTimeout) clearTimeout(self.formatTokenTimeout)

			self.formatTokenTimeout = setTimeout(
				() => {
					self.formatToken = null
					self.checkFeedbacks('format_ready')
				},
				getOptNumber(options, 'timeout') * 1000
			)
		},
	}

	actions['formatConfirm'] = {
		name: 'Format drive/card (confirm)',
		options: [],
		callback: async () => {
			if (self.formatToken) {
				if (self.formatTokenTimeout) {
					clearTimeout(self.formatTokenTimeout)
					self.formatTokenTimeout = null
				}

				const cmd = new Commands.FormatConfirmCommand()
				cmd.code = self.formatToken

				self.formatToken = null
				self.checkFeedbacks('format_ready')

				await self.sendCommand(cmd)
			}
		},
	}

	actions['remote'] = {
		name: 'Remote Control (enable/disable)',
		options: [
			{
				type: 'dropdown',
				label: 'Enable/Disable',
				id: 'remoteEnable',
				default: 'toggle',
				choices: CHOICES_REMOTECONTROL,
			},
		],
		callback: async ({ options }) => {
			let setRemote = true
			if (options.remoteEnable == 'toggle') {
				setRemote = !self.remoteInfo?.enabled
			} else {
				setRemote = getOptBool(options, 'remoteEnable')
			}

			const cmd = new Commands.RemoteCommand()
			cmd.enable = setRemote

			await self.sendCommand(cmd)

			const newVariables: CompanionVariableValues = {}
			updateRemoteVariable(self, newVariables)
			self.setVariableValues(newVariables)
			self.checkFeedbacks('remote_status')
		},
	}

	return actions
}
	