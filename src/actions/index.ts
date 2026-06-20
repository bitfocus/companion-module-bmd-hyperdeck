import type { CompanionActionDefinitions } from '@companion-module/base'
import type { InstanceBaseExt } from '../types.js'
import { createModelChoices, createClipsChoice } from '../choices/index.js'
import { createPlaybackActions, type PlaybackActions } from './playback.js'
import { createNavigationActions, type NavigationActions } from './navigation.js'
import { createShuttleActions, type ShuttleActions } from './shuttle.js'
import { createRecordActions, type RecordActions } from './record.js'
import { createSlotActions, type SlotActions } from './slot.js'
import { createAudioActions, type AudioActions } from './audio.js'
import { createVideoActions, type VideoActions } from './video.js'
import { createFormatActions, type FormatActions } from './format.js'
import { createRemoteActions, type RemoteActions } from './remote.js'
import { createClipsActions, type ClipsActions } from './clips.js'

export type HyperdeckActionsSchema = PlaybackActions &
	NavigationActions &
	ShuttleActions &
	RecordActions &
	SlotActions &
	AudioActions &
	VideoActions &
	FormatActions &
	RemoteActions &
	ClipsActions

export function initActions(self: InstanceBaseExt): CompanionActionDefinitions<HyperdeckActionsSchema> {
	const modelChoices = createModelChoices(self.model)
	const clipChoices = createClipsChoice(self)

	return {
		...createPlaybackActions(self),
		...createNavigationActions(self, clipChoices),
		...createShuttleActions(self),
		...createRecordActions(self, modelChoices),
		...createSlotActions(self, modelChoices),
		...createAudioActions(self, modelChoices),
		...createVideoActions(self, modelChoices),
		...createFormatActions(self, modelChoices),
		...createRemoteActions(self),
		...createClipsActions(self),
	}
}
