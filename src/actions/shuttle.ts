import type { CompanionActionDefinitions } from '@companion-module/base'
import { Regex } from '@companion-module/base'
import { Commands } from 'hyperdeck-connection'
import type { InstanceBaseExt } from '../types.js'

export type ShuttleActions = {
	shuttle: { options: { speed: number } }
	jogFwd: { options: { jogFwdTc: string } }
	jogRew: { options: { jogRewTc: string } }
}

export function createShuttleActions(self: InstanceBaseExt): CompanionActionDefinitions<ShuttleActions> {
	const maxShuttle = self.model?.maxShuttle ?? 0

	if (self.config.modelID == 'bmdDup4K') {
		return {
			shuttle: undefined,
			jogFwd: undefined,
			jogRew: undefined,
		}
	}

	const actions: CompanionActionDefinitions<ShuttleActions> = {
		jogFwd: {
			name: 'Jog forward (TC) duration',
			options: [
				{
					type: 'textinput',
					label: 'Timecode hh:mm:ss:ff',
					id: 'jogFwdTc',
					default: '00:00:00:01',
					regex: Regex.TIMECODE,
					useVariables: true,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.JogCommand()
				cmd.timecode = `+${options.jogFwdTc}`
				await self.sendCommand(cmd)
			},
		},
		jogRew: {
			name: 'Jog backward (TC) duration',
			options: [
				{
					type: 'textinput',
					label: 'Timecode hh:mm:ss:ff',
					id: 'jogRewTc',
					default: '00:00:00:01',
					regex: Regex.TIMECODE,
					useVariables: true,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.JogCommand()
				cmd.timecode = `-${options.jogRewTc}`
				await self.sendCommand(cmd)
			},
		},
		shuttle: {
			name: 'Shuttle with speed',
			options: [
				{
					type: 'number',
					label: 'Speed %',
					id: 'speed',
					default: 100,
					min: 0 - maxShuttle,
					max: maxShuttle,
					range: true,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.ShuttleCommand()
				cmd.speed = options.speed
				await self.sendCommand(cmd)
			},
		},
	}

	return actions
}
