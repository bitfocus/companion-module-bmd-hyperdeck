import type { DropdownChoice, InstanceBase } from '@companion-module/base'
import type { HyperdeckConfig } from './config'
import type { Commands } from 'hyperdeck-connection'
import type { ModelInfo } from './models'
import type { SimpleClipInfo } from './util'

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

	simpleClipsList: SimpleClipInfo[]
	fullClipsList: Commands.ClipInfo[]

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

export interface IpAndPort {
	ip: string
	port: number | undefined
}
