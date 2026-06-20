import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { HyperdeckSchema } from '../schema.js'
import { colors } from './colors.js'

export function configPresets(): [
	CompanionPresetSection<HyperdeckSchema>,
	CompanionPresetDefinitions<HyperdeckSchema>,
] {
	const presets: CompanionPresetDefinitions<HyperdeckSchema> = {}

	presets.remote = {
		type: 'simple',
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
				options: { status: 'true' },
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

	const section: CompanionPresetSection<HyperdeckSchema> = {
		id: 'config',
		name: 'Config',
		definitions: Object.keys(presets),
	}

	return [section, presets]
}
