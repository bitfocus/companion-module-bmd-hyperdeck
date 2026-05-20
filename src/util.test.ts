import { getTimestamp, protocolGte, stripExtension, mergeState, toHHMMSS, makeSimpleClipInfos } from './util'

// Define Jest globals to avoid type errors
declare const describe: any
declare const it: any
declare const expect: any
declare const jest: any

describe('util', () => {
	describe('getTimestamp', () => {
		it('should return a timestamp in the format YYYYMMDD_HHMMSS', () => {
			const timestamp = getTimestamp()
			// Format is YYYYMMDD_HHMMSS (15 characters)
			expect(timestamp).toMatch(/^\d{8}_\d{6}$/)
		})
		
		it('should return consistent format even with single digit values', () => {
			// Mock the Date object to have single digits
			const mockDate = new Date(2023, 0, 1, 5, 6, 7) // Jan 1, 2023 05:06:07
			jest.useFakeTimers().setSystemTime(mockDate)
			
			const timestamp = getTimestamp()
			expect(timestamp).toBe('20230101_050607')
			
			jest.useRealTimers()
		})
	})

	describe('protocolGte', () => {
		it('should correctly compare semantic version strings', () => {
			expect(protocolGte('2.0.0', '1.9.0')).toBe(true)
			expect(protocolGte('1.9.0', '2.0.0')).toBe(false)
			expect(protocolGte('2.0.0', '2.0.0')).toBe(true)
		})

		it('should handle numeric inputs', () => {
			expect(protocolGte(2, 1)).toBe(true)
			expect(protocolGte(1, 2)).toBe(false)
		})

		it('should return false for invalid version strings', () => {
			expect(protocolGte('invalid', '1.0.0')).toBe(false)
			expect(protocolGte('1.0.0', 'invalid')).toBe(false)
		})
	})

	describe('stripExtension', () => {
		it('should remove file extension when present', () => {
			expect(stripExtension('file.txt')).toBe('file')
			expect(stripExtension('video.mp4')).toBe('video')
			expect(stripExtension('image.png')).toBe('image')
		})

		it('should return original string when no extension', () => {
			expect(stripExtension('file')).toBe('file')
			expect(stripExtension('')).toBe('')
		})

		it('should handle multiple dots correctly', () => {
			// Note: The regex only matches 3-character extensions after a dot
			expect(stripExtension('file.tar.gz')).toBe('file.tar.gz') // .gz is only 2 chars, so not removed
			expect(stripExtension('file.name.with.dots')).toBe('file.name.with.dots') // .dots is 4 chars, so not removed
			expect(stripExtension('file.name.doc')).toBe('file.name') // .doc is 3 chars, so removed
		})

		it('should handle files with 3-character extensions correctly', () => {
			// Only handles extensions with exactly 3 lowercase letters or digits
			expect(stripExtension('file.txt')).toBe('file') // 3-letter extension removed
			expect(stripExtension('data.xml')).toBe('data') // 3-letter extension removed
			expect(stripExtension('data.xm1')).toBe('data') // 3-char extension with letter and digit removed
			expect(stripExtension('file.v99')).toBe('file') // 3-digit extension removed
			expect(stripExtension('file.v12')).toBe('file') // 3-char extension with digits removed
			// Extensions that don't match exactly 3 lowercase letters/digits remain
			expect(stripExtension('file.v123')).toBe('file.v123') // 4 chars, not removed
			expect(stripExtension('file.xmL')).toBe('file.xmL') // has uppercase L, not removed
		})
	})

	describe('mergeState', () => {
		it('should merge properties from patch into current state', () => {
			const currentState = { a: 1, b: 2, c: 3 }
			const patch = { a: 10, d: 4 }
			const result = mergeState(currentState, patch)

			expect(result).toEqual({ a: 10, b: 2, c: 3, d: 4 })
			expect(result).not.toBe(currentState) // Should return new object
		})

		it('should not overwrite with undefined values', () => {
			const currentState = { a: 1, b: 2 }
			const patch: { a?: number; b?: number; c?: number } = { a: undefined, b: 20, c: 30 }
			const result = mergeState(currentState, patch)

			expect(result).toEqual({ a: 1, b: 20, c: 30 }) // a should remain 1, not become undefined
		})

		it('should handle empty patch', () => {
			const currentState = { a: 1, b: 2 }
			const patch = {}
			const result = mergeState(currentState, patch)

			expect(result).toEqual({ a: 1, b: 2 })
		})

		it('should handle undefined patch', () => {
			const currentState = { a: 1, b: 2 }
			// @ts-expect-error Testing incorrect usage
			const result = mergeState(currentState, undefined)

			expect(result).toEqual({ a: 1, b: 2 }) // Should return original with no modifications
		})
	})

	describe('toHHMMSS', () => {
		it('should convert seconds to HH:MM:SS format', () => {
			expect(toHHMMSS(0)).toBe('00:00:00')
			expect(toHHMMSS(1)).toBe('00:00:01')
			expect(toHHMMSS(61)).toBe('00:01:01')
			expect(toHHMMSS(3661)).toBe('01:01:01') // 1 hour, 1 minute, 1 second
		})

		it('should pad single digits with zero', () => {
			expect(toHHMMSS(5)).toBe('00:00:05')
			expect(toHHMMSS(65)).toBe('00:01:05')
			expect(toHHMMSS(3605)).toBe('01:00:05')
		})

		it('should handle large values', () => {
			expect(toHHMMSS(7265)).toBe('02:01:05') // 2 hours, 1 minute, 5 seconds
		})
	})

	describe('makeSimpleClipInfos', () => {
		it('should transform clip info objects to simple format', () => {
			const clips = [
				{ clipId: 1, name: 'Clip 1', extraProperty: 'extra1' },
				{ clipId: 2, name: 'Clip 2', extraProperty: 'extra2' },
			] as any // Casting since we don't have the full Commands.ClipInfo type

			const result = makeSimpleClipInfos(clips)

			expect(result).toEqual([
				{ clipId: 1, name: 'Clip 1' },
				{ clipId: 2, name: 'Clip 2' },
			])
		})

		it('should handle empty array', () => {
			const clips: any[] = []
			const result = makeSimpleClipInfos(clips)

			expect(result).toEqual([])
		})

		it('should only preserve clipId and name', () => {
			const clips = [
				{
					clipId: 1,
					name: 'Test Clip',
					duration: 100,
					type: 'video',
					tags: ['tag1', 'tag2'],
				},
			] as any

			const result = makeSimpleClipInfos(clips)

			expect(result).toEqual([{ clipId: 1, name: 'Test Clip' }])
			expect(result[0]).not.toHaveProperty('duration')
			expect(result[0]).not.toHaveProperty('type')
			expect(result[0]).not.toHaveProperty('tags')
		})
	})
})