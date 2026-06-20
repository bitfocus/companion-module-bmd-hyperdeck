import type { CompanionActionDefinitions } from '@companion-module/base'
import { Regex } from '@companion-module/base'
import { Commands } from 'hyperdeck-connection'
import type { InstanceBaseExt, ClipDropdownChoice } from '../types.js'
import { CHOICES_STARTEND } from '../choices/index.js'
import { stripExtension } from '../util.js'

export type NavigationActions = {
	goto: { options: { tc: string } }
	gotoN: { options: { clip: number } }
	gotoName: { options: { clip: string } }
	goFwd: { options: { clip: number } }
	goRew: { options: { clip: number } }
	goStartEnd: { options: { startEnd: string } }
}

export function createNavigationActions(
	self: InstanceBaseExt,
	clipChoices: ClipDropdownChoice[],
): CompanionActionDefinitions<NavigationActions> {
	if (self.config.modelID == 'bmdDup4K') {
		return {
			goto: undefined,
			gotoN: undefined,
			gotoName: undefined,
			goFwd: undefined,
			goRew: undefined,
			goStartEnd: undefined,
		}
	}

	const actions: CompanionActionDefinitions<NavigationActions> = {
		goto: {
			name: 'Goto (TC)',
			options: [
				{
					type: 'textinput',
					label: 'Timecode hh:mm:ss:ff',
					id: 'tc',
					default: '00:00:01:00',
					regex: Regex.TIMECODE,
					useVariables: true,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.GoToCommand()
				cmd.timecode = options.tc
				await self.sendCommand(cmd)
			},
		},
		gotoN: {
			name: 'Goto Clip (n)',
			options: [
				{
					type: 'number',
					label: 'Clip Number',
					id: 'clip',
					default: 1,
					min: 1,
					max: 999,
					range: false,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.GoToCommand()
				cmd.clipId = options.clip
				await self.sendCommand(cmd)
			},
		},
		gotoName: {
			name: 'Goto Clip (name)',
			options: [
				{
					type: 'dropdown',
					label: 'Clip Name',
					id: 'clip',
					default: '',
					choices: clipChoices,
					minChoicesForSearch: 0,
					allowCustom: true,
				},
			],
			callback: async ({ options }) => {
				await self.updateClips()

				const parsed = stripExtension(options.clip.trim())

				const clip = self.simpleClipsList.find((clip) => stripExtension(clip.name) === parsed)
				if (!clip) {
					self.log('info', `Clip "${options.clip}" does not exist`)
				} else {
					const cmd = new Commands.GoToCommand()
					cmd.clipId = clip.clipId
					await self.sendCommand(cmd)
				}
			},
		},
		goFwd: {
			name: 'Go forward (n) clips',
			options: [
				{
					type: 'number',
					label: 'Number of clips',
					id: 'clip',
					default: 1,
					min: 1,
					max: 999,
					range: false,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.GoToCommand()
				cmd.clipId = `+${options.clip}`
				await self.sendCommand(cmd)
			},
		},
		goRew: {
			name: 'Go backward (n) clips',
			options: [
				{
					type: 'number',
					label: 'Number of clips',
					id: 'clip',
					default: 1,
					min: 1,
					max: 999,
					range: false,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.GoToCommand()
				cmd.clipId = `-${options.clip}`
				await self.sendCommand(cmd)
			},
		},
		goStartEnd: {
			name: 'Go to (start|end) of clip',
			options: [
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Go to',
					id: 'startEnd',
					default: 'start',
					choices: CHOICES_STARTEND,
				},
			],
			callback: async ({ options }) => {
				const cmd = new Commands.GoToCommand()
				cmd.clip = options.startEnd as any
				await self.sendCommand(cmd)
			},
		},
	}

	return actions
}
