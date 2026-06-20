import { CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import type { InstanceBaseExt } from '../types.js'
import { CHOICES_REMOTESTATUS } from '../choices/index.js'

export type RemoteFeedbacks = {
	remote_status: { type: 'boolean'; options: { status: 'true' | 'false' } }
}

export function createRemoteFeedbacks(self: InstanceBaseExt): CompanionFeedbackDefinitions<RemoteFeedbacks> {
	const feedbacks: CompanionFeedbackDefinitions<RemoteFeedbacks> = {
		remote_status: {
			type: 'boolean',
			name: 'Remote Status',
			description: 'Set feedback based on the remote control status',
			options: [
				{
					type: 'dropdown',
					disableAutoExpression: true,
					label: 'Status',
					id: 'status',
					default: CHOICES_REMOTESTATUS[0].id,
					choices: CHOICES_REMOTESTATUS,
				},
			],
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 255),
			},
			callback: ({ options }) => {
				self.log('debug', `FEEDBACK: ${options.status} ${self.remoteInfo}`)
				return (options.status === 'true') === self.remoteInfo?.['enabled']
			},
		},
	}

	return feedbacks
}
