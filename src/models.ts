import { AudioInputType, FileFormatFamily, VideoInputType } from './choices.js'

export interface ModelInfo {
	id: string
	label: string
	videoInputs: VideoInputType[]
	audioInputs: AudioInputType[]
	fileFormats: FileFormatFamily[]
	slotLabels: string
	maxShuttle: number
	hasSeparateInputFormat: boolean
}

export const CONFIG_MODELS: Record<string, ModelInfo> = {
	hdStudio: {
		id: 'hdStudio',
		label: 'HyperDeck Studio',
		videoInputs: [VideoInputType.SDI, VideoInputType.HDMI],
		audioInputs: [AudioInputType.Embedded],
		fileFormats: [
			FileFormatFamily.Uncompressed,
			FileFormatFamily.ProRes,
			FileFormatFamily.Proxy,
			FileFormatFamily.DNxHD220,
		],
		slotLabels: 'SSD2',
		maxShuttle: 1600,
		hasSeparateInputFormat: false,
	},
	hdStudioPro: {
		id: 'hdStudioPro',
		label: 'HyperDeck Studio Pro',
		videoInputs: [VideoInputType.SDI, VideoInputType.HDMI, VideoInputType.Component],
		audioInputs: [AudioInputType.Embedded, AudioInputType.XLR, AudioInputType.RCA],
		fileFormats: [
			FileFormatFamily.Uncompressed,
			FileFormatFamily.ProRes,
			FileFormatFamily.Proxy,
			FileFormatFamily.DNxHD220,
		],
		slotLabels: 'SSD2',
		maxShuttle: 1600,
		hasSeparateInputFormat: false,
	},
	hdStudio12G: {
		id: 'hdStudio12G',
		label: 'HyperDeck Studio 12G',
		videoInputs: [VideoInputType.SDI, VideoInputType.HDMI],
		audioInputs: [AudioInputType.Embedded],
		fileFormats: [
			FileFormatFamily.Uncompressed,
			FileFormatFamily.ProRes,
			FileFormatFamily.Proxy,
			FileFormatFamily.DNx,
			FileFormatFamily.DNxHD220,
			FileFormatFamily.DNxHR_HQX,
			FileFormatFamily.DNxHR_SQ,
			FileFormatFamily.DNxHR_LB,
		],
		slotLabels: 'SSD2',
		maxShuttle: 1600,
		hasSeparateInputFormat: false,
	},
	bmdDup4K: {
		id: 'bmdDup4K',
		label: 'Blackmagic Duplicator 4K',
		videoInputs: [VideoInputType.SDI, VideoInputType.Optical],
		audioInputs: [AudioInputType.Embedded],
		fileFormats: [FileFormatFamily.H264, FileFormatFamily.H265],
		slotLabels: 'SD25', //TODO check correct slots
		maxShuttle: 100,
		hasSeparateInputFormat: false,
	},
	hdStudioMini: {
		id: 'hdStudioMini',
		label: 'HyperDeck Studio Mini',
		videoInputs: [VideoInputType.SDI],
		audioInputs: [AudioInputType.Embedded],
		fileFormats: [
			FileFormatFamily.ProRes,
			FileFormatFamily.Proxy,
			FileFormatFamily.DNx,
			FileFormatFamily.DNxHD220,
			FileFormatFamily.DNxHR_HQX,
			FileFormatFamily.DNxHR_SQ,
			FileFormatFamily.DNxHR_LB,
			FileFormatFamily.H264,
		],
		slotLabels: 'SD2',
		maxShuttle: 1600,
		hasSeparateInputFormat: false,
	},
	hdStudioHDMini: {
		id: 'hdStudioHDMini',
		label: 'HyperDeck Studio HD Mini',
		videoInputs: [VideoInputType.SDI, VideoInputType.HDMI],
		audioInputs: [AudioInputType.Embedded],
		fileFormats: [
			FileFormatFamily.ProRes,
			FileFormatFamily.Proxy,
			FileFormatFamily.DNx,
			FileFormatFamily.DNxHD220,
			FileFormatFamily.H264,
		],
		slotLabels: 'SD2_USB',
		maxShuttle: 5000,
		hasSeparateInputFormat: true,
	},
	hdStudioHDPlus: {
		id: 'hdStudioHDPlus',
		label: 'HyperDeck Studio HD Plus',
		videoInputs: [VideoInputType.SDI, VideoInputType.HDMI],
		audioInputs: [AudioInputType.Embedded],
		fileFormats: [
			FileFormatFamily.ProRes,
			FileFormatFamily.Proxy,
			FileFormatFamily.DNxHR_HQX,
			FileFormatFamily.DNxHR_SQ,
			FileFormatFamily.DNxHR_LB,
			FileFormatFamily.H264_SDI,
			FileFormatFamily.H264,
		],
		slotLabels: 'SD2_USB',
		maxShuttle: 5000,
		hasSeparateInputFormat: true,
	},
	hdStudioHDPro: {
		id: 'hdStudioHDPro',
		label: 'HyperDeck Studio HD Pro',
		videoInputs: [VideoInputType.SDI, VideoInputType.HDMI],
		audioInputs: [AudioInputType.Embedded],
		fileFormats: [
			FileFormatFamily.ProRes,
			FileFormatFamily.Proxy,
			FileFormatFamily.DNxHR_HQX,
			FileFormatFamily.DNxHR_SQ,
			FileFormatFamily.DNxHR_LB,
			FileFormatFamily.H264_SDI,
			FileFormatFamily.H264,
		],
		slotLabels: 'SSD2_SD2_USB',
		maxShuttle: 5000,
		hasSeparateInputFormat: true,
	},
	hdStudio4KPro: {
		id: 'hdStudio4KPro',
		label: 'HyperDeck Studio 4K Pro',
		videoInputs: [VideoInputType.SDI, VideoInputType.HDMI],
		audioInputs: [AudioInputType.Embedded],
		fileFormats: [
			FileFormatFamily.ProRes,
			FileFormatFamily.Proxy,
			FileFormatFamily.DNxHR_HQX,
			FileFormatFamily.DNxHR_SQ,
			FileFormatFamily.DNxHR_LB,
			FileFormatFamily.H264_5,
		],
		slotLabels: 'SSD2_SD2_USB',
		maxShuttle: 5000,
		hasSeparateInputFormat: true,
	},
	hdExtreme8K: {
		id: 'hdExtreme8K',
		label: 'HyperDeck Extreme 8K',
		videoInputs: [
			VideoInputType.SDI,
			VideoInputType.HDMI,
			VideoInputType.Component,
			VideoInputType.Composite,
			VideoInputType.Optical,
		],
		audioInputs: [AudioInputType.Embedded, AudioInputType.XLR, AudioInputType.RCA],
		fileFormats: [FileFormatFamily.ProRes, FileFormatFamily.H265],
		slotLabels: 'SD2_USB', //TODO check correct slots
		maxShuttle: 5000,
		hasSeparateInputFormat: true,
	},
	hdShuttleHD: {
		id: 'hdShuttleHD',
		label: 'HyperDeck Shuttle HD',
		videoInputs: [VideoInputType.HDMI],
		audioInputs: [AudioInputType.Embedded],
		fileFormats: [
			FileFormatFamily.ProRes,
			FileFormatFamily.Proxy,
			FileFormatFamily.DNx,
			FileFormatFamily.DNxHD220x,
			FileFormatFamily.H264,
			FileFormatFamily.Teleprompter,
		],
		slotLabels: 'SD_USB',
		maxShuttle: 5000,
		hasSeparateInputFormat: true, // TODO - verify
	},
}
