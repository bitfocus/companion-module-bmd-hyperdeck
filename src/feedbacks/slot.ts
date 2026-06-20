import { CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import type { InstanceBaseExt } from '../types.js'
import { CHOICES_SLOTSTATUS } from '../choices/index.js'

export type SlotFeedbacks = {
	slot_status: { type: 'boolean'; options: { status: string; slotId: number } }
}

export function createSlotFeedbacks(self: InstanceBaseExt): CompanionFeedbackDefinitions<SlotFeedbacks> {
	const feedbacks: CompanionFeedbackDefinitions<SlotFeedbacks> = {
		slot_status: {
			type: 'boolean',
			name: 'Slot/disk status',
			description: 'Set feedback based on disk status',
			options: [
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Disk Status',
					id: 'status',
					choices: CHOICES_SLOTSTATUS,
					default: CHOICES_SLOTSTATUS[0].id,
				},
				{
					type: 'number',
					label: 'Slot Id',
					id: 'slotId',
					default: 1,
					min: 1,
					max: 100,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			callback: async ({ options }) => {
				const slot = self.slotInfo[options.slotId]
				return !!slot && slot.status === options.status
			},
		},
	}

	return feedbacks
}
