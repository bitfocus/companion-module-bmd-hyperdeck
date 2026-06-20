import type { VariablesSchema } from './variables/schema.js'
import type { HyperdeckConfig } from './config.js'
import type { HyperdeckActionsSchema } from './actions/index.js'
import type { HyperdeckFeedbacksSchema } from './feedbacks/index.js'

export type HyperdeckSchema = {
	config: HyperdeckConfig
	secrets: undefined
	actions: HyperdeckActionsSchema
	feedbacks: HyperdeckFeedbacksSchema
	variables: VariablesSchema
}
