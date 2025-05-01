import { DropdownChoice, DropdownChoiceId } from '@companion-module/base'
import { ModelInfo } from './models.js'
import { ClipDropdownChoice, InstanceBaseExt } from './types.js'
import { stripExtension } from './util.js'
import { VideoFormatsToChoices } from './choices/videoFormats.js'

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

export enum AudioInputType {
	Embedded = 'embedded',
	XLR = 'XLR',
	RCA = 'RCA',
}

const CONFIG_AUDIOINPUTS: Record<string, DropdownChoice | undefined> = {
	embedded: { id: AudioInputType.Embedded, label: 'Embedded' },
	XLR: { id: AudioInputType.XLR, label: 'XLR' },
	RCA: { id: AudioInputType.RCA, label: 'RCA' },
}

export enum VideoInputType {
	SDI = 'SDI',
	HDMI = 'HDMI',
	Component = 'component',
	Composite = 'composite',
	Optical = 'optical',
}

const CONFIG_VIDEOINPUTS: Record<string, DropdownChoice | undefined> = {
	SDI: { id: VideoInputType.SDI, label: 'SDI' },
	HDMI: { id: VideoInputType.HDMI, label: 'HDMI' },
	component: { id: VideoInputType.Component, label: 'Component' },
	composite: { id: VideoInputType.Composite, label: 'Composite' },
	optical: { id: VideoInputType.Optical, label: 'Optical' },
}

export interface FormatDropdownChoice extends DropdownChoice {
	family: FileFormatFamily
}

export enum FileFormatFamily {
	Uncompressed = 'uncompressed',
	ProRes = 'prores',
	Proxy = 'proxy',
	DNx = 'DNx',
	DNxHD220 = 'DNxHD220',
	DNxHD220x = 'DNxHD220x',
	DNxHR_HQX = 'DNxHR_HQX',
	DNxHR_SQ = 'DNxHR_SQ',
	DNxHR_LB = 'DNxHR_LB',
	H264_SDI = 'H.264_SDI',
	H264 = 'H.264',
	H265 = 'H.265',
	H264_5 = 'H.264/5',
	Teleprompter = 'teleprompter',
}

export const CONFIG_FILEFORMATS: FormatDropdownChoice[] = [
	{ id: 'QuickTimeUncompressed', label: 'QuickTime Uncompressed', family: FileFormatFamily.Uncompressed },
	{ id: 'QuickTimeProResHQ', label: 'QuickTime ProRes HQ', family: FileFormatFamily.ProRes },
	{ id: 'QuickTimeProRes', label: 'QuickTime ProRes', family: FileFormatFamily.ProRes },
	{ id: 'QuickTimeProResLT', label: 'QuickTime ProRes LT', family: FileFormatFamily.ProRes },
	{ id: 'QuickTimeProResProxy', label: 'QuickTime ProRes Proxy', family: FileFormatFamily.Proxy },
	{ id: 'QuickTimeDNxHD45', label: 'DNxHD 45 QT', family: FileFormatFamily.DNx },
	{ id: 'DNxHD45', label: 'DNxHD 45 MXF', family: FileFormatFamily.DNx },
	{ id: 'QuickTimeDNxHD145', label: 'DNxHD 145 QT', family: FileFormatFamily.DNx },
	{ id: 'DNxHD145', label: 'DNxHD 145 MXF', family: FileFormatFamily.DNx },
	{ id: 'QuickTimeDNxHD220', label: 'DNxHD 220 QT', family: FileFormatFamily.DNxHD220 },
	{ id: 'DNxHD220', label: 'MXF DNxHD 220', family: FileFormatFamily.DNxHD220 },
	{ id: 'QuickTimeDNxHD220x', label: 'DNxHD 220x QT', family: FileFormatFamily.DNxHD220x },
	{ id: 'DNxHD220x', label: 'MXF DNxHD 220x', family: FileFormatFamily.DNxHD220x },
	{ id: 'QuickTimeDNxHR_HQX', label: 'DNxHR HQX QT', family: FileFormatFamily.DNxHR_HQX },
	{ id: 'DNxHR_HQX', label: 'DNxHR HQX MXF', family: FileFormatFamily.DNxHR_HQX },
	{ id: 'QuickTimeDNxHR_SQ', label: 'DNxHR SQ QT', family: FileFormatFamily.DNxHR_SQ },
	{ id: 'DNxHR_SQ', label: 'DNxHR SQ MXF', family: FileFormatFamily.DNxHR_SQ },
	{ id: 'QuickTimeDNxHR_LB', label: 'DNxHR LB QT', family: FileFormatFamily.DNxHR_LB },
	{ id: 'DNxHR_LB', label: 'DNxHR LB MXF', family: FileFormatFamily.DNxHR_LB },
	{ id: 'H.264High10_422', label: 'H.264 SDI', family: FileFormatFamily.H264_SDI },
	{ id: 'H.264High', label: 'H.264 High', family: FileFormatFamily.H264 },
	{ id: 'H.264Medium', label: 'H.264 Medium', family: FileFormatFamily.H264 },
	{ id: 'H.264Low', label: 'H.264 Low', family: FileFormatFamily.H264 },
	{ id: 'H.265High', label: 'H.265 High', family: FileFormatFamily.H265 },
	{ id: 'H.265Medium', label: 'H.265 Medium', family: FileFormatFamily.H265 },
	{ id: 'H.265Low', label: 'H.265 Low', family: FileFormatFamily.H265 },
	{ id: 'H.264High10_422', label: 'H.264/5 SDI', family: FileFormatFamily.H264_5 },
	{ id: 'H.264High', label: 'H.264/5 High', family: FileFormatFamily.H264_5 },
	{ id: 'H.264Medium', label: 'H.264/5 Medium', family: FileFormatFamily.H264_5 },
	{ id: 'H.264Low', label: 'H.264/5 Low', family: FileFormatFamily.H264_5 },
	{ id: 'Teleprompter', label: 'Teleprompter', family: FileFormatFamily.Teleprompter },
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
	SD_USBNAS: [
		{ id: 1, label: '1: SD' },
		{ id: 2, label: '2: USB-C/NAS' },
	],
	SD2_USB: [
		{ id: 1, label: '1: SD 1' },
		{ id: 2, label: '2: SD 2' },
		{ id: 3, label: '3: USB-C' },
	],
	CFAST2_USBNAS: [
		{ id: 1, label: '1: CFast 1' },
		{ id: 2, label: '2: CFast 2' },
		{ id: 3, label: '3: USB-C/NAS' },
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
	VideoFormats: DropdownChoice[]
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
		VideoFormats: [],
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

		result.VideoFormats.push(...VideoFormatsToChoices(model.videoFormats))

		//TODO define CHOICES_SLOTS based on model
		result.Slots = CONFIG_SLOT_LABELS[model.slotLabels] ?? []
	}

	return result
}

export function createClipsChoice(instance: InstanceBaseExt) {
	const clips: ClipDropdownChoice[] = []

	for (const { clipId, name } of instance.simpleClipsList) {
		clips.push({ id: name, label: stripExtension(name), clipId: clipId })
	}

	return clips
}
