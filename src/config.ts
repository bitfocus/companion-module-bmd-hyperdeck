import { Regex, SomeCompanionConfigField } from '@companion-module/base'
import { CONFIG_MODELS } from './models.js'
import { CONFIG_SLATE_CAMERA_ID } from './choices.js'

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
	bonjourHost?: string
	host: string
	modelID: string
	projectName: string
	camera: string
	director: string
	cameraOperator: string
	reel: string
	timecodeVariables: 'disabled' | 'notifications' | 'polling'
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
			isVisible: (options) => !options['bonjourHost'],
		},
		{
			type: 'static-text',
			id: 'host-filler',
			width: 6,
			label: '',
			value: '',
			isVisible: (options) => !!options['bonjourHost'],
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
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Slate Project Information',
			value:
			'The following settings will be stored within the meta-data of all clips recorded on the deck. This data can also be set/changed using the relevant actions.',
		},
		{
			type: 'textinput',
			id: 'projectName',
			label: 'Project Name',
			width: 6,
		},
		{
			type: 'dropdown',
			id: 'camera',
			label: 'Camera',
			choices: CONFIG_SLATE_CAMERA_ID,
			default: 'A',
			width: 2,
		},
		{
			type: 'textinput',
			id: 'director',
			label: 'Director',
			width: 6,
		},
		{
			type: 'textinput',
			id: 'cameraOperator',
			label: 'Camera Operator',
			width: 6,
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
