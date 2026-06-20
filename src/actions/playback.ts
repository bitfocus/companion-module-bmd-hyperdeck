import type { CompanionActionDefinitions } from '@companion-module/base'
import { Regex } from '@companion-module/base'
import { Commands } from 'hyperdeck-connection'
import type { InstanceBaseExt } from '../types.js'

export type PlaybackActions = {
	play: {
		options: {
			speed: number
			loop: boolean
			single: boolean
		}
	}
	stop: { options: Record<string, never> }
	playStopToggle: { options: Record<string, never> }
	playrangeSet: { options: { in: string; out: string } }
	playrangeClear: { options: Record<string, never> }
}

export function createPlaybackActions(self: InstanceBaseExt): CompanionActionDefinitions<PlaybackActions> {
	const maxShuttle = self.model?.maxShuttle ?? 0

	const actions: CompanionActionDefinitions<PlaybackActions> = {
		play:
			self.config.modelID != 'bmdDup4K'
				? {
						name: 'Play',
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
							{
								type: 'checkbox',
								label: 'Loop clip',
								id: 'loop',
								default: false,
							},
							{
								type: 'checkbox',
								label: 'Single clip playback',
								id: 'single',
								default: false,
							},
						],
						callback: async ({ options }) => {
							const cmd = new Commands.PlayCommand()
							cmd.speed = String(options.speed)
							cmd.loop = options.loop
							cmd.singleClip = options.single
							await self.sendCommand(cmd)
						},
					}
				: undefined,

		stop: {
			name: 'Stop',
			options: [],
			callback: async () => {
				const cmd = new Commands.StopCommand()
				await self.sendCommand(cmd)
			},
		},
		playrangeSet:
			self.config.modelID != 'bmdDup4K'
				? {
						name: 'Play range - set (in/out)',
						options: [
							{
								type: 'textinput',
								label: 'In (timecode hh:mm:ss:ff)',
								id: 'in',
								default: '00:00:00:00',
								regex: Regex.TIMECODE,
								useVariables: true,
							},
							{
								type: 'textinput',
								label: 'Out (timecode hh:mm:ss:ff)',
								id: 'out',
								default: '00:00:10:00',
								regex: Regex.TIMECODE,
								useVariables: true,
							},
						],
						callback: async ({ options }) => {
							const cmd = new Commands.PlayrangeSetCommand()
							cmd.in = options.in
							cmd.out = options.out
							await self.sendCommand(cmd)
						},
					}
				: undefined,
		playrangeClear:
			self.config.modelID != 'bmdDup4K'
				? {
						name: 'Play range - clear',
						options: [],
						callback: async () => {
							const cmd = new Commands.PlayrangeClearCommand()
							await self.sendCommand(cmd)
						},
					}
				: undefined,
		playStopToggle: {
			name: 'Play/Stop Toggle',
			description: 'Toggle between Play and Stop based on current transport status',
			options: [],
			callback: async () => {
				try {
					if (self.transportInfo.status === 'play') {
						// Currently playing, so stop
						const cmd = new Commands.StopCommand()
						await self.sendCommand(cmd)
					} else {
						// Not playing, so start playing
						const cmd = new Commands.PlayCommand()
						cmd.speed = '100'
						cmd.loop = false
						cmd.singleClip = false
						await self.sendCommand(cmd)
					}
				} catch (error: any) {
					if (error.message && error.message.includes('108')) {
						self.log('warn', 'Internal error: HyperDeck may be busy or in an invalid state. Try again in a moment.')
					} else {
						self.log('error', `Play/Stop toggle failed: ${error.message || error}`)
					}
				}
			},
		},
	}

	return actions
}
