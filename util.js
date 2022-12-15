/**
 * Creates a string with the current date/time
 *
 * @returns {string} the current date/time in format 'YYYYMMDD_HHMM'
 * @access public
 * @since 1.0.3
 */
module.exports.getTimestamp = function () {
	const d = new Date()
	const curr_date = ('0' + d.getDate()).slice(-2)
	const curr_month = ('0' + (d.getMonth() + 1)).slice(-2)
	const curr_year = d.getFullYear()
	const h = ('0' + d.getHours()).slice(-2)
	const m = ('0' + d.getMinutes()).slice(-2)
	return `${curr_year}${curr_month}${curr_date}_${h}${m}`
}
