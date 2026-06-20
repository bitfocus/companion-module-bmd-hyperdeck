import type { CompanionActionDefinitions } from '@companion-module/base'
import { Commands } from 'hyperdeck-connection'
import type { InstanceBaseExt } from '../types.js'
import { CHOICES_REMOTECONTROL } from '../choices/index.js'
import { updateRemoteVariable } from '../variables/index.js'
import type { VariablesSchema } from '../variables/schema.js'

export type RemoteActions = {
	remote: { options: { remoteEnable: string } }
}

export function createRemoteActions(self: InstanceBaseExt): CompanionActionDefinitions<RemoteActions> {
	const actions: CompanionActionDefinitions<RemoteActions> = {
		remote: {
			name: 'Remote Control (enable/disable)',
			options: [
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Enable/Disable',
					id: 'remoteEnable',
					default: 'toggle',
					choices: CHOICES_REMOTECONTROL,
				},
			],
			callback: async ({ options }) => {
				let setRemote = true
				if (options.remoteEnable === 'toggle') {
					setRemote = !self.remoteInfo?.enabled
				} else {
					setRemote = options.remoteEnable === 'true'
				}

				const cmd = new Commands.RemoteCommand()
				cmd.enable = setRemote

				await self.sendCommand(cmd)

				const newVariables: Partial<VariablesSchema> = {}
				updateRemoteVariable(self, newVariables)
				self.setVariableValues(newVariables)
				self.checkFeedbacks('remote_status')
			},
		},
	}

	return actions
}
