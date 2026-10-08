export type VariablesSchema = {
	// Transport info
	status: string
	speed: number
	clipId: number | string
	clipName: string
	clipCount: number
	slotId: number | string
	videoFormat: string
	inputVideoFormat?: string
	loop: boolean
	singleClip: boolean

	// Active clip timecode
	clipDurationTimecode: string
	clipStartTimecode: string
	clipEndTimecode: string

	// Slot info
	recordingTime: string
	volumeName: string
	[slotRecordingTime: `slot${number}_recordingTime`]: string
	[slotVolumeName: `slot${number}_volumeName`]: string

	// Clip list
	clipNames: string[]
	[clipName: `clip${number}_name`]: string

	// Configuration
	fileFormat: string
	audioCodec: string | undefined
	audioChannels: number | undefined
	timecodeInput: string
	timecodePreset: string

	// Play range
	playrangeIn: number | string
	playrangeOut: number | string
	playrangeInTimecode: string
	playrangeOutTimecode: string

	// Remote
	remoteEnabled: boolean

	// Target IP
	ip: string

	// Timecode (count up)
	timecodeHMS: string
	timecodeHMSF: string
	timecodeH: string
	timecodeM: string
	timecodeS: string
	timecodeF: string

	// Timecode (countdown)
	countdownTimecodeHMS: string
	countdownTimecodeHMSF: string
	countdownTimecodeH: string
	countdownTimecodeM: string
	countdownTimecodeS: string
	countdownTimecodeF: string
}
