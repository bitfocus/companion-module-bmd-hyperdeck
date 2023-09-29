import { DropdownChoice } from '@companion-module/base'
import { VideoFormat } from 'hyperdeck-connection'

export const FORMATS_SD: VideoFormat[] = [VideoFormat.NTSC, VideoFormat.PAL]
export const FORMATS_SD_PROGRESSIVE: VideoFormat[] = [VideoFormat.NTSCp, VideoFormat.PALp]
export const FORMATS_HD_SDI: VideoFormat[] = [
	VideoFormat._720p50,
	VideoFormat._720p5994,
	VideoFormat._720p60,
	VideoFormat._1080p23976,
	VideoFormat._1080p24,
	VideoFormat._1080p25,
	VideoFormat._1080p2997,
	VideoFormat._1080p30,

	VideoFormat._1080i50,
	VideoFormat._1080i5994,
	VideoFormat._1080i60,
]
export const FORMATS_2K_DCI: VideoFormat[] = [VideoFormat._2Kp23976DCI, VideoFormat._2Kp24DCI, VideoFormat._2Kp25DCI]
export const FORMATS_3G_SDI: VideoFormat[] = [VideoFormat._1080p50, VideoFormat._1080p5994, VideoFormat._1080p60]

export const FORMATS_4K30: VideoFormat[] = [
	VideoFormat._4Kp23976,
	VideoFormat._4Kp24,
	VideoFormat._4Kp25,
	VideoFormat._4Kp2997,
	VideoFormat._4Kp30,
]
export const FORMATS_4K_DCI: VideoFormat[] = [VideoFormat._4Kp23976DCI, VideoFormat._4Kp24DCI, VideoFormat._4Kp25DCI]
export const FORMATS_4K60: VideoFormat[] = [VideoFormat._4Kp50, VideoFormat._4Kp5994, VideoFormat._4Kp60]

export const FORMATS_8K: VideoFormat[] = [
	VideoFormat._8Kp23976,
	VideoFormat._8Kp24,
	VideoFormat._8Kp25,
	VideoFormat._8Kp2997,
	VideoFormat._8Kp30,
	VideoFormat._8Kp50,
	VideoFormat._8Kp5994,
	VideoFormat._8Kp60,
]
export const FORMATS_8K_DCI: VideoFormat[] = [VideoFormat._8Kp23976DCI, VideoFormat._8Kp24DCI, VideoFormat._8Kp25DCI]

export const FORMATS_ALL: VideoFormat[] = [
	...FORMATS_SD,
	...FORMATS_SD_PROGRESSIVE,
	...FORMATS_HD_SDI,
	...FORMATS_3G_SDI,
	// TODO - 2K DCI
	...FORMATS_4K30,
	// TODO - 4K DCI
	...FORMATS_4K60,
	// TODO - 8K
]

export function VideoFormatsToChoices(formats: VideoFormat[]): DropdownChoice[] {
	return formats.map((f) => ({
		id: f,
		label: f,
	}))
}
