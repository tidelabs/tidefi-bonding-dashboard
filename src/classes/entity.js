import { computed } from 'vue'
import { toSvg } from 'jdenticon'
import {
  getControllerInfo
} from '../helpers/validators'
import useIdentity from 'src/helpers/useIdentity'
import {
  toBaseToken,
  normalizeValue
} from 'src/helpers/utils'
import BN from 'bignumber.js'
import { useClientStore } from 'stores/client'
import { useEntitiesStore } from 'stores/entities'
import { stakerRewards } from 'src/helpers/stakerRewards'
// import useErasTime from 'src/helpers/erasTime'
import { calcInflation } from 'src/helpers/calcInflation'

const BN_HUNDRED = BN(100)
const BN_MAX_INTEGER = BN(Number.MAX_SAFE_INTEGER)

export async function addOrUpdateEntity (address, validator = false) {
  const entitiesStore = useEntitiesStore()

  const entity = entitiesStore.entities.find((en) => en.address === address)
  if (entity) {
    // update validator in current set or not
    entity.validator = validator
    entity.connect()
  }
  else {
    const newEntity = new Entity(address, validator)
    await newEntity.connect()
    entitiesStore.entities.push(newEntity)
  }
}

export async function updateLastBlock (number, author) {
  const entitiesStore = useEntitiesStore()

  const validator = entitiesStore.getActiveValidators.find((validator) => validator.address === author)
  if (validator) {
    validator.lastBlock = number
  }
}

export class Entity {
  constructor (address, validator = false) {
    this.address = address
    //
    this.identicon = null
    this.balances = {
      freeBalance: 0,
      frozenFee: 0,
      frozenMisc: 0,
      reservedBalance: 0,
      availableBalance: 0,
      lockedBalance: 0,
      lockedBreakdown: [],
      vestingLocked: 0,
      isVesting: false,
      vestedBalance: 0,
      vestedClaimable: 0,
      vesting: 0,
      vestingTotal: 0,
      namedReserves: []
    }
    this.ledger = null
    this.tokenBalances = []
    // unsubscribes
    this.unsubscribeTokenBalances = null
    this.unsubscribeBalances = null
    this.unsubscribeStakingInfo = null
    // this.unsubscribeRewardPoints = null
    // validator info
    this.validator = validator
    this.identityType = 'identity_none' // identity_plus | identity_check | identity_verified
    this.hasIdentity = false
    this.hasVerifiedIdentity = false // TODO:
    this.belowAvgPoints = false // TODO:
    this.slashed = false // TODO:
    this.noGovernance = false // TODO:
    this.elected = false // active
    this.nextElected = false // next set
    this.stakers = {
      total: '0',
      own: '0',
      others: []
    }
    this.preferences = {
      commission: 0,
      blocked: false
    }
    this.lastPaidOut = 'unknown'
    this.bonded = 0
    this.otherStaked = 0
    this.ownStaked = 0
    this.totalStaked = 0
    this.currentRewardPoints = 0
    this.erasRewardPoints = []
    this.payee = ''
    this.stakerRewards = []
    this.nominations = []
    // Staking Info
    this.stakingInfo = {
      controllerId: '',
      exposure: {
        own: 0,
        total: 0,
        others: []
      },
      nextSessionIds: [],
      nominators: [],
      redeemable: 0,
      rewardDestination: '',
      sessionIds: [],
      stakingLedger: {
        active: '',
        claimedRewards: [],
        stash: '',
        total: 0,
        unlocking: []
      },
      stashId: '',
      unlocking: false,
      validatorPrefs: {
        commission: 10000000,
        blocked: false
      },
      inflation: {
        idealInterest: 0,
        idealStake: 0,
        inflation: 0,
        stakedFraction: 0,
        stakedReturn: 0
      }
    }
    // this.reputation = 0 // computed - future
    this.lastBlock = ''
    this.blockCount = 0
  }

  async connect () {
    const clientStore = useClientStore()
    const entitiesStore = useEntitiesStore()

    // unsubscribe in case this is an update
    if (this.unsubscribeTokenBalances) {
      this.unsubscribeTokenBalances()
      this.unsubscribeTokenBalances = null
    }
    if (this.unsubscribeBalances) {
      this.unsubscribeBalances()
      this.unsubscribeBalances = null
    }
    if (this.unsubscribeStakingInfo) {
      this.unsubscribeStakingInfo()
      this.unsubscribeStakingInfo = null
    }
    // if (this.unsubscribeRewardPoints) {
    //   this.unsubscribeRewardPoints()
    //   this.unsubscribeRewardPoints = null
    // }

    entitiesStore.incLoading()

    // verify this address exists on-chain
    const [ entryHash, entrySize ] = await Promise.all([
      clientStore.client.api.query.system.account.hash(this.address),
      clientStore.client.api.query.system.account.size(this.address)
    ])

    if (!entryHash || !entrySize) {
      entitiesStore.decLoading()
      return false // failure
    }

    // console.log('Account:', entryHash, entrySize)

    if (!this.identicon) {
      this.identicon = toSvg(this.address, 24)
    }

    const controller = await getControllerInfo(this.address, clientStore.client.api)
    this.controller = controller.toHuman()
    // console.log('controller:', this.controller)
    // console.log('address   :', this.address)
    const payee = await await clientStore.client.api.query.staking.payee(this.address)
    this.payee = payee.toHuman()
    // console.log('payee:', this.address, this.payee)

    const {
      updateIdentity,
      identityInfo,
      parentInfo,
      superInfo,
      identityType,
      hasIdentity,
      hasVerifiedIdentity,
      identityTooltip,
      identityIcon,
      name,
      parentName,
      superName,
      email,
      legal,
      riot,
      twitter,
      web
    } = useIdentity(this.address, clientStore.subIdentities, clientStore.client.api)
    await updateIdentity()
    // console.log(identityInfo.value, parentInfo.value, superInfo.value)

    this.identity = {
      identityInfo,
      parentInfo,
      superInfo,
      identityType,
      hasIdentity,
      hasVerifiedIdentity,
      identityTooltip,
      identityIcon,
      name,
      parentName,
      superName,
      email,
      legal,
      riot,
      twitter,
      web
    }

    await this.fetchBalances()
    await this.fetchLedger()
    await this.fetchTokenBalances()

    const nominations = await clientStore.client.api.query.staking.nominators(this.address)
    this.nominations = nominations.toJSON()
    // console.log('nominations:', this.nominations)

    // validator specific
    if (this.validator) {
      await this.updateStakerInfo()
      await this.fetchStakingInfo()
    }

    // ones that will be done asynchronously
    stakerRewards(clientStore.client.api, this.address, true)
      .then((rewards) => {
        this.stakerRewards = rewards
      })

    if (this.stakers && 'total' in this.stakers) {
      const {
        idealInterest,
        idealStake,
        inflation,
        stakedFraction,
        stakedReturn
      } = calcInflation(this.stakers.total)

      this.inflation = {
        idealInterest,
        idealStake,
        inflation,
        stakedFraction,
        stakedReturn
      }

      // console.log('Validator Inflation:', this.inflation)

      this.calcValidatorReturn()
    }

    // loading data done
    entitiesStore.decLoading()

    // this.reputation = computed(() => {
    //   return 5
    // })

    this.nominatorCount = computed(() => {
      if (this.stakers && this.stakers.others && this.stakers.others.length > 0) {
        return this.stakers.others.length
      }
      return 0
    })

    this.bonded = computed(() => {
      if (this.balances.lockedBreakdown && this.balances.lockedBreakdown.length > 0) {
        const breakdown = this.balances.lockedBreakdown.find((bd) => {
          return bd.id.trim() === 'staking'
        })
        if (breakdown) {
          return breakdown.amount
        }
      }
      return 0
    })

    this.otherStaked = computed(() => {
      if (this.stakers && 'total' in this.stakers) {
        const total = this.stakers.total
        const own = this.stakers.own
        const t = new BN(total)
        const val = t.minus(own)
        return this.formatTokenValue(val)
      }

      return 0
    })

    this.ownStaked = computed(() => {
      return this.stakers && 'own' in this.stakers
        ? this.formatTokenValue(normalizeValue(this.stakers.own)) // validator
        : this.balances.locked
          ? this.formatTokenValue(this.balances.locked) // staker
          : 0
    })

    this.totalStaked = computed(() => {
      return this.stakers && 'total' in this.stakers
        ? this.formatTokenValue(normalizeValue(this.stakers.total))
        : 0
    })

    this.currentRewardPoints = computed(() => {
      const clientStore = useClientStore()

      return clientStore.rewardPoints[ clientStore.rewardPoints.length - 1 ]?.rewards?.individual[ this.address ] || 0
    })

    this.erasRewardPoints = computed(() => {
      const clientStore = useClientStore()
      const points = []

      clientStore.rewardPoints.forEach((era) => {
        if (era.rewards.individual[ this.address ]) {
          points.push({
            era: era?.era,
            total: era?.rewards?.total,
            amount: era?.rewards?.individual[ this.address ]
          })
        }
      })

      // console.log('validator points:', this.address, points)

      return points
    })

    this.nextElected = computed(() => {
      const clientStore = useClientStore()

      if (this.validator) {
        return !!clientStore.nextElected.find((el) => el === this.address)
      }
      return false
    })

    // success
    return true
  }

  formatTokenValue (val) {
    const clientStore = useClientStore()

    return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ]) : 0
  }

  async fetchBalances () {
    const clientStore = useClientStore()

    this.unsubscribeBalances
      = await clientStore.client.api.derive.balances.all(
        this.address, (balance) => {
          this.balances.freeBalance = balance.freeBalance.toString()
          this.balances.frozenFee = balance.frozenFee.toString()
          this.balances.frozenMisc = balance.frozenMisc.toString()
          this.balances.reservedBalance = balance.reservedBalance.toString()
          this.balances.votingBalance = balance.votingBalance.toString()
          this.balances.availableBalance = balance.availableBalance.toString()
          this.balances.lockedBalance = balance.lockedBalance.toString()
          this.balances.lockedBreakdown = balance.lockedBreakdown
            .map((breakdown) => breakdown.toHuman())
            .map((breakdown) => {
              return {
                ...breakdown,
                amount: normalizeValue(breakdown.amount)
              }
            })
          this.balances.vestingLocked = balance.vestingLocked.toString()
          this.balances.isVesting = balance.isVesting
          this.balances.vestedBalance = balance.vestedBalance.toString()
          this.balances.vestedClaimable = balance.vestedClaimable.toString()
          this.balances.vesting = balance.vesting.toString()
          this.balances.vestingTotal = balance.vestingTotal.toString()
          this.balances.namedReserves = balance.namedReserves.map((reserve) => reserve.toHuman())
        })

    // console.log('balances:', this.balances)
  }

  async updateStakerInfo () {
    const clientStore = useClientStore()

    // all validators in StakersEntries are in the elected set
    const stakerEntry = clientStore.stakerEntries.find((se) => se.address === this.address)
    if (stakerEntry) {
      this.elected = true
      this.stakers = stakerEntry.stakers
      this.preferences = stakerEntry.preferences
    }
    else {
      // console.log('Validator not in current set:', this.address)
      const validatorEntry = clientStore.validatorEntries.find((ve) => ve.address === this.address)
      if (validatorEntry) {
        this.elected = false
        this.stakers = []
        this.preferences = validatorEntry.data
      }
    }
  }

  calcLastPaidOut () {
    const clientStore = useClientStore()

    if (!this.elected) {
      this.lastPaidOut = ''
      return
    }

    if (this.stakingInfo && this.stakingInfo.stakingLedger && this.stakingInfo.stakingLedger.claimedRewards && this.stakingInfo.stakingLedger.claimedRewards.length > 0) {
      const lastEraPaid = this.stakingInfo.stakingLedger.claimedRewards[ this.stakingInfo.stakingLedger.claimedRewards.length - 1 ]

      if (lastEraPaid === -1) {
        this.lastPaidOut = 'never'
        return
      }

      const days = clientStore.previousEra - lastEraPaid
      switch (days) {
        case 0:
          this.lastPaidOut = 'recently'
          break
        case 1:
          this.lastPaidOut = 'yesterday'
          break
        default:
          this.lastPaidOut = `${ days } days`
          break
      }
      return
    }

    this.lastPaidOut = ''
  }

  calcValidatorReturn () {
    const clientStore = useClientStore()
    // const entitiesStore = useEntitiesStore()

    if (!this.elected || (this.stakers && !('total' in this.stakers))) {
      this.stakedReturn = 0
      return
    }

    // Average of all stakes (bonds)
    const avgStaked = BN(clientStore.erasTotalStaked).div(clientStore.counterForNominators)

    if (avgStaked && !avgStaked.isZero()) {
      const adjusted = avgStaked.multipliedBy(BN_HUNDRED).multipliedBy(this.inflation.stakedReturn).div(this.stakers.total)
      // console.log('adjusted:', adjusted.toNumber())

      const stakedReturn = (adjusted.gt(BN_MAX_INTEGER) ? BN_MAX_INTEGER : adjusted).div(BN_HUNDRED).toNumber()

      // adjusted for mission
      this.stakedReturn = (stakedReturn * (100 - parseFloat(this.preferences.commission)) / 100).toFixed(2)

      // console.log('Validator Staked Return:', adjusted.toNumber(), stakedReturn, this.stakedReturn)
    }
  }

  async fetchStakingInfo () {
    const clientStore = useClientStore()

    this.unsubscribeStakingInfo
    = await clientStore.client.api.derive.staking.account(this.address,
        (si) => {
          // console.log('si:', si)
          const stakingInfo = {}
          stakingInfo.accountId = si.accountId.toHuman()
          stakingInfo.controllerId = si.controllerId.toHuman()

          const exposureHuman = si.exposure.toHuman()
          stakingInfo.exposure = si.exposure.toJSON()
          stakingInfo.exposure.others = exposureHuman.others

          stakingInfo.nextSessionIds = si.nextSessionIds.map((id) => id.toHuman())
          stakingInfo.nominators = si.nominators.map((id) => id.toHuman())
          stakingInfo.redeemable = si.redeemable.toJSON()
          stakingInfo.rewardDestination = si.rewardDestination.toHuman()
          stakingInfo.sessionIds = si.sessionIds.map((id) => id.toHuman())

          const stakingLedgerHuman = si.stakingLedger.toHuman()
          stakingInfo.stakingLedger = si.stakingLedger.toJSON()
          stakingInfo.stakingLedger.active = normalizeValue(stakingLedgerHuman.active)
          stakingInfo.stakingLedger.total = normalizeValue(stakingLedgerHuman.total)

          stakingInfo.stashId = si.stashId.toHuman()
          stakingInfo.unlocking = si.unlocking ?? false
          stakingInfo.validatorPrefs = si.validatorPrefs.toJSON()

          this.stakingInfo = stakingInfo

          // console.log('stakingInfo:', this.stakingInfo)

          this.calcLastPaidOut()
        })
  }

  async fetchLedger () {
    const clientStore = useClientStore()

    const ledgerData = await clientStore.client.api.query.staking.ledger(this.address)
    if (ledgerData) {
      const ledger = ledgerData.toHuman()
      // console.log('Ledger:', ledger)
      const ledgerJSON = ledgerData.toJSON()
      if (ledger) {
        if ('active' in ledger) {
          ledger.active = normalizeValue(ledger.active)
        }
        ledger.claimedRewards = ledgerJSON.claimedRewards
        ledger.total = normalizeValue(ledger.total)
        this.ledger = ledger
      }
    }
  }

  async fetchTokenBalances () {
    const clientStore = useClientStore()

    const a = clientStore.assets.map(({ id }) => [
      this.address,
      id
    ])

    this.unsubscribeTokenBalances
    = await clientStore.client.api.query.assets.account.multi(a,
        (data) => {
          this.tokenBalances = data.map((balance, i) => {
            const assetId = parseInt(a[ i ][ 1 ])
            const balanceHuman = balance.toHuman()
            const val = { id: assetId, ledger: balance.toJSON() }
            if (val.ledger !== null) {
              val.ledger.balance = normalizeValue(balanceHuman.balance)
            }
            return val
          })
        })
  }
}
