import BN from 'bignumber.js'

export async function getAccountBalances (api, addr) {
  return await api.query.balances.account(addr)
}

export async function getFreeBalance (api, addr) {
  const account = await getAccountBalances(api, addr)
  return account.freeBalance
}

export function toDecimals (val, exp, precision = 2) {
  const value = (new BN(val).div(new BN(10).pow(exp))).dp(precision).toFormat()
  return value
}

export function toBaseToken (val, exp, precision = 4) {
  const value = (new BN(val).div(new BN(10).pow(exp))).toFormat(precision)
  return value
}

/**
 *
 * @param {String} hash
 * @param {*} length
 * @returns
 */
export function trimHash (hash, length) {
  if (hash.length < length) {
    return hash
  }

  const side = ((length - 2) / 2) | 0

  return hash.substr(0, side) + '..' + hash.substr(-side, side)
}

export function displayMilliOrSecond (num) {
  if (num < 10000) {
    return `${ num }ms`
  }

  return `${ (num / 1000) | 0 }s`
}

export function toHuman (decimals, value) {
  return parseInt(value, 10) / Math.pow(10, decimals)
}

// takes a string number like "51,723,497,607,334,758"
// and removes all the commas
export function normalizeValue (val) {
  return val.replace(/,/g, '')
}

// options = { d: h, m, s } : set to true/false for visible
export function convertSecondsToTime (sec, options = { d: false, h: true, m: true, s: true }) {
  // convert to milliseconds
  const dateObj = new Date(sec * 1000)
  const days = dateObj.getUTCDate() - 1
  const hours = dateObj.getUTCHours()
  const minutes = dateObj.getUTCMinutes()
  const seconds = dateObj.getSeconds()

  let timeString = options.d && days > 0 ? days.toString() + 'd ' : ''
  timeString += options.h && hours ? hours.toString() + 'h ' : ''
  timeString += options.m ? minutes.toString() + 'm ' : ''
  timeString += options.s ? seconds.toString() + 's' : ''

  return timeString
}
