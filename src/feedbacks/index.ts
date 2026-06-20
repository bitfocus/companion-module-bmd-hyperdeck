import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import type { InstanceBaseExt } from '../types.js'
import { createModelChoices, createClipsChoice } from '../choices/index.js'
import { createTransportFeedbacks, type TransportFeedbacks } from './transport.js'
import { createSlotFeedbacks, type SlotFeedbacks } from './slot.js'
import { createAudioFeedbacks, type AudioFeedbacks } from './audio.js'
import { createVideoFeedbacks, type VideoFeedbacks } from './video.js'
import { createFormatFeedbacks, type FormatFeedbacks } from './format.js'
import { createRemoteFeedbacks, type RemoteFeedbacks } from './remote.js'

export type HyperdeckFeedbacksSchema = TransportFeedbacks &
	SlotFeedbacks &
	AudioFeedbacks &
	VideoFeedbacks &
	FormatFeedbacks &
	RemoteFeedbacks

export function initFeedbacks(self: InstanceBaseExt): CompanionFeedbackDefinitions<HyperdeckFeedbacksSchema> {
	const modelChoices = createModelChoices(self.model)
	const clipChoices = createClipsChoice(self)

	return {
		...createTransportFeedbacks(self, modelChoices, clipChoices),
		...createSlotFeedbacks(self),
		...createAudioFeedbacks(self, modelChoices),
		...createVideoFeedbacks(self, modelChoices),
		...createFormatFeedbacks(self),
		...createRemoteFeedbacks(self),
	}
}
