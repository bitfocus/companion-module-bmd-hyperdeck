import { CONFIG_MODELS, ModelInfo } from './models.js'
import { AudioInputType, FileFormatFamily, VideoInputType } from './choices.js'

// Define Jest globals to avoid type errors
declare const describe: any
declare const test: any
declare const it: any
declare const expect: any
declare const jest: any

describe('Models', () => {
	describe('CONFIG_MODELS', () => {
		it('should have all expected model IDs defined', () => {
			const expectedModelIds = [
				'hdStudio',
				'hdStudioPro',
				'hdStudio12G',
				'bmdDup4K',
				'hdStudioMini',
				'hdStudioHDMini',
				'hdStudioHDPlus',
				'hdStudioHDPro',
				'hdStudio4KPro',
				'hdExtreme8K',
				'hdShuttleHD',
			]

			expectedModelIds.forEach(modelId => {
				expect(CONFIG_MODELS[modelId]).toBeDefined()
			})
		})

		it('should have consistent structure for all models', () => {
			for (const modelId in CONFIG_MODELS) {
				const model = CONFIG_MODELS[modelId]

				// Check that all required properties exist
				expect(model.id).toBeDefined()
				expect(model.label).toBeDefined()
				expect(model.videoInputs).toBeDefined()
				expect(model.audioInputs).toBeDefined()
				expect(model.fileFormats).toBeDefined()
				expect(model.videoFormats).toBeDefined()
				expect(model.slotLabels).toBeDefined()
				expect(model.maxShuttle).toBeDefined()
				expect(model.hasSeparateInputFormat).toBeDefined()

				// Check property types
				expect(typeof model.id).toBe('string')
				expect(typeof model.label).toBe('string')
				expect(Array.isArray(model.videoInputs)).toBe(true)
				expect(Array.isArray(model.audioInputs)).toBe(true)
				expect(Array.isArray(model.fileFormats)).toBe(true)
				expect(Array.isArray(model.videoFormats)).toBe(true)
				expect(typeof model.slotLabels).toBe('string')
				expect(typeof model.maxShuttle).toBe('number')
				expect(typeof model.hasSeparateInputFormat).toBe('boolean')

				// Check that id matches the key
				expect(model.id).toBe(modelId)
			}
		})

		it('should have valid video input types for all models', () => {
			for (const modelId in CONFIG_MODELS) {
				const model = CONFIG_MODELS[modelId]
				
				model.videoInputs.forEach(videoInput => {
					expect(Object.values(VideoInputType)).toContain(videoInput)
				})
			}
		})

		it('should have valid audio input types for all models', () => {
			for (const modelId in CONFIG_MODELS) {
				const model = CONFIG_MODELS[modelId]
				
				model.audioInputs.forEach(audioInput => {
					expect(Object.values(AudioInputType)).toContain(audioInput)
				})
			}
		})

		it('should have valid file format families for all models', () => {
			for (const modelId in CONFIG_MODELS) {
				const model = CONFIG_MODELS[modelId]
				
				model.fileFormats.forEach(fileFormat => {
					expect(Object.values(FileFormatFamily)).toContain(fileFormat)
				})
			}
		})

		it('should have valid video formats for all models', () => {
			for (const modelId in CONFIG_MODELS) {
				const model = CONFIG_MODELS[modelId]
				
				// Check that videoFormats is an array of VideoFormat objects
				model.videoFormats.forEach(videoFormat => {
					// Since VideoFormat is imported from hyperdeck-connection, 
					// we can't validate the exact enum values here but can check it's defined
					expect(videoFormat).toBeDefined()
				})
			}
		})

		it('should have positive maxShuttle values', () => {
			for (const modelId in CONFIG_MODELS) {
				const model = CONFIG_MODELS[modelId]
				expect(model.maxShuttle).toBeGreaterThan(0)
			}
		})

		it('should have slotLabels as non-empty strings', () => {
			for (const modelId in CONFIG_MODELS) {
				const model = CONFIG_MODELS[modelId]
				expect(typeof model.slotLabels).toBe('string')
				expect(model.slotLabels.length).toBeGreaterThan(0)
			}
		})

		it('should have unique model IDs', () => {
			const modelIds = Object.keys(CONFIG_MODELS)
			const uniqueModelIds = [...new Set(modelIds)]
			
			expect(modelIds.length).toBe(uniqueModelIds.length)
		})

		describe('individual model properties', () => {
			it('should correctly configure hdStudio model', () => {
				const model = CONFIG_MODELS.hdStudio
				
				expect(model.id).toBe('hdStudio')
				expect(model.label).toBe('HyperDeck Studio')
				expect(model.videoInputs).toEqual([VideoInputType.SDI, VideoInputType.HDMI])
				expect(model.audioInputs).toEqual([AudioInputType.Embedded])
				expect(model.hasSeparateInputFormat).toBe(false)
				expect(model.maxShuttle).toBe(1600)
			})

			it('should correctly configure hdStudioPro model', () => {
				const model = CONFIG_MODELS.hdStudioPro
				
				expect(model.id).toBe('hdStudioPro')
				expect(model.label).toBe('HyperDeck Studio Pro')
				expect(model.videoInputs).toEqual([VideoInputType.SDI, VideoInputType.HDMI, VideoInputType.Component])
				expect(model.audioInputs).toEqual([AudioInputType.Embedded, AudioInputType.XLR, AudioInputType.RCA])
				expect(model.hasSeparateInputFormat).toBe(false)
				expect(model.maxShuttle).toBe(1600)
			})

			it('should correctly configure hdStudioHDMini model', () => {
				const model = CONFIG_MODELS.hdStudioHDMini
				
				expect(model.id).toBe('hdStudioHDMini')
				expect(model.label).toBe('HyperDeck Studio HD Mini')
				expect(model.videoInputs).toEqual([VideoInputType.SDI, VideoInputType.HDMI])
				expect(model.audioInputs).toEqual([AudioInputType.Embedded])
				expect(model.hasSeparateInputFormat).toBe(true)
				expect(model.maxShuttle).toBe(5000)
			})

			it('should correctly configure hdExtreme8K model', () => {
				const model = CONFIG_MODELS.hdExtreme8K
				
				expect(model.id).toBe('hdExtreme8K')
				expect(model.label).toBe('HyperDeck Extreme 8K')
				expect(model.videoInputs).toEqual([
					VideoInputType.SDI,
					VideoInputType.HDMI,
					VideoInputType.Component,
					VideoInputType.Composite,
					VideoInputType.Optical,
				])
				expect(model.audioInputs).toEqual([AudioInputType.Embedded, AudioInputType.XLR, AudioInputType.RCA])
				expect(model.hasSeparateInputFormat).toBe(true)
				expect(model.maxShuttle).toBe(5000)
			})
		})
	})

	describe('ModelInfo interface', () => {
		it('should be properly defined with all required fields', () => {
			// This test verifies that the ModelInfo interface is well-defined
			// by checking that all known models conform to it
			const sampleModel: ModelInfo = CONFIG_MODELS.hdStudio
			
			expect(sampleModel).toHaveProperty('id')
			expect(sampleModel).toHaveProperty('label')
			expect(sampleModel).toHaveProperty('videoInputs')
			expect(sampleModel).toHaveProperty('audioInputs')
			expect(sampleModel).toHaveProperty('fileFormats')
			expect(sampleModel).toHaveProperty('videoFormats')
			expect(sampleModel).toHaveProperty('slotLabels')
			expect(sampleModel).toHaveProperty('maxShuttle')
			expect(sampleModel).toHaveProperty('hasSeparateInputFormat')
		})
	})
})