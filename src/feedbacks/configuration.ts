import { CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import type { InstanceBaseExt } from '../types.js'
import { CHOICES_TIMECODEINPUT } from '../choices/index.js'

export type ConfigurationFeedbacks = {
	timecode_input: { type: 'boolean'; options: { input: string } }
}

export function createConfigurationFeedbacks(self: InstanceBaseExt): CompanionFeedbackDefinitions<ConfigurationFeedbacks> {
	const feedbacks: CompanionFeedbackDefinitions<ConfigurationFeedbacks> = {
		timecode_input: {
			type: 'boolean',
			name: 'Timecode input',
			description: 'Set feedback based on the selected timecode input',
			options: [
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Source',
					id: 'input',
					choices: CHOICES_TIMECODEINPUT,
					default: 'preset',
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			callback: ({ options }) => {
				return options.input === String(self.deckConfig.timecodeInput)
			},
		},
	}

	return feedbacks
}
