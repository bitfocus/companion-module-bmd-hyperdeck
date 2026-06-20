import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { HyperdeckSchema } from '../schema.js'
import { colors } from './colors.js'

export function monitorPresets(): [
	CompanionPresetSection<HyperdeckSchema>,
	CompanionPresetDefinitions<HyperdeckSchema>,
] {
	const presets: CompanionPresetDefinitions<HyperdeckSchema> = {}

	presets.transportStatus = {
		type: 'simple',
		name: 'Transport Status',
		style: {
			text: 'Status\n$(hyperdeck:status)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.clipInfo = {
		type: 'simple',
		name: 'Clip Info',
		style: {
			text: 'Clip\n$(hyperdeck:clipName)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.slotId = {
		type: 'simple',
		name: 'Slot ID',
		style: {
			text: 'Slot\n$(hyperdeck:slotId)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.videoFormat = {
		type: 'simple',
		name: 'Video Format',
		style: {
			text: 'Format\n$(hyperdeck:videoFormat)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.recordingTime = {
		type: 'simple',
		name: 'Recording Time',
		style: {
			text: 'Rec Time\n$(hyperdeck:recordingTime)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.timecode = {
		type: 'simple',
		name: 'Timecode',
		style: {
			text: 'TC\n$(hyperdeck:timecodeHMSF)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.countdown = {
		type: 'simple',
		name: 'Countdown TC',
		style: {
			text: '⏳\n$(hyperdeck:countdownTimecodeHMSF)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.audioFormat = {
		type: 'simple',
		name: 'Audio Format',
		style: {
			text: 'Audio\n$(hyperdeck:audioCodec)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.audioChannels = {
		type: 'simple',
		name: 'Audio Channels',
		style: {
			text: 'Channels\n$(hyperdeck:audioChannels)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	presets.remoteEnabled = {
		type: 'simple',
		name: 'Remote Status',
		style: {
			text: 'Remote\n$(hyperdeck:remoteEnabled)',
			size: 'auto',
			color: colors.white,
			bgcolor: colors.black,
		},
		steps: [],
		feedbacks: [],
	}

	const section: CompanionPresetSection<HyperdeckSchema> = {
		id: 'monitor',
		name: 'Monitor',
		definitions: Object.keys(presets),
	}

	return [section, presets]
}
