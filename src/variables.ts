import Timecode from 'smpte-timecode'
import { VideoFormat } from 'hyperdeck-connection'
import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import { InstanceBaseExt } from './types.js'
import { stripExtension } from './util.js'
import { CONFIG_FILEFORMATS } from './choices.js'

const frameRates: { [k in VideoFormat]: Timecode.FRAMERATE } = {
	[VideoFormat.NTSC]: 29.97,
	[VideoFormat.PAL]: 25,
	[VideoFormat.NTSCp]: 29.97,
	[VideoFormat.PALp]: 25,
	[VideoFormat._720p50]: 50,
	[VideoFormat._720p5994]: 59.94,
	[VideoFormat._720p60]: 60,
	[VideoFormat._1080p23976]: 23.976, // not supported by smpte-timecode lib
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
	[VideoFormat._4Kp23976]: 23.976, // not supported by smpte-timecode lib
	[VideoFormat._4Kp24]: 24,
	[VideoFormat._4Kp25]: 25,
	[VideoFormat._4Kp2997]: 29.97,
	[VideoFormat._4Kp30]: 30,
	[VideoFormat._4Kp50]: 50,
	[VideoFormat._4Kp5994]: 59.94,
	[VideoFormat._4Kp60]: 60,
}

export function updateTransportInfoVariables(instance: InstanceBaseExt, newValues: CompanionVariableValues) {
	const capitalise = (s: string) => {
		if (typeof s !== 'string') return ''
		return s.charAt(0).toUpperCase() + s.slice(1)
	}
	newValues['status'] = capitalise(instance.transportInfo.status)
	newValues['speed'] = instance.transportInfo.speed

	//Clip ID and Slot ID  null exceptions
	let clipNameVariable: string | undefined
	if (instance.transportInfo.clipId !== null) {
		const clipObj = instance.clipsList.find(({ clipId }) => clipId == instance.transportInfo.clipId)
		if (clipObj) {
			clipNameVariable = stripExtension(clipObj.name)
		}
	}

	newValues['clipId'] = instance.transportInfo.clipId ?? '-'
	newValues['clipName'] = clipNameVariable ?? '-'
	newValues['clipCount'] = instance.clipsList.length
	newValues['slotId'] = instance.transportInfo.slotId ?? '-'
	newValues['videoFormat'] = instance.transportInfo.videoFormat ?? 'none'
	if (instance.model.hasSeparateInputFormat) {
		newValues['inputVideoFormat'] = instance.transportInfo.inputVideoFormat ?? 'none'
	}
}

export function updateClipVariables(instance: InstanceBaseExt, newValues: CompanionVariableValues) {
	newValues['clipCount'] = instance.clipsList.length
	// Variables for every clip in the list
	for (const { clipId, name } of instance.clipsList) {
		newValues[`clip${clipId}_name`] = stripExtension(name)
	}
}

export function updateSlotInfoVariables(instance: InstanceBaseExt, newValues: CompanionVariableValues) {
	const activeSlotId = instance.transportInfo.slotId
	instance.slotInfo.forEach((slot, index) => {
		if (slot != null) {
			let recordingTime = '--:--:--'
			try {
				if (typeof slot.recordingTime === 'number') {
					recordingTime = new Date(slot.recordingTime * 1000).toISOString().substr(11, 8)
				}
			} catch (e) {
				instance.log('error', `Slot ${index} recording time parse error: ${e}`)
			}

			newValues[`slot${index}_recordingTime`] = recordingTime
			if (slot.slotId === activeSlotId) {
				newValues['recordingTime'] = recordingTime
			}
		}
	})
}

interface CounterValues {
	tcH: string | number
	tcM: string | number
	tcS: string | number
	tcF: string | number
	tcHMS: string
	tcHMSF: string
}

export function updateTimecodeVariables(instance: InstanceBaseExt, newValues: CompanionVariableValues) {
	const tb = instance.transportInfo.videoFormat && frameRates[instance.transportInfo.videoFormat]
	const countUp: CounterValues = {
		tcH: '--',
		tcM: '--',
		tcS: '--',
		tcF: '--',
		tcHMS: '--:--:--',
		tcHMSF: '--:--:--:--',
	}
	let countDown: CounterValues = {
		tcH: '--',
		tcM: '--',
		tcS: '--',
		tcF: '--',
		tcHMS: '--:--:--',
		tcHMSF: '--:--:--:--',
	}

	const pad = (n: number | string) => ('00' + n).substr(-2)

	const setTcVariable = (isCountdown: boolean, { tcH, tcM, tcS, tcF, tcHMS, tcHMSF }: CounterValues) => {
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeHMS'] = tcHMS
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeHMSF'] = tcHMSF
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeH'] = pad(tcH)
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeM'] = pad(tcM)
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeS'] = pad(tcS)
		newValues[(isCountdown ? 'countdownT' : 't') + 'imecodeF'] = pad(tcF)
	}

	if (instance.transportInfo.displayTimecode) {
		if (tb) {
			try {
				let tc = Timecode(instance.transportInfo.displayTimecode, tb)
				countUp.tcH = tc.hours
				countUp.tcM = tc.minutes
				countUp.tcS = tc.seconds
				countUp.tcF = tc.frames
				countUp.tcHMS = tc.toString().substr(0, 8)
				countUp.tcHMSF = tc.toString()

				if (instance.transportInfo.slotId !== undefined) {
					const clip = instance.clipsList.find(({ clipId }) => clipId == instance.transportInfo.clipId)
					//				instance.debug('Clip duration: ', clip.duration)
					const modesWhereCountdownMakesNoSense = new Set(['preview', 'record'])
					if (clip && clip.duration && !modesWhereCountdownMakesNoSense.has(instance.transportInfo.status)) {
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
				console.log(instance.transportInfo.displayTimecode)
				instance.log('error', 'Timecode error:' + JSON.stringify(err) + (err as any)?.message + err?.toString())
			}
		} else {
			// no timebase implies we can't use smpte-timecode lib
			let tc = instance.transportInfo.displayTimecode.match(
				/^(?<HMS>(?<H>\d{2}):(?<M>\d{2}):(?<S>\d{2}))[:;](?<F>\d{2})$/
			)
			if (tc && tc.groups) {
				countUp.tcH = tc.groups.H
				countUp.tcM = tc.groups.M
				countUp.tcS = tc.groups.S
				countUp.tcF = tc.groups.F
				countUp.tcHMS = tc.groups.HMS
			}
			countUp.tcHMSF = instance.transportInfo.displayTimecode
		}
	}

	setTcVariable(false, countUp)
	setTcVariable(true, countDown)
}

export function updateConfigurationVariables(instance: InstanceBaseExt, newValues: CompanionVariableValues) {
	const format = CONFIG_FILEFORMATS.find(({ id }) => id === instance.deckConfig.fileFormat)
	newValues['fileFormat'] = format?.label ?? instance.deckConfig.fileFormat

	newValues['audioCodec'] = instance.deckConfig.audioCodec
	newValues['audioChannels'] = instance.deckConfig.audioInputChannels
}

export function updateRemoteVariable(instance: InstanceBaseExt, newValues: CompanionVariableValues) {
	newValues['remoteEnabled'] = instance.remoteInfo?.enabled || false
}

export function initVariables(instance: InstanceBaseExt) {
	const variables: CompanionVariableDefinition[] = []

	const values: CompanionVariableValues = {}

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
	if (instance.model.hasSeparateInputFormat) {
		variables.push({
			name: 'Input video format',
			variableId: 'inputVideoFormat',
		})
	}
	updateTransportInfoVariables(instance, values)

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
	updateSlotInfoVariables(instance, values)

	// Clip variables
	variables.push({
		name: 'Clip count',
		variableId: 'clipCount',
	})
	for (const { clipId } of instance.clipsList) {
		variables.push({
			name: `Clip ${clipId} Name`,
			variableId: `clip${clipId}_name`,
		})
	}
	updateClipVariables(instance, values)

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
	updateConfigurationVariables(instance, values)

	// Remote status
	variables.push({
		name: 'Remote enabled',
		variableId: 'remoteEnabled',
	})

	// Timecode variables
	const initTcVariable = (isCountdown: boolean) => {
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
	initTcVariable(false)
	initTcVariable(true)

	updateTimecodeVariables(instance, values)

	instance.setVariableDefinitions(variables)
	instance.setVariableValues(values)
}
