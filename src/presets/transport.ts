import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { HyperdeckSchema } from '../schema.js'
import { colors } from './colors.js'

export function transportPresets(): [
	CompanionPresetSection<HyperdeckSchema>,
	CompanionPresetDefinitions<HyperdeckSchema>,
] {
	const presets: CompanionPresetDefinitions<HyperdeckSchema> = {}

	presets.play = {
		type: 'simple',
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
				down: [{ actionId: 'play', options: { speed: 100, loop: false, single: false } }],
				up: [],
			},
		],
	}

	presets.playSingle = {
		type: 'simple',
		name: 'Play single clip',
		style: {
			text: '▶\nPlay\n1 clip',
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
				down: [{ actionId: 'play', options: { speed: 100, loop: false, single: true } }],
				up: [],
			},
		],
	}

	presets.rec = {
		type: 'simple',
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

	presets.recStopToggle = {
		type: 'simple',
		name: 'Record/Stop Toggle',
		style: {
			text: '●/■\nRec/Stop',
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
			{
				feedbackId: 'transport_status',
				options: { status: 'stopped' },
				style: {
					color: colors.white,
					bgcolor: colors.grey,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'recordStopToggle', options: {} }],
				up: [],
			},
		],
	}

	presets.spill = {
		type: 'simple',
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
				down: [{ actionId: 'spill', options: { slot: 'next' } }],
				up: [],
			},
		],
	}

	presets.recName = {
		type: 'simple',
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
				down: [{ actionId: 'recName', options: { name: 'Recording' } }],
				up: [],
			},
		],
	}

	presets.recTimestamp = {
		type: 'simple',
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
				down: [{ actionId: 'recTimestamp', options: { prefix: '' } }],
				up: [],
			},
		],
	}

	presets.stop = {
		type: 'simple',
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

	presets.playStopToggle = {
		type: 'simple',
		name: 'Play/Stop Toggle',
		style: {
			text: '▶/■\nPlay/Stop',
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
			{
				feedbackId: 'transport_status',
				options: { status: 'stopped' },
				style: {
					color: colors.white,
					bgcolor: colors.grey,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'playStopToggle', options: {} }],
				up: [],
			},
		],
	}

	presets.goto = {
		type: 'simple',
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
				down: [{ actionId: 'goto', options: { tc: '00:00:01:00' } }],
				up: [],
			},
		],
	}

	presets.gotoN = {
		type: 'simple',
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
				down: [{ actionId: 'gotoN', options: { clip: 1 } }],
				up: [],
			},
		],
	}

	presets.gotoName = {
		type: 'simple',
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
		type: 'simple',
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
				down: [{ actionId: 'goFwd', options: { clip: 1 } }],
				up: [],
			},
		],
	}

	presets.goRew = {
		type: 'simple',
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
				down: [{ actionId: 'goRew', options: { clip: 1 } }],
				up: [],
			},
		],
	}

	const section: CompanionPresetSection<HyperdeckSchema> = {
		id: 'transport',
		name: 'Transport',
		definitions: Object.keys(presets),
	}

	return [section, presets]
}
