import { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { InstanceBaseExt } from '../types.js'
import { HyperdeckSchema } from '../schema.js'
import { transportPresets } from './transport.js'
import { utilityPresets } from './utility.js'
import { configPresets } from './config.js'
import { monitorPresets } from './monitor.js'
import { clipPresets } from './clips.js'
import { videoFormatPresets, slotPresets } from './slotFormat.js'

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

	// These presets depend on the model/clip list, so are built separately with the instance
	for (const builder of [clipPresets, videoFormatPresets, slotPresets]) {
		const [section, sectionPresets] = builder(self)
		sections.push(section)
		Object.assign(presets, sectionPresets)
	}

	return [sections, presets]
}
