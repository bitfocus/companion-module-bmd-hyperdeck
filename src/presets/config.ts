import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { HyperdeckSchema } from '../schema.js'
import { CHOICES_TIMECODEINPUT } from '../choices/index.js'
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

	// Set the preset timecode. The `timecode` local variable holds the value to apply and is
	// shown on the button; it defaults to 00:00:00:00 so the preset doubles as a reset-to-zero button.
	presets.timecodePreset = {
		type: 'simple',
		name: 'Set preset timecode',
		style: {
			text: 'Set TC\n$(local:timecode)',
			size: '14',
			color: colors.white,
			bgcolor: colors.black,
		},
		localVariables: [
			{
				variableName: 'timecode',
				variableType: 'simple',
				startupValue: '00:00:00:00',
			},
		],
		feedbacks: [],
		steps: [
			{
				down: [
					{
						actionId: 'timecodePreset',
						options: { timecode: { isExpression: true, value: '$(local:timecode)' } },
					},
				],
				up: [],
			},
		],
	}

	// One button per timecode input source, highlighted when that source is active
	for (const source of CHOICES_TIMECODEINPUT) {
		presets[`timecodeInput_${source.id}`] = {
			type: 'simple',
			name: `Timecode input: ${source.label}`,
			style: {
				text: `TC In\n${source.label}`,
				size: '14',
				color: colors.white,
				bgcolor: colors.black,
			},
			feedbacks: [
				{
					feedbackId: 'timecode_input',
					options: { input: source.id },
					style: {
						color: colors.white,
						bgcolor: colors.blue,
					},
				},
			],
			steps: [
				{
					down: [{ actionId: 'timecodeInput', options: { input: source.id } }],
					up: [],
				},
			],
		}
	}

	const section: CompanionPresetSection<HyperdeckSchema> = {
		id: 'config',
		name: 'Config',
		definitions: Object.keys(presets),
	}

	return [section, presets]
}
