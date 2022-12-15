module.exports.CHOICES_STARTEND = [
	{ id: 'start', label: 'Start' },
	{ id: 'end', label: 'End' },
]

module.exports.CHOICES_PREVIEWMODE = [
	{ id: 'true', label: 'Preview' },
	{ id: 'false', label: 'Output' },
]

module.exports.CHOICES_AUDIOCODEC = [
	{ id: 'PCM', label: 'PCM' },
	{ id: 'AAC', label: 'AAC (2 channels only)' },
]

module.exports.CHOICES_AUDIOCHANNELS = [
	{ id: '2', label: '2 Channels' },
	{ id: '4', label: '4 Channels' },
	{ id: '8', label: '8 Channels' },
	{ id: '16', label: '16 Channels' },
	{ id: 'cycle', label: 'Cycle' },
]

module.exports.CHOICES_DYNAMICRANGE = [
	{ id: 'auto', label: 'Auto' },
	{ id: 'Rec709', label: 'Rec.709' },
	{ id: 'Rec2020_SDR', label: 'Rec.2020 SDR' },
	{ id: 'HLG', label: 'HLG' },
	{ id: 'ST2084_300', label: 'ST2084 300' },
	{ id: 'ST2084_500', label: 'ST2084 500' },
	{ id: 'ST2084_800', label: 'ST2084 800' },
	{ id: 'ST2084_1000', label: 'ST2084 1000 ' },
	{ id: 'ST2084_2000', label: 'ST2084 2000' },
	{ id: 'ST2084_4000', label: 'ST2084 4000' },
	{ id: 'ST2048', label: 'ST2048' },
]

module.exports.CHOICES_FILESYSTEM = [
	{ id: 'HFS+', label: 'HFS+' },
	{ id: 'exFAT', label: 'exFAT' },
]

module.exports.CHOICES_REMOTECONTROL = [
	{ id: 'toggle', label: 'Toggle' },
	{ id: true, label: 'Enable' },
	{ id: false, label: 'Disable' },
]

module.exports.CHOICES_TRANSPORTSTATUS = [
	{ id: 'preview', label: 'Preview' },
	{ id: 'stopped', label: 'Stopped' },
	{ id: 'play', label: 'Playing' },
	{ id: 'forward', label: 'Forward' },
	{ id: 'rewind', label: 'Rewind' },
	{ id: 'jog', label: 'Jog' },
	{ id: 'shuttle', label: 'Shuttle' },
	{ id: 'record', label: 'Record' },
]

module.exports.CHOICES_SLOTSTATUS = [
	{ id: 'empty', label: 'Empty' },
	{ id: 'error', label: 'Error' },
	{ id: 'mounted', label: 'Mounted' },
	{ id: 'mounting', label: 'Mounting' },
]

module.exports.CHOICES_ENABLEDISABLE = [
	{ id: true, label: 'Enable' },
	{ id: false, label: 'Disable' },
]

module.exports.CHOICES_REMOTESTATUS = [
	{ id: true, label: 'Enabled' },
	{ id: false, label: 'Disabled' },
]
