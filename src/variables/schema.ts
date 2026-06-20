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

	// Active clip timecode
	clipDurationTimecode: string
	clipStartTimecode: string
	clipEndTimecode: string

	// Slot info
	recordingTime: string
	[slotRecordingTime: `slot${number}_recordingTime`]: string

	// Clip list
	[clipName: `clip${number}_name`]: string

	// Configuration
	fileFormat: string
	audioCodec: string | undefined
	audioChannels: number | undefined

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
