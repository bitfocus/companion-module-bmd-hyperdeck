exports.initFeedbacks = function () {
	const feedbacks = {}

	feedbacks['transport_status'] = {
		label: 'Transport status',
		description: 'Based on transport status, change colors of the bank',
		options: [
			{
				type: 'dropdown',
				label: 'Transport Status',
				id: 'status',
				choices: this.CHOICES_TRANSPORTSTATUS,
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(0, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			if (options.status === this.transportInfo.status) {
				return { color: options.fg, bgcolor: options.bg }
			}
		},
	}
	feedbacks['transport_clip'] = {
		label: 'Active clip',
		description: 'Set the colour based on the which clip is active',
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
				choices: [
					{ id: 'either', label: 'Either' },
					{ id: 1, label: 'Slot 1' },
					{ id: 2, label: 'Slot 2' },
				],
				default: 'either',
				regex: this.REGEX_SOMETHING,
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(0, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			if (
				(options.slotID == 'either' && options.clipID == this.transportInfo.clipId) ||
				(options.slotID == this.transportInfo.slotId && options.clipID == this.transportInfo.clipId)
			) {
				return {
					color: options.fg,
					bgcolor: options.bg,
				}
			}
		},
	}
	feedbacks['transport_slot'] = {
		label: 'Active slot',
		description: 'Set the colour based on the which slot is active',
		options: [
			{
				type: 'textinput',
				label: 'Slot Id',
				id: 'setting',
				default: 1,
				regex: this.REGEX_SIGNED_NUMBER,
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(0, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			if (options.setting == this.transportInfo.slotId) {
				return {
					color: options.fg,
					bgcolor: options.bg,
				}
			}
		},
	}
	feedbacks['slot_status'] = {
		label: 'Slot/disk status',
		description: 'Based on disk status, change colors of the bank',
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
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(0, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			const slot = this.slotInfo[options.slotId]
			if (slot && slot.status === options.status) {
				return {
					color: options.fg,
					bgcolor: options.bg,
				}
			}
		},
	}
	feedbacks['transport_loop'] = {
		label: 'Loop playback',
		description: 'Set the colour of the button based on the loop status',
		options: [
			{
				type: 'dropdown',
				label: 'Loop',
				id: 'setting',
				choices: this.CHOICES_ENABLEDISABLE,
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(0, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			if (options.setting === String(this.transportInfo.loop)) {
				return {
					color: options.fg,
					bgcolor: options.bg,
				}
			}
		},
	}
	feedbacks['transport_singleClip'] = {
		label: 'Single clip playback',
		description: 'Set the colour of the button for single clip playback',
		options: [
			{
				type: 'dropdown',
				label: 'Single clip',
				id: 'setting',
				choices: this.CHOICES_ENABLEDISABLE,
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(0, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			if (options.setting === String(this.transportInfo.singleClip)) {
				return {
					color: options.fg,
					bgcolor: options.bg,
				}
			}
		},
	}
	feedbacks['video_input'] = {
		label: 'Video input',
		description: 'Set the colour of the button based on selected video input',
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'setting',
				choices: this.CHOICES_VIDEOINPUTS,
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(0, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			if (options.setting === String(this.deckConfig.videoInput)) {
				return {
					color: options.fg,
					bgcolor: options.bg,
				}
			}
		},
	}
	feedbacks['audio_input'] = {
		label: 'Audio input',
		description: 'Set the colour of the button based on selected audio input',
		options: [
			{
				type: 'dropdown',
				label: 'Input',
				id: 'setting',
				choices: this.CHOICES_AUDIOINPUTS,
				default: 'embedded'
			},
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(0, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			if (options.setting === String(this.deckConfig.audioInput)) {
				return {
					color: options.fg,
					bgcolor: options.bg,
				}
			}
		},
	}
	feedbacks['format_ready'] = {
		label: 'Format prepared',
		description: 'Set the colour of the button based on a successful Format Prepare action',
		options: [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: this.rgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: this.rgb(255, 0, 0),
			},
		],
		callback: ({ options }, bank) => {
			if (this.formatToken !== null) {
				return {
					color: options.fg,
					bgcolor: options.bg,
				}
			}
		},
	}

	return feedbacks
}
