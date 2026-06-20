import type { CompanionActionDefinitions } from '@companion-module/base'
import type { InstanceBaseExt } from '../types.js'

export type ClipsActions = {
	fetchClips: { options: Record<string, never> }
}

export function createClipsActions(self: InstanceBaseExt): CompanionActionDefinitions<ClipsActions> {
	const actions: CompanionActionDefinitions<ClipsActions> = {
		fetchClips: {
			name: 'Fetch Clips',
			options: [],
			callback: async () => {
				await self.updateClips(true)
			},
		},
	}

	return actions
}
