import { CompanionPresetDefinitions, combineRgb } from '@companion-module/base'
import { InstanceBaseExt } from './types.js'

// Define colors for different categories
const colors = {
	white: combineRgb(255, 255, 255),
	black: combineRgb(0, 0, 0),
	red: combineRgb(255, 0, 0),
	green: combineRgb(0, 200, 0),
	blue: combineRgb(0, 80, 255),
	yellow: combineRgb(255, 255, 0),
	orange: combineRgb(255, 102, 0),
	purple: combineRgb(128, 0, 128),
	teal: combineRgb(0, 128, 128),
	lightBlue: combineRgb(0, 176, 255),
	grey: combineRgb(128, 128, 128),
	darkBlue: combineRgb(0, 0, 100),
}

export function initPresets(self: InstanceBaseExt): CompanionPresetDefinitions {
	self.log('info', 'Initializing Presets')

	const presets: CompanionPresetDefinitions = {}

	presets.play = {
		type: 'button',
		category: 'Transport',
		name: 'Play',
		style: {
			text: '▶\nPlay',
			size: '14',
			color: colors.white,
			bgcolor: colors.black,
		},
		feedbacks: [
			{
				feedbackId: 'transport_status',
				options: { status: 'play' },
				style: {
					color: colors.white,
					bgcolor: colors.green,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'play', options: { speed: 100, loop: false, single: false, useVariable: false } }],
				up: [],
			},
		],
	}

	presets.rec = {
		type: 'button',
		category: 'Transport',
		name: 'Record',
		style: {
			text: '●\nRec',
			size: '14',
			color: colors.white,
			bgcolor: colors.black,
		},
		feedbacks: [
			{
				feedbackId: 'transport_status',
				options: { status: 'record' },
				style: {
					color: colors.white,
					bgcolor: colors.red,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'rec', options: {} }],
				up: [],
			},
		],
	}

    presets.spill = {
        type: 'button',
        category: 'Transport',
        name: 'Spill',
        style: {
            text: '⏺️\nSpill',
            size: '14',
            color: colors.black,
            bgcolor: colors.yellow,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'spill', options: { slot: 'next' } } ],
                up: [],
            },
        ],
    }
    
    presets.recName = {
        type: 'button',
        category: 'Transport',
        name: 'Record w/ Name',
        style: {
            text: 'Rec\n●\nNamed',
            size: '14',
            color: colors.white,
            bgcolor: colors.black,
        },
        feedbacks: [
			{
				feedbackId: 'transport_status',
				options: { status: 'record' },
				style: {
					color: colors.white,
					bgcolor: colors.red,
				},
			},
		],
        steps: [
            {
                down: [ { actionId: 'recName', options: { name: 'Recording' } } ],
                up: [],
            },
        ],
    }
    
    presets.recTimestamp = {
        type: 'button',
        category: 'Transport',
        name: 'Record w/ Timestamp',
        style: {
            text: 'Rec\n●\nTime',
            size: '14',
            color: colors.white,
            bgcolor: colors.black,
        },
		feedbacks: [
			{
				feedbackId: 'transport_status',
				options: { status: 'record' },
				style: {
					color: colors.white,
					bgcolor: colors.red,
				},
			},
		],
        steps: [
            {
                down: [ { actionId: 'recTimestamp', options: { prefix: '' } } ],
                up: [],
            },
        ],
    }

	presets.stop = {
		type: 'button',
		category: 'Transport',
		name: 'Stop',
		style: {
			text: '■\nStop',
			size: '14',
			color: colors.white,
			bgcolor: colors.grey,
		},
		feedbacks: [
			{
				feedbackId: 'transport_status',
				options: { status: 'stopped' },
				style: {
					color: colors.white,
					bgcolor: colors.black,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'stop', options: {} }],
				up: [],
			},
		],
	}

    presets.goto = {
        type: 'button',
        category: 'Transport',
        name: 'Goto TC',
        style: {
            text: 'Goto\n00:00:01:00',
            size: '14',
            color: colors.white,
            bgcolor: colors.teal,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'goto', options: { tc: '00:00:01:00' } } ],
                up: [],
            },
        ],
    }

	presets.gotoN = {
		type: 'button',
		category: 'Transport',
		name: 'Goto Clip (n)',
		style: {
			text: 'Goto\n\u{2B80}\nClip 1',
			size: '14',
			color: colors.white,
			bgcolor: colors.black,
		},
		feedbacks: [
			{
				feedbackId: 'transport_clip',
				options: { clipID: 1, slotID: 'either' },
				style: {
					color: colors.white,
					bgcolor: colors.blue,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'gotoN', options: { clip: 1, useVariable: false } }],
				up: [],
			},
		],
	}

	presets.gotoName = {
		type: 'button',
		category: 'Transport',
		name: 'Goto Clip (name)',
		style: {
			text: 'Goto\n\u{2B80}\nNamed',
			size: '14',
			color: colors.white,
			bgcolor: colors.black,
		},
		feedbacks: [
			{
				feedbackId: 'transport_clip_name',
				options: { clipName: '', slotID: 'either' },
				style: {
					color: colors.white,
					bgcolor: colors.blue,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'gotoName', options: { clip: '' } }],
				up: [],
			},
		],
	}

    presets.goFwd = {
        type: 'button',
        category: 'Transport',
        name: 'Go Fwd Clip',
        style: {
            text: 'Next\n\u{1F87A}\nClip',
            size: '14',
            color: colors.black,
            bgcolor: colors.orange,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'goFwd', options: { clip: 1, useVariable: false } } ],
                up: [],
            },
        ],
    }
    
    presets.goRew = {
        type: 'button',
        category: 'Transport',
        name: 'Go Rew Clip',
        style: {
            text: 'Prev\n\u{1F878}\nClip',
            size: '14',
            color: colors.black,
            bgcolor: colors.orange,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'goRew', options: { clip: 1, useVariable: false } } ],
                up: [],
            },
        ],
    }
    
    presets.fetchClips = {
        type: 'button',
        category: 'Utility',
        name: 'Fetch Clips',
        style: {
            text: 'Fetch\n\u{1F517}\nClips',
            size: '14',
            color: colors.white,
            bgcolor: colors.purple,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'fetchClips', options: {} } ],
                up: [],
            },
        ],
    }

	presets.formatPrepare = {
		type: 'button',
		category: 'Utility',
		name: 'Format (Prepare)',
		style: {
			text: 'Format\nPrepare',
			size: '14',
			color: colors.white,
			bgcolor: colors.black,
		},
		feedbacks: [
			{
				feedbackId: 'format_ready',
				options: {},
				style: {
					color: colors.white,
					bgcolor: colors.red,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'formatPrepare', options: { filesystem: 'HFS+', timeout: 10 } }],
				up: [],
			},
		],
	}

    presets.formatConfirm = {
        type: 'button',
        category: 'Utility',
        name: 'Format (Confirm)',
        style: {
            text: 'Format\nConfirm',
            size: '14',
            color: colors.white,
            bgcolor: colors.red,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'formatConfirm', options: {} } ],
                up: [],
            },
        ],
    }

	presets.remote = {
		type: 'button',
		category: 'Config',
		name: 'Remote Toggle',
		style: {
			text: 'Remote\nToggle',
			size: '14',
			color: colors.white,
			bgcolor: colors.black,
		},
		feedbacks: [
			{
				feedbackId: 'remote_status',
				options: { status: true },
				style: {
					color: colors.white,
					bgcolor: colors.blue,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'remote', options: { remoteEnable: 'toggle' } }],
				up: [],
			},
		],
	}

	presets.transportStatus = {
		type: 'button',
		category: 'Monitor',
		name: 'Transport Status',
		style: {
			text: 'Status\n$(hyperdeck:status)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.clipInfo = {
		type: 'button',
		category: 'Monitor',
		name: 'Clip Info',
		style: {
			text: 'Clip\n$(hyperdeck:clipName)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.slotId = {
		type: 'button',
		category: 'Monitor',
		name: 'Slot ID',
		style: {
			text: 'Slot\n$(hyperdeck:slotId)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.videoFormat = {
		type: 'button',
		category: 'Monitor',
		name: 'Video Format',
		style: {
			text: 'Format\n$(hyperdeck:videoFormat)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.recordingTime = {
		type: 'button',
		category: 'Monitor',
		name: 'Recording Time',
		style: {
			text: 'Rec Time\n$(hyperdeck:recordingTime)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.timecode = {
		type: 'button',
		category: 'Monitor',
		name: 'Timecode',
		style: {
			text: 'TC\n$(hyperdeck:timecodeHMSF)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.countdown = {
		type: 'button',
		category: 'Monitor',
		name: 'Countdown TC',
		style: {
			text: '⏳\n$(hyperdeck:countdownTimecodeHMSF)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.audioFormat = {
		type: 'button',
		category: 'Monitor',
		name: 'Audio Format',
		style: {
			text: 'Audio\n$(hyperdeck:audioCodec)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.audioChannels = {
		type: 'button',
		category: 'Monitor',
		name: 'Audio Channels',
		style: {
			text: 'Channels\n$(hyperdeck:audioChannels)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.remoteEnabled = {
		type: 'button',
		category: 'Monitor',
		name: 'Remote Status',
		style: {
			text: 'Remote\n$(hyperdeck:remoteEnabled)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	return presets
}
