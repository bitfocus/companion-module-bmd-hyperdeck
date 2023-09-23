import { DropdownChoice, DropdownChoiceId } from '@companion-module/base'
import { ModelInfo } from './models.js'
import { ClipDropdownChoice, InstanceBaseExt } from './types.js'
import { stripExtension } from './util.js'

export const DropdownChoiceTrue: DropdownChoiceId = true as unknown as DropdownChoiceId
export const DropdownChoiceFalse: DropdownChoiceId = false as unknown as DropdownChoiceId

export const CHOICES_STARTEND: DropdownChoice[] = [
	{ id: 'start', label: 'Start' },
	{ id: 'end', label: 'End' },
]

export const CHOICES_PREVIEWMODE: DropdownChoice[] = [
	{ id: 'true', label: 'Preview' },
	{ id: 'false', label: 'Output' },
]

export const CHOICES_AUDIOCODEC: DropdownChoice[] = [
	{ id: 'PCM', label: 'PCM' },
	{ id: 'AAC', label: 'AAC (2 channels only)' },
]

export const CHOICES_AUDIOCHANNELS: DropdownChoice[] = [
	{ id: '2', label: '2 Channels' },
	{ id: '4', label: '4 Channels' },
	{ id: '8', label: '8 Channels' },
	{ id: '16', label: '16 Channels' },
	{ id: 'cycle', label: 'Cycle' },
]

export const CHOICES_DYNAMICRANGE: DropdownChoice[] = [
	{ id: 'auto', label: 'Auto' },
	{ id: 'Rec709', label: 'Rec.709' },
	{ id: 'Rec2020_SDR', label: 'Rec.2020 SDR' },
	{ id: 'HLG', label: 'HLG' },
	{ id: 'ST2084_300', label: 'ST2084 300' },
	{ id: 'ST2084_500', label: 'ST2084 500' },
	{ id: 'ST2084_800', label: 'ST2084 800' },
	{ id: 'ST2084_1000', label: 'ST2084 1000 ' },
	{ id: 'ST2084_2000', label: 'ST2084 2000' },
	{ id: 'ST2084_4000', label: 'ST2084 4000' },
	{ id: 'ST2048', label: 'ST2048' },
]

export const CHOICES_FILESYSTEM: DropdownChoice[] = [
	{ id: 'HFS+', label: 'HFS+' },
	{ id: 'exFAT', label: 'exFAT' },
]

export const CHOICES_REMOTECONTROL: DropdownChoice[] = [
	{ id: 'toggle', label: 'Toggle' },
	{ id: DropdownChoiceTrue, label: 'Enable' },
	{ id: DropdownChoiceFalse, label: 'Disable' },
]

export const CHOICES_TRANSPORTSTATUS: DropdownChoice[] = [
	{ id: 'preview', label: 'Preview' },
	{ id: 'stopped', label: 'Stopped' },
	{ id: 'play', label: 'Playing' },
	{ id: 'forward', label: 'Forward' },
	{ id: 'rewind', label: 'Rewind' },
	{ id: 'jog', label: 'Jog' },
	{ id: 'shuttle', label: 'Shuttle' },
	{ id: 'record', label: 'Record' },
]

export const CHOICES_SLOTSTATUS: DropdownChoice[] = [
	{ id: 'empty', label: 'Empty' },
	{ id: 'error', label: 'Error' },
	{ id: 'mounted', label: 'Mounted' },
	{ id: 'mounting', label: 'Mounting' },
]

export const CHOICES_ENABLEDISABLE: DropdownChoice[] = [
	{ id: DropdownChoiceTrue, label: 'Enable' },
	{ id: DropdownChoiceFalse, label: 'Disable' },
]

export const CHOICES_REMOTESTATUS: DropdownChoice[] = [
	{ id: DropdownChoiceTrue, label: 'Enabled' },
	{ id: DropdownChoiceFalse, label: 'Disabled' },
]

const CONFIG_AUDIOINPUTS: Record<string, DropdownChoice | undefined> = {
	embedded: { id: 'embedded', label: 'Embedded' },
	XLR: { id: 'XLR', label: 'XLR' },
	RCA: { id: 'RCA', label: 'RCA' },
}

const CONFIG_VIDEOINPUTS: Record<string, DropdownChoice | undefined> = {
	SDI: { id: 'SDI', label: 'SDI' },
	HDMI: { id: 'HDMI', label: 'HDMI' },
	component: { id: 'component', label: 'Component' },
	composite: { id: 'composite', label: 'Composite' },
	optical: { id: 'optical', label: 'Optical' },
}

export interface FormatDropdownChoice extends DropdownChoice {
	family: string
}

export const CONFIG_FILEFORMATS: FormatDropdownChoice[] = [
	{ id: 'QuickTimeUncompressed', label: 'QuickTime Uncompressed', family: 'uncompressed' },
	{ id: 'QuickTimeProResHQ', label: 'QuickTime ProRes HQ', family: 'prores' },
	{ id: 'QuickTimeProRes', label: 'QuickTime ProRes', family: 'prores' },
	{ id: 'QuickTimeProResLT', label: 'QuickTime ProRes LT', family: 'prores' },
	{ id: 'QuickTimeProResProxy', label: 'QuickTime ProRes Proxy', family: 'proxy' },
	{ id: 'QuickTimeDNxHD45', label: 'DNxHD 45 QT', family: 'DNx' },
	{ id: 'DNxHD45', label: 'DNxHD 45 MXF', family: 'DNx' },
	{ id: 'QuickTimeDNxHD145', label: 'DNxHD 145 QT', family: 'DNx' },
	{ id: 'DNxHD145', label: 'DNxHD 145 MXF', family: 'DNx' },
	{ id: 'QuickTimeDNxHD220', label: 'DNxHD 220 QT', family: 'DNxHD220' },
	{ id: 'DNxHD220', label: 'MXF DNxHD 220', family: 'DNxHD220' },
	{ id: 'QuickTimeDNxHR_HQX', label: 'DNxHR HQX QT', family: 'DNxHR_HQX' },
	{ id: 'DNxHR_HQX', label: 'DNxHR HQX MXF', family: 'DNxHR_HQX' },
	{ id: 'QuickTimeDNxHR_SQ', label: 'DNxHR SQ QT', family: 'DNxHR_SQ' },
	{ id: 'DNxHR_SQ', label: 'DNxHR SQ MXF', family: 'DNxHR_SQ' },
	{ id: 'QuickTimeDNxHR_LB', label: 'DNxHR LB QT', family: 'DNxHR_LB' },
	{ id: 'DNxHR_LB', label: 'DNxHR LB MXF', family: 'DNxHR_LB' },
	{ id: 'H.264High10_422', label: 'H.264 SDI', family: 'H.264_SDI' },
	{ id: 'H.264High', label: 'H.264 High', family: 'H.264' },
	{ id: 'H.264Medium', label: 'H.264 Medium', family: 'H.264' },
	{ id: 'H.264Low', label: 'H.264 Low', family: 'H.264' },
	{ id: 'H.265High', label: 'H.265 High', family: 'H.265' },
	{ id: 'H.265Medium', label: 'H.265 Medium', family: 'H.265' },
	{ id: 'H.265Low', label: 'H.265 Low', family: 'H.265' },
	{ id: 'H.264High10_422', label: 'H.264/5 SDI', family: 'H.264/5' },
	{ id: 'H.264High', label: 'H.264/5 High', family: 'H.264/5' },
	{ id: 'H.264Medium', label: 'H.264/5 Medium', family: 'H.264/5' },
	{ id: 'H.264Low', label: 'H.264/5 Low', family: 'H.264/5' },
	{ id: 'Teleprompter', label: 'Teleprompter', family: 'teleprompter' },
]

const CONFIG_SLOT_LABELS: Record<string, DropdownChoice[] | undefined> = {
	SSD2: [
		{ id: 1, label: '1: SSD 1' },
		{ id: 2, label: '2: SSD 2' },
	],
	SD2: [
		{ id: 1, label: '1: SD 1' },
		{ id: 2, label: '2: SD 2' },
	],
	SD_USB: [
		{ id: 1, label: '1: SD' },
		{ id: 2, label: '2: USB-C' },
	],
	SD2_USB: [
		{ id: 1, label: '1: SD 1' },
		{ id: 2, label: '2: SD 2' },
		{ id: 3, label: '3: USB-C' },
	],
	SSD2_SD2_USB: [
		{ id: 1, label: '1: SSD 1' },
		{ id: 2, label: '2: SSD 2' },
		{ id: 3, label: '3: USB-C' },
		{ id: 4, label: '4: SD 1' },
		{ id: 5, label: '5: SD 2' },
	],
	SD25: [
		{ id: 1, label: '1: SD 1' },
		{ id: 2, label: '2: SD 2' },
		{ id: 3, label: '3: SD 3' },
		{ id: 4, label: '4: SD 4' },
		{ id: 5, label: '5: SD 5' },
		{ id: 6, label: '6: SD 6' },
		{ id: 7, label: '7: SD 7' },
		{ id: 8, label: '8: SD 8' },
		{ id: 9, label: '9: SD 9' },
		{ id: 10, label: '10: SD 10' },
		{ id: 11, label: '11: SD 11' },
		{ id: 12, label: '12: SD 12' },
		{ id: 13, label: '13: SD 13' },
		{ id: 14, label: '14: SD 14' },
		{ id: 15, label: '15: SD 15' },
		{ id: 16, label: '16: SD 16' },
		{ id: 17, label: '17: SD 17' },
		{ id: 18, label: '18: SD 18' },
		{ id: 19, label: '19: SD 19' },
		{ id: 20, label: '20: SD 20' },
		{ id: 21, label: '21: SD 21' },
		{ id: 22, label: '22: SD 22' },
		{ id: 23, label: '23: SD 23' },
		{ id: 24, label: '24: SD 24' },
		{ id: 25, label: '25: SD 25' },
	],
}

export interface ModelChoices {
	AudioInputs: DropdownChoice[]
	VideoInputs: DropdownChoice[]
	Slots: DropdownChoice[]
	FileFormats: FormatDropdownChoice[]
	Clips: ClipDropdownChoice[]
}

function createDefaultChoice(id: string): DropdownChoice {
	return {
		id,
		label: id,
	}
}
export function createModelChoices(model: ModelInfo | undefined) {
	const result: ModelChoices = {
		AudioInputs: [],
		VideoInputs: [],
		Slots: [],
		FileFormats: [],
		Clips: [],
	}

	if (model) {
		for (const inputId of model.audioInputs) {
			result.AudioInputs.push(CONFIG_AUDIOINPUTS[inputId] ?? createDefaultChoice(inputId))
		}

		for (const format of CONFIG_FILEFORMATS) {
			if (model.fileFormats.includes(format.family)) {
				result.FileFormats.push(format)
			}
		}

		for (const inputId of model.videoInputs) {
			result.VideoInputs.push(CONFIG_VIDEOINPUTS[inputId] ?? createDefaultChoice(inputId))
		}

		//TODO define CHOICES_SLOTS based on model
		result.Slots = CONFIG_SLOT_LABELS[model.slotLabels] ?? []
	}

	return result
}

export function createClipsChoice(instance: InstanceBaseExt) {
	const clips: ClipDropdownChoice[] = []

	for (const { clipId, name } of instance.clipsList) {
		clips.push({ id: name, label: stripExtension(name), clipId: clipId })
	}

	return clips
}
