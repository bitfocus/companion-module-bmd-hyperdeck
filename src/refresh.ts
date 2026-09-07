import { TransportStatus } from 'hyperdeck-connection'

export function shouldRefreshClipsAfterTransportUpdate(previousStatus: TransportStatus, nextStatus: TransportStatus): boolean {
	return previousStatus === TransportStatus.RECORD && nextStatus !== TransportStatus.RECORD
}
