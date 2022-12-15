const Timecode = require('smpte-timecode')
const { VideoFormat } = require('hyperdeck-connection')

const frameRates = {
	[VideoFormat.NTSC]: 29.97,
	[VideoFormat.PAL]: 25,
	[VideoFormat.NTSCp]: 29.97,
	[VideoFormat.PALp]: 25,
	[VideoFormat._720p50]: 50,
	[VideoFormat._720p5994]: 59.94,
	[VideoFormat._720p60]: 60,
	// [VideoFormat._1080p23976]: 23.976, // not supported by smpte-timecode lib
	[VideoFormat._1080p24]: 24,
	[VideoFormat._1080p25]: 25,
	[VideoFormat._1080p2997]: 29.97,
	[VideoFormat._1080p30]: 30,
	[VideoFormat._1080i50]: 25,
	[VideoFormat._1080i5994]: 29.97,
	[VideoFormat._1080i60]: 30,
	[VideoFormat._1080p50]: 50,
	[VideoFormat._1080p5994]: 59.94,
	[VideoFormat._1080p60]: 60,
	// [VideoFormat._4Kp23976]: 23.976, // not supported by smpte-timecode lib
	[VideoFormat._4Kp24]: 24,
	[VideoFormat._4Kp25]: 25,
	[VideoFormat._4Kp2997]: 29.97,
	[VideoFormat._4Kp30]: 30,
	[VideoFormat._4Kp50]: 50,
	[VideoFormat._4Kp5994]: 59.94,
	[VideoFormat._4Kp60]: 60,
}

module.exports.updateTransportInfoVariables = function (instance, newValues) {
	const capitalise = (s) => {
		if (typeof s !== 'string') return ''
		return s.charAt(0).toUpperCase() + s.slice(1)
	}
	newValues['status'] = capitalise(instance.transportInfo['status'])
	newValues['speed'] = instance.transportInfo['speed']

	//Clip ID and Slot ID  null exceptions
	let clipIdVariable = '-'
	let clipNameVariable = '-'
	if (instance.transportInfo['clipId'] != null) {
		clipIdVariable = instance.transportInfo['clipId']

		try {
			let clipObj = instance.CHOICES_CLIPS.find(({ clipId }) => clipId == instance.transportInfo['clipId'])

			if (clipObj) {
				clipNameVariable = clipObj.label
			}
		} catch (error) {
			//some uncaught error
		}
	}

	let slotIdVariable = '-'
	if (instance.transportInfo['slotId'] != null) {
		slotIdVariable = instance.transportInfo['slotId']
	}
	newValues['clipId'] = clipIdVariable
	newValues['clipName'] = clipNameVariable
	newValues['clipCount'] = instance.clipCount
	newValues['slotId'] = slotIdVariable
	newValues['videoFormat'] = instance.transportInfo['videoFormat']
}

module.exports.updateClipVariables = function (instance, newValues) {
	newValues['clipCount'] = instance.clipCount
	// Variables for every clip in the list
	if (instance.clipsList) {
		instance.clipsList.forEach(({ clipId, name }) => {
			newValues[`clip${clipId}_name`] = instance._stripExtension(name)
		})
	}
}

module.exports.updateSlotInfoVariables = function (instance, newValues) {
	let recordingTimes = []
	instance.slotInfo.forEach((slot, index) => {
		try {
			if (slot != null) {
				recordingTimes[index] = '--:--:--'
				if (slot['recordingTime'] !== undefined) {
					recordingTimes[index] = new Date(slot['recordingTime'] * 1000).toISOString().substr(11, 8)
				}
				newValues[`slot${index}_recordingTime`] = recordingTimes[index]
			}
		} catch (e) {
			instance.log('error', `Slot ${index} recording time parse error: ${e}`)
		}
	})
	recordingTimes[0] = '--:--:--'
	let activeSlot = instance.transportInfo['slotId']
	if (instance.slotInfo[activeSlot] != null && instance.slotInfo[activeSlot].recordingTime !== undefined) {
		recordingTimes[0] = recordingTimes[activeSlot]
	}
	newValues['recordingTime'] = recordingTimes[0]
}

module.exports.updateTimecodeVariables = function (instance, newValues) {
	const tb = frameRates[instance.transportInfo['videoFormat']]
	const countUp = {
		tcH: '--',
		tcM: '--',
		tcS: '--',
		tcF: '--',
		tcHMS: '--:--:--',
		tcHMSF: '--:--:--:--',
	}
	let countDown = {
		tcH: '--',
		tcM: '--',
		tcS: '--',
		tcF: '--',
		tcHMS: '--:--:--',
		tcHMSF: '--:--:--:--',
	}

	const pad = (n) => ('00' + n).substr(-2)

	const setTcVariable = (isCountdown, { tcH, tcM, tcS, tcF, tcHMS, tcHMSF }) => {
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeHMS'] = tcHMS
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeHMSF'] = tcHMSF
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeH'] = pad(tcH)
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeM'] = pad(tcM)
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeS'] = pad(tcS)
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeF'] = pad(tcF)
	}

	if (instance.transportInfo['displayTimecode']) {
		if (tb) {
			try {
				let tc = Timecode(instance.transportInfo['displayTimecode'], tb)
				countUp.tcH = tc.hours
				countUp.tcM = tc.minutes
				countUp.tcS = tc.seconds
				countUp.tcF = tc.frames
				countUp.tcHMS = tc.toString().substr(0, 8)
				countUp.tcHMSF = tc.toString()

				if (instance.transportInfo['slotId'] !== undefined && instance.clipsList !== undefined) {
					const clip = instance.clipsList.find(({ clipId }) => clipId == instance.transportInfo['clipId'])
					//				instance.debug('Clip duration: ', clip.duration)
					const modesWhereCountdownMakesNoSense = new Set(['preview', 'record'])
					if (clip && clip.duration && !modesWhereCountdownMakesNoSense.has(instance.transportInfo['status'])) {
						const tcTot = Timecode(clip.duration, tb)
						const tcStart = Timecode(clip.startTime, tb)
						const left = Math.max(0, tcTot.frameCount - (tc.frameCount - tcStart.frameCount) - 1)
						const tcLeft = Timecode(left, tb) // todo - unhardcode

						countDown.tcH = tcLeft.hours
						countDown.tcM = tcLeft.minutes
						countDown.tcS = tcLeft.seconds
						countDown.tcF = tcLeft.frames
						countDown.tcHMS = tcLeft.toString().substr(0, 8)
						countDown.tcHMSF = tcLeft.toString()
					}
				}
			} catch (err) {
				instance.log('error', 'Timecode error:' + JSON.stringify(err))
			}
		} else {
			// no timebase implies we can't use smpte-timecode lib
			let tc = instance.transportInfo['displayTimecode'].match(
				/^(?<HMS>(?<H>\d{2}):(?<M>\d{2}):(?<S>\d{2}))[:;](?<F>\d{2})$/
			)
			if (tc && tc.groups) {
				countUp.tcH = tc.groups.H
				countUp.tcM = tc.groups.M
				countUp.tcS = tc.groups.S
				countUp.tcF = tc.groups.F
				countUp.tcHMS = tc.groups.HMS
			}
			countUp.tcHMSF = instance.transportInfo['displayTimecode']
		}
	}

	setTcVariable(false, countUp)
	setTcVariable(true, countDown)
}

module.exports.updateConfigurationVariables = function (instance, newValues) {
	if (instance.deckConfig.fileFormat !== '') {
		const format = instance.CONFIG_FILEFORMATS.find(({ id }) => id === instance.deckConfig['fileFormat'])
		if (format !== undefined) {
			newValues['fileFormat'] = format.label
		}
	}
	if (instance.deckConfig.audioCodec !== '') {
		newValues['audioCodec'] = instance.deckConfig.audioCodec
	}
	if (instance.deckConfig.audioInputChannels !== '') {
		newValues['audioChannels'] = instance.deckConfig.audioInputChannels
	}
}

module.exports.updateRemoteVariable = function (instance, newValues) {
	newValues['remoteEnabled'] = instance.remoteInfo?.['enabled'] || false
}

module.exports.initVariables = function (instance) {
	const variables = []

	const values = {}

	// transport info vars:
	variables.push({
		name: 'Transport status',
		variableId: 'status',
	})
	variables.push({
		name: 'Play speed',
		variableId: 'speed',
	})
	variables.push({
		name: 'Clip ID',
		variableId: 'clipId',
	})
	variables.push({
		name: 'Clip Name',
		variableId: 'clipName',
	})
	variables.push({
		name: 'Slot ID',
		variableId: 'slotId',
	})
	variables.push({
		name: 'Video format',
		variableId: 'videoFormat',
	})
	module.exports.updateTransportInfoVariables(instance, values)

	// Slot variables
	variables.push({
		name: 'Active slot recording time available',
		variableId: 'recordingTime',
	})
	instance.slotInfo.forEach((slot, index) => {
		if (slot != null) {
			variables.push({
				name: `Slot ${index} recording time available`,
				variableId: `slot${index}_recordingTime`,
			})
		}
	})
	module.exports.updateSlotInfoVariables(instance, values)

	// Clip variables
	variables.push({
		name: 'Clip count',
		variableId: 'clipCount',
	})
	if (instance.clipsList !== undefined) {
		instance.clipsList.forEach(({ clipId }) => {
			variables.push({
				name: `Clip ${clipId} Name`,
				variableId: `clip${clipId}_name`,
			})
		})
	}
	module.exports.updateClipVariables(instance, values)

	// Timecode variables
	const initTcVariable = (isCountdown) => {
		variables.push({
			name: (isCountdown ? 'Countdown ' : '') + 'Timecode (HH:MM:SS)',
			variableId: (isCountdown ? 'countdownT' : 't') + 'imecodeHMS',
		})

		variables.push({
			name: (isCountdown ? 'Countdown ' : '') + 'Timecode (HH:MM:SS:FF)',
			variableId: (isCountdown ? 'countdownT' : 't') + 'imecodeHMSF',
		})

		variables.push({
			name: (isCountdown ? 'Countdown ' : '') + 'Timecode (HH)',
			variableId: (isCountdown ? 'countdownT' : 't') + 'imecodeH',
		})

		variables.push({
			name: (isCountdown ? 'Countdown ' : '') + 'Timecode (MM)',
			variableId: (isCountdown ? 'countdownT' : 't') + 'imecodeM',
		})

		variables.push({
			name: (isCountdown ? 'Countdown ' : '') + 'Timecode (SS)',
			variableId: (isCountdown ? 'countdownT' : 't') + 'imecodeS',
		})

		variables.push({
			name: (isCountdown ? 'Countdown ' : '') + 'Timecode (FF)',
			variableId: (isCountdown ? 'countdownT' : 't') + 'imecodeF',
		})
	}

	// Configuration variables
	variables.push({
		name: 'File format',
		variableId: 'fileFormat',
	})
	variables.push({
		name: 'Audio codec',
		variableId: 'audioCodec',
	})
	variables.push({
		name: 'Audio channels',
		variableId: 'audioChannels',
	})
	module.exports.updateConfigurationVariables(instance, values)

	// Remote status
	variables.push({
		name: 'Remote enabled',
		variableId: 'remoteEnabled',
	})

	initTcVariable(false)
	initTcVariable(true)

	module.exports.updateTimecodeVariables(instance, values)

	instance.setVariableDefinitions(variables)
	instance.setVariableValues(values)
}
