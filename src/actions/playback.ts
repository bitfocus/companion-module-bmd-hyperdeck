import type { CompanionActionDefinitions } from '@companion-module/base'
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
