const { Regex } = require('@companion-module/base')
const { Commands } = require('hyperdeck-connection')
const {
	CHOICES_STARTEND,
	CHOICES_PREVIEWMODE,
	CHOICES_AUDIOCODEC,
	CHOICES_AUDIOCHANNELS,
	CHOICES_FILESYSTEM,
	CHOICES_REMOTECONTROL,
} = require('./choices')
const { getTimestamp } = require('./util')
const { updateRemoteVariable } = require('./variables')

exports.initActions = function () {
	const actions = {}
	const sendCommand = async (cmd) => {
		if (this.hyperDeck && this.hyperDeck.connected) {
			try {
				return await this.hyperDeck.sendCommand(cmd)
			} catch (e) {
				if (e.code) {
					this.log('error', `${e.code} ${e.name}`)
				}
			}
		} else {
			this.log('debug', 'Socket not connected :(')
		}
	}

	const maxShuttle = this.model?.maxShuttle ?? 0

	if (this.config.modelID != 'bmdDup4K') {
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
			callback: async (action) => {
				const cmd = new Commands.PlayCommand(action.options.speed, action.options.loop, action.options.singleClip)
				await sendCommand(cmd)
			},
		}
	}

	actions['rec'] = {
		name: 'Record',
		options: [],
		callback: async () => {
			const cmd = new Commands.RecordCommand()
			await sendCommand(cmd)
		},
	}

	if (this.config.modelID == 'bmdDup4K') {
		actions['recAppend'] = {
			name: 'Append Record',
			options: [],
			callback: async () => {
				const cmd = new Commands.RecordCommand()
				cmd.append = true
				await sendCommand(cmd)
			},
		}
	}

	if (this.config.modelID != 'bmdDup4K') {
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
			callback: async (action) => {
				const name = await this.parseVariablesInString(action.options.name)
				const cmd = new Commands.RecordCommand(name)
				await sendCommand(cmd)
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
			callback: async (action) => {
				const cmd = new Commands.RecordCommand()
				const timeStamp = getTimestamp()
				if (action.options.prefix) {
					const name = await this.parseVariablesInString(action.options.prefix)
					cmd.filename = name + '-' + timeStamp + '-'
				} else {
					cmd.filename = timeStamp + '-'
				}
				await sendCommand(cmd)
			},
		}
		actions['recCustom'] = {
			name: 'Record (with custom reel)',
			options: [
				{
					type: 'static-text',
					id: 'info',
					label: "Set 'Reel' in instance config",
				},
			],
			callback: async () => {
				const cmd = new Commands.RecordCommand(this.config.reel + '-')
				await sendCommand(cmd)
			},
		}
	}

	actions['stop'] = {
		name: 'Stop',
		options: [],
		callback: async () => {
			const cmd = new Commands.StopCommand()
			await sendCommand(cmd)
		},
	}

	if (this.config.modelID != 'bmdDup4K') {
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
			callback: async (action) => {
				const cmd = new Commands.GoToCommand()
				cmd.timecode = action.options.tc
				await sendCommand(cmd)
			},
		}
		actions['gotoN'] = {
			name: 'Goto Clip (n)',
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
			callback: async (action) => {
				const cmd = new Commands.GoToCommand()
				cmd.clipId = action.options.clip
				await sendCommand(cmd)
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
					required: true,
					choices: this.CHOICES_CLIPS,
					minChoicesForSearch: 0,
					allowCustom: true,
				},
			],
			callback: async (action) => {
				await this.updateClips(this.transportInfo.slotId)

				const parsed = await this.parseVariablesInString(action.options.clip)

				const clip = this.CHOICES_CLIPS.find(({ label }) => label == this._stripExtension(parsed))
				if (!clip) {
					this.log('info', `Clip "${parsed}" does not exist`)
				} else {
					const cmd = new Commands.GoToCommand()
					cmd.clipId = clip.clipId
					await sendCommand(cmd)
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
					required: true,
					range: false,
				},
			],
			callback: async (action) => {
				const cmd = new Commands.GoToCommand()
				cmd.clipId = `+${action.options.clip}`
				await sendCommand(cmd)
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
					required: true,
					range: false,
				},
			],
			callback: async (action) => {
				const cmd = new Commands.GoToCommand()
				cmd.clipId = `-${action.options.clip}`
				await sendCommand(cmd)
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
			callback: async (action) => {
				const cmd = new Commands.GoToCommand()
				cmd.clip = action.options.startEnd
				await sendCommand(cmd)
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
			callback: async (action) => {
				const cmd = new Commands.JogCommand()
				cmd.timecode = `+${action.options.jogFwdTc}`
				await sendCommand(cmd)
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
			callback: async (action) => {
				const cmd = new Commands.JogCommand()
				cmd.timecode = `-${action.options.jogRewTc}`
				await sendCommand(cmd)
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
					required: true,
					range: true,
				},
			],
			callback: async (action) => {
				const cmd = new Commands.ShuttleCommand(action.options.speed)
				await sendCommand(cmd)
			},
		}
		actions['select'] = {
			name: 'Select (slot)',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'slot',
					default: 1,
					choices: this.CHOICES_SLOTS,
				},
			],
			callback: async (action) => {
				const cmd = new Commands.SlotSelectCommand()
				cmd.slotId = action.options.slot
				await sendCommand(cmd)

				// select will update internal cliplist so we should fetch those
				this.transportInfo = await sendCommand(new Commands.TransportInfoCommand())
				await this.updateClips(this.transportInfo.slotId)

				this.checkFeedbacks()
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
			callback: async (action) => {
				const cmd = new Commands.PreviewCommand(action.options.enable)
				await sendCommand(cmd)
			},
		}
	} // endif (!= bmdDup4K)

	if (this.CHOICES_VIDEOINPUTS.length > 1) {
		actions['videoSrc'] = {
			name: 'Video source',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'videoSrc',
					default: 'SDI',
					choices: this.CHOICES_VIDEOINPUTS,
				},
			],
			callback: async (action) => {
				const cmd = new Commands.ConfigurationCommand()
				cmd.videoInput = action.options.videoSrc
				await sendCommand(cmd)
			},
		}
	}

	if (this.CHOICES_AUDIOINPUTS.length > 1) {
		actions['audioSrc'] = {
			name: 'Audio source',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'audioSrc',
					default: 'embedded',
					choices: this.CHOICES_AUDIOINPUTS,
				},
			],
			callback: async (action) => {
				const cmd = new Commands.ConfigurationCommand()
				cmd.audioInput = action.options.audioSrc
				await sendCommand(cmd)
			},
		}
	}

	if (this.protocolVersion >= 1.11) {
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
			callback: async (action) => {
				const cmd = new Commands.ConfigurationCommand()
				cmd.audioCodec = action.options.audioCodec
				cmd.audioInputChannels = 2
				if (action.options.audioCodec == 'PCM') {
					let channels = action.options.audioChannels
					if (channels == 'cycle') {
						channels = this.deckConfig.audioInputChannels == 16 ? 2 : this.deckConfig.audioInputChannels * 2
					}
					cmd.audioInputChannels = channels
				}
				await sendCommand(cmd)
			},
		}
	}

	if (this.CHOICES_FILEFORMATS.length > 1) {
		actions['fileFormat'] = {
			name: 'File format',
			options: [
				{
					type: 'dropdown',
					label: 'Format',
					id: 'fileFormat',
					default: 'QuickTimeProRes',
					choices: this.CHOICES_FILEFORMATS,
				},
			],
			callback: async (action) => {
				const cmd = new Commands.ConfigurationCommand()
				cmd.fileFormat = action.options.fileFormat
				await sendCommand(cmd)
			},
		}
	}

	actions['fetchClips'] = {
		name: 'Fetch Clips',
		options: [],
		callback: async () => {
			await this.updateClips(this.transportInfo.slotId)
		},
	}

	/**
				* Not currently implemented
				*
			if (this.config.modelID == 'hdExtreme8K') {
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
                    callback: async (action) => {
                        const cmd = new Commands.ConfigurationCommand()
                        cmd.dynamicRange = action.options.dynamicRange
                        await sendCommand(cmd)
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
			},
		],
		callback: async (action) => {
			const cmd = new Commands.FormatCommand()
			cmd.filesystem = action.options.filesystem
			const response = await sendCommand(cmd)

			if (response && response.code) {
				this.log('debug', 'Format token: ' + response.code)
				this.formatToken = response.code
				this.checkFeedbacks('format_ready')
			}

			setTimeout(() => {
				this.formatToken = null
				this.checkFeedbacks('format_ready')
			}, action.options.timeout * 1000)
		},
	}

	actions['formatConfirm'] = {
		name: 'Format drive/card (confirm)',
		options: [],
		callback: async () => {
			if (this.formatToken) {
				const cmd = new Commands.FormatConfirmCommand()
				cmd.code = this.formatToken

				this.formatToken = null
				this.checkFeedbacks('format_ready')

				await sendCommand(cmd)
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
		callback: async (action) => {
			let setRemote = action.options.remoteEnable
			if (action.options.remoteEnable == 'toggle') {
				setRemote = !this.remoteInfo['enabled']
			}

			const cmd = new Commands.RemoteCommand()
			cmd.enable = setRemote

			const newVariables = {}
			updateRemoteVariable(this, newVariables)
			this.setVariableValues(newVariables)
			this.checkFeedbacks('remote_status')

			await sendCommand(cmd)
		},
	}

	return actions
}
