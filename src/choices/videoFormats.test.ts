import { VideoFormat } from 'hyperdeck-connection'
import {
	FORMATS_SD,
	FORMATS_SD_PROGRESSIVE,
	FORMATS_HD_SDI,
	FORMATS_2K_DCI,
	FORMATS_3G_SDI,
	FORMATS_4K30,
	FORMATS_4K_DCI,
	FORMATS_4K60,
	FORMATS_8K,
	FORMATS_8K_DCI,
	FORMATS_ALL,
	VideoFormatsToChoices,
} from './videoFormats'

// Define Jest globals to avoid type errors
declare const describe: any
declare const test: any
declare const it: any
declare const expect: any
declare const jest: any

describe('videoFormats', () => {
	describe('FORMATS_SD', () => {
		it('should contain NTSC and PAL formats', () => {
			expect(FORMATS_SD).toContain(VideoFormat.NTSC)
			expect(FORMATS_SD).toContain(VideoFormat.PAL)
			expect(FORMATS_SD).toHaveLength(2)
		})
	})

	describe('FORMATS_SD_PROGRESSIVE', () => {
		it('should contain NTSCp and PALp formats', () => {
			expect(FORMATS_SD_PROGRESSIVE).toContain(VideoFormat.NTSCp)
			expect(FORMATS_SD_PROGRESSIVE).toContain(VideoFormat.PALp)
			expect(FORMATS_SD_PROGRESSIVE).toHaveLength(2)
		})
	})

	describe('FORMATS_HD_SDI', () => {
		it('should contain HD SDI formats', () => {
			const expectedFormats = [
				VideoFormat._720p50,
				VideoFormat._720p5994,
				VideoFormat._720p60,
				VideoFormat._1080p23976,
				VideoFormat._1080p24,
				VideoFormat._1080p25,
				VideoFormat._1080p2997,
				VideoFormat._1080p30,
				VideoFormat._1080i50,
				VideoFormat._1080i5994,
				VideoFormat._1080i60,
			]
			
			expectedFormats.forEach(format => {
				expect(FORMATS_HD_SDI).toContain(format)
			})
			expect(FORMATS_HD_SDI).toHaveLength(expectedFormats.length)
		})
	})

	describe('FORMATS_2K_DCI', () => {
		it('should contain 2K DCI formats', () => {
			expect(FORMATS_2K_DCI).toContain(VideoFormat._2Kp23976DCI)
			expect(FORMATS_2K_DCI).toContain(VideoFormat._2Kp24DCI)
			expect(FORMATS_2K_DCI).toContain(VideoFormat._2Kp25DCI)
			expect(FORMATS_2K_DCI).toHaveLength(3)
		})
	})

	describe('FORMATS_3G_SDI', () => {
		it('should contain 3G SDI formats', () => {
			expect(FORMATS_3G_SDI).toContain(VideoFormat._1080p50)
			expect(FORMATS_3G_SDI).toContain(VideoFormat._1080p5994)
			expect(FORMATS_3G_SDI).toContain(VideoFormat._1080p60)
			expect(FORMATS_3G_SDI).toHaveLength(3)
		})
	})

	describe('FORMATS_4K30', () => {
		it('should contain 4K formats up to 30fps', () => {
			const expectedFormats = [
				VideoFormat._4Kp23976,
				VideoFormat._4Kp24,
				VideoFormat._4Kp25,
				VideoFormat._4Kp2997,
				VideoFormat._4Kp30,
			]
			
			expectedFormats.forEach(format => {
				expect(FORMATS_4K30).toContain(format)
			})
			expect(FORMATS_4K30).toHaveLength(expectedFormats.length)
		})
	})

	describe('FORMATS_4K_DCI', () => {
		it('should contain 4K DCI formats', () => {
			expect(FORMATS_4K_DCI).toContain(VideoFormat._4Kp23976DCI)
			expect(FORMATS_4K_DCI).toContain(VideoFormat._4Kp24DCI)
			expect(FORMATS_4K_DCI).toContain(VideoFormat._4Kp25DCI)
			expect(FORMATS_4K_DCI).toHaveLength(3)
		})
	})

	describe('FORMATS_4K60', () => {
		it('should contain 4K formats up to 60fps', () => {
			const expectedFormats = [
				VideoFormat._4Kp50,
				VideoFormat._4Kp5994,
				VideoFormat._4Kp60,
			]
			
			expectedFormats.forEach(format => {
				expect(FORMATS_4K60).toContain(format)
			})
			expect(FORMATS_4K60).toHaveLength(expectedFormats.length)
		})
	})

	describe('FORMATS_8K', () => {
		it('should contain 8K formats', () => {
			const expectedFormats = [
				VideoFormat._8Kp23976,
				VideoFormat._8Kp24,
				VideoFormat._8Kp25,
				VideoFormat._8Kp2997,
				VideoFormat._8Kp30,
				VideoFormat._8Kp50,
				VideoFormat._8Kp5994,
				VideoFormat._8Kp60,
			]
			
			expectedFormats.forEach(format => {
				expect(FORMATS_8K).toContain(format)
			})
			expect(FORMATS_8K).toHaveLength(expectedFormats.length)
		})
	})

	describe('FORMATS_8K_DCI', () => {
		it('should contain 8K DCI formats', () => {
			expect(FORMATS_8K_DCI).toContain(VideoFormat._8Kp23976DCI)
			expect(FORMATS_8K_DCI).toContain(VideoFormat._8Kp24DCI)
			expect(FORMATS_8K_DCI).toContain(VideoFormat._8Kp25DCI)
			expect(FORMATS_8K_DCI).toHaveLength(3)
		})
	})

	describe('FORMATS_ALL', () => {
		it('should contain all formats except 2K DCI, 4K DCI, and 8K', () => {
			// Check that all individual format arrays are included in FORMATS_ALL
			FORMATS_SD.forEach(format => expect(FORMATS_ALL).toContain(format))
			FORMATS_SD_PROGRESSIVE.forEach(format => expect(FORMATS_ALL).toContain(format))
			FORMATS_HD_SDI.forEach(format => expect(FORMATS_ALL).toContain(format))
			FORMATS_3G_SDI.forEach(format => expect(FORMATS_ALL).toContain(format))
			FORMATS_4K30.forEach(format => expect(FORMATS_ALL).toContain(format))
			FORMATS_4K60.forEach(format => expect(FORMATS_ALL).toContain(format))

			// The formats mentioned as "TODO" above should NOT be in FORMATS_ALL
			// Check that 2K DCI formats are NOT in FORMATS_ALL
			FORMATS_2K_DCI.forEach(format => expect(FORMATS_ALL).not.toContain(format))
			
			// Check that 4K DCI formats are NOT in FORMATS_ALL
			FORMATS_4K_DCI.forEach(format => expect(FORMATS_ALL).not.toContain(format))
			
			// Check that 8K formats are NOT in FORMATS_ALL
			FORMATS_8K.forEach(format => expect(FORMATS_ALL).not.toContain(format))
			FORMATS_8K_DCI.forEach(format => expect(FORMATS_ALL).not.toContain(format))

			// Calculate expected length based on included arrays
			const expectedLength =
				FORMATS_SD.length +
				FORMATS_SD_PROGRESSIVE.length +
				FORMATS_HD_SDI.length +
				FORMATS_3G_SDI.length +
				FORMATS_4K30.length +
				FORMATS_4K60.length
			
			expect(FORMATS_ALL).toHaveLength(expectedLength)
		})
	})

	describe('VideoFormatsToChoices', () => {
		it('should convert video formats to dropdown choices', () => {
			const testFormats: VideoFormat[] = [VideoFormat.NTSC, VideoFormat.PAL, VideoFormat._720p50]
			const choices = VideoFormatsToChoices(testFormats)

			expect(choices).toHaveLength(3)
			expect(choices).toEqual([
				{ id: VideoFormat.NTSC, label: VideoFormat.NTSC },
				{ id: VideoFormat.PAL, label: VideoFormat.PAL },
				{ id: VideoFormat._720p50, label: VideoFormat._720p50 },
			])
		})

		it('should return empty array when given empty array', () => {
			const choices = VideoFormatsToChoices([])
			expect(choices).toEqual([])
		})

		it('should handle single format correctly', () => {
			const choices = VideoFormatsToChoices([VideoFormat.NTSC])
			expect(choices).toEqual([{ id: VideoFormat.NTSC, label: VideoFormat.NTSC }])
		})

		it('should create choices with matching id and label values', () => {
			const testFormats: VideoFormat[] = [
				VideoFormat._4Kp24,
				VideoFormat._1080p30,
				VideoFormat._2Kp25DCI,
			]
			const choices = VideoFormatsToChoices(testFormats)

			testFormats.forEach((format, index) => {
				expect(choices[index].id).toBe(format)
				expect(choices[index].label).toBe(format)
			})
		})
	})
})