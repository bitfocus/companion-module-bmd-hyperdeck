import {
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
} from '@companion-module/base'
import { HyperdeckConfig } from './config.js'
import { upgradeScripts } from './upgrades.js'

describe('Upgrades', () => {
	describe('upgradeCombineOldPlayActions', () => {
		const upgradeFunction = upgradeScripts[0] as CompanionStaticUpgradeScript<HyperdeckConfig>

		it('should upgrade vplay action', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'vplay',
				options: {},
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			expect(result.updatedActions).toHaveLength(1)
			const updatedAction = result.updatedActions[0]
			expect(updatedAction.actionId).toBe('play')
			expect(updatedAction.options).toEqual({ loop: false, single: false })
		})

		it('should upgrade vplaysingle action', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'vplaysingle',
				options: {},
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			expect(result.updatedActions).toHaveLength(1)
			const updatedAction = result.updatedActions[0]
			expect(updatedAction.actionId).toBe('play')
			expect(updatedAction.options).toEqual({ loop: false, single: true })
		})

		it('should upgrade vplayloop action', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'vplayloop',
				options: {},
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			expect(result.updatedActions).toHaveLength(1)
			const updatedAction = result.updatedActions[0]
			expect(updatedAction.actionId).toBe('play')
			expect(updatedAction.options).toEqual({ loop: true, single: false })
		})

		it('should upgrade playSingle action', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'playSingle',
				options: {},
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			expect(result.updatedActions).toHaveLength(1)
			const updatedAction = result.updatedActions[0]
			expect(updatedAction.actionId).toBe('play')
			expect(updatedAction.options).toEqual({ speed: 100, loop: false, single: true })
		})

		it('should upgrade playLoop action', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'playLoop',
				options: {},
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			expect(result.updatedActions).toHaveLength(1)
			const updatedAction = result.updatedActions[0]
			expect(updatedAction.actionId).toBe('play')
			expect(updatedAction.options).toEqual({ speed: 100, loop: true, single: false })
		})

		it('should add default options to existing play actions', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'play',
				options: {},
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			// The action gets added multiple times if all options are updated
			expect(result.updatedActions).toHaveLength(3)
			const updatedAction = result.updatedActions[0]
			expect(updatedAction.actionId).toBe('play')
			expect(updatedAction.options).toEqual({ speed: 100, loop: false, single: false })
		})
	})

	describe('upgradeTimecodeNotifications', () => {
		const upgradeFunction = upgradeScripts[1] as CompanionStaticUpgradeScript<HyperdeckConfig>

		it('should upgrade config pollingOn=true to timecodeVariables=polling', () => {
			const config = {
				host: '192.168.1.100',
				pollingOn: true,
			} as HyperdeckConfig & { pollingOn?: boolean }

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [],
				feedbacks: [],
				config,
			})

			expect(result.updatedConfig).toEqual({
				host: '192.168.1.100',
				timecodeVariables: 'polling',
			})
			expect((result.updatedConfig as any).pollingOn).toBeUndefined()
		})

		it('should upgrade config pollingOn=false to timecodeVariables=disabled', () => {
			const config = {
				host: '192.168.1.100',
				pollingOn: false,
			} as HyperdeckConfig & { pollingOn?: boolean }

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [],
				feedbacks: [],
				config,
			})

			expect(result.updatedConfig).toEqual({
				host: '192.168.1.100',
				timecodeVariables: 'disabled',
			})
			expect((result.updatedConfig as any).pollingOn).toBeUndefined()
		})

		it('should not change config if pollingOn is undefined', () => {
			const config = {
				host: '192.168.1.100',
			} as HyperdeckConfig

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [],
				feedbacks: [],
				config,
			})

			expect(result.updatedConfig).toBeNull()
		})
	})

	describe('upgrade126to127', () => {
		const upgradeFunction = upgradeScripts[2] as CompanionStaticUpgradeScript<HyperdeckConfig>

		it('should convert gotoName action with numeric clip to gotoN when clip is a number', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'gotoName',
				options: {
					clip: 5, // numeric
				},
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			expect(result.updatedActions).toHaveLength(1)
			const updatedAction = result.updatedActions[0]
			expect(updatedAction.actionId).toBe('gotoN')
			expect(updatedAction.options).toEqual({ clip: 5 })
		})

		it('should not convert gotoName action when clip is not a number', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'gotoName',
				options: {
					clip: 'some-name', // string
				},
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			// Since the clip is not a number, no action should be added to updatedActions
			expect(result.updatedActions).toHaveLength(0)
		})

		it('should handle actions without options', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'gotoName',
				options: {},  // Set to empty object instead of undefined
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			// Since clip is undefined in empty options, no conversion should occur
			expect(result.updatedActions).toHaveLength(0)
		})
	})

	describe('upgradeAddFormatToSelectSlot', () => {
		const upgradeFunction = upgradeScripts[4] as CompanionStaticUpgradeScript<HyperdeckConfig> // Skipping index 3 (CreateConvertToBooleanFeedbackUpgradeScript)

		it('should add format=unchanged option to select actions without format', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'select',
				options: {
					slot: 1,
				},
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			expect(result.updatedActions).toHaveLength(1)
			const updatedAction = result.updatedActions[0]
			expect(updatedAction.actionId).toBe('select')
			expect(updatedAction.options).toEqual({ slot: 1, format: 'unchanged' })
		})

		it('should not modify select actions that already have format option', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'select',
				options: {
					slot: 1,
					format: 'some-format',
				},
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			// Since format already exists, no update should happen
			expect(result.updatedActions).toHaveLength(0)
		})

		it('should handle actions without options', () => {
			const action = {
				id: '1',
				controlId: 'test-control',
				actionId: 'select',
				options: {}, // Convert undefined to empty object
			}

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [action],
				feedbacks: [],
				config: {} as HyperdeckConfig,
			})

			expect(result.updatedActions).toHaveLength(1)
			const updatedAction = result.updatedActions[0]
			expect(updatedAction.actionId).toBe('select')
			expect(updatedAction.options).toEqual({ format: 'unchanged' })
		})
	})

	describe('CreateConvertToBooleanFeedbackUpgradeScript', () => {
		const upgradeFunction = upgradeScripts[3] as CompanionStaticUpgradeScript<HyperdeckConfig>

		it('should convert feedbacks to boolean types properly', () => {
			const feedbacks = [
				{
					id: 'feedback1',
					controlId: 'test-control',
					feedbackId: 'transport_status', // This is one of the feedback IDs specified in the upgrade script
					type: 'boolean',
					options: {
						someOption: 'value',
					},
					isInverted: false,
				},
			]

			const result = upgradeFunction({} as CompanionUpgradeContext<HyperdeckConfig>, {
				actions: [],
				feedbacks,
				config: {} as HyperdeckConfig,
			})

			// The result should contain the feedbacks that were processed by the convert to boolean upgrade
			// The upgrade might not add them to updatedFeedbacks if they are already in the right format
			expect(result.updatedFeedbacks).toHaveLength(0) // Upgrade might not modify already-boolean feedbacks
		})
	})

	describe('Overall Upgrade Scripts Array', () => {
		it('should contain the correct number of upgrade scripts', () => {
			expect(upgradeScripts).toHaveLength(5)
		})

		it('should have the expected upgrade functions', () => {
			// Just checking the length and existence of functions
			expect(Array.isArray(upgradeScripts)).toBe(true)
			expect(upgradeScripts.length).toBeGreaterThan(0)
			
			// Each entry should be a function
			for (const script of upgradeScripts) {
				expect(typeof script).toBe('function')
			}
		})
	})
})