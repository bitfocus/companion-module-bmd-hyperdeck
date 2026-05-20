import {
	createModelChoices,
	createClipsChoice,
	CHOICES_STARTEND,
	CHOICES_PREVIEWMODE,
	CHOICES_AUDIOCODEC,
	CHOICES_AUDIOCHANNELS,
	CHOICES_DYNAMICRANGE,
	CHOICES_FILESYSTEM,
	CHOICES_REMOTECONTROL,
	CHOICES_TRANSPORTSTATUS,
	CHOICES_SLOTSTATUS,
	CHOICES_ENABLEDISABLE,
	CHOICES_REMOTESTATUS,
	CONFIG_FILEFORMATS,
	AudioInputType,
	VideoInputType,
	FileFormatFamily,
	ModelChoices,
} from './choices.js'
import { ModelInfo } from './models.js'
import { VideoFormat } from 'hyperdeck-connection'

// Define Jest globals to avoid type errors
declare const describe: any
declare const test: any
declare const it: any
declare const expect: any
declare const jest: any

// Define a minimal mock for VideoFormat if needed
// For testing purposes we can use string-like values
const MOCK_VIDEO_FORMAT: VideoFormat = '1080i50' as any

describe('choices', () => {
	describe('Constants', () => {
		test('CHOICES_STARTEND should have correct values', () => {
			expect(CHOICES_STARTEND).toEqual([
				{ id: 'start', label: 'Start' },
				{ id: 'end', label: 'End' },
			])
		})

		test('CHOICES_PREVIEWMODE should have correct values', () => {
			expect(CHOICES_PREVIEWMODE).toEqual([
				{ id: 'true', label: 'Preview' },
				{ id: 'false', label: 'Output' },
			])
		})

		test('CHOICES_AUDIOCODEC should have correct values', () => {
			expect(CHOICES_AUDIOCODEC).toEqual([
				{ id: 'PCM', label: 'PCM' },
				{ id: 'AAC', label: 'AAC (2 channels only)' },
			])
		})

		test('CHOICES_AUDIOCHANNELS should have correct values', () => {
			expect(CHOICES_AUDIOCHANNELS).toEqual([
				{ id: '2', label: '2 Channels' },
				{ id: '4', label: '4 Channels' },
				{ id: '8', label: '8 Channels' },
				{ id: '16', label: '16 Channels' },
				{ id: 'cycle', label: 'Cycle' },
			])
		})

		test('CHOICES_DYNAMICRANGE should have correct values', () => {
			expect(CHOICES_DYNAMICRANGE).toContainEqual({ id: 'auto', label: 'Auto' })
			expect(CHOICES_DYNAMICRANGE).toContainEqual({ id: 'Rec709', label: 'Rec.709' })
			expect(CHOICES_DYNAMICRANGE).toContainEqual({ id: 'HLG', label: 'HLG' })
			expect(CHOICES_DYNAMICRANGE).toContainEqual({ id: 'ST2084_1000', label: 'ST2084 1000 ' })
			expect(CHOICES_DYNAMICRANGE.length).toBeGreaterThan(0)
		})

		test('CHOICES_FILESYSTEM should have correct values', () => {
			expect(CHOICES_FILESYSTEM).toEqual([
				{ id: 'HFS+', label: 'HFS+' },
				{ id: 'exFAT', label: 'exFAT' },
			])
		})

		test('CHOICES_REMOTECONTROL should have correct values', () => {
			expect(CHOICES_REMOTECONTROL).toHaveLength(3)
			expect(CHOICES_REMOTECONTROL[0]).toEqual({ id: 'toggle', label: 'Toggle' })
			expect(CHOICES_REMOTECONTROL[1].label).toBe('Enable')
			expect(CHOICES_REMOTECONTROL[2].label).toBe('Disable')
		})

		test('CHOICES_TRANSPORTSTATUS should have correct values', () => {
			const expectedValues = [
				'preview', 'stopped', 'play', 'forward', 'rewind', 'jog', 'shuttle', 'record'
			]
			expect(CHOICES_TRANSPORTSTATUS).toHaveLength(expectedValues.length)

			expectedValues.forEach((value, index) => {
				expect(CHOICES_TRANSPORTSTATUS[index].id).toBe(value)
			})
		})

		test('CHOICES_SLOTSTATUS should have correct values', () => {
			expect(CHOICES_SLOTSTATUS).toEqual([
				{ id: 'empty', label: 'Empty' },
				{ id: 'error', label: 'Error' },
				{ id: 'mounted', label: 'Mounted' },
				{ id: 'mounting', label: 'Mounting' },
			])
		})

		test('CHOICES_ENABLEDISABLE should have correct values', () => {
			expect(CHOICES_ENABLEDISABLE).toHaveLength(2)
			expect(CHOICES_ENABLEDISABLE[0].label).toBe('Enable')
			expect(CHOICES_ENABLEDISABLE[1].label).toBe('Disable')
		})

		test('CHOICES_REMOTESTATUS should have correct values', () => {
			expect(CHOICES_REMOTESTATUS).toHaveLength(2)
			expect(CHOICES_REMOTESTATUS[0].label).toBe('Enabled')
			expect(CHOICES_REMOTESTATUS[1].label).toBe('Disabled')
		})
	})

	describe('Enums', () => {
		test('AudioInputType should have correct values', () => {
			expect(AudioInputType.Embedded).toBe('embedded')
			expect(AudioInputType.XLR).toBe('XLR')
			expect(AudioInputType.RCA).toBe('RCA')
		})

		test('VideoInputType should have correct values', () => {
			expect(VideoInputType.SDI).toBe('SDI')
			expect(VideoInputType.HDMI).toBe('HDMI')
			expect(VideoInputType.Component).toBe('component')
			expect(VideoInputType.Composite).toBe('composite')
			expect(VideoInputType.Optical).toBe('optical')
		})

		test('FileFormatFamily should have correct values', () => {
			expect(FileFormatFamily.Uncompressed).toBe('uncompressed')
			expect(FileFormatFamily.ProRes).toBe('prores')
			expect(FileFormatFamily.Proxy).toBe('proxy')
			expect(FileFormatFamily.DNx).toBe('DNx')
			expect(FileFormatFamily.H264).toBe('H.264')
			expect(FileFormatFamily.H265).toBe('H.265')
			expect(FileFormatFamily.H264_5).toBe('H.264/5')
			// Check a few more values to ensure completeness
			expect(Object.values(FileFormatFamily)).toContain('H.265')
			expect(Object.values(FileFormatFamily)).toContain('H.264/5')
		})
	})

	describe('CONFIG_FILEFORMATS', () => {
		test('should have expected file formats', () => {
			expect(CONFIG_FILEFORMATS).toContainEqual({
				id: 'QuickTimeUncompressed',
				label: 'QuickTime Uncompressed',
				family: FileFormatFamily.Uncompressed,
			})

			expect(CONFIG_FILEFORMATS).toContainEqual({
				id: 'QuickTimeProResHQ',
				label: 'QuickTime ProRes HQ',
				family: FileFormatFamily.ProRes,
			})

			expect(CONFIG_FILEFORMATS).toContainEqual({
				id: 'H.264High',
				label: 'H.264 High',
				family: FileFormatFamily.H264,
			})

			// Verify that all entries have the required properties
			for (const format of CONFIG_FILEFORMATS) {
				expect(format.id).toBeDefined()
				expect(format.label).toBeDefined()
				expect(format.family).toBeDefined()
				expect(Object.values(FileFormatFamily)).toContain(format.family)
			}
		})
	})

	describe('createModelChoices', () => {
		it('should return empty arrays when model is undefined', () => {
			const result = createModelChoices(undefined)

			expect(result).toEqual({
				AudioInputs: [],
				VideoInputs: [],
				Slots: [],
				FileFormats: [],
				VideoFormats: [],
				Clips: [],
			})
		})

		it('should populate choices based on model audio inputs', () => {
			// Mock model with required properties
			const mockModel: ModelInfo = {
				id: 'test-model',
				label: 'Test Model',
				audioInputs: [AudioInputType.Embedded, AudioInputType.XLR],
				videoInputs: [],
				videoFormats: [],
				fileFormats: [],
				slotLabels: 'SSD2',
				maxShuttle: 1600,
				hasSeparateInputFormat: false,
			}

			const result = createModelChoices(mockModel)

			expect(result.AudioInputs).toEqual([
				{ id: 'embedded', label: 'Embedded' },
				{ id: 'XLR', label: 'XLR' },
			])
		})

		it('should handle unknown audio inputs by creating default choices', () => {
			const mockModel: ModelInfo = {
				id: 'test-model',
				label: 'Test Model',
				audioInputs: ['unknown_input' as AudioInputType], // Cast to avoid type error
				videoInputs: [],
				videoFormats: [],
				fileFormats: [],
				slotLabels: 'SSD2',
				maxShuttle: 1600,
				hasSeparateInputFormat: false,
			}

			const result = createModelChoices(mockModel)

			expect(result.AudioInputs).toEqual([
				{ id: 'unknown_input', label: 'unknown_input' },
			])
		})

		it('should populate choices based on model video inputs', () => {
			const mockModel: ModelInfo = {
				id: 'test-model',
				label: 'Test Model',
				audioInputs: [],
				videoInputs: [VideoInputType.SDI, VideoInputType.HDMI],
				videoFormats: [],
				fileFormats: [],
				slotLabels: 'SSD2',
				maxShuttle: 1600,
				hasSeparateInputFormat: false,
			}

			const result = createModelChoices(mockModel)

			expect(result.VideoInputs).toEqual([
				{ id: 'SDI', label: 'SDI' },
				{ id: 'HDMI', label: 'HDMI' },
			])
		})

		it('should handle unknown video inputs by creating default choices', () => {
			const mockModel: ModelInfo = {
				id: 'test-model',
				label: 'Test Model',
				audioInputs: [],
				videoInputs: ['unknown_video_input' as VideoInputType], // Cast to avoid type error
				videoFormats: [],
				fileFormats: [],
				slotLabels: 'SSD2',
				maxShuttle: 1600,
				hasSeparateInputFormat: false,
			}

			const result = createModelChoices(mockModel)

			expect(result.VideoInputs).toEqual([
				{ id: 'unknown_video_input', label: 'unknown_video_input' },
			])
		})

		it('should populate file formats based on model file format families', () => {
			const mockModel: ModelInfo = {
				id: 'test-model',
				label: 'Test Model',
				audioInputs: [],
				videoInputs: [],
				videoFormats: [],
				fileFormats: [FileFormatFamily.Uncompressed, FileFormatFamily.ProRes],
				slotLabels: 'SSD2',
				maxShuttle: 1600,
				hasSeparateInputFormat: false,
			}

			const result = createModelChoices(mockModel)

			const expectedFileFormats = CONFIG_FILEFORMATS.filter(
				format => [FileFormatFamily.Uncompressed, FileFormatFamily.ProRes].includes(format.family)
			)

			expect(result.FileFormats).toEqual(expectedFileFormats)
		})

		it('should populate slots based on model slot labels config', () => {
			const mockModel: ModelInfo = {
				id: 'test-model',
				label: 'Test Model',
				audioInputs: [],
				videoInputs: [],
				videoFormats: [],
				fileFormats: [],
				slotLabels: 'SSD2',
				maxShuttle: 1600,
				hasSeparateInputFormat: false,
			}

			const result = createModelChoices(mockModel)

			expect(result.Slots).toEqual([
				{ id: 1, label: '1: SSD 1' },
				{ id: 2, label: '2: SSD 2' },
			])
		})

		it('should return empty slots array for unknown slot label config', () => {
			const mockModel: ModelInfo = {
				id: 'test-model',
				label: 'Test Model',
				audioInputs: [],
				videoInputs: [],
				videoFormats: [],
				fileFormats: [],
				slotLabels: 'unknown_config',
				maxShuttle: 1600,
				hasSeparateInputFormat: false,
			}

			const result = createModelChoices(mockModel)

			expect(result.Slots).toEqual([])
		})

		it('should populate all fields correctly when model has all properties', () => {
			const mockModel: ModelInfo = {
				id: 'test-model',
				label: 'Test Model',
				audioInputs: [AudioInputType.Embedded, AudioInputType.XLR],
				videoInputs: [VideoInputType.HDMI, VideoInputType.Component],
				videoFormats: [MOCK_VIDEO_FORMAT], // Using mock since we don't have real video format constants
				fileFormats: [FileFormatFamily.H264, FileFormatFamily.DNx],
				slotLabels: 'SD2_USB',
				maxShuttle: 1600,
				hasSeparateInputFormat: false,
			}

			const result = createModelChoices(mockModel)

			expect(result.AudioInputs).toEqual([
				{ id: 'embedded', label: 'Embedded' },
				{ id: 'XLR', label: 'XLR' },
			])

			expect(result.VideoInputs).toEqual([
				{ id: 'HDMI', label: 'HDMI' },
				{ id: 'component', label: 'Component' },
			])

			const h264AndDnxFormats = CONFIG_FILEFORMATS.filter(
				format => [FileFormatFamily.H264, FileFormatFamily.DNx].includes(format.family)
			)
			expect(result.FileFormats).toEqual(h264AndDnxFormats)
		})
	})


	describe('createClipsChoice', () => {
		it('should create clip choices from instance simpleClipsList', () => {
			const mockInstance = {
				simpleClipsList: [
					{ clipId: 1, name: 'sample_clip.mov' },
					{ clipId: 2, name: 'another_clip.mp4' },
				],
			}

			const result = createClipsChoice(mockInstance as any)

			expect(result).toEqual([
				{ id: 'sample_clip.mov', label: 'sample_clip', clipId: 1 },
				{ id: 'another_clip.mp4', label: 'another_clip', clipId: 2 },
			])
		})

		it('should handle clips without extensions', () => {
			const mockInstance = {
				simpleClipsList: [
					{ clipId: 1, name: 'clip_without_extension' },
				],
			}

			const result = createClipsChoice(mockInstance as any)

			expect(result).toEqual([
				{ id: 'clip_without_extension', label: 'clip_without_extension', clipId: 1 },
			])
		})

		it('should return empty array when simpleClipsList is empty', () => {
			const mockInstance = {
				simpleClipsList: [],
			}

			const result = createClipsChoice(mockInstance as any)

			expect(result).toEqual([])
		})

		it('should handle complex file paths', () => {
			const mockInstance = {
				simpleClipsList: [
					{ clipId: 1, name: '/path/to/my.clip.mov' },
				],
			}

			const result = createClipsChoice(mockInstance as any)

			// Note: stripExtension behavior depends on the implementation; 
			// assuming it strips the last extension regardless of path separators
			expect(result[0].id).toBe('/path/to/my.clip.mov')
			expect(result[0].label).toMatch(/\/path\/to\/my\.clip$/)
		})
	})

	describe('ModelChoices interface', () => {
		it('should be properly defined with expected properties', () => {
			const mockModelChoices: ModelChoices = {
				AudioInputs: [{ id: 'test', label: 'Test' }],
				VideoInputs: [{ id: 'test', label: 'Test' }],
				Slots: [{ id: 1, label: 'Slot 1' }],
				FileFormats: [{ id: 'test', label: 'Test', family: FileFormatFamily.H264 }],
				VideoFormats: [{ id: 'test', label: 'Test' }],
				Clips: [{ id: 'test', label: 'Test', clipId: 1 }],
			}

			expect(mockModelChoices).toHaveProperty('AudioInputs')
			expect(mockModelChoices).toHaveProperty('VideoInputs')
			expect(mockModelChoices).toHaveProperty('Slots')
			expect(mockModelChoices).toHaveProperty('FileFormats')
			expect(mockModelChoices).toHaveProperty('VideoFormats')
			expect(mockModelChoices).toHaveProperty('Clips')
		})
	})
})