import assert from 'node:assert/strict'
import test from 'node:test'

import { TransportStatus } from 'hyperdeck-connection'
import { shouldRefreshClipsAfterTransportUpdate } from '../dist/refresh.js'

test('refreshes the clip list when recording stops', () => {
	assert.equal(shouldRefreshClipsAfterTransportUpdate(TransportStatus.RECORD, TransportStatus.STOPPED), true)
})

test('does not refresh the clip list for unrelated transport changes', () => {
	assert.equal(shouldRefreshClipsAfterTransportUpdate(TransportStatus.STOPPED, TransportStatus.PLAY), false)
})
