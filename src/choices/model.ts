import { DropdownChoice } from '@companion-module/base'
import { ModelInfo } from '../models.js'
import { ClipDropdownChoice, InstanceBaseExt } from '../types.js'
import { stripExtension } from '../util.js'
import { VideoFormatsToChoices } from './videoFormats.js'
import { CONFIG_AUDIOINPUTS, CONFIG_VIDEOINPUTS, CONFIG_SLOT_LABELS } from './inputs.js'
import { CONFIG_FILEFORMATS, FormatDropdownChoice } from './fileFormats.js'

export interface ModelChoices {
	AudioInputs: DropdownChoice[]
	VideoInputs: DropdownChoice[]
	Slots: DropdownChoice[]
	FileFormats: FormatDropdownChoice[]
	VideoFormats: DropdownChoice[]
	Clips: ClipDropdownChoice[]
}

function createDefaultChoice(id: string): DropdownChoice {
	return {
		id,
		label: id,
	}
}
export function createModelChoices(model: ModelInfo | undefined) {
	const result: ModelChoices = {
		AudioInputs: [],
		VideoInputs: [],
		Slots: [],
		FileFormats: [],
		VideoFormats: [],
		Clips: [],
	}

	if (model) {
		for (const inputId of model.audioInputs) {
			result.AudioInputs.push(CONFIG_AUDIOINPUTS[inputId] ?? createDefaultChoice(inputId))
		}

		for (const format of CONFIG_FILEFORMATS) {
			if (model.fileFormats.includes(format.family)) {
				result.FileFormats.push(format)
			}
		}

		for (const inputId of model.videoInputs) {
			result.VideoInputs.push(CONFIG_VIDEOINPUTS[inputId] ?? createDefaultChoice(inputId))
		}

		result.VideoFormats.push(...VideoFormatsToChoices(model.videoFormats))

		//TODO define CHOICES_SLOTS based on model
		result.Slots = CONFIG_SLOT_LABELS[model.slotLabels] ?? []
	}

	return result
}

export function createClipsChoice(instance: InstanceBaseExt) {
	const clips: ClipDropdownChoice[] = []

	for (const { clipId, name } of instance.simpleClipsList) {
		clips.push({ id: name, label: stripExtension(name), clipId: clipId })
	}

	return clips
}
