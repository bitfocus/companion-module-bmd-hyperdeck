import { DropdownChoice, InstanceBase } from '@companion-module/base'
import { HyperdeckConfig } from './config'
import { Commands } from 'hyperdeck-connection'
import { ModelInfo } from './models'

export interface ClipDropdownChoice extends DropdownChoice {
	clipId: number
}

export interface InstanceBaseExt extends InstanceBase<HyperdeckConfig> {
	transportInfo: TransportInfoStateExt
	deckConfig: Commands.ConfigurationCommandResponse
	slotInfo: Commands.SlotInfoCommandResponse[]

	protocolVersion: number
	model: ModelInfo
	config: HyperdeckConfig

	remoteInfo: Commands.RemoteInfoCommandResponse | null
	formatToken: string | null

	CHOICES_SLOTS: DropdownChoice[]
	CHOICES_CLIPS: ClipDropdownChoice[]
	CHOICES_FILEFORMATS: DropdownChoice[]
	CHOICES_VIDEOINPUTS: DropdownChoice[]
	CHOICES_AUDIOINPUTS: DropdownChoice[]

	clipCount: number
	clipsList: Commands.ClipInfo[] | null

	/**
	 * INTERNAL: Get clip list from the hyperdeck
	 *
	 * @access protected
	 */
	updateClips(): Promise<void>

	sendCommand<TResponse>(cmd: Commands.AbstractCommand<TResponse>): Promise<TResponse>

	refreshTransportInfo(): Promise<void>
}

export interface TransportInfoStateExt extends Commands.TransportInfoCommandResponse {
	clipName: string | null
}
