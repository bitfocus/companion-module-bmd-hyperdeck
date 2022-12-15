exports.initFeedbacks = function () {
	const feedbacks = {}

	feedbacks['transport_status'] = {
		type: 'boolean',
		label: 'Transport status',
		description: 'Set feedback based on transport status',
		options: [
			{
				type: 'dropdown',
				label: 'Transport Status',
				id: 'status',
				choices: this.CHOICES_TRANSPORTSTATUS,
			},
		],
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 0),
		},
		callback: ({ options }, bank) => {
			if (options.status === this.transportInfo.status) {
				return true
			}
			return false
		},
	}
	feedbacks['transport_clip'] = {
		type: 'boolean',
		label: 'Active clip',
		description: 'Set feedback based on the which clip is active',
		options: [
			{
				type: 'textinput',
				label: 'Clip Id',
				id: 'clipID',
				default: 1,
				regex: this.REGEX_SIGNED_NUMBER,
			},
			{
				type: 'dropdown',
				label: 'Slot Id',
				id: 'slotID',
				choices: [{ id: 'either', label: 'Any' }].concat(this.CHOICES_SLOTS),
				default: 'either',
				regex: this.REGEX_SOMETHING,
			},
		],
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 0),
		},
		callback: ({ options }, bank) => {
			if (
				(options.slotID == 'either' && options.clipID == this.transportInfo.clipId) ||
				(options.slotID == this.transportInfo.slotId && options.clipID == this.transportInfo.clipId)
			) {
				return true
			}
			return false
		},
	}
	feedbacks['transport_clip_name'] = {
		type: 'boolean',
		label: 'Active Clip (name)',
		description: 'Set feedback based on the name of the active clip',
		options: [
			{
				type: 'dropdown',
				label: 'Clip Name - select from list or enter text (variables supported)',
				id: 'clipName',
				default: '',
				required: true,
				choices: this.CHOICES_CLIPS,
				minChoicesForSearch: 0,
				allowCustom: true,
			},
			{
				type: 'dropdown',
				label: 'Slot Id',
				id: 'slotID',
				choices: [{ id: 'either', label: 'Any' }].concat(this.CHOICES_SLOTS),
				default: 'either',
				regex: this.REGEX_SOMETHING,
			},
		],
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(255, 0, 0),
		},
		callback: ({ options }, bank) => {
			let match = false
			this.parseVariables(options.clipName, (parsed) => {
				if (
					(options.slotID == 'either' && parsed == this.transportInfo.clipName) ||
					(options.slotID == this.transportInfo.slotId && parsed == this.transportInfo.clipName)
				) {
					match = true
				}
			})
			return match
		},
	}
	feedbacks['transport_slot'] = {
		type: 'boolean',
		label: 'Active slot',
		description: 'Set feedback based on the which slot is active',
		options: [
			{
				type: 'textinput',
				label: 'Slot Id',
				id: 'setting',
				default: 1,
				regex: this.REGEX_SIGNED_NUMBER,
			},
		],
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 0),
		},
		callback: ({ options }, bank) => {
			if (options.setting == this.transportInfo.slotId) {
				return true
			}
			return false
		},
	}
	feedbacks['slot_status'] = {
		type: 'boolean',
		label: 'Slot/disk status',
		description: 'Set feedback based on disk status',
		options: [
			{
				type: 'dropdown',
				label: 'Disk Status',
				id: 'status',
				choices: this.CHOICES_SLOTSTATUS,
			},
			{
				type: 'textinput',
				label: 'Slot Id',
				id: 'slotId',
				default: 1,
				regex: this.REGEX_SIGNED_NUMBER,
			},
		],
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 0),
		},
		callback: ({ options }, bank) => {
			const slot = this.slotInfo[options.slotId]
			if (slot && slot.status === options.status) {
				return true
			}
			return false
		},
	}
	feedbacks['transport_loop'] = {
		type: 'boolean',
		label: 'Loop playback',
		description: 'Set feedback based on the loop status',
		options: [
			{
				type: 'dropdown',
				label: 'Loop',
				id: 'setting',
				choices: this.CHOICES_ENABLEDISABLE,
			},
		],
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 0),
		},
		callback: ({ options }, bank) => {
			if (options.setting === String(this.transportInfo.loop)) {
				return true
			}
			return false
		},
	}
	feedbacks['transport_singleClip'] = {
		type: 'boolean',
		label: 'Single clip playback',
		description: 'Set feedback for single clip playback',
		options: [
			{
				type: 'dropdown',
				label: 'Single clip',
				id: 'setting',
				choices: this.CHOICES_ENABLEDISABLE,
			},
		],
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 0),
		},
		callback: ({ options }, bank) => {
			if (options.setting === String(this.transportInfo.singleClip)) {
				return true
			}
			return false
		},
	}
	feedbacks['video_input'] = {
		type: 'boolean',
		label: 'Video input',
		description: 'Set feedback based on selected video input',
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'setting',
				choices: this.CHOICES_VIDEOINPUTS,
			},
		],
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 0),
		},
		callback: ({ options }, bank) => {
			if (options.setting === String(this.deckConfig.videoInput)) {
				return true
			}
			return false
		},
	}
	if (this.CHOICES_AUDIOINPUTS.length > 1) {
		feedbacks['audio_input'] = {
			type: 'boolean',
			label: 'Audio input',
			description: 'Set feedback based on selected audio input',
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'setting',
					choices: this.CHOICES_AUDIOINPUTS,
					default: 'embedded',
				},
			],
			style: {
				color: this.rgb(255, 255, 255),
				bgcolor: this.rgb(0, 0, 0),
			},
			callback: ({ options }, bank) => {
				if (options.setting === String(this.deckConfig.audioInput)) {
					return true
				}
				return false
			},
		}
	}
	feedbacks['audio_channels'] = {
		type: 'boolean',
		label: 'Audio channels',
		description: 'Set feedback based on configured audio channels',
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
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 255),
		},
		callback: ({ options }, bank) => {
			if (options.audioCodec === 'AAC' || this.deckConfig.audioCodec === 'AAC') {
				if (options.audioCodec === this.deckConfig.audioCodec) {
					return true
				}
				return false
			}
			if (options.audioChannels === String(this.deckConfig.audioInputChannels)) {
				return true
			}
			return false
		},
	}
	feedbacks['format_ready'] = {
		type: 'boolean',
		label: 'Format prepared',
		description: 'Set feedback based on a successful Format Prepare action',
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(255, 0, 0),
		},
		callback: ({ options }, bank) => {
			if (this.formatToken !== null) {
				return true
			}
			return false
		},
	}
	feedbacks['remote_status'] = {
		type: 'boolean',
		label: 'Remote Status',
		description: 'Set feedback based on the remote control status',
		options: [
			{
				type: 'dropdown',
				label: 'Status',
				id: 'status',
				default: true,
				choices: this.CHOICES_REMOTESTATUS,
			},
		],
		style: {
			color: this.rgb(255, 255, 255),
			bgcolor: this.rgb(0, 0, 255),
		},
		callback: ({ options }, bank) => {
			this.debug('FEEDBACK:', options.status, this.remoteInfo)
			return options.status === this.remoteInfo['enabled']
		},
	}

	return feedbacks
}
