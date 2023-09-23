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
	formatTokenTimeout: NodeJS.Timeout | null

	clipsList: Commands.ClipInfo[]

	/**
	 * INTERNAL: Get clip list from the hyperdeck
	 *
	 * @access protected
	 */
	updateClips(doFullInit?: boolean): Promise<void>

	sendCommand<TResponse>(cmd: Commands.AbstractCommand<TResponse>): Promise<TResponse>

	refreshTransportInfo(): Promise<void>
}

export interface TransportInfoStateExt extends Commands.TransportInfoCommandResponse {
	clipName: string | null
}
