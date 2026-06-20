import type { CompanionActionDefinitions } from '@companion-module/base'
import { Commands } from 'hyperdeck-connection'
import type { InstanceBaseExt } from '../types.js'
import type { ModelChoices } from '../choices/index.js'
import { CHOICES_AUDIOCODEC, CHOICES_AUDIOCHANNELS } from '../choices/index.js'
import { protocolGte } from '../util.js'

export type AudioActions = {
	audioSrc: {
		options: {
			audioSrc: string
		}
	}
	audioChannels: {
		options: {
			audioCodec: 'PCM' | 'AAC'
			audioChannels: string
		}
	}
}

export function createAudioActions(
	self: InstanceBaseExt,
	modelChoices: ModelChoices,
): CompanionActionDefinitions<AudioActions> {
	const actions: CompanionActionDefinitions<AudioActions> = {
		audioSrc:
			modelChoices.AudioInputs.length > 1
				? {
						name: 'Audio source',
						options: [
							{
								type: 'dropdown',
								disableAutoExpression: true,
								label: 'Input',
								id: 'audioSrc',
								default: modelChoices.AudioInputs[0]?.id,
								choices: modelChoices.AudioInputs,
							},
						],
						callback: async ({ options }) => {
							const cmd = new Commands.ConfigurationCommand()
							cmd.audioInput = options.audioSrc
							await self.sendCommand(cmd)
						},
					}
				: undefined,

		audioChannels: protocolGte(self.protocolVersion, '1.11')
			? {
					name: 'Audio channels',
					options: [
						{
							type: 'dropdown',
							label: 'Codec',
							id: 'audioCodec',
							default: CHOICES_AUDIOCODEC[0].id,
							choices: CHOICES_AUDIOCODEC,
						},
						{
							type: 'dropdown',
							label: 'Channels',
							id: 'audioChannels',
							default: '2',
							choices: CHOICES_AUDIOCHANNELS,
							isVisibleExpression: `$(options:audioCodec) == 'PCM'`,
							expressionDescription: 'Valid options are: ' + CHOICES_AUDIOCHANNELS.map((v) => v.id).join(', '),
						},
					],
					callback: async ({ options }) => {
						const cmd = new Commands.ConfigurationCommand()
						cmd.audioCodec = options.audioCodec
						cmd.audioInputChannels = 2
						if (options.audioCodec == 'PCM') {
							let channels = 2
							if (options.audioChannels == 'cycle') {
								channels =
									self.deckConfig.audioInputChannels == 16 || typeof self.deckConfig.audioInputChannels !== 'number'
										? 2
										: self.deckConfig.audioInputChannels * 2
							} else {
								channels = Number(options.audioChannels)
								if (isNaN(channels)) {
									throw new Error(`Invalid audio channels: ${options.audioChannels}`)
								}
							}
							cmd.audioInputChannels = channels
						}
						await self.sendCommand(cmd)
					},
				}
			: undefined,
	}

	return actions
}
