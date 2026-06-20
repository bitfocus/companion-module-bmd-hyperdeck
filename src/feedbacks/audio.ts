import { CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import type { InstanceBaseExt } from '../types.js'
import { CHOICES_AUDIOCODEC, CHOICES_AUDIOCHANNELS } from '../choices/index.js'
import type { ModelChoices } from '../choices/index.js'

export type AudioFeedbacks = {
	audio_input: { type: 'boolean'; options: { setting: string } }
	audio_channels: { type: 'boolean'; options: { audioCodec: string; audioChannels: string } }
}

export function createAudioFeedbacks(
	self: InstanceBaseExt,
	modelChoices: ModelChoices,
): CompanionFeedbackDefinitions<AudioFeedbacks> {
	const feedbacks: CompanionFeedbackDefinitions<AudioFeedbacks> = {
		audio_input:
			modelChoices.AudioInputs.length > 1
				? {
						type: 'boolean',
						name: 'Audio input',
						description: 'Set feedback based on selected audio input',
						options: [
							{
								type: 'dropdown',
								disableAutoExpression: true,
								label: 'Input',
								id: 'setting',
								choices: modelChoices.AudioInputs,
								default: modelChoices.AudioInputs[0]?.id,
							},
						],
						defaultStyle: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(0, 0, 0),
						},
						callback: ({ options }) => {
							return options.setting === self.deckConfig.audioInput
						},
					}
				: undefined,

		audio_channels: {
			type: 'boolean',
			name: 'Audio channels',
			description: 'Set feedback based on configured audio channels',
			options: [
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Codec',
					id: 'audioCodec',
					default: CHOICES_AUDIOCODEC[0].id,
					choices: CHOICES_AUDIOCODEC,
				},
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Channels',
					id: 'audioChannels',
					default: '2',
					choices: CHOICES_AUDIOCHANNELS,
					description: 'Only valid when codec is PCM',
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 255),
			},
			callback: ({ options }) => {
				if (options.audioCodec === 'AAC' || self.deckConfig.audioCodec === 'AAC') {
					return options.audioCodec === self.deckConfig.audioCodec
				}
				return options.audioChannels === String(self.deckConfig.audioInputChannels)
			},
		},
	}

	return feedbacks
}
