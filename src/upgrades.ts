import {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
	CreateConvertToBooleanFeedbackUpgradeScript,
} from '@companion-module/base'
import { HyperdeckConfig } from './config.js'

export const upgradeScripts: CompanionStaticUpgradeScript<HyperdeckConfig>[] = [
	upgradeCombineOldPlayActions,
	upgradeTimecodeNotifications,
	upgrade126to127,
	CreateConvertToBooleanFeedbackUpgradeScript({
		transport_status: true,
		transport_clip: true,
		transport_slot: true,
		slot_status: true,
		transport_loop: true,
		transport_singleClip: true,
		video_input: true,
		audio_input: true,
		format_ready: true,
	}),
]

// v1.0.* -> v1.1.0 (combine old play actions)
function upgradeCombineOldPlayActions(
	_context: CompanionUpgradeContext<HyperdeckConfig>,
	props: CompanionStaticUpgradeProps<HyperdeckConfig>
): CompanionStaticUpgradeResult<HyperdeckConfig> {
	const changes: CompanionStaticUpgradeResult<HyperdeckConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		if (!action.options) action.options = {}

		switch (action.actionId) {
			case 'vplay':
				action.options.loop = false
				action.options.single = false
				action.actionId = 'play'
				changes.updatedActions.push(action)
				break
			case 'vplaysingle':
				action.options.loop = false
				action.options.single = true
				action.actionId = 'play'
				changes.updatedActions.push(action)
				break
			case 'vplayloop':
				action.options.loop = true
				action.options.single = false
				action.actionId = 'play'
				changes.updatedActions.push(action)
				break
			case 'playSingle':
				action.options.speed = 100
				action.options.loop = false
				action.options.single = true
				action.actionId = 'play'
				changes.updatedActions.push(action)
				break
			case 'playLoop':
				action.options.speed = 100
				action.options.loop = true
				action.options.single = false
				action.actionId = 'play'
				changes.updatedActions.push(action)
				break
			case 'play':
				if (action.options.speed === undefined) {
					action.options.speed = 100
					changes.updatedActions.push(action)
				}
				if (action.options.loop === undefined) {
					action.options.loop = false
					changes.updatedActions.push(action)
				}
				if (action.options.single === undefined) {
					action.options.single = false
					changes.updatedActions.push(action)
				}
				break
		}
	}

	return changes
}

// v1.1.0 -> v1.2.0 (timecode notifications)
function upgradeTimecodeNotifications(
	_context: CompanionUpgradeContext<HyperdeckConfig>,
	props: CompanionStaticUpgradeProps<HyperdeckConfig>
): CompanionStaticUpgradeResult<HyperdeckConfig> {
	const changes: CompanionStaticUpgradeResult<HyperdeckConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	if (props.config) {
		const config: HyperdeckConfig & { pollingOn?: boolean } = props.config
		if (config.pollingOn !== undefined) {
			if (config.pollingOn) {
				config.timecodeVariables = 'polling'
			} else {
				config.timecodeVariables = 'disabled'
			}
			delete config.pollingOn

			changes.updatedConfig = config
		}
	}

	return changes
}

// v1.2.6 -> 1.2.7 (gotoClip (n) bug fix)
function upgrade126to127(
	_context: CompanionUpgradeContext<HyperdeckConfig>,
	props: CompanionStaticUpgradeProps<HyperdeckConfig>
): CompanionStaticUpgradeResult<HyperdeckConfig> {
	const changes: CompanionStaticUpgradeResult<HyperdeckConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		if (action.options === undefined) {
			action.options = {}
		}
		// If the clip is not a number, return early as we don't need to change it
		if (action.actionId === 'gotoName' && !isNaN(action.options.clip as any)) {
			action.actionId = 'gotoN'
			changes.updatedActions.push(action)
		}
	}

	return changes
}
