import semver from 'semver'

/**
 * Creates a string with the current date/time
 *
 * @returns {string} the current date/time in format 'YYYYMMDD_HHMM'
 * @access public
 * @since 1.0.3
 */
export function getTimestamp(): string {
	const d = new Date()
	const curr_date = ('0' + d.getDate()).slice(-2)
	const curr_month = ('0' + (d.getMonth() + 1)).slice(-2)
	const curr_year = d.getFullYear()
	const h = ('0' + d.getHours()).slice(-2)
	const m = ('0' + d.getMinutes()).slice(-2)
	return `${curr_year}${curr_month}${curr_date}_${h}${m}`
}

/**
 * Compare protocol version numbers
 *
 * @access protected
 * @since 2.0.3
 */
export function protocolGte(a: string | number, b: string | number): boolean {
	const v1 = semver.coerce(a.toString())
	const v2 = semver.coerce(b.toString())
	return !!v1 && !!v2 && semver.gte(v1, v2)
}

export function stripExtension(fileName: string): string {
	const re = /(.*?)(\.([a-z]|\d){3})?$/
	return fileName.replace(re, '$1')
}
