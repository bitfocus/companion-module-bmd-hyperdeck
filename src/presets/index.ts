import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { HyperdeckSchema } from '../schema.js'
import { transportPresets } from './transport.js'
import { utilityPresets } from './utility.js'
import { configPresets } from './config.js'
import { monitorPresets } from './monitor.js'

export function initPresets(
	self: InstanceBaseExt,
): [CompanionPresetSection<HyperdeckSchema>[], CompanionPresetDefinitions<HyperdeckSchema>] {
	self.log('info', 'Initializing Presets')

	const sections: CompanionPresetSection<HyperdeckSchema>[] = []
	const presets: CompanionPresetDefinitions<HyperdeckSchema> = {}

	for (const builder of [transportPresets, utilityPresets, configPresets, monitorPresets]) {
		const [section, sectionPresets] = builder()
		sections.push(section)
		Object.assign(presets, sectionPresets)
	}

	return [sections, presets]
}
