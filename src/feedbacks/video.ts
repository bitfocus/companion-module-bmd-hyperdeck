import { CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import type { InstanceBaseExt } from '../types.js'
import type { ModelChoices } from '../choices/index.js'

export type VideoFeedbacks = {
	video_input: { type: 'boolean'; options: { setting: string } }
}

export function createVideoFeedbacks(
	self: InstanceBaseExt,
	modelChoices: ModelChoices,
): CompanionFeedbackDefinitions<VideoFeedbacks> {
	const feedbacks: CompanionFeedbackDefinitions<VideoFeedbacks> = {
		video_input: {
			type: 'boolean',
			name: 'Video input',
			description: 'Set feedback based on selected video input',
			options: [
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Input',
					id: 'setting',
					choices: modelChoices.VideoInputs,
					default: modelChoices.VideoInputs[0]?.id,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			callback: ({ options }) => {
				return options.setting === String(self.deckConfig.videoInput)
			},
		},
	}

	return feedbacks
}
