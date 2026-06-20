import { CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import type { InstanceBaseExt } from '../types.js'

export type FormatFeedbacks = {
	format_ready: { type: 'boolean'; options: Record<string, never> }
}

export function createFormatFeedbacks(self: InstanceBaseExt): CompanionFeedbackDefinitions<FormatFeedbacks> {
	const feedbacks: CompanionFeedbackDefinitions<FormatFeedbacks> = {
		format_ready: {
			type: 'boolean',
			name: 'Format prepared',
			description: 'Set feedback based on a successful Format Prepare action',
			options: [],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({}) => {
				return self.formatToken !== null
			},
		},
	}

	return feedbacks
}
