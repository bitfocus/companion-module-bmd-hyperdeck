import type { CompanionActionDefinitions } from '@companion-module/base'
import { Commands, FilesystemFormat } from 'hyperdeck-connection'
import type { InstanceBaseExt } from '../types.js'
import type { ModelChoices } from '../choices/index.js'
import { CHOICES_FILESYSTEM } from '../choices/index.js'

export type FormatActions = {
	fileFormat: { options: { fileFormat: string } }
	formatPrepare: { options: { filesystem: string; timeout: number } }
	formatConfirm: { options: Record<string, never> }
}

export function createFormatActions(
	self: InstanceBaseExt,
	modelChoices: ModelChoices,
): CompanionActionDefinitions<FormatActions> {
	const actions: CompanionActionDefinitions<FormatActions> = {
		fileFormat:
			modelChoices.FileFormats.length > 1
				? {
						name: 'File format',
						options: [
							{
								type: 'dropdown',
								label: 'Format',
								id: 'fileFormat',
								default: modelChoices.FileFormats[0]?.id,
								choices: modelChoices.FileFormats,
							},
						],
						callback: async ({ options }) => {
							const cmd = new Commands.ConfigurationCommand()
							cmd.fileFormat = options.fileFormat
							await self.sendCommand(cmd)
						},
					}
				: undefined,

		formatPrepare: {
			name: 'Format drive/card (prepare)',
			options: [
				{
					type: 'dropdown',
					label: 'Filesystem',
					id: 'filesystem',
					default: 'HFS+',
					choices: CHOICES_FILESYSTEM,
				},
				{
					type: 'number',
					label: 'Confirmation timeout (sec)',
					id: 'timeout',
					default: 10,
					min: 0,
					max: 600,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.FormatCommand()
				cmd.filesystem = options.filesystem as FilesystemFormat
				const response = await self.sendCommand(cmd)

				if (response && response.code) {
					self.log('debug', 'Format token: ' + response.code)
					self.formatToken = response.code
					self.checkFeedbacks('format_ready')
				}

				if (self.formatTokenTimeout) clearTimeout(self.formatTokenTimeout)

				self.formatTokenTimeout = setTimeout(() => {
					self.formatToken = null
					self.checkFeedbacks('format_ready')
				}, options.timeout * 1000)
			},
		},

		formatConfirm: {
			name: 'Format drive/card (confirm)',
			options: [],
			callback: async () => {
				if (self.formatToken) {
					if (self.formatTokenTimeout) {
						clearTimeout(self.formatTokenTimeout)
						self.formatTokenTimeout = null
					}

					const cmd = new Commands.FormatConfirmCommand()
					cmd.code = self.formatToken

					self.formatToken = null
					self.checkFeedbacks('format_ready')

					await self.sendCommand(cmd)
				}
			},
		},
	}

	return actions
}
