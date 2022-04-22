exports.initFeedbacks = function () {
	const feedbacks = {}

	feedbacks['transport_status'] = {
		type: 'boolean',
		label: 'Transport status',
		description: 'Set feedback based on transport status',
		options: [	{
			type: 'dropdown',
			label: 'Transport Status',
			id: 'status',
			choices: this.CHOICES_TRANSPORTSTATUS,
		}],
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
				choices: [{ id: 'either', label: 'Any' },].concat(this.CHOICES_SLOTS),
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
	feedbacks['transport_slot'] = {
		type: 'boolean',
		label: 'Active slot',
		description: 'Set feedback based on the which slot is active',
		options: [	{
			type: 'textinput',
			label: 'Slot Id',
			id: 'setting',
			default: 1,
			regex: this.REGEX_SIGNED_NUMBER,
		}],
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
		options: [	{
			type: 'dropdown',
			label: 'Loop',
			id: 'setting',
			choices: this.CHOICES_ENABLEDISABLE,
		}],
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
		options: [	{
			type: 'dropdown',
			label: 'Single clip',
			id: 'setting',
			choices: this.CHOICES_ENABLEDISABLE,
		}],
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
		options: [	{
			type: 'dropdown',
			label: 'Input',
			id: 'setting',
			choices: this.CHOICES_VIDEOINPUTS,
		}],
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
			options: [{
				type: 'dropdown',
				label: 'Input',
				id: 'setting',
				choices: this.CHOICES_AUDIOINPUTS,
				default: 'embedded'
			}],
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

	return feedbacks
}
