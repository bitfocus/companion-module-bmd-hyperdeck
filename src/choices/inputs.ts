import { DropdownChoice } from '@companion-module/base'

export enum AudioInputType {
	Embedded = 'embedded',
	XLR = 'XLR',
	RCA = 'RCA',
}

export const CONFIG_AUDIOINPUTS: Record<string, DropdownChoice | undefined> = {
	embedded: { id: AudioInputType.Embedded, label: 'Embedded' },
	XLR: { id: AudioInputType.XLR, label: 'XLR' },
	RCA: { id: AudioInputType.RCA, label: 'RCA' },
}

export enum VideoInputType {
	SDI = 'SDI',
	HDMI = 'HDMI',
	Component = 'component',
	Composite = 'composite',
	Optical = 'optical',
}

export const CONFIG_VIDEOINPUTS: Record<string, DropdownChoice | undefined> = {
	SDI: { id: VideoInputType.SDI, label: 'SDI' },
	HDMI: { id: VideoInputType.HDMI, label: 'HDMI' },
	component: { id: VideoInputType.Component, label: 'Component' },
	composite: { id: VideoInputType.Composite, label: 'Composite' },
	optical: { id: VideoInputType.Optical, label: 'Optical' },
}

export const CONFIG_SLOT_LABELS: Record<string, DropdownChoice[] | undefined> = {
	SSD2: [
		{ id: 1, label: '1: SSD 1' },
		{ id: 2, label: '2: SSD 2' },
	],
	SD2: [
		{ id: 1, label: '1: SD 1' },
		{ id: 2, label: '2: SD 2' },
	],
	SD_USB: [
		{ id: 1, label: '1: SD' },
		{ id: 2, label: '2: USB-C' },
	],
	SD_USBNAS: [
		{ id: 1, label: '1: SD' },
		{ id: 2, label: '2: USB-C/NAS' },
	],
	SD2_USB: [
		{ id: 1, label: '1: SD 1' },
		{ id: 2, label: '2: SD 2' },
		{ id: 3, label: '3: USB-C' },
	],
	CFAST2_USBNAS: [
		{ id: 1, label: '1: CFast 1' },
		{ id: 2, label: '2: CFast 2' },
		{ id: 3, label: '3: USB-C/NAS' },
	],
	SSD2_SD2_USB: [
		{ id: 1, label: '1: SSD 1' },
		{ id: 2, label: '2: SSD 2' },
		{ id: 3, label: '3: USB-C' },
		{ id: 4, label: '4: SD 1' },
		{ id: 5, label: '5: SD 2' },
	],
	SD25: [
		{ id: 1, label: '1: SD 1' },
		{ id: 2, label: '2: SD 2' },
		{ id: 3, label: '3: SD 3' },
		{ id: 4, label: '4: SD 4' },
		{ id: 5, label: '5: SD 5' },
		{ id: 6, label: '6: SD 6' },
		{ id: 7, label: '7: SD 7' },
		{ id: 8, label: '8: SD 8' },
		{ id: 9, label: '9: SD 9' },
		{ id: 10, label: '10: SD 10' },
		{ id: 11, label: '11: SD 11' },
		{ id: 12, label: '12: SD 12' },
		{ id: 13, label: '13: SD 13' },
		{ id: 14, label: '14: SD 14' },
		{ id: 15, label: '15: SD 15' },
		{ id: 16, label: '16: SD 16' },
		{ id: 17, label: '17: SD 17' },
		{ id: 18, label: '18: SD 18' },
		{ id: 19, label: '19: SD 19' },
		{ id: 20, label: '20: SD 20' },
		{ id: 21, label: '21: SD 21' },
		{ id: 22, label: '22: SD 22' },
		{ id: 23, label: '23: SD 23' },
		{ id: 24, label: '24: SD 24' },
		{ id: 25, label: '25: SD 25' },
	],
}
