
// v1.0.* -> v1.1.0 (combine old play actions)
module.exports.upgradeCombineOldPlayActions = function (context, config, actions, feedbacks) {
    var changed = false

    let upgradePass = function (action, changed) {
        if (action.options === undefined) {
            action.options = {}
        }

        switch (action.action) {
            case 'vplay':
                action.options.speed = opt.speed
                action.options.loop = false
                action.options.single = false
                action.action = 'play'
                changed = true
                break
            case 'vplaysingle':
                action.options.speed = opt.speed
                action.options.loop = false
                action.options.single = true
                action.action = 'play'
                changed = true
                break
            case 'vplayloop':
                action.options.speed = opt.speed
                action.options.loop = true
                action.options.single = false
                action.action = 'play'
                changed = true
                break
            case 'playSingle':
                action.options.speed = 100
                action.options.loop = false
                action.options.single = true
                action.action = 'play'
                changed = true
                break
            case 'playLoop':
                action.options.speed = 100
                action.options.loop = true
                action.options.single = false
                action.action = 'play'
                changed = true
                break
            case 'play':
                if (action.options.speed === undefined) {
                    action.options.speed = 100
                    changed = true
                }
                if (action.options.loop === undefined) {
                    action.options.loop = false
                    changed = true
                }
                if (action.options.single === undefined) {
                    action.options.single = false
                    changed = true
                }
                break
        }

        return changed
    }

    for (var k in actions) {
        changed = upgradePass(actions[k], changed)
    }

    return changed
}

// v1.1.0 -> v1.2.0 (timecode notifications)
module.exports.upgradeTimecodeNotifications = function (context, config, actions, feedbacks) {
    let changed = false

    if (config) {
        if (config.pollingOn !== undefined) {
            if (config.pollingOn) {
                config.timecodeVariables = 'polling'
            } else {
                config.timecodeVariables = 'disabled'
            }
            delete config.pollingOn
            changed = true
        }
    }

    return changed
}