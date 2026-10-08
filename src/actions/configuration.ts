import type { CompanionActionDefinitions } from '@companion-module/base'
import { Commands } from 'hyperdeck-connection'
import type { InstanceBaseExt } from '../types.js'
import { TIMECODE_REGEX } from '../util.js'
import { CHOICES_TIMECODEINPUT } from '../choices/index.js'

export type ConfigurationActions = {
	timecodeInput: { options: { input: 'external' | 'embedded' | 'preset' | 'clip' } }
	timecodePreset: { options: { timecode: string } }
}

export function createConfigurationActions(self: InstanceBaseExt): CompanionActionDefinitions<ConfigurationActions> {
	// The duplicator records continuously and does not expose the timecode configuration
	const isSupported = self.config.modelID != 'bmdDup4K'

	const actions: CompanionActionDefinitions<ConfigurationActions> = {
		timecodeInput: isSupported
			? {
					name: 'Set timecode input',
					description: 'Select where the recorded timecode comes from. Use "Preset" to record from a preset value.',
					options: [
						{
							type: 'dropdown',
							label: 'Source',
							id: 'input',
							default: 'preset',
							choices: CHOICES_TIMECODEINPUT,
						},
					],
					callback: async ({ options }) => {
						const cmd = new Commands.ConfigurationCommand()
						cmd.timecodeInput = options.input
						await self.sendCommand(cmd)
					},
				}
			: undefined,

		timecodePreset: isSupported
			? {
					name: 'Set timecode preset',
					description: 'Set the preset timecode. Only applies while the timecode input is set to "Preset".',
					options: [
						{
							type: 'textinput',
							label: 'Timecode hh:mm:ss:ff',
							id: 'timecode',
							default: '00:00:00:00',
							regex: TIMECODE_REGEX,
							useVariables: true,
						},
					],
					callback: async ({ options }) => {
						const cmd = new Commands.ConfigurationCommand()
						cmd.timecodePreset = options.timecode
						await self.sendCommand(cmd)
					},
				}
			: undefined,
	}

	return actions
}
