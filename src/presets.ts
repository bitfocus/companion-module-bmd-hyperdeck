import { CompanionPresetDefinitions, combineRgb } from '@companion-module/base'
import { InstanceBaseExt } from './types.js'

// Define colors for different categories
const colors = {
	white: combineRgb(255, 255, 255),
	black: combineRgb(0, 0, 0),
	red: combineRgb(255, 0, 0),
	green: combineRgb(0, 200, 0),
	blue: combineRgb(0, 80, 255),
	yellow: combineRgb(255, 255, 0),
	orange: combineRgb(255, 102, 0),
	purple: combineRgb(128, 0, 128),
	teal: combineRgb(0, 128, 128),
	lightBlue: combineRgb(0, 176, 255),
	grey: combineRgb(128, 128, 128),
	darkBlue: combineRgb(0, 0, 100),
}

export function initPresets(self: InstanceBaseExt): CompanionPresetDefinitions {
    self.log('info', 'Initializing Presets')
    
	const presets: CompanionPresetDefinitions = {}

	presets.play = {
        type: 'button',
        category: 'Transport',
        name: 'Play',
        style: {
            text: '▶\nPlay',
            size: '14',
            color: colors.white,
            bgcolor: colors.green,
        },
        feedbacks: [],
        steps: [
            {
                down: [
                    { actionId: 'play', options: { speed: 100, loop: false, single: false, useVariable: false } },
                ],
                up: [],
            },
        ],
    }
    
    presets.rec = {
        type: 'button',
        category: 'Transport',
        name: 'Record',
        style: {
            text: '●\nRec',
            size: '14',
            color: colors.white,
            bgcolor: colors.red,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'rec', options: {} } ],
                up: [],
            },
        ],
    }
    
    presets.spill = {
        type: 'button',
        category: 'Transport',
        name: 'Spill',
        style: {
            text: '⏺️\nSpill',
            size: '14',
            color: colors.black,
            bgcolor: colors.yellow,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'spill', options: { slot: 'next' } } ],
                up: [],
            },
        ],
    }
    
    presets.recName = {
        type: 'button',
        category: 'Transport',
        name: 'Record w/ Name',
        style: {
            text: 'Rec\nNamed',
            size: '14',
            color: colors.white,
            bgcolor: colors.red,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'recName', options: { name: 'Recording' } } ],
                up: [],
            },
        ],
    }
    
    presets.recTimestamp = {
        type: 'button',
        category: 'Transport',
        name: 'Record w/ Timestamp',
        style: {
            text: 'Rec\nTime',
            size: '14',
            color: colors.white,
            bgcolor: colors.red,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'recTimestamp', options: { prefix: '' } } ],
                up: [],
            },
        ],
    }
    
    presets.stop = {
        type: 'button',
        category: 'Transport',
        name: 'Stop',
        style: {
            text: '■\nStop',
            size: '14',
            color: colors.white,
            bgcolor: colors.black,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'stop', options: {} } ],
                up: [],
            },
        ],
    }
    
    presets.goto = {
        type: 'button',
        category: 'Transport',
        name: 'Goto TC',
        style: {
            text: 'Goto\n00:00:01:00',
            size: '14',
            color: colors.white,
            bgcolor: colors.teal,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'goto', options: { tc: '00:00:01:00' } } ],
                up: [],
            },
        ],
    }
    
    presets.gotoN = {
        type: 'button',
        category: 'Transport',
        name: 'Goto Clip (n)',
        style: {
            text: 'Goto\nClip 1',
            size: '14',
            color: colors.white,
            bgcolor: colors.blue,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'gotoN', options: { clip: 1, useVariable: false } } ],
                up: [],
            },
        ],
    }
    
    presets.gotoName = {
        type: 'button',
        category: 'Transport',
        name: 'Goto Clip (name)',
        style: {
            text: 'Goto\nNamed',
            size: '14',
            color: colors.white,
            bgcolor: colors.blue,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'gotoName', options: { clip: '' } } ],
                up: [],
            },
        ],
    }
    
    presets.goFwd = {
        type: 'button',
        category: 'Transport',
        name: 'Go Fwd Clip',
        style: {
            text: 'Next\nClip',
            size: '14',
            color: colors.black,
            bgcolor: colors.orange,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'goFwd', options: { clip: 1, useVariable: false } } ],
                up: [],
            },
        ],
    }
    
    presets.goRew = {
        type: 'button',
        category: 'Transport',
        name: 'Go Rew Clip',
        style: {
            text: 'Prev\nClip',
            size: '14',
            color: colors.black,
            bgcolor: colors.orange,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'goRew', options: { clip: 1, useVariable: false } } ],
                up: [],
            },
        ],
    }
    
    presets.fetchClips = {
        type: 'button',
        category: 'Utility',
        name: 'Fetch Clips',
        style: {
            text: 'Fetch\nClips',
            size: '14',
            color: colors.white,
            bgcolor: colors.purple,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'fetchClips', options: {} } ],
                up: [],
            },
        ],
    }
    
    presets.formatPrepare = {
        type: 'button',
        category: 'Utility',
        name: 'Format (Prepare)',
        style: {
            text: 'Format\nPrepare',
            size: '14',
            color: colors.white,
            bgcolor: colors.red,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'formatPrepare', options: { filesystem: 'HFS+', timeout: 10 } } ],
                up: [],
            },
        ],
    }
    
    presets.formatConfirm = {
        type: 'button',
        category: 'Utility',
        name: 'Format (Confirm)',
        style: {
            text: 'Format\nConfirm',
            size: '14',
            color: colors.white,
            bgcolor: colors.red,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'formatConfirm', options: {} } ],
                up: [],
            },
        ],
    }
    
    presets.remote = {
        type: 'button',
        category: 'Config',
        name: 'Remote Toggle',
        style: {
            text: 'Remote\nToggle',
            size: '14',
            color: colors.black,
            bgcolor: colors.grey,
        },
        feedbacks: [],
        steps: [
            {
                down: [ { actionId: 'remote', options: { remoteEnable: 'toggle' } } ],
                up: [],
            },
        ],
    }
    

	return presets
}
