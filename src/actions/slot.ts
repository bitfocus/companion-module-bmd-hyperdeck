import type { CompanionActionDefinitions } from '@companion-module/base'
import { Commands, VideoFormat } from 'hyperdeck-connection'
import type { InstanceBaseExt } from '../types.js'
import type { ModelChoices } from '../choices/index.js'

export type SlotActions = {
	select: { options: { slot: 'unchanged' | number; format: 'unchanged' | string } }
}

export function createSlotActions(
	self: InstanceBaseExt,
	modelChoices: ModelChoices,
): CompanionActionDefinitions<SlotActions> {
	if (self.config.modelID == 'bmdDup4K') {
		return {
			select: undefined,
		}
	}

	const actions: CompanionActionDefinitions<SlotActions> = {
		select: {
			name: 'Select slot or format',
			options: [
				{
					type: 'dropdown',
					label: 'Slot',
					id: 'slot',
					default: 1,
					choices: [
						{
							id: 'unchanged',
							label: 'Unchanged',
						},
						...modelChoices.Slots,
					],
				},
				{
					type: 'dropdown',
					label: 'Format',
					id: 'format',
					default: 'unchanged',
					choices: [
						{
							id: 'unchanged',
							label: 'Unchanged',
						},
						...modelChoices.VideoFormats,
					],
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.SlotSelectCommand()
				if (options.slot && options.slot !== 'unchanged') cmd.slotId = options.slot
				if (options.format && options.format !== 'unchanged') cmd.format = options.format as VideoFormat
				await self.sendCommand(cmd)

				// select will update internal cliplist so we should fetch those
				await self.refreshTransportInfo()
				await self.updateClips(true)

				self.checkAllFeedbacks()
			},
		},
	}

	return actions
}
