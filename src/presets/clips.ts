import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { HyperdeckSchema } from '../schema.js'
import { InstanceBaseExt } from '../types.js'
import { stripExtension } from '../util.js'
import { colors } from './colors.js'

export function clipPresets(
	self: InstanceBaseExt,
): [CompanionPresetSection<HyperdeckSchema>, CompanionPresetDefinitions<HyperdeckSchema>] {
	const presets: CompanionPresetDefinitions<HyperdeckSchema> = {}

	// Template for loading a clip by its index. The `clipIndex` local variable is
	// substituted per generated button, so only this one definition needs updating.
	presets.loadClipByIndex = {
		type: 'simple',
		name: 'Load clip (by index)',
		style: {
			// Look up the clip name from the index held in the local variable
			text: 'Clip $(local:clipIndex)\n$(hyperdeck:clip$(local:clipIndex)_name)',
			size: '14',
			color: colors.white,
			bgcolor: colors.black,
		},
		localVariables: [
			{
				variableName: 'clipIndex',
				variableType: 'simple',
				startupValue: 1,
			},
		],
		feedbacks: [
			{
				feedbackId: 'transport_clip',
				options: {
					clipID: { isExpression: true, value: '$(local:clipIndex)' },
					slotID: 'either',
				},
				style: {
					color: colors.white,
					bgcolor: colors.blue,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'gotoN', options: { clip: { isExpression: true, value: '$(local:clipIndex)' } } }],
				up: [],
			},
		],
	}

	// Template for loading a clip by its name. The `clipName` local variable holds
	// the clip name, which is both used for the action and shown in the button text.
	presets.loadClipByName = {
		type: 'simple',
		name: 'Load clip (by name)',
		style: {
			text: '$(local:clipName)',
			size: '14',
			color: colors.white,
			bgcolor: colors.black,
		},
		localVariables: [
			{
				variableName: 'clipName',
				variableType: 'simple',
				startupValue: '',
			},
		],
		feedbacks: [
			{
				feedbackId: 'transport_clip_name',
				options: {
					clipName: { isExpression: true, value: '$(local:clipName)' },
					slotID: 'either',
				},
				style: {
					color: colors.white,
					bgcolor: colors.blue,
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'gotoName', options: { clip: { isExpression: true, value: '$(local:clipName)' } } }],
				up: [],
			},
		],
	}

	const section: CompanionPresetSection<HyperdeckSchema> = {
		id: 'clips',
		name: 'Clips',
		definitions: [
			{
				type: 'template',
				id: 'clips_by_index',
				name: 'Load clip (by index)',
				presetId: 'loadClipByIndex',
				templateVariableName: 'clipIndex',
				templateValues: self.simpleClipsList.map(({ clipId, name }) => ({
					name: `Clip ${clipId}: ${stripExtension(name)}`,
					value: clipId,
				})),
			},
			{
				type: 'template',
				id: 'clips_by_name',
				name: 'Load clip (by name)',
				presetId: 'loadClipByName',
				templateVariableName: 'clipName',
				templateValues: self.simpleClipsList.map(({ name }) => {
					const clipName = stripExtension(name)
					return { name: clipName, value: clipName }
				}),
			},
		],
	}

	return [section, presets]
}
