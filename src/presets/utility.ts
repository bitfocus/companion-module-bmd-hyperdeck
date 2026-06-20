import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { HyperdeckSchema } from '../schema.js'
import { colors } from './colors.js'

export function utilityPresets(): [
	CompanionPresetSection<HyperdeckSchema>,
	CompanionPresetDefinitions<HyperdeckSchema>,
] {
	const presets: CompanionPresetDefinitions<HyperdeckSchema> = {}

	presets.fetchClips = {
		type: 'simple',
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
				down: [{ actionId: 'fetchClips', options: {} }],
				up: [],
			},
		],
	}

	presets.formatPrepare = {
		type: 'simple',
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
		type: 'simple',
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
				down: [{ actionId: 'formatConfirm', options: {} }],
				up: [],
			},
		],
	}

	const section: CompanionPresetSection<HyperdeckSchema> = {
		id: 'utility',
		name: 'Utility',
		definitions: Object.keys(presets),
	}

	return [section, presets]
}
