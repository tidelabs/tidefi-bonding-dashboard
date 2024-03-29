import { computed, ref, reactive, watch } from 'vue'
import { getControllerInfo } from '../helpers/validators'
import useIdentity from 'src/helpers/useIdentity'
import { toBaseToken, normalizeValue } from 'src/helpers/utils'
import BN from 'bignumber.js'
import { useClientStore } from 'stores/client'
import { useEntitiesStore } from 'stores/entities'
import { stakerRewards } from 'src/helpers/stakerRewards'
// import useErasTime from 'src/helpers/erasTime'
import { calcInflation } from 'src/helpers/calcInflation'

// const BN_HUNDRED = BN(100)
// const BN_MAX_INTEGER = BN(Number.MAX_SAFE_INTEGER)

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

  const validator = entitiesStore.getActiveValidators.find(
    (validator) => validator.address === author
  )
  if (validator) {
    validator.lastBlock = number
  }
}

export class Entity {
  constructor (address, validator = false) {
    this.address = address
    //
    this.ledger = null
    // validator info
    this.validator = validator
    this.identity = reactive({})
    this.belowAvgPoints = false // TODO:
    this.noGovernance = false // TODO:
    this.elected = false // active
    this.nextElected = false // next set
    this.stakedReturn = ref(0)
    this.bonded = 0
    this.otherStaked = 0
    this.ownStaked = 0
    this.totalStaked = 0
    this.currentRewardPoints = 0
    this.payee = ''
    this.lastBlock = ''
    this.blockCount = 0

    this.slashesInEras = reactive([])
    this.slashingSpans = ref(null)

    this.balances = reactive({
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
    })
    this.tokenBalances = reactive([])
    this.stakers = reactive({
      total: '0',
      own: '0',
      others: []
    })
    this.preferences = reactive({
      commission: 0,
      blocked: false
    })
    this.erasRewardPoints = reactive([])
    this.stakerRewards = reactive([])
    this.nominations = reactive([])
    // start of "Staking Info"
    this.stakingInfo = reactive({
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
      }
    })
    // end of "Staking Info"
    this.inflation = reactive({
      idealInterest: 0,
      idealStake: 0,
      inflation: 0,
      stakedFraction: 0,
      stakedReturn: 0
    })

    this.bondingHistory = reactive([])
    this.commissionHistory = reactive([])
    this.currentStakes = reactive([])
    // unsubscribes
    this.unsubscribeTokenBalances = null
    this.unsubscribeBalances = null
    this.unsubscribeStakingInfo = null
    this.unsubscribeCurrentStakes = null
    // this.unsubscribeRewardPoints = null

    // this.reputation = 0 // computed - future
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
    if (this.unsubscribeCurrentStakes) {
      this.unsubscribeCurrentStakes()
      this.unsubscribeCurrentStakes = null
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

    const controller = await getControllerInfo(
      this.address,
      clientStore.client.api
    )
    this.controller = controller.toHuman()
    // console.log('controller:', this.controller)
    // console.log('address   :', this.address)

    const payee = await await clientStore.client.api.query.staking.payee(
      this.address
    )
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
    } = useIdentity(
      this.address,
      clientStore.subIdentities,
      clientStore.client.api
    )
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
    await this.fetchValidatorInfo()
    await this.fetchTokenBalances()
    await this.fetchValidatorPrefs()
    await this.fetchCurrentStakes()

    const nominations = await clientStore.client.api.query.staking.nominators(
      this.address
    )
    this.nominations = nominations.toJSON()
    // console.log('nominations:', this.nominations)

    // validator specific
    if (this.validator) {
      await this.updateStakerInfo()
      await this.fetchStakingInfo()

      const slashingSpans = (
        await clientStore.client.api.query.staking.slashingSpans(this.address)
      ).toJSON()
      // console.log('slashingSpans:', this.slashingSpans, slashingSpans)
      this.slashingSpans = ref(slashingSpans)

      const historyDepth = clientStore.consts.historyDepth
      const currentEra = clientStore.currentEra
      const depth = Math.min(historyDepth, currentEra)
      const args = [...Array(depth)].map((_, i) => [
        clientStore.currentEra - i,
        this.address
      ])

      const validatorSlashInEra
        = await clientStore.client.api.query.staking.validatorSlashInEra.multi(
          args
        )
      if (validatorSlashInEra) {
        const slashesInEras = validatorSlashInEra
          .reduce((acc, val, index) => {
            if (val.isEmpty) return acc

            const era = currentEra - index
            const valHuman = val.toHuman()
            acc.push({
              era,
              percent: valHuman[ 0 ],
              amount: normalizeValue(valHuman[ 1 ])
            })

            return acc
          }, [])
          .sort((a, b) => a.era - b.era)

        this.slashesInEras.splice(
          0,
          this.slashesInEras.length,
          ...slashesInEras
        )

        // console.log('slashesInEras:', slashesInEras)
      }

      // ones that will be done asynchronously
      this.fetchBondingHistory()
    }

    // ones that will be done asynchronously
    stakerRewards(clientStore.client.api, this.address, true).then(
      (rewards) => {
        this.stakerRewards.splice(0, this.stakerRewards.length, ...rewards)
      }
    )

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
        stakedReturn: stakedReturn / 20
      }

      // console.log('Validator Inflation:', this.inflation)

      this.calcValidatorReturn()
    }

    // loading data done
    entitiesStore.decLoading()

    // this.reputation = computed(() => {
    //   return 5
    // })

    this.isOversubscribed = computed(() => {
      const clientStore = useClientStore()
      return (
        this.nominatorCount.value
        > clientStore.consts.maxNominatorRewardedPerValidator
      )
    })

    this.isSlashed = computed(() => !!this.slashesInEras.length)
    // console.log('isSlashed:', this.identity.name.value, this.isSlashed.value)

    this.nominatorCount = computed(() => {
      if (
        this.stakers
        && this.stakers.others
        && this.stakers.others.length > 0
      ) {
        return this.stakers.others.length
      }
      return 0
    })

    this.bonded = computed(() => {
      if (this.balances?.lockedBreakdown?.length > 0) {
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

      return (
        clientStore.rewardPoints[ clientStore.rewardPoints.length - 1 ]?.rewards
          ?.individual[ this.address ] || 0
      )
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

    this.lastPaidOut = computed(() => {
      const clientStore = useClientStore()

      if (!this.elected) {
        return ''
      }

      if (
        this.stakingInfo
        && this.stakingInfo.stakingLedger
        && this.stakingInfo.stakingLedger.claimedRewards
        && this.stakingInfo.stakingLedger.claimedRewards.length > 0
      ) {
        const lastEraPaid
          = this.stakingInfo.stakingLedger.claimedRewards[
            this.stakingInfo.stakingLedger.claimedRewards.length - 1
          ]

        if (lastEraPaid === -1) {
          return 'never'
        }

        const days = clientStore.previousEra - lastEraPaid
        switch (days) {
          case 0:
            return 'recently'
          case 1:
            return 'yesterday'
          default:
            return `${ days } days`
        }
      }

      return ''
    })

    watch(
      () => this.stakerRewards,
      (val) => {
        console.log('watch StakersRewards', val)
      }
    )

    // success
    return true
  }

  async disconnect () {
    if (this.unsubscribeTokenBalances) {
      await this.unsubscribeTokenBalances()
      this.unsubscribeTokenBalances = null
    }
    if (this.unsubscribeBalances) {
      await this.unsubscribeBalances()
      this.unsubscribeBalances = null
    }
    if (this.unsubscribeStakingInfo) {
      await this.unsubscribeStakingInfo()
      this.unsubscribeStakingInfo = null
    }
    if (this.unsubscribeCurrentStakes) {
      await this.unsubscribeCurrentStakes()
      this.unsubscribeCurrentStakes = null
    }
  }

  formatTokenValue (val) {
    const clientStore = useClientStore()

    return clientStore.decimals.length > 0
      ? toBaseToken(val, clientStore.decimals[ 0 ])
      : 0
  }

  async fetchBalances () {
    const clientStore = useClientStore()

    this.unsubscribeBalances = await clientStore.client.api.derive.balances.all(
      this.address,
      (balance) => {
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
        this.balances.namedReserves = balance.namedReserves.map((reserve) =>
          reserve.toHuman()
        )
      }
    )

    // console.log('balances:', this.balances)
  }

  async updateStakerInfo () {
    const clientStore = useClientStore()

    // all validators in StakersEntries are in the elected set
    const stakerEntry = clientStore.stakerEntries.find(
      (se) => se.address === this.address
    )
    if (stakerEntry) {
      this.elected = true
      this.stakers = stakerEntry.stakers
      this.preferences = stakerEntry.preferences
    }
    else {
      // console.log('Validator not in current set:', this.address)
      const validatorEntry = clientStore.validatorEntries.find(
        (ve) => ve.address === this.address
      )
      if (validatorEntry) {
        this.elected = false
        this.stakers = []
        this.preferences = validatorEntry.data
      }
    }
  }

  calcValidatorReturn () {
    // const clientStore = useClientStore()
    // const entitiesStore = useEntitiesStore()

    if (!this.elected || (this.stakers && !('total' in this.stakers))) {
      this.stakedReturn = ref(0)
      return
    }

    // Average of all stakes (bonds)
    // const avgStaked = BN(clientStore.erasTotalStaked).div(clientStore.counterForNominators)
    const avgStaked = BN(this.stakers.total).div(this.stakers.others.length)

    if (avgStaked && !avgStaked.isZero()) {
      // const adjusted = avgStaked.multipliedBy(BN_HUNDRED).multipliedBy(this.inflation.stakedReturn).div(Math.max(1, parseInt(this.stakers.total)))
      // console.log('adjusted:', adjusted.toNumber())

      // const stakedReturn = (adjusted.gt(BN_MAX_INTEGER) ? BN_MAX_INTEGER : adjusted).div(BN_HUNDRED).toNumber()

      // adjusted for commission
      // console.log('stakedReturn:', this.address, stakedReturn, this.preferences.commission)
      this.stakedReturn = ref(
        (
          (this.inflation.stakedReturn
            * (100 - parseFloat(this.preferences.commission)))
          / 100
        ).toFixed(2)
      )

      // console.log('Validator Bonded Return:', adjusted.toNumber(), stakedReturn, this.stakedReturn)
    }
  }

  async fetchStakingInfo () {
    const clientStore = useClientStore()

    this.unsubscribeStakingInfo
      = await clientStore.client.api.derive.staking.account(
        this.address,
        (si) => {
          // console.log('si:', si)
          const stakingInfo = {}
          stakingInfo.accountId = si.accountId.toHuman()
          stakingInfo.controllerId = si.controllerId.toHuman()

          const exposureHuman = si.exposure.toHuman()
          stakingInfo.exposure = si.exposure.toJSON()
          stakingInfo.exposure.others = exposureHuman.others

          stakingInfo.nextSessionIds = si.nextSessionIds.map((id) =>
            id.toHuman()
          )
          stakingInfo.nominators = si.nominators.map((id) => id.toHuman())
          stakingInfo.redeemable = si.redeemable.toJSON()
          stakingInfo.rewardDestination = si.rewardDestination.toHuman()
          stakingInfo.sessionIds = si.sessionIds.map((id) => id.toHuman())

          const stakingLedgerHuman = si.stakingLedger.toHuman()
          stakingInfo.stakingLedger = si.stakingLedger.toJSON()
          stakingInfo.stakingLedger.active = normalizeValue(
            stakingLedgerHuman.active
          )
          stakingInfo.stakingLedger.total = normalizeValue(
            stakingLedgerHuman.total
          )

          stakingInfo.stashId = si.stashId.toHuman()
          stakingInfo.unlocking = si.unlocking
            ? si.unlocking.map((value) => {
              return {
                remainingEras: value.remainingEras.toNumber(),
                value: value.value.toString()
              }
            })
            : []
          // console.log('unlocking:', stakingInfo.unlocking)
          stakingInfo.validatorPrefs = si.validatorPrefs.toJSON()

          this.stakingInfo = stakingInfo

          // console.log('stakingInfo:', this.stakingInfo)
        }
      )
  }

  async fetchLedger () {
    const clientStore = useClientStore()

    const ledgerData = await clientStore.client.api.query.staking.ledger(
      this.address
    )
    if (ledgerData) {
      const ledger = ledgerData.toHuman()
      // console.log('Ledger:', ledger)
      const ledgerJSON = ledgerData.toJSON()
      if (ledger) {
        if ('active' in ledger) {
          ledger.active = normalizeValue(ledger.active)
        }
        if ('unlocking' in ledger) {
          const unlocking = ledger.unlocking.map((unlock) => {
            return {
              era: parseInt(unlock.era, 10),
              value: normalizeValue(unlock.value)
            }
          })
          ledger.unlocking = unlocking
        }
        ledger.claimedRewards = ledgerJSON.claimedRewards
        ledger.total = normalizeValue(ledger.total)
        this.ledger = ledger
      }
    }
  }

  async fetchCurrentStakes () {
    const clientStore = useClientStore()

    this.unsubscribeCurrentStakes
      = await clientStore.client.api.query.tidefiStaking.accountStakes(
        this.address,
        (currentStakes) => {
          this.currentStakes.splice(
            0,
            this.currentStakes.length,
            ...currentStakes.toHuman()
          )
          // console.log('currentStakes:', currentStakes.toHuman())
        }
      )
  }

  async fetchBondingHistory () {
    const clientStore = useClientStore()

    const historyDepth = clientStore.consts.historyDepth
    const currentEra = clientStore.currentEra
    const depth = Math.min(historyDepth, currentEra)
    const args = [...Array(depth)].map((_, i) => [
      clientStore.currentEra - i,
      this.address
    ])

    const stakerEntries
      = await clientStore.client.api.query.staking.erasStakers.multi(args)
    const se = stakerEntries
      .map((data, index) => {
        const era = currentEra - index
        const stakers = data.toHuman()
        stakers.own = normalizeValue(stakers.own)
        stakers.total = normalizeValue(stakers.total)
        stakers.others = stakers.others.map((other) => {
          return {
            ...other,
            value: normalizeValue(other.value)
          }
        })

        return {
          era,
          own: stakers.own,
          total: stakers.total,
          others: stakers.others
        }
      })
      .sort((a, b) => a.era - b.era)
    this.bondingHistory.splice(0, this.bondingHistory.length, ...se)

    // console.log('Bonding History:', this.bondingHistory)
  }

  async fetchValidatorInfo () {
    // const clientStore = useClientStore()
    // const validatorInfo = await clientStore.client.api.query.staking.validators(this.address)
    // console.log('Validator Info:', validatorInfo)
  }

  async fetchTokenBalances () {
    const clientStore = useClientStore()

    const a = clientStore.assets.map(({ id }) => [ this.address, id ])

    this.unsubscribeTokenBalances
      = await clientStore.client.api.query.assets.account.multi(a, (data) => {
        this.tokenBalances = data.map((balance, i) => {
          const assetId = parseInt(a[ i ][ 1 ])
          const balanceHuman = balance.toHuman()
          const val = { id: assetId, ledger: balance.toJSON() }
          if (val.ledger !== null) {
            val.ledger.balance = normalizeValue(balanceHuman.balance)
            val.ledger.reserved = normalizeValue(balanceHuman.reserved)
            val.ledger.reason = balanceHuman.reason
          }
          return val
        })
      })
  }

  async fetchValidatorPrefs () {
    const clientStore = useClientStore()

    const historyDepth = clientStore.consts.historyDepth
    const currentEra = clientStore.currentEra
    const depth = Math.min(historyDepth, currentEra)
    const args = [...Array(depth)].map((_, i) => [
      clientStore.currentEra - i,
      this.address
    ])

    const validatorPrefsHistory
      = await clientStore.client.api.query.staking.erasValidatorPrefs.multi(args)
    // console.log('validatorPrefsHistory:', validatorPrefsHistory)
    const commissionHistory = validatorPrefsHistory
      .reduce((acc, preferences, index) => {
        if (!preferences || preferences.isEmpty) return acc

        const data = preferences.toJSON()
        const era = currentEra - index
        acc.push({
          era,
          commission: data.commission / 10000000
        })

        return acc
      }, [])
      .sort((a, b) => a.era - b.era)

    // console.log('erasValidatorPrefs:', erasValidatorPrefs)
    this.commissionHistory.splice(
      0,
      this.commissionHistory.length,
      ...commissionHistory
    )
  }
}
