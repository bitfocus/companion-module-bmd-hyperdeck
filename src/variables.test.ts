import { InstanceBaseExt } from './types.js'
import {
	updateTransportInfoVariables,
	updateClipVariables,
	updateSlotInfoVariables,
	updateTimecodeVariables,
	updateConfigurationVariables,
	updateRemoteVariable
} from './variables.js'
import { SlotStatus, VideoFormat } from 'hyperdeck-connection'

// Mock companion module types
type CompanionVariableValues = Record<string, string | number | boolean>
type CompanionVariableDefinition = {
	name: string
	variableId: string
}

// Create a mock InstanceBaseExt for testing purposes
class MockInstanceBaseExt {
	transportInfo: any = {}
	slotInfo: any[] = []
	simpleClipsList: any[] = []
	fullClipsList: any[] = []
	deckConfig: any = {}
	remoteInfo: any = null
	model: any = { hasSeparateInputFormat: false }

	setVariableDefinitions(_variables: CompanionVariableDefinition[]) {}
	setVariableValues(_values: CompanionVariableValues) {}
	log(_level: string, _message: string) {}
}

describe('variables.ts functions', () => {
	describe('updateTransportInfoVariables', () => {
		it('should update transport info variables correctly', () => {
			const instance = new MockInstanceBaseExt()
			instance.transportInfo = {
				status: 'playing',
				speed: 1.0,
				clipId: 1,
				slotId: 2,
				videoFormat: VideoFormat._1080p30
			}
			
			const newValues: CompanionVariableValues = {}
			updateTransportInfoVariables(instance as InstanceBaseExt, newValues)

			expect(newValues['status']).toBe('Playing')
			expect(newValues['speed']).toBe(1.0)
			expect(newValues['clipId']).toBe(1)
			expect(newValues['slotId']).toBe(2)
			expect(newValues['videoFormat']).toBe(VideoFormat._1080p30)
		})

		it('should handle null clipId and slotId', () => {
			const instance = new MockInstanceBaseExt()
			instance.transportInfo = {
				status: 'stopped',
				speed: 0.0,
				clipId: null,
				slotId: null,
				videoFormat: null
			}
			
			const newValues: CompanionVariableValues = {}
			updateTransportInfoVariables(instance as InstanceBaseExt, newValues)

			expect(newValues['status']).toBe('Stopped')
			expect(newValues['clipId']).toBe('-')
			expect(newValues['slotId']).toBe('-')
			expect(newValues['videoFormat']).toBe('none')
		})
		
		it('should handle clips with extension stripping', () => {
			const instance = new MockInstanceBaseExt()
			instance.transportInfo = {
				status: 'playing',
				speed: 1.0,
				clipId: 1,
				slotId: 2,
				videoFormat: VideoFormat._1080p30
			}
			instance.simpleClipsList = [
				{ clipId: 1, name: 'test_clip.mp4' }
			]
			
			const newValues: CompanionVariableValues = {}
			updateTransportInfoVariables(instance as InstanceBaseExt, newValues)

			expect(newValues['clipName']).toBe('test_clip')
		})

		it('should handle clip not found in list', () => {
			const instance = new MockInstanceBaseExt()
			instance.transportInfo = {
				status: 'playing',
				speed: 1.0,
				clipId: 5,
				slotId: 2,
				videoFormat: VideoFormat._1080p30
			}
			instance.simpleClipsList = [
				{ clipId: 1, name: 'test_clip.mp4' }
			]
			
			const newValues: CompanionVariableValues = {}
			updateTransportInfoVariables(instance as InstanceBaseExt, newValues)

			expect(newValues['clipName']).toBe('-')
		})
		
		it('should handle input video format when applicable', () => {
			const instance = new MockInstanceBaseExt()
			instance.model.hasSeparateInputFormat = true
			instance.transportInfo = {
				status: 'playing',
				speed: 1.0,
				clipId: 1,
				slotId: 2,
				videoFormat: VideoFormat._1080p30,
				inputVideoFormat: VideoFormat._720p60
			}
			
			const newValues: CompanionVariableValues = {}
			updateTransportInfoVariables(instance as InstanceBaseExt, newValues)

			expect(newValues['inputVideoFormat']).toBe(VideoFormat._720p60)
		})
	})

	describe('updateClipVariables', () => {
		it('should update clip variables correctly', () => {
			const instance = new MockInstanceBaseExt()
			instance.simpleClipsList = [
				{ clipId: 1, name: 'clip1.mp4' },
				{ clipId: 2, name: 'clip2.mov' }
			]
			
			const newValues: CompanionVariableValues = {}
			updateClipVariables(instance as InstanceBaseExt, newValues)

			expect(newValues['clipCount']).toBe(2)
			expect(newValues['clip1_name']).toBe('clip1')
			expect(newValues['clip2_name']).toBe('clip2')
		})

		it('should handle empty clip list', () => {
			const instance = new MockInstanceBaseExt()
			instance.simpleClipsList = []
			
			const newValues: CompanionVariableValues = {}
			updateClipVariables(instance as InstanceBaseExt, newValues)

			expect(newValues['clipCount']).toBe(0)
		})
	})

	describe('updateSlotInfoVariables', () => {
		it('should update slot info variables with mounted slot', () => {
			const instance = new MockInstanceBaseExt()
			instance.transportInfo = {
				slotId: 1
			}
			instance.slotInfo = [
				null,
				{
					slotId: 1,
					status: SlotStatus.MOUNTED,
					recordingTime: 125
				}
			]
			
			const newValues: CompanionVariableValues = {}
			updateSlotInfoVariables(instance as InstanceBaseExt, newValues)

			expect(newValues['slot1_recordingTime']).toBe('00:02:05')
			expect(newValues['recordingTime']).toBe('00:02:05')
		})

		it('should handle unmounted slots', () => {
			const instance = new MockInstanceBaseExt()
			instance.slotInfo = [
				{
					slotId: 0,
					status: 'unmounted' as SlotStatus,
					recordingTime: 125
				}
			]
			
			const newValues: CompanionVariableValues = {}
			updateSlotInfoVariables(instance as InstanceBaseExt, newValues)

			// Should remain default since it's unmounted
			expect(newValues['slot0_recordingTime']).toBe('--:--:--')
		})

		it('should handle invalid recording time', () => {
			const instance = new MockInstanceBaseExt()
			instance.transportInfo = {
				slotId: 0
			}
			instance.slotInfo = [
				{
					slotId: 0,
					status: SlotStatus.MOUNTED,
					recordingTime: null
				}
			]
			
			const newValues: CompanionVariableValues = {}
			updateSlotInfoVariables(instance as InstanceBaseExt, newValues)

			// Should remain default since recordingTime is null
			expect(newValues['recordingTime']).toBe('--:--:--')
		})
	})

	describe('updateTimecodeVariables', () => {
		it('should update timecode variables with valid timebase', () => {
			const instance = new MockInstanceBaseExt()
			instance.transportInfo = {
				displayTimecode: '01:23:45:12',
				videoFormat: VideoFormat._1080p30,
				slotId: 1,
				status: 'play',
				clipId: 1
			}
			instance.fullClipsList = [
				{
					clipId: 1,
					duration: '02:00:00:00',
					startTime: '00:00:00:00'
				}
			]
			
			const newValues: CompanionVariableValues = {}
			updateTimecodeVariables(instance as InstanceBaseExt, newValues)

			// Check primary timecode values
			expect(newValues['timecodeHMS']).toBe('01:23:45')
			expect(newValues['timecodeHMSF']).toBe('01:23:45:12')
			expect(newValues['timecodeH']).toBe('01')
			expect(newValues['timecodeM']).toBe('23')
			expect(newValues['timecodeS']).toBe('45')
			expect(newValues['timecodeF']).toBe('12')
		})

		it('should handle countdown timecode when clip is available', () => {
			const instance = new MockInstanceBaseExt()
			instance.transportInfo = {
				displayTimecode: '01:23:45:12',
				videoFormat: VideoFormat._1080p30,
				slotId: 1,
				status: 'play',
				clipId: 1
			}
			instance.fullClipsList = [
				{
					clipId: 1,
					duration: '02:00:00:00',
					startTime: '00:00:00:00'
				}
			]
			
			const newValues: CompanionVariableValues = {}
			updateTimecodeVariables(instance as InstanceBaseExt, newValues)

			// Countdown timecode should be calculated
			expect(newValues['countdownTimecodeHMS']).toBeDefined()
			expect(newValues['countdownTimecodeHMSF']).toBeDefined()
		})

		it('should handle timecode parsing without video format', () => {
			const instance = new MockInstanceBaseExt()
			instance.transportInfo = {
				displayTimecode: '01:23:45:12',
				videoFormat: null
			}
			
			const newValues: CompanionVariableValues = {}
			updateTimecodeVariables(instance as InstanceBaseExt, newValues)

			// With invalid video format, it should parse using regex fallback
			expect(newValues['timecodeHMSF']).toBe('01:23:45:12')
		})

		it('should handle bad timecode format gracefully', () => {
			const instance = new MockInstanceBaseExt()
			instance.transportInfo = {
				displayTimecode: 'bad_format',
				videoFormat: VideoFormat._1080p30
			}
			
			const newValues: CompanionVariableValues = {}
			updateTimecodeVariables(instance as InstanceBaseExt, newValues)

			// Should have default values when parsing fails
			expect(newValues['timecodeHMS']).toBe('--:--:--')
		})
	})

	describe('updateConfigurationVariables', () => {
		it('should update configuration variables correctly', () => {
			const instance = new MockInstanceBaseExt()
			instance.deckConfig = {
				fileFormat: 'QuickTimeProRes',
				audioCodec: 'pcm',
				audioInputChannels: 2
			}

			const newValues: CompanionVariableValues = {}
			updateConfigurationVariables(instance as InstanceBaseExt, newValues)

			expect(newValues['fileFormat']).toBe('QuickTime ProRes')
			expect(newValues['audioCodec']).toBe('pcm')
			expect(newValues['audioChannels']).toBe(2)
		})

		it('should handle unknown file format', () => {
			const instance = new MockInstanceBaseExt()
			instance.deckConfig = {
				fileFormat: 'unknown_format',
				audioCodec: 'dtsx',
				audioInputChannels: 8
			}
			
			const newValues: CompanionVariableValues = {}
			updateConfigurationVariables(instance as InstanceBaseExt, newValues)

			expect(newValues['fileFormat']).toBe('unknown_format')
			expect(newValues['audioCodec']).toBe('dtsx')
			expect(newValues['audioChannels']).toBe(8)
		})
	})

	describe('updateRemoteVariable', () => {
		it('should update remote variable when enabled', () => {
			const instance = new MockInstanceBaseExt()
			instance.remoteInfo = {
				enabled: true
			}
			
			const newValues: CompanionVariableValues = {}
			updateRemoteVariable(instance as InstanceBaseExt, newValues)

			expect(newValues['remoteEnabled']).toBe(true)
		})

		it('should update remote variable when disabled', () => {
			const instance = new MockInstanceBaseExt()
			instance.remoteInfo = {
				enabled: false
			}
			
			const newValues: CompanionVariableValues = {}
			updateRemoteVariable(instance as InstanceBaseExt, newValues)

			expect(newValues['remoteEnabled']).toBe(false)
		})

		it('should handle null remote info', () => {
			const instance = new MockInstanceBaseExt()
			instance.remoteInfo = null
			
			const newValues: CompanionVariableValues = {}
			updateRemoteVariable(instance as InstanceBaseExt, newValues)

			expect(newValues['remoteEnabled']).toBe(false)
		})
	})
	
})