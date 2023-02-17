import BN from 'bignumber.js'
import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { hexToU8a, isHex } from '@polkadot/util'
import { useChainsStore } from 'stores/chain'
import { useClientStore } from 'src/stores/client'
import { Client } from '../classes/client'
import { format, subDays, parseISO } from 'date-fns'

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

export function toNormalizeBaseToken (val, exp, precision = 4) {
  const value = normalizeValue(toBaseToken(val, exp, precision))
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
// and removes all the commas, returns "51723497607334758"
export function normalizeValue (val) {
  return String(val).replace(/,/g, '')
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
  timeString += options.s && seconds && !hours ? seconds.toString() + 's' : ''

  return timeString
}

export const isValidAddress = (address) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  }
  catch (error) {
    return false
  }
}

export async function initializeClient () {
  const chainsStore = useChainsStore()

  if (chainsStore.client) {
    await chainsStore.client.disconnect(true)
    delete chainsStore.client
  }

  chainsStore.client = new Client(chainsStore.chains[ chainsStore.chainIndex ])
  return await chainsStore.client.connect()
}

export function eraToDate (era) {
  const clientStore = useClientStore()
  const currentEra = clientStore.currentEra
  if (era <= currentEra) {
    return format(subDays(new Date(), currentEra - era), 'MMM.dd')
  }
  return 'unknown'
}

export function blocksToMS (block) {
  const clientStore = useClientStore()
  const blockTime = parseInt(clientStore.consts.expectedBlockTime, 10) // 6000
  return (parseInt(block, 10) * blockTime)
}

export function formatDateInternational (when) {
  let date = when

  if (!date) return ''
  if (typeof date === 'string') date = parseISO(date)

  return format(date, 'dd.LLL.yyyy')
}

/**
 * Given a number of seconds, return a string that expresses the time in days, hours, minutes, and
 * seconds.
 * @param s - number in seconds,
 * @param maxResolution - smallest time unit that return will show
 * @param simple - Format to return | true: 1:02:03:22 | false: 1 day 2 hours 3 minutes 22 seconds
 * @returns A string with the number of days, hours, minutes, and seconds.
 */
export function formatDurationFromSeconds (
  s, // number,
  maxResolution = 'seconds', // 'days' | 'hours' | 'minutes' | 'seconds'
  simple = false
) {
  let remaining = s
  const days = Math.floor(remaining / 86_400)
  remaining = remaining % 86_400
  const hours = Math.floor(remaining / 3_600)
  remaining = remaining % 3_600
  const minutes = Math.floor(remaining / 60)
  remaining = remaining % 60
  const seconds = remaining

  const dayString = simple
    ? `${ days.toString().padStart(2, '0') }:`
    : days > 1
      ? `${ days } Days`
      : days === 1
        ? `${ days } Day`
        : maxResolution === 'days'
          ? '0 Days'
          : ''
  const hourString = simple
    ? `${ hours.toString().padStart(2, '0') }:`
    : hours > 1
      ? `${ hours } Hours`
      : hours === 1
        ? `${ hours } Hour`
        : maxResolution === 'hours' && days === 0
          ? '0 Hours'
          : ''
  const minuteString = simple
    ? `${ minutes.toString().padStart(2, '0') }:`
    : minutes > 1
      ? `${ minutes } Minutes`
      : minutes === 1
        ? `${ minutes } Minute`
        : maxResolution === 'minutes' && days === 0 && hours === 0
          ? '0 Minutes'
          : ''
  const secondString = simple
    ? seconds.toString().padStart(2, '0')
    : seconds > 1
      ? `${ seconds } Seconds`
      : seconds === 1
        ? `${ seconds } Second`
        : maxResolution === 'seconds' && days === 0 && hours === 0 && minutes === 0
          ? '0 Seconds'
          : ''

  let durationString = ''

  switch (maxResolution) {
    case 'seconds':
      durationString
        = `${ dayString } ${ hourString } ${ minuteString } ${ secondString }`.trim()
      break
    case 'minutes':
      durationString = `${ dayString } ${ hourString } ${ minuteString }`.trim()
      break
    case 'hours':
      durationString = `${ dayString } ${ hourString }`.trim()
      break
    case 'days':
      durationString = `${ dayString }`.trim()
      break
  }

  return durationString
}

/**
 * Converts seconds to a time unit as a float.
 * @param  s - number in seconds
 * @param resolution - Unit to return.
 * Can be days, hours, minutes, or seconds.
 * @param decimals - The number of decimal places to show.
 * @param cascade - Increase resolution unit when value falls below 1 of the current resolution.
 * @param maxCascadeResolution - Smallest resolution cascade can go to.
 * @example toTimeFloat(153_000) => [1.7, 'days']
 * @returns Array(2) of value and unit.
 */
export function toTimeFloat (
  s, // number
  resolution = 'days', // 'days' | 'hours' | 'minutes' | 'seconds'
  decimals = 1,
  cascade = true,
  maxCascadeResolution = 'seconds' // 'days' | 'hours' | 'minutes' | 'seconds'
) {
  if (s <= 0 || isNaN(s)) return [ 0, 'seconds' ]

  const resolutions = [ 'days', 'hours', 'minutes', 'seconds' ]
  let cascadePoint = resolutions.indexOf(resolution)
  let value = 0

  for (let i = resolutions.indexOf(resolution); i < resolutions.length; i++) {
    switch (resolutions[ `${ i }` ]) {
      case 'days':
        value = s / 86_400
        break
      case 'hours':
        value = s / 3_600
        break
      case 'minutes':
        value = s / 60
        break
      case 'seconds':
        value = s
        break
    }
    if (value < 1 && cascade && i < resolutions.indexOf(maxCascadeResolution)) {
      cascadePoint++
    }
    else {
      break
    }
  }

  let timeValue = value * Math.pow(10, decimals) // put decimal at max decimals spot
  timeValue = Math.ceil(timeValue) // get rid of undesired decimals
  timeValue = timeValue / Math.pow(10, decimals) // put decimal back in place

  const unitString
    = timeValue === 1
      ? resolutions[ `${ cascadePoint }` ].slice(0, -1) // remove 's' when 1
      : resolutions[ `${ cascadePoint }` ]

  timeValue = timeValue || 0

  return [ timeValue, unitString ]
}
