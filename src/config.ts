import { Regex, SomeCompanionConfigField } from '@companion-module/base'
import { CONFIG_MODELS } from './models'

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

export interface HyperdeckConfig {
	host: string
	modelID: string
	reel: string
	timecodeVariables: string // TODO
	pollingInterval: number
}

export function getConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Warning',
			value:
				'Hyperdeck only supports 1 connection at any given time. Be sure to disconect any other devices controling it. Remember to press the remote button on the frontpanel of the Hyperdeck to enable remote control.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: Regex.IP,
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
			id: 'info',
			width: 12,
			label: 'Custom Clip Record Naming',
			value:
				"Companion is able to initiate recordings where the file names use a custom 'Reel-[####]' naming convention.  The 'Reel' is a custom name defined below and [####] is auto incremented from '0' by the HyperDeck.  <b>This naming is only used when starting records using the 'Record (with custom reel)' action.</b>",
		},
		{
			type: 'textinput',
			id: 'reel',
			label: 'Custom Reel',
			width: 6,
			default: 'A001',
			regex: Regex.SOMETHING,
		},
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Displaying Timecode Variable',
			value:
				'Timecode variables have to be explicitly enabled by selecting "Notifications" or "Polling". Note that timecode notifications are not supported before hyperdeck firmware V7!',
		},
		{
			type: 'dropdown',
			id: 'timecodeVariables',
			label: 'Timecode Variables',
			width: 6,
			choices: CONFIG_NOTIFICATION_METHOD,
			default: 'disabled',
		},
		{
			type: 'number',
			id: 'pollingInterval',
			label: 'Polling Interval (in ms)',
			width: 6,
			min: 15,
			max: 10000,
			default: 500,
			required: true,
		},
	]
}
