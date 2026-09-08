import assert from 'node:assert/strict'
import test from 'node:test'

import { updateTransportInfoVariables } from '../dist/variables/index.js'

function createInstance(loop, singleClip) {
	return {
		transportInfo: {
			status: 'play',
			speed: 100,
			loop,
			singleClip,
			clipId: null,
			slotId: null,
			videoFormat: null,
			inputVideoFormat: null,
		},
		simpleClipsList: [],
		fullClipsList: [],
		model: { hasSeparateInputFormat: false },
	}
}

test('exposes loop and single clip playback state as variables', () => {
	const values = {}
	updateTransportInfoVariables(createInstance(true, false), values)

	assert.equal(values.loop, true)
	assert.equal(values.singleClip, false)
})

test('updates both playback mode variables when the transport state changes', () => {
	const values = {}
	updateTransportInfoVariables(createInstance(false, true), values)

	assert.equal(values.loop, false)
	assert.equal(values.singleClip, true)
})
