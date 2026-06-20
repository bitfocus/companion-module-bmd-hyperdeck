import type { CompanionActionDefinitions } from '@companion-module/base'
import { Commands } from 'hyperdeck-connection'
import type { InstanceBaseExt } from '../types.js'
import type { ModelChoices } from '../choices/index.js'
import { CHOICES_PREVIEWMODE } from '../choices/index.js'

export type VideoActions = {
	videoSrc: { options: { videoSrc: string } }
	preview: { options: { enable: string } }
}

export function createVideoActions(
	self: InstanceBaseExt,
	modelChoices: ModelChoices,
): CompanionActionDefinitions<VideoActions> {
	const actions: CompanionActionDefinitions<VideoActions> = {
		videoSrc:
			modelChoices.VideoInputs.length > 1
				? {
						name: 'Video source',
						options: [
							{
								type: 'dropdown',
								disableAutoExpression: true,
								label: 'Input',
								id: 'videoSrc',
								default: modelChoices.VideoInputs[0]?.id,
								choices: modelChoices.VideoInputs,
							},
						],
						callback: async ({ options }) => {
							const cmd = new Commands.ConfigurationCommand()
							cmd.videoInput = options.videoSrc
							await self.sendCommand(cmd)
						},
					}
				: undefined,

		preview:
			self.config.modelID != 'bmdDup4K'
				? {
						name: 'Preview',
						options: [
							{
								type: 'dropdown',
								disableAutoExpression: true,
								label: 'Set preview/output mode',
								id: 'enable',
								default: 'true',
								choices: CHOICES_PREVIEWMODE,
							},
						],
						callback: async ({ options }) => {
							const cmd = new Commands.PreviewCommand(options.enable === 'true')
							await self.sendCommand(cmd)
						},
					}
				: undefined,

		/**
				* Not currently implemented
				*
			if (self.config.modelID == 'hdExtreme8K') {
				actions['dynamicRange'] = {
					name: 'Set playback dyanmic range',
					options: [
						{
							type: 'dropdown',
							label: 'Dynamic Range',
							id: 'dynamicRange',
							default: 'auto',
							choices: CHOICES_DYNAMICRANGE
						}
					],
                    callback: async ({options}) => {
                        const cmd = new Commands.ConfigurationCommand()
                        cmd.dynamicRange = action.options.dynamicRange
                        await self.sendCommand(cmd)
                    },
				};
			}
			*/
	}

	return actions
}
