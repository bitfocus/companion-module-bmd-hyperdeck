import Timecode from 'smpte-timecode'
import { SlotStatus, VideoFormat } from 'hyperdeck-connection'
import { CompanionVariableDefinitions } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { stripExtension, toHHMMSS } from '../util.js'
import { CONFIG_FILEFORMATS } from '../choices/index.js'
import { VariablesSchema } from './schema.js'

const frameRates: { [k in VideoFormat]: Timecode.FRAMERATE } = {
	[VideoFormat.NTSC]: 29.97,
	[VideoFormat.PAL]: 25,
	[VideoFormat.NTSCp]: 29.97,
	[VideoFormat.PALp]: 25,

	[VideoFormat._720p50]: 50,
	[VideoFormat._720p5994]: 59.94,
	[VideoFormat._720p60]: 60,
	[VideoFormat._1080p23976]: 23.976,
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

	[VideoFormat._2Kp23976DCI]: 23.976,
	[VideoFormat._2Kp24DCI]: 24,
	[VideoFormat._2Kp25DCI]: 25,

	[VideoFormat._4Kp23976]: 23.976,
	[VideoFormat._4Kp24]: 24,
	[VideoFormat._4Kp25]: 25,
	[VideoFormat._4Kp2997]: 29.97,
	[VideoFormat._4Kp30]: 30,

	[VideoFormat._4Kp50]: 50,
	[VideoFormat._4Kp5994]: 59.94,
	[VideoFormat._4Kp60]: 60,

	[VideoFormat._4Kp23976DCI]: 23.976,
	[VideoFormat._4Kp24DCI]: 24,
	[VideoFormat._4Kp25DCI]: 25,

	[VideoFormat._8Kp23976]: 23.976,
	[VideoFormat._8Kp24]: 24,
	[VideoFormat._8Kp25]: 25,
	[VideoFormat._8Kp2997]: 29.97,
	[VideoFormat._8Kp30]: 30,

	[VideoFormat._8Kp50]: 50,
	[VideoFormat._8Kp5994]: 59.94,
	[VideoFormat._8Kp60]: 60,

	[VideoFormat._8Kp23976DCI]: 23.976,
	[VideoFormat._8Kp24DCI]: 24,
	[VideoFormat._8Kp25DCI]: 25,
}

export function updateTransportInfoVariables(instance: InstanceBaseExt, newValues: Partial<VariablesSchema>) {
	const capitalise = (s: string) => {
		if (typeof s !== 'string') return ''
		return s.charAt(0).toUpperCase() + s.slice(1)
	}
	newValues['status'] = capitalise(instance.transportInfo.status)
	newValues['speed'] = instance.transportInfo.speed

	//Clip ID and Slot ID  null exceptions
	let clipNameVariable: string | undefined
	if (instance.transportInfo.clipId !== null) {
		const clipObj = instance.simpleClipsList.find(({ clipId }) => clipId == instance.transportInfo.clipId)
		if (clipObj) {
			clipNameVariable = stripExtension(clipObj.name)
		}
	}

	newValues['clipId'] = instance.transportInfo.clipId ?? '-'
	newValues['clipName'] = clipNameVariable ?? '-'
	newValues['clipCount'] = instance.simpleClipsList.length
	newValues['slotId'] = instance.transportInfo.slotId ?? '-'
	newValues['videoFormat'] = instance.transportInfo.videoFormat ?? 'none'
	if (instance.model.hasSeparateInputFormat) {
		newValues['inputVideoFormat'] = instance.transportInfo.inputVideoFormat ?? 'none'
	}

	// Add active clip timecode variables
	if (instance.transportInfo.clipId !== null) {
		const clip = instance.fullClipsList.find(({ clipId }) => clipId == instance.transportInfo.clipId)
		if (clip) {
			const tb = instance.transportInfo.videoFormat && frameRates[instance.transportInfo.videoFormat]

			newValues['clipDurationTimecode'] = '--:--:--:--'
			newValues['clipStartTimecode'] = '--:--:--:--'
			newValues['clipEndTimecode'] = '--:--:--:--'

			if (tb) {
				let tcStart: Timecode.TimecodeInstance | undefined
				let tcDuration: Timecode.TimecodeInstance | undefined

				if (clip.startTime) {
					try {
						tcStart = Timecode(clip.startTime, tb)
						newValues['clipStartTimecode'] = tcStart.toString()
					} catch (err) {
						newValues['clipStartTimecode'] = '--:--:--:--'
					}
				}

				if (clip.duration) {
					try {
						tcDuration = Timecode(clip.duration, tb)
						newValues['clipDurationTimecode'] = tcDuration.toString()
					} catch (err) {
						newValues['clipDurationTimecode'] = '--:--:--:--'
					}
				}

				if (tcStart && tcDuration) {
					try {
						const tcEnd = Timecode(tcStart.frameCount + tcDuration.frameCount, tb)
						newValues['clipEndTimecode'] = tcEnd.toString()
					} catch (err) {
						newValues['clipEndTimecode'] = '--:--:--:--'
					}
				}
			}
		} else {
			newValues['clipDurationTimecode'] = '--:--:--:--'
			newValues['clipStartTimecode'] = '--:--:--:--'
			newValues['clipEndTimecode'] = '--:--:--:--'
		}
	} else {
		newValues['clipDurationTimecode'] = '--:--:--:--'
		newValues['clipStartTimecode'] = '--:--:--:--'
		newValues['clipEndTimecode'] = '--:--:--:--'
	}
}

export function updateClipVariables(instance: InstanceBaseExt, newValues: Partial<VariablesSchema>) {
	newValues['clipCount'] = instance.simpleClipsList.length
	// Variables for every clip in the list
	for (const { clipId, name } of instance.simpleClipsList) {
		newValues[`clip${clipId}_name`] = stripExtension(name)
	}
	newValues['clipNames'] = instance.simpleClipsList.map(({ name }) => stripExtension(name))
}

export function updateSlotInfoVariables(instance: InstanceBaseExt, newValues: Partial<VariablesSchema>) {
	const activeSlotId = instance.transportInfo.slotId
	newValues['recordingTime'] = '--:--:--'
	instance.slotInfo.forEach((slot, index) => {
		if (!slot) return

		let recordingTime = '--:--:--'
		if (slot.status === SlotStatus.MOUNTED) {
			try {
				if (typeof slot.recordingTime === 'number') {
					recordingTime = toHHMMSS(slot.recordingTime)
					instance.log('debug', `Slot ${index} recording time: ${slot.recordingTime} secs -> ${recordingTime}`)
				}
			} catch (e) {
				instance.log('error', `Slot ${index} recording time parse error: ${e}`)
			}
		}

		newValues[`slot${index}_recordingTime`] = recordingTime
		if (slot.slotId === activeSlotId) {
			newValues['recordingTime'] = recordingTime
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

export function updateTimecodeVariables(instance: InstanceBaseExt, newValues: Partial<VariablesSchema>) {
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
		const prefix = isCountdown ? 'countdownT' : 't'
		newValues[`${prefix}imecodeHMS`] = tcHMS
		newValues[`${prefix}imecodeHMSF`] = tcHMSF
		newValues[`${prefix}imecodeH`] = pad(tcH)
		newValues[`${prefix}imecodeM`] = pad(tcM)
		newValues[`${prefix}imecodeS`] = pad(tcS)
		newValues[`${prefix}imecodeF`] = pad(tcF)
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
					const clip = instance.fullClipsList.find(({ clipId }) => clipId == instance.transportInfo.clipId)
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
				/^(?<HMS>(?<H>\d{2}):(?<M>\d{2}):(?<S>\d{2}))[:;](?<F>\d{2})$/,
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

export function updateConfigurationVariables(instance: InstanceBaseExt, newValues: Partial<VariablesSchema>) {
	const format = CONFIG_FILEFORMATS.find(({ id }) => id === instance.deckConfig.fileFormat)
	newValues['fileFormat'] = format?.label ?? instance.deckConfig.fileFormat

	newValues['audioCodec'] = instance.deckConfig.audioCodec
	newValues['audioChannels'] = instance.deckConfig.audioInputChannels
}

export function updateRemoteVariable(instance: InstanceBaseExt, newValues: Partial<VariablesSchema>) {
	newValues['remoteEnabled'] = instance.remoteInfo?.enabled || false
}

export function initVariables(instance: InstanceBaseExt) {
	const variables: CompanionVariableDefinitions<VariablesSchema> = {
		// transport info vars:
		status: { name: 'Transport status' },
		speed: { name: 'Play speed' },
		clipId: { name: 'Clip ID' },
		clipName: { name: 'Clip Name' },
		slotId: { name: 'Slot ID' },
		videoFormat: { name: 'Video format' },

		// active clip timecode vars:
		clipDurationTimecode: { name: 'Active clip duration timecode' },
		clipStartTimecode: { name: 'Active clip start timecode' },
		clipEndTimecode: { name: 'Active clip end timecode' },

		// slot vars:
		recordingTime: { name: 'Active slot recording time available' },

		// clip vars:
		clipCount: { name: 'Clip count' },
		clipNames: { name: 'Clip names (array)' },

		// configuration vars:
		fileFormat: { name: 'File format' },
		audioCodec: { name: 'Audio codec' },
		audioChannels: { name: 'Audio channels' },

		// remote status:
		remoteEnabled: { name: 'Remote enabled' },

		// target IP:
		ip: { name: 'Target IP' },

		// timecode vars (count up):
		timecodeHMS: { name: 'Timecode (HH:MM:SS)' },
		timecodeHMSF: { name: 'Timecode (HH:MM:SS:FF)' },
		timecodeH: { name: 'Timecode (HH)' },
		timecodeM: { name: 'Timecode (MM)' },
		timecodeS: { name: 'Timecode (SS)' },
		timecodeF: { name: 'Timecode (FF)' },

		// timecode vars (countdown):
		countdownTimecodeHMS: { name: 'Countdown Timecode (HH:MM:SS)' },
		countdownTimecodeHMSF: { name: 'Countdown Timecode (HH:MM:SS:FF)' },
		countdownTimecodeH: { name: 'Countdown Timecode (HH)' },
		countdownTimecodeM: { name: 'Countdown Timecode (MM)' },
		countdownTimecodeS: { name: 'Countdown Timecode (SS)' },
		countdownTimecodeF: { name: 'Countdown Timecode (FF)' },
	}

	if (instance.model.hasSeparateInputFormat) {
		variables.inputVideoFormat = { name: 'Input video format' }
	}

	const values: Partial<VariablesSchema> = {}

	updateTransportInfoVariables(instance, values)

	// Slot variables
	instance.slotInfo.forEach((slot, index) => {
		if (slot != null) {
			variables[`slot${index}_recordingTime`] = {
				name: `Slot ${index} recording time available`,
			}
		}
	})
	updateSlotInfoVariables(instance, values)

	// Clip variables
	for (const { clipId } of instance.simpleClipsList) {
		variables[`clip${clipId}_name`] = {
			name: `Clip ${clipId} Name`,
		}
	}
	updateClipVariables(instance, values)

	// Configuration variables
	updateConfigurationVariables(instance, values)

	// Target IP
	values['ip'] = instance.config.bonjourHost?.split(':')[0] ?? instance.config.host ?? '-'

	updateTimecodeVariables(instance, values)
	updateRemoteVariable(instance, values)

	instance.setVariableDefinitions(variables)
	instance.setVariableValues(values)
}
