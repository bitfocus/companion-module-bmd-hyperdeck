import { DropdownChoice } from '@companion-module/base'

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
