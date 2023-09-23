import { DropdownChoice, DropdownChoiceId } from '@companion-module/base'

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
