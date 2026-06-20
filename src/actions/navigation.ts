import type { CompanionActionDefinitions } from '@companion-module/base'
import { Regex } from '@companion-module/base'
import { Commands } from 'hyperdeck-connection'
import Timecode from 'smpte-timecode'
import type { InstanceBaseExt, ClipDropdownChoice } from '../types.js'
import { CHOICES_STARTEND } from '../choices/index.js'
import { stripExtension } from '../util.js'
import { frameRates } from '../variables/index.js'

/**
 * Reformat a user-entered goto timecode to match the deck's drop-frame mode.
 *
 * When the active video format is drop-frame (29.97/59.94), the HyperDeck interprets a
 * non-drop-frame ('HH:MM:SS:FF') goto timecode as a raw frame count and recalls a position
 * offset by the accumulated dropped frames. Sending it in drop-frame notation ('HH:MM:SS;FF')
 * with the same numbers makes the deck recall exactly the entered value. See issue #165.
 */
function normaliseGotoTimecode(self: InstanceBaseExt, tc: string): string {
	const videoFormat = self.transportInfo.videoFormat
	const frameRate = videoFormat ? frameRates[videoFormat] : undefined

	// Only drop-frame rates are affected; leave everything else exactly as entered
	if (frameRate !== 29.97 && frameRate !== 59.94) return tc

	try {
		return Timecode(tc, frameRate, true).toString()
	} catch (_e) {
		// Not a valid drop-frame timecode, send as entered
		return tc
	}
}

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
				cmd.timecode = normaliseGotoTimecode(self, options.tc)
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
