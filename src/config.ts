import { Regex, SomeCompanionConfigField } from '@companion-module/base'
import { CONFIG_MODELS } from './models.js'

const CONFIG_NOTIFICATION_METHOD = [
	{ id: 'disabled', label: 'Disabled' },
	{ id: 'notifications', label: 'Notifications' },
	{ id: 'polling', label: 'Polling' },
]

const CHOICES_MODEL = Object.values(CONFIG_MODELS)
// Sort alphabetical
CHOICES_MODEL.sort((a, b) => {
	const x = a.label.toLowerCase()
	const y = b.label.toLowerCase()

	return x.localeCompare(y)
})

export type HyperdeckConfig = {
	bonjourHost?: string
	host: string
	modelID: string
	reel: string
	timecodeVariables: 'disabled' | 'notifications' | 'polling'
	pollingInterval: number
	warnRemoteDisabled: boolean
}

export function getConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info0',
			width: 12,
			label: 'Warning',
			value:
				'Some Hyperdecks only supports 1 connection at any given time. Be sure to disconect any other devices controling it. Remember to press the remote button on the frontpanel of the Hyperdeck to enable remote control.',
		},
		{
			type: 'bonjour-device',
			id: 'bonjourHost',
			label: 'Device',
			width: 6,
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: Regex.IP,
			isVisibleExpression: `!$(options:bonjourHost)`,
		},
		{
			type: 'static-text',
			id: 'host-filler',
			width: 6,
			label: '',
			value: '',
			isVisibleExpression: `!!$(options:bonjourHost)`,
		},
		{
			type: 'dropdown',
			id: 'modelID',
			label: 'Model',
			width: 6,
			choices: CHOICES_MODEL,
			default: 0,
		},
		{
			type: 'static-text',
			id: 'modelID-filler',
			width: 6,
			label: '',
			value: '',
		},
		{
			type: 'textinput',
			id: 'reel',
			label: 'Custom Reel',
			width: 6,
			default: 'A001',
			description:
				"Used to initiate recordings with a custom 'Reel-[####]' naming convention, where [####] is auto-incremented from '0' by the HyperDeck. Only used by the 'Record (with custom reel)' action.",
		},
		{
			type: 'dropdown',
			id: 'timecodeVariables',
			label: 'Timecode Variables',
			width: 6,
			choices: CONFIG_NOTIFICATION_METHOD,
			default: 'disabled',
			description:
				'Timecode variables have to be explicitly enabled by selecting "Notifications" or "Polling". Note that timecode notifications are not supported before HyperDeck firmware V7!',
		},
		{
			type: 'number',
			id: 'pollingInterval',
			label: 'Polling Interval (in ms)',
			width: 6,
			min: 15,
			max: 10000,
			default: 500,
		},
		{
			type: 'checkbox',
			id: 'warnRemoteDisabled',
			label: 'Warn when remote (REM) is disabled',
			width: 12,
			default: false,
			description:
				'Put the connection into a warning state whenever remote control (REM) is disabled on the HyperDeck. The deck ignores control commands while REM is off.',
		},
	]
}
