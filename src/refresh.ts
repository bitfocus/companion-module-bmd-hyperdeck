import { TransportStatus } from 'hyperdeck-connection'

/**
 * The deck only writes the finished recording into its disk list once recording stops, and that
 * change is not included in the transport notification. Detect the RECORD -> (not RECORD) edge so
 * the caller can refresh the clip list, keeping clipCount/clipNames current (#172).
 */
export function shouldRefreshClipsAfterTransportUpdate(
	previousStatus: TransportStatus,
	nextStatus: TransportStatus,
): boolean {
	return previousStatus === TransportStatus.RECORD && nextStatus !== TransportStatus.RECORD
}
