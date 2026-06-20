import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { HyperdeckSchema } from '../schema.js'
import { InstanceBaseExt } from '../types.js'
import { createModelChoices } from '../choices/index.js'
import { colors } from './colors.js'

export function videoFormatPresets(
	self: InstanceBaseExt,
): [CompanionPresetSection<HyperdeckSchema>, CompanionPresetDefinitions<HyperdeckSchema>] {
	const presets: CompanionPresetDefinitions<HyperdeckSchema> = {}

	// The 'select' action these presets use is not available on this model
	if (self.config.modelID === 'bmdDup4K') {
		return [{ id: 'video_formats', name: 'Video Formats', definitions: [] }, presets]
	}

	const modelChoices = createModelChoices(self.model)

	// Template for setting the active video format. The `format` local variable is
	// substituted per generated button, so only this one definition needs updating.
	presets.setVideoFormat = {
		type: 'simple',
		name: 'Set video format',
		style: {
			text: 'Format\n$(local:format)',
			size: '14',
			color: colors.white,
			bgcolor: colors.black,
		},
		localVariables: [
			{
				variableName: 'format',
				variableType: 'simple',
				startupValue: modelChoices.VideoFormats[0]?.id ?? '',
			},
		],
		feedbacks: [
			{
				// Highlight when this is the active video format
				feedbackId: 'video_format',
				options: { format: { isExpression: true, value: '$(local:format)' } },
				style: {
					color: colors.white,
					bgcolor: colors.blue,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'select',
						options: { slot: 'unchanged', format: { isExpression: true, value: '$(local:format)' } },
					},
				],
				up: [],
			},
		],
	}

	const section: CompanionPresetSection<HyperdeckSchema> = {
		id: 'video_formats',
		name: 'Video Formats',
		definitions: [
			{
				type: 'template',
				id: 'set_video_format',
				name: 'Set video format',
				presetId: 'setVideoFormat',
				templateVariableName: 'format',
				templateValues: modelChoices.VideoFormats.map((choice) => ({
					name: choice.label,
					value: choice.id,
				})),
			},
		],
	}

	return [section, presets]
}

export function slotPresets(
	self: InstanceBaseExt,
): [CompanionPresetSection<HyperdeckSchema>, CompanionPresetDefinitions<HyperdeckSchema>] {
	const presets: CompanionPresetDefinitions<HyperdeckSchema> = {}

	// The 'select' action these presets use is not available on this model
	if (self.config.modelID === 'bmdDup4K') {
		return [{ id: 'slots', name: 'Slots', definitions: [] }, presets]
	}

	const modelChoices = createModelChoices(self.model)

	// Template for selecting the active slot. The `slot` local variable is
	// substituted per generated button, so only this one definition needs updating.
	presets.selectSlot = {
		type: 'simple',
		name: 'Select slot',
		style: {
			text: 'Slot\n$(local:slot)',
			size: '18',
			color: colors.white,
			bgcolor: colors.black,
		},
		localVariables: [
			{
				variableName: 'slot',
				variableType: 'simple',
				startupValue: modelChoices.Slots[0]?.id ?? 1,
			},
		],
		feedbacks: [
			{
				feedbackId: 'transport_slot',
				options: { setting: { isExpression: true, value: '$(local:slot)' } },
				style: {
					color: colors.white,
					bgcolor: colors.blue,
				},
			},
		],
		steps: [
			{
				down: [
					{
						actionId: 'select',
						options: { slot: { isExpression: true, value: '$(local:slot)' }, format: 'unchanged' },
					},
				],
				up: [],
			},
		],
	}

	const section: CompanionPresetSection<HyperdeckSchema> = {
		id: 'slots',
		name: 'Slots',
		definitions: [
			{
				type: 'template',
				id: 'select_slot',
				name: 'Select slot',
				presetId: 'selectSlot',
				templateVariableName: 'slot',
				templateValues: modelChoices.Slots.map((choice) => ({
					name: choice.label,
					value: choice.id,
				})),
			},
		],
	}

	return [section, presets]
}
