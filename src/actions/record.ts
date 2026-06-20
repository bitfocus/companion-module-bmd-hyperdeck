import type { CompanionActionDefinitions } from '@companion-module/base'
import { Regex } from '@companion-module/base'
import { Commands } from 'hyperdeck-connection'
import type { InstanceBaseExt } from '../types.js'
import type { ModelChoices } from '../choices/index.js'
import { getTimestamp } from '../util.js'

export type RecordActions = {
	rec: { options: Record<string, never> }
	spill: { options: { slot: 'next' | 'same' | number } }
	recAppend: { options: Record<string, never> }
	recName: { options: { name: string } }
	recTimestamp: { options: { prefix: string } }
	recCustom: { options: { info: string } }
}

export function createRecordActions(
	self: InstanceBaseExt,
	modelChoices: ModelChoices,
): CompanionActionDefinitions<RecordActions> {
	const actions: CompanionActionDefinitions<RecordActions> = {
		rec: {
			name: 'Record',
			options: [],
			callback: async () => {
				const cmd = new Commands.RecordCommand()
				await self.sendCommand(cmd)
			},
		},

		spill: {
			name: 'Spill',
			description: 'Spill current recording to specified slot',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'slot',
					default: 'next',
					choices: [
						{
							id: 'next',
							label: 'next',
						},
						{
							id: 'same',
							label: 'Same Slot',
						},
						...modelChoices.Slots,
					],
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.RecordSpillCommand()
				if (!options.slot || options.slot === 'next') {
					// No parameter
				} else if (options.slot === 'same') {
					// Split and continue on the same slot
					if (self.transportInfo.slotId) cmd.slot = self.transportInfo.slotId
				} else {
					cmd.slot = options.slot
				}

				await self.sendCommand(cmd)
			},
		},

		recAppend:
			self.config.modelID == 'bmdDup4K'
				? {
						name: 'Append Record',
						options: [],
						callback: async () => {
							const cmd = new Commands.RecordCommand()
							cmd.append = true
							await self.sendCommand(cmd)
						},
					}
				: undefined,

		recName:
			self.config.modelID != 'bmdDup4K'
				? {
						name: 'Record (with name)',
						options: [
							{
								type: 'textinput',
								label: 'Filename (without extension)',
								id: 'name',
								default: '',
								regex: Regex.SOMETHING,
								useVariables: true,
							},
						],
						callback: async ({ options }) => {
							const cmd = new Commands.RecordCommand(options.name)
							await self.sendCommand(cmd)
						},
					}
				: undefined,
		recTimestamp:
			self.config.modelID != 'bmdDup4K'
				? {
						name: 'Record (with name and current date/time)',
						options: [
							{
								type: 'textinput',
								label: 'Filename (optional)',
								id: 'prefix',
								default: '',
								useVariables: true,
							},
						],
						callback: async ({ options }) => {
							const cmd = new Commands.RecordCommand()
							const timeStamp = getTimestamp()
							if (options.prefix) {
								cmd.filename = options.prefix + '-' + timeStamp + '-'
							} else {
								cmd.filename = timeStamp + '-'
							}
							await self.sendCommand(cmd)
						},
					}
				: undefined,
		recCustom:
			self.config.modelID != 'bmdDup4K'
				? {
						name: 'Record (with custom reel)',
						options: [
							{
								type: 'static-text',
								id: 'info',
								label: "Set 'Reel' in instance config",
								value: '',
							},
						],
						callback: async () => {
							const cmd = new Commands.RecordCommand(self.config.reel + '-')
							await self.sendCommand(cmd)
						},
					}
				: undefined,
	}

	return actions
}
