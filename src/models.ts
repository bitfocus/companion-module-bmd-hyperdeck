export interface ModelInfo {
	id: string
	label: string
	videoInputs: string[] // TODO
	audioInputs: string[] // TODO
	fileFormats: string[] // TODO
	slotLabels: string
	maxShuttle: number
}

export const CONFIG_MODELS: Record<string, ModelInfo> = {
	hdStudio: {
		id: 'hdStudio',
		label: 'HyperDeck Studio',
		videoInputs: ['SDI', 'HDMI'],
		audioInputs: ['embedded'],
		fileFormats: ['uncompressed', 'prores', 'proxy', 'DNxHD220'],
		slotLabels: 'SSD2',
		maxShuttle: 1600,
	},
	hdStudioPro: {
		id: 'hdStudioPro',
		label: 'HyperDeck Studio Pro',
		videoInputs: ['SDI', 'HDMI', 'component'],
		audioInputs: ['embedded', 'XLR', 'RCA'],
		fileFormats: ['uncompressed', 'prores', 'proxy', 'DNxHD220'],
		slotLabels: 'SSD2',
		maxShuttle: 1600,
	},
	hdStudio12G: {
		id: 'hdStudio12G',
		label: 'HyperDeck Studio 12G',
		videoInputs: ['SDI', 'HDMI'],
		audioInputs: ['embedded'],
		fileFormats: ['uncompressed', 'prores', 'proxy', 'DNx', 'DNxHD220', 'DNxHR_HQX', 'DNxHR_SQ', 'DNxHR_LB'],
		slotLabels: 'SSD2',
		maxShuttle: 1600,
	},
	bmdDup4K: {
		id: 'bmdDup4K',
		label: 'Blackmagic Duplicator 4K',
		videoInputs: ['SDI', 'optical'],
		audioInputs: ['embedded'],
		fileFormats: ['H.264', 'H.265'],
		slotLabels: 'SD25', //TODO check correct slots
		maxShuttle: 100,
	},
	hdStudioMini: {
		id: 'hdStudioMini',
		label: 'HyperDeck Studio Mini',
		videoInputs: ['SDI'],
		audioInputs: ['embedded'],
		fileFormats: ['prores', 'proxy', 'DNx', 'DNxHD220', 'DNxHR_HQX', 'DNxHR_SQ', 'DNxHR_LB', 'H.264'],
		slotLabels: 'SD2',
		maxShuttle: 1600,
	},
	hdStudioHDMini: {
		id: 'hdStudioHDMini',
		label: 'HyperDeck Studio HD Mini',
		videoInputs: ['SDI', 'HDMI'],
		audioInputs: ['embedded'],
		fileFormats: ['prores', 'proxy', 'DNx', 'DNxHD220', 'H.264'],
		slotLabels: 'SD2_USB',
		maxShuttle: 5000,
	},
	hdStudioHDPlus: {
		id: 'hdStudioHDPlus',
		label: 'HyperDeck Studio HD Plus',
		videoInputs: ['SDI', 'HDMI'],
		audioInputs: ['embedded'],
		fileFormats: ['prores', 'proxy', 'DNxHR_HQX', 'DNxHR_SQ', 'DNxHR_LB', 'H.264_SDI', 'H.264'],
		slotLabels: 'SD2_USB',
		maxShuttle: 5000,
	},
	hdStudioHDPro: {
		id: 'hdStudioHDPro',
		label: 'HyperDeck Studio HD Pro',
		videoInputs: ['SDI', 'HDMI'],
		audioInputs: ['embedded'],
		fileFormats: ['prores', 'proxy', 'DNxHR_HQX', 'DNxHR_SQ', 'DNxHR_LB', 'H.264_SDI', 'H.264'],
		slotLabels: 'SSD2_SD2_USB',
		maxShuttle: 5000,
	},
	hdStudio4KPro: {
		id: 'hdStudio4KPro',
		label: 'HyperDeck Studio 4K Pro',
		videoInputs: ['SDI', 'HDMI'],
		audioInputs: ['embedded'],
		fileFormats: ['prores', 'proxy', 'DNxHR_HQX', 'DNxHR_SQ', 'DNxHR_LB', 'H.264/5'],
		slotLabels: 'SSD2_SD2_USB',
		maxShuttle: 5000,
	},
	hdExtreme8K: {
		id: 'hdExtreme8K',
		label: 'HyperDeck Extreme 8K',
		videoInputs: ['SDI', 'HDMI', 'component', 'composite', 'optical'],
		audioInputs: ['embedded', 'XLR', 'RCA'],
		fileFormats: ['prores', 'H.265'],
		slotLabels: 'SD2_USB', //TODO check correct slots
		maxShuttle: 5000,
	},
	hdShuttleHD: {
		id: 'hdShuttleHD',
		label: 'HyperDeck Shuttle HD',
		videoInputs: ['HDMI'],
		audioInputs: ['embedded'],
		fileFormats: ['prores', 'proxy', 'DNx', 'DNxHD220', 'H.264', 'teleprompter'],
		slotLabels: 'SD_USB',
		maxShuttle: 5000,
	},
}
