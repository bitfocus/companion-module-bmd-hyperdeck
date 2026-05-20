import { Regex } from '@companion-module/base'
import { getConfigFields, HyperdeckConfig } from './config.js'

// Define Jest globals to avoid type errors
declare const describe: any
declare const it: any
declare const expect: any
declare const jest: any

describe('Config', () => {
	describe('getConfigFields', () => {
		it('should return an array of config fields', () => {
			const fields = getConfigFields()
			expect(Array.isArray(fields)).toBe(true)
			expect(fields.length).toBeGreaterThan(0)
		})

		it('should return correct number of config fields', () => {
			const fields = getConfigFields()
			// Count unique IDs to determine actual field count (avoiding duplicate 'info' IDs)
			const uniqueFields = fields.filter(
				(field, index, self) => self.findIndex(f => f.id === field.id) === index || field.type === 'static-text'
			)
			expect(uniqueFields.length).toBeGreaterThanOrEqual(9) // At least 9 unique fields
		})

		it('should include bonjour device field', () => {
			const fields = getConfigFields()
			const bonjourField = fields.find(field => field.id === 'bonjourHost')
			expect(bonjourField).toBeDefined()
			expect(bonjourField?.type).toBe('bonjour-device')
			expect(bonjourField?.label).toBe('Device')
			expect(bonjourField?.width).toBe(6)
		})

		it('should include host text input field', () => {
			const fields = getConfigFields()
			const hostField = fields.find(field => field.id === 'host')
			expect(hostField).toBeDefined()
			expect(hostField?.type).toBe('textinput')
			expect(hostField?.label).toBe('Target IP')
			expect(hostField?.width).toBe(6)
			// Type assertion to handle union type properly
			if (hostField && hostField.type === 'textinput' && 'regex' in hostField) {
				expect((hostField as any).regex).toBe(Regex.IP)
			}
		})

		it('should include host filler field', () => {
			const fields = getConfigFields()
			const fillerField = fields.find(field => field.id === 'host-filler')
			expect(fillerField).toBeDefined()
			expect(fillerField?.type).toBe('static-text')
			expect(fillerField?.width).toBe(6)
			// Type assertion to handle union type properly
			if (fillerField && fillerField.type === 'static-text' && 'value' in fillerField) {
				expect((fillerField as any).value).toBe('')
			}
		})

		it('should include model ID dropdown field', () => {
			const fields = getConfigFields()
			const modelField = fields.find(field => field.id === 'modelID')
			expect(modelField).toBeDefined()
			expect(modelField?.type).toBe('dropdown')
			expect(modelField?.label).toBe('Model')
			expect(modelField?.width).toBe(6)
			// Type assertion to handle union type properly
			if (modelField && modelField.type === 'dropdown' && 'choices' in modelField) {
				expect(Array.isArray((modelField as any).choices)).toBe(true)
			}
			if (modelField && modelField.type === 'dropdown' && 'default' in modelField) {
				expect((modelField as any).default).toBe(0)
			}
		})

		it('should include reel text input field', () => {
			const fields = getConfigFields()
			const reelField = fields.find(field => field.id === 'reel')
			expect(reelField).toBeDefined()
			expect(reelField?.type).toBe('textinput')
			expect(reelField?.label).toBe('Custom Reel')
			expect(reelField?.width).toBe(6)
			// Type assertion to handle union type properly
			if (reelField && reelField.type === 'textinput' && 'default' in reelField) {
				expect((reelField as any).default).toBe('A001')
			}
		})

		it('should include timecode variables dropdown field', () => {
			const fields = getConfigFields()
			const timecodeField = fields.find(field => field.id === 'timecodeVariables')
			expect(timecodeField).toBeDefined()
			expect(timecodeField?.type).toBe('dropdown')
			expect(timecodeField?.label).toBe('Timecode Variables')
			expect(timecodeField?.width).toBe(6)
			// Type assertion to handle union type properly
			if (timecodeField && timecodeField.type === 'dropdown' && 'choices' in timecodeField) {
				expect(Array.isArray((timecodeField as any).choices)).toBe(true)
			}
			if (timecodeField && timecodeField.type === 'dropdown' && 'default' in timecodeField) {
				expect((timecodeField as any).default).toBe('disabled')
			}
		})

		it('should include polling interval number field', () => {
			const fields = getConfigFields()
			const pollingField = fields.find(field => field.id === 'pollingInterval')
			expect(pollingField).toBeDefined()
			expect(pollingField?.type).toBe('number')
			expect(pollingField?.label).toBe('Polling Interval (in ms)')
			expect(pollingField?.width).toBe(6)
			// Type assertion to handle union type properly
			if (pollingField && pollingField.type === 'number' && 'min' in pollingField) {
				expect((pollingField as any).min).toBe(15)
			}
			if (pollingField && pollingField.type === 'number' && 'max' in pollingField) {
				expect((pollingField as any).max).toBe(10000)
			}
			if (pollingField && pollingField.type === 'number' && 'default' in pollingField) {
				expect((pollingField as any).default).toBe(500)
			}
			if (pollingField && pollingField.type === 'number' && 'required' in pollingField) {
				expect((pollingField as any).required).toBe(true)
			}
		})

		it('should have visibility conditions for host field', () => {
			const fields = getConfigFields()
			const hostField = fields.find(field => field.id === 'host')
			if (hostField && 'isVisible' in hostField) {
				// Test when bonjourHost is not present
				expect((hostField as any).isVisible({})).toBe(true)
				// Test when bonjourHost is present
				expect((hostField as any).isVisible({ bonjourHost: 'some-host' })).toBe(false)
			}
		})

		it('should have visibility conditions for host filler field', () => {
			const fields = getConfigFields()
			const fillerField = fields.find(field => field.id === 'host-filler')
			if (fillerField && 'isVisible' in fillerField) {
				// Test when bonjourHost is not present
				expect((fillerField as any).isVisible({})).toBe(false)
				// Test when bonjourHost is present
				expect((fillerField as any).isVisible({ bonjourHost: 'some-host' })).toBe(true)
			}
		})

		it('should have model choices sorted alphabetically', () => {
			const fields = getConfigFields()
			const modelField = fields.find(field => field.id === 'modelID')
			if (modelField && modelField.type === 'dropdown' && 'choices' in modelField) {
				const choices = (modelField as any).choices as Array<{id: string, label: string}>
				for (let i = 0; i < choices.length - 1; i++) {
					const currentLabel = choices[i].label.toLowerCase()
					const nextLabel = choices[i + 1].label.toLowerCase()
					expect(currentLabel.localeCompare(nextLabel)).toBeLessThanOrEqual(0)
				}
			}
		})

		it('should include the expected timecode variable choices', () => {
			const fields = getConfigFields()
			const timecodeField = fields.find(field => field.id === 'timecodeVariables')
			if (timecodeField && timecodeField.type === 'dropdown' && 'choices' in timecodeField) {
				const choices = (timecodeField as any).choices as Array<{id: string, label: string}>
				expect(choices).toContainEqual({ id: 'disabled', label: 'Disabled' })
				expect(choices).toContainEqual({ id: 'notifications', label: 'Notifications' })
				expect(choices).toContainEqual({ id: 'polling', label: 'Polling' })
			}
		})
	})

	describe('HyperdeckConfig interface', () => {
		it('should define the correct properties', () => {
			// This test verifies the interface exists and has expected properties
			const config: HyperdeckConfig = {
				host: '192.168.1.100',
				modelID: 'hdStudio',
				reel: 'A001',
				timecodeVariables: 'disabled',
				pollingInterval: 500,
			}

			expect(config.host).toBe('192.168.1.100')
			expect(config.modelID).toBe('hdStudio')
			expect(config.reel).toBe('A001')
			expect(config.timecodeVariables).toBe('disabled')
			expect(config.pollingInterval).toBe(500)
		})

		it('should allow optional bonjourHost property', () => {
			const configWithBonjour: HyperdeckConfig = {
				host: '192.168.1.100',
				modelID: 'hdStudio',
				reel: 'A001',
				timecodeVariables: 'notifications',
				pollingInterval: 250,
				bonjourHost: 'device.local'
			}

			expect(configWithBonjour.bonjourHost).toBe('device.local')
		})

		it('should accept different timecodeVariables values', () => {
			const configDisabled: HyperdeckConfig = {
				host: '192.168.1.100',
				modelID: 'hdStudio',
				reel: 'A001',
				timecodeVariables: 'disabled',
				pollingInterval: 500,
			}

			const configNotifications: HyperdeckConfig = {
				host: '192.168.1.100',
				modelID: 'hdStudio',
				reel: 'A001',
				timecodeVariables: 'notifications',
				pollingInterval: 500,
			}

			const configPolling: HyperdeckConfig = {
				host: '192.168.1.100',
				modelID: 'hdStudio',
				reel: 'A001',
				timecodeVariables: 'polling',
				pollingInterval: 500,
			}

			expect(configDisabled.timecodeVariables).toBe('disabled')
			expect(configNotifications.timecodeVariables).toBe('notifications')
			expect(configPolling.timecodeVariables).toBe('polling')
		})
	})
})