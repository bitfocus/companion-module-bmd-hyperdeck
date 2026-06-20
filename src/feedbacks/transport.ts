import { CompanionFeedbackDefinitions, Regex, combineRgb } from '@companion-module/base'
import type { InstanceBaseExt, ClipDropdownChoice } from '../types.js'
import { CHOICES_TRANSPORTSTATUS, CHOICES_ENABLEDISABLE } from '../choices/index.js'
import type { ModelChoices } from '../choices/index.js'

export type TransportFeedbacks = {
	transport_status: { type: 'boolean'; options: { status: string } }
	transport_clip: { type: 'boolean'; options: { clipID: number; slotID: string } }
	transport_clip_name: { type: 'boolean'; options: { clipName: string; slotID: string } }
	transport_slot: { type: 'boolean'; options: { setting: number } }
	transport_loop: { type: 'boolean'; options: { setting: string } }
	transport_singleClip: { type: 'boolean'; options: { setting: string } }
}

export function createTransportFeedbacks(
	self: InstanceBaseExt,
	modelChoices: ModelChoices,
	clipChoices: ClipDropdownChoice[],
): CompanionFeedbackDefinitions<TransportFeedbacks> {
	const feedbacks: CompanionFeedbackDefinitions<TransportFeedbacks> = {
		transport_status: {
			type: 'boolean',
			name: 'Transport status',
			description: 'Set feedback based on transport status',
			options: [
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Transport Status',
					id: 'status',
					choices: CHOICES_TRANSPORTSTATUS,
					default: CHOICES_TRANSPORTSTATUS[0].id,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			callback: ({ options }) => {
				return options.status === self.transportInfo.status
			},
		},
		transport_clip: {
			type: 'boolean',
			name: 'Active clip',
			description: 'Set feedback based on the which clip is active',
			options: [
				{
					type: 'number',
					label: 'Clip Id',
					id: 'clipID',
					default: 1,
					min: 1,
					max: 999,
				},
				{
					type: 'dropdown',
					label: 'Slot Id',
					id: 'slotID',
					choices: [{ id: 'either', label: 'Any' }, ...modelChoices.Slots],
					default: 'either',
					regex: Regex.SOMETHING,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			callback: ({ options }) => {
				return (
					(options.slotID == 'either' && options.clipID == self.transportInfo.clipId) ||
					(Number(options.slotID) == self.transportInfo.slotId && options.clipID == self.transportInfo.clipId)
				)
			},
		},
		transport_clip_name: {
			type: 'boolean',
			name: 'Active Clip (name)',
			description: 'Set feedback based on the name of the active clip',
			options: [
				{
					type: 'dropdown',
					label: 'Clip Name',
					id: 'clipName',
					default: '',
					choices: clipChoices,
					minChoicesForSearch: 0,
					allowCustom: true,
				},
				{
					type: 'dropdown',
					label: 'Slot Id',
					id: 'slotID',
					choices: [{ id: 'either', label: 'Any' }, ...modelChoices.Slots],
					default: 'either',
					regex: Regex.SOMETHING,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			callback: ({ options }) => {
				return (
					(options.slotID == 'either' && options.clipName == self.transportInfo.clipName) ||
					(Number(options.slotID) == self.transportInfo.slotId && options.clipName == self.transportInfo.clipName)
				)
			},
		},
		transport_slot: {
			type: 'boolean',
			name: 'Active slot',
			description: 'Set feedback based on the which slot is active',
			options: [
				{
					type: 'number',
					label: 'Slot Id',
					id: 'setting',
					default: 1,
					min: 1,
					max: 100,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			callback: ({ options }) => {
				return options.setting == self.transportInfo.slotId
			},
		},
		transport_loop: {
			type: 'boolean',
			name: 'Loop playback',
			description: 'Set feedback based on the loop status',
			options: [
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Loop',
					id: 'setting',
					choices: CHOICES_ENABLEDISABLE,
					default: CHOICES_ENABLEDISABLE[0].id,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			callback: ({ options }) => {
				return (options.setting === 'true') === self.transportInfo.loop
			},
		},
		transport_singleClip: {
			type: 'boolean',
			name: 'Single clip playback',
			description: 'Set feedback for single clip playback',
			options: [
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Single clip',
					id: 'setting',
					choices: CHOICES_ENABLEDISABLE,
					default: CHOICES_ENABLEDISABLE[0].id,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			callback: ({ options }) => {
				return (options.setting === 'true') === self.transportInfo.singleClip
			},
		},
	}

	return feedbacks
}
