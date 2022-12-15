const { CreateConvertToBooleanFeedbackUpgradeScript } = require('@companion-module/base')

module.exports.upgradeScripts = [
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
function upgradeCombineOldPlayActions(context, props) {
	const changes = {
		config: null,
		actions: [],
		feedbacks: [],
	}

	for (const action of props.actions) {
		if (action.options === undefined) {
			action.options = {}
		}

		switch (action.action) {
			case 'vplay':
				action.options.speed = opt.speed
				action.options.loop = false
				action.options.single = false
				action.action = 'play'
				changes.actions.push(action)
				break
			case 'vplaysingle':
				action.options.speed = opt.speed
				action.options.loop = false
				action.options.single = true
				action.action = 'play'
				changes.actions.push(action)
				break
			case 'vplayloop':
				action.options.speed = opt.speed
				action.options.loop = true
				action.options.single = false
				action.action = 'play'
				changes.actions.push(action)
				break
			case 'playSingle':
				action.options.speed = 100
				action.options.loop = false
				action.options.single = true
				action.action = 'play'
				changes.actions.push(action)
				break
			case 'playLoop':
				action.options.speed = 100
				action.options.loop = true
				action.options.single = false
				action.action = 'play'
				changes.actions.push(action)
				break
			case 'play':
				if (action.options.speed === undefined) {
					action.options.speed = 100
					changes.actions.push(action)
				}
				if (action.options.loop === undefined) {
					action.options.loop = false
					changes.actions.push(action)
				}
				if (action.options.single === undefined) {
					action.options.single = false
					changes.actions.push(action)
				}
				break
		}
	}

	return changes
}

// v1.1.0 -> v1.2.0 (timecode notifications)
function upgradeTimecodeNotifications(context, props) {
	const changes = {
		config: null,
		actions: [],
		feedbacks: [],
	}

	if (props.config) {
		if (props.config.pollingOn !== undefined) {
			if (props.config.pollingOn) {
				props.config.timecodeVariables = 'polling'
			} else {
				props.config.timecodeVariables = 'disabled'
			}
			delete props.config.pollingOn

			changes.config = props.config
		}
	}

	return changes
}

// v1.2.6 -> 1.2.7 (gotoClip (n) bug fix)
function upgrade126to127(context, props) {
	const changes = {
		config: null,
		actions: [],
		feedbacks: [],
	}

	for (const action of props.actions) {
		if (action.options === undefined) {
			action.options = {}
		}
		// If the clip is not a number, return early as we don't need to change it
		if (action.action === 'gotoName' && !isNaN(action.options.clip)) {
			action.action = 'gotoN'
			changes.actions.push(action)
		}
	}

	return changes
}
