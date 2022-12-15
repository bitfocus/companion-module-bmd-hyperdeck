const { Regex, combineRgb } = require('@companion-module/base')
const {
	CHOICES_AUDIOCODEC,
	CHOICES_AUDIOCHANNELS,
	CHOICES_TRANSPORTSTATUS,
	CHOICES_SLOTSTATUS,
	CHOICES_ENABLEDISABLE,
	CHOICES_REMOTESTATUS,
} = require('./choices')

exports.initFeedbacks = function () {
	const feedbacks = {}

	feedbacks['transport_status'] = {
		type: 'boolean',
		name: 'Transport status',
		description: 'Set feedback based on transport status',
		options: [
			{
				type: 'dropdown',
				label: 'Transport Status',
				id: 'status',
				choices: CHOICES_TRANSPORTSTATUS,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		callback: ({ options }) => {
			return options.status === this.transportInfo.status
		},
	}
	feedbacks['transport_clip'] = {
		type: 'boolean',
		name: 'Active clip',
		description: 'Set feedback based on the which clip is active',
		options: [
			{
				type: 'textinput',
				label: 'Clip Id',
				id: 'clipID',
				default: 1,
				regex: Regex.SIGNED_NUMBER,
			},
			{
				type: 'dropdown',
				label: 'Slot Id',
				id: 'slotID',
				choices: [{ id: 'either', label: 'Any' }].concat(this.CHOICES_SLOTS),
				default: 'either',
				regex: Regex.SOMETHING,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		callback: ({ options }) => {
			return (
				(options.slotID == 'either' && options.clipID == this.transportInfo.clipId) ||
				(options.slotID == this.transportInfo.slotId && options.clipID == this.transportInfo.clipId)
			)
		},
	}
	feedbacks['transport_clip_name'] = {
		type: 'boolean',
		name: 'Active Clip (name)',
		description: 'Set feedback based on the name of the active clip',
		options: [
			{
				type: 'dropdown',
				label: 'Clip Name - select from list or enter text',
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
				regex: Regex.SOMETHING,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		callback: ({ options }) => {
			return (
				(options.slotID == 'either' && options.clipName == this.transportInfo.clipName) ||
				(options.slotID == this.transportInfo.slotId && options.clipName == this.transportInfo.clipName)
			)
		},
	}
	feedbacks['transport_slot'] = {
		type: 'boolean',
		name: 'Active slot',
		description: 'Set feedback based on the which slot is active',
		options: [
			{
				type: 'textinput',
				label: 'Slot Id',
				id: 'setting',
				default: 1,
				regex: Regex.SIGNED_NUMBER,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		callback: ({ options }) => {
			return options.setting == this.transportInfo.slotId
		},
	}
	feedbacks['slot_status'] = {
		type: 'boolean',
		name: 'Slot/disk status',
		description: 'Set feedback based on disk status',
		options: [
			{
				type: 'dropdown',
				label: 'Disk Status',
				id: 'status',
				choices: CHOICES_SLOTSTATUS,
			},
			{
				type: 'textinput',
				label: 'Slot Id',
				id: 'slotId',
				default: 1,
				regex: Regex.SIGNED_NUMBER,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		callback: ({ options }) => {
			const slot = this.slotInfo[options.slotId]
			return !!slot && slot.status === options.status
		},
	}
	feedbacks['transport_loop'] = {
		type: 'boolean',
		name: 'Loop playback',
		description: 'Set feedback based on the loop status',
		options: [
			{
				type: 'dropdown',
				label: 'Loop',
				id: 'setting',
				choices: CHOICES_ENABLEDISABLE,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		callback: ({ options }) => {
			return options.setting === String(this.transportInfo.loop)
		},
	}
	feedbacks['transport_singleClip'] = {
		type: 'boolean',
		name: 'Single clip playback',
		description: 'Set feedback for single clip playback',
		options: [
			{
				type: 'dropdown',
				label: 'Single clip',
				id: 'setting',
				choices: CHOICES_ENABLEDISABLE,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		callback: ({ options }) => {
			return options.setting === String(this.transportInfo.singleClip)
		},
	}
	feedbacks['video_input'] = {
		type: 'boolean',
		name: 'Video input',
		description: 'Set feedback based on selected video input',
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'setting',
				choices: this.CHOICES_VIDEOINPUTS,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		callback: ({ options }) => {
			return options.setting === String(this.deckConfig.videoInput)
		},
	}
	if (this.CHOICES_AUDIOINPUTS.length > 1) {
		feedbacks['audio_input'] = {
			type: 'boolean',
			name: 'Audio input',
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
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			callback: ({ options }) => {
				return options.setting === String(this.deckConfig.audioInput)
			},
		}
	}
	feedbacks['audio_channels'] = {
		type: 'boolean',
		name: 'Audio channels',
		description: 'Set feedback based on configured audio channels',
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
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 255),
		},
		callback: ({ options }) => {
			if (options.audioCodec === 'AAC' || this.deckConfig.audioCodec === 'AAC') {
				return options.audioCodec === this.deckConfig.audioCodec
			}
			return options.audioChannels === String(this.deckConfig.audioInputChannels)
		},
	}
	feedbacks['format_ready'] = {
		type: 'boolean',
		name: 'Format prepared',
		description: 'Set feedback based on a successful Format Prepare action',
		options: [],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		callback: ({ options }) => {
			return this.formatToken !== null
		},
	}
	feedbacks['remote_status'] = {
		type: 'boolean',
		name: 'Remote Status',
		description: 'Set feedback based on the remote control status',
		options: [
			{
				type: 'dropdown',
				label: 'Status',
				id: 'status',
				default: true,
				choices: CHOICES_REMOTESTATUS,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 255),
		},
		callback: ({ options }) => {
			this.log('debug', `FEEDBACK: ${options.status} ${this.remoteInfo}`)
			return options.status === this.remoteInfo?.['enabled']
		},
	}

	return feedbacks
}
