import {
	CompanionMigrationOptionValues,
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
	FixupNumericOrVariablesValueToExpressions,
} from '@companion-module/base'
import type { HyperdeckConfig } from '../config.js'

// Actions that used to have a separate `<value>`/`<value>Var` field pair plus a
// `useVariable` toggle. With auto-expression enabled these collapse into a single
// expression-capable field (`valueField`).
const COMBINE_USEVARIABLE_ACTIONS: Record<string, { valueField: string; varField: string }> = {
	gotoN: { valueField: 'clip', varField: 'clipVar' },
	goFwd: { valueField: 'clip', varField: 'clipVar' },
	goRew: { valueField: 'clip', varField: 'clipVar' },
	play: { valueField: 'speed', varField: 'speedVar' },
	shuttle: { valueField: 'speed', varField: 'speedVar' },
}

// Combine the old `<value>` + `<value>Var` + `useVariable` option trio into a single
// expression-capable field, preserving the previous behaviour.
function upgradeCombineUseVariableFields(
	_context: CompanionUpgradeContext<HyperdeckConfig>,
	props: CompanionStaticUpgradeProps<HyperdeckConfig, undefined>,
): CompanionStaticUpgradeResult<HyperdeckConfig, undefined> {
	const changes: CompanionStaticUpgradeResult<HyperdeckConfig, undefined> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		const mapping = COMBINE_USEVARIABLE_ACTIONS[action.actionId]
		if (!mapping) continue

		const options = action.options
		// Only touch old-shape actions (idempotent: skip already-migrated ones)
		if (options[mapping.varField] === undefined && options.useVariable === undefined) continue

		const useVariable =
			options.useVariable && !options.useVariable.isExpression ? Boolean(options.useVariable.value) : false

		const source = useVariable ? options[mapping.varField] : options[mapping.valueField]
		const fixed = FixupNumericOrVariablesValueToExpressions(source)
		if (fixed) options[mapping.valueField] = fixed

		delete options[mapping.varField]
		delete options.useVariable

		changes.updatedActions.push(action)
	}

	return changes
}

// Dropdown options that historically used boolean choice ids and so could be stored
// as actual booleans (or a mix of booleans and strings). Dropdowns only support
// string/number ids, so these are now string dropdowns ('true'/'false'); normalise any
// stored boolean values back to the matching 'true'/'false' strings.
const BOOLEAN_DROPDOWN_ACTION_OPTIONS: Record<string, string[]> = {
	remote: ['remoteEnable'],
}
const BOOLEAN_DROPDOWN_FEEDBACK_OPTIONS: Record<string, string[]> = {
	remote_status: ['status'],
	transport_loop: ['setting'],
	transport_singleClip: ['setting'],
}

// Convert a stored boolean value into the matching 'true'/'false' string. Leaves anything
// else (existing strings like 'true'/'toggle') and expressions untouched. Returns true if changed.
function coerceBooleanToTrueFalseString(options: CompanionMigrationOptionValues, key: string): boolean {
	const opt = options[key]
	if (!opt || opt.isExpression) return false
	if (opt.value === true) {
		options[key] = { isExpression: false, value: 'true' }
		return true
	}
	if (opt.value === false) {
		options[key] = { isExpression: false, value: 'false' }
		return true
	}
	return false
}

function upgradeBooleanDropdownValues(
	_context: CompanionUpgradeContext<HyperdeckConfig>,
	props: CompanionStaticUpgradeProps<HyperdeckConfig, undefined>,
): CompanionStaticUpgradeResult<HyperdeckConfig, undefined> {
	const changes: CompanionStaticUpgradeResult<HyperdeckConfig, undefined> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		const keys = BOOLEAN_DROPDOWN_ACTION_OPTIONS[action.actionId]
		if (!keys) continue
		let changed = false
		for (const key of keys) changed = coerceBooleanToTrueFalseString(action.options, key) || changed
		if (changed) changes.updatedActions.push(action)
	}

	for (const feedback of props.feedbacks) {
		const keys = BOOLEAN_DROPDOWN_FEEDBACK_OPTIONS[feedback.feedbackId]
		if (!keys) continue
		let changed = false
		for (const key of keys) changed = coerceBooleanToTrueFalseString(feedback.options, key) || changed
		if (changed) changes.updatedFeedbacks.push(feedback)
	}

	return changes
}

// Feedback options that were numeric textinputs (with useVariables) and are now expression-capable
// number fields. Stored values may be numeric strings or variable references.
const NUMERIC_FIELD_FEEDBACK_OPTIONS: Record<string, string[]> = {
	slot_status: ['slotId'],
	transport_clip: ['clipID'],
	transport_slot: ['setting'],
}

// Apply the numeric/variable -> expression fixup. Returns true if the value meaningfully changed.
function fixupNumericFieldOption(options: CompanionMigrationOptionValues, key: string): boolean {
	const original = options[key]
	if (!original) return false
	const fixed = FixupNumericOrVariablesValueToExpressions(original)
	if (!fixed || (fixed.isExpression === original.isExpression && fixed.value === original.value)) return false
	options[key] = fixed
	return true
}

function upgradeNumericTextinputFields(
	_context: CompanionUpgradeContext<HyperdeckConfig>,
	props: CompanionStaticUpgradeProps<HyperdeckConfig, undefined>,
): CompanionStaticUpgradeResult<HyperdeckConfig, undefined> {
	const changes: CompanionStaticUpgradeResult<HyperdeckConfig, undefined> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	for (const feedback of props.feedbacks) {
		const keys = NUMERIC_FIELD_FEEDBACK_OPTIONS[feedback.feedbackId]
		if (!keys) continue
		let changed = false
		for (const key of keys) changed = fixupNumericFieldOption(feedback.options, key) || changed
		if (changed) changes.updatedFeedbacks.push(feedback)
	}

	return changes
}

export const v3UpgradeScripts: CompanionStaticUpgradeScript<HyperdeckConfig>[] = [
	upgradeCombineUseVariableFields,
	upgradeBooleanDropdownValues,
	upgradeNumericTextinputFields,
]
