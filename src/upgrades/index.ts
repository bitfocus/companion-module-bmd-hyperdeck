import {
	CompanionMigrationOptionValues,
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
	CreateConvertToBooleanFeedbackUpgradeScript,
	JsonValue,
} from '@companion-module/base'
import { HyperdeckConfig } from '../config.js'
import { v3UpgradeScripts } from './v3-0.js'

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
	upgradeAddFormatToSelectSlot,
	...v3UpgradeScripts,
]

/**
 * Set an option to a literal (non-expression) value.
 * Since base v2.0, option values are wrapped as `{ isExpression, value }`.
 */
function setOptionValue(options: CompanionMigrationOptionValues, key: string, value: JsonValue): void {
	options[key] = { isExpression: false, value }
}

/**
 * Read an option's literal value, or `undefined` if it is unset or an expression.
 */
function getOptionValue(options: CompanionMigrationOptionValues, key: string): JsonValue | undefined {
	const option = options[key]
	if (option === undefined || option.isExpression) return undefined
	return option.value
}

// v1.0.* -> v1.1.0 (combine old play actions)
function upgradeCombineOldPlayActions(
	_context: CompanionUpgradeContext<HyperdeckConfig>,
	props: CompanionStaticUpgradeProps<HyperdeckConfig, undefined>,
): CompanionStaticUpgradeResult<HyperdeckConfig, undefined> {
	const changes: CompanionStaticUpgradeResult<HyperdeckConfig, undefined> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		switch (action.actionId) {
			case 'vplay':
				setOptionValue(action.options, 'loop', false)
				setOptionValue(action.options, 'single', false)
				action.actionId = 'play'
				changes.updatedActions.push(action)
				break
			case 'vplaysingle':
				setOptionValue(action.options, 'loop', false)
				setOptionValue(action.options, 'single', true)
				action.actionId = 'play'
				changes.updatedActions.push(action)
				break
			case 'vplayloop':
				setOptionValue(action.options, 'loop', true)
				setOptionValue(action.options, 'single', false)
				action.actionId = 'play'
				changes.updatedActions.push(action)
				break
			case 'playSingle':
				setOptionValue(action.options, 'speed', 100)
				setOptionValue(action.options, 'loop', false)
				setOptionValue(action.options, 'single', true)
				action.actionId = 'play'
				changes.updatedActions.push(action)
				break
			case 'playLoop':
				setOptionValue(action.options, 'speed', 100)
				setOptionValue(action.options, 'loop', true)
				setOptionValue(action.options, 'single', false)
				action.actionId = 'play'
				changes.updatedActions.push(action)
				break
			case 'play': {
				let changed = false
				if (action.options.speed === undefined) {
					setOptionValue(action.options, 'speed', 100)
					changed = true
				}
				if (action.options.loop === undefined) {
					setOptionValue(action.options, 'loop', false)
					changed = true
				}
				if (action.options.single === undefined) {
					setOptionValue(action.options, 'single', false)
					changed = true
				}
				if (changed) changes.updatedActions.push(action)
				break
			}
		}
	}

	return changes
}

// v1.1.0 -> v1.2.0 (timecode notifications)
function upgradeTimecodeNotifications(
	_context: CompanionUpgradeContext<HyperdeckConfig>,
	props: CompanionStaticUpgradeProps<HyperdeckConfig, undefined>,
): CompanionStaticUpgradeResult<HyperdeckConfig, undefined> {
	const changes: CompanionStaticUpgradeResult<HyperdeckConfig, undefined> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	if (props.config) {
		const config: HyperdeckConfig & { pollingOn?: boolean } = props.config
		if (config.pollingOn !== undefined) {
			config.timecodeVariables = config.pollingOn ? 'polling' : 'disabled'
			delete config.pollingOn

			changes.updatedConfig = config
		}
	}

	return changes
}

// v1.2.6 -> 1.2.7 (gotoClip (n) bug fix)
function upgrade126to127(
	_context: CompanionUpgradeContext<HyperdeckConfig>,
	props: CompanionStaticUpgradeProps<HyperdeckConfig, undefined>,
): CompanionStaticUpgradeResult<HyperdeckConfig, undefined> {
	const changes: CompanionStaticUpgradeResult<HyperdeckConfig, undefined> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		if (action.actionId !== 'gotoName') continue

		// If the clip is a plain number, switch to the numeric goto action
		const clip = getOptionValue(action.options, 'clip')
		if (clip !== undefined && !isNaN(Number(clip))) {
			action.actionId = 'gotoN'
			changes.updatedActions.push(action)
		}
	}

	return changes
}

function upgradeAddFormatToSelectSlot(
	_context: CompanionUpgradeContext<HyperdeckConfig>,
	props: CompanionStaticUpgradeProps<HyperdeckConfig, undefined>,
): CompanionStaticUpgradeResult<HyperdeckConfig, undefined> {
	const changes: CompanionStaticUpgradeResult<HyperdeckConfig, undefined> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		if (action.actionId === 'select' && action.options.format === undefined) {
			setOptionValue(action.options, 'format', 'unchanged')
			changes.updatedActions.push(action)
		}
	}

	return changes
}
