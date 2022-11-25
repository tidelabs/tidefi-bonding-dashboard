import { computed } from 'vue'
import { toSvg } from 'jdenticon'
import {
  getControllerInfo,
  getIdentityInfo,
  getParentIdentity,
  getSuperIdentity
} from '../helpers/validators'
import { trimHash, toBaseToken, normalizeValue, isVerifiedIdentity } from '../helpers/utils'
import BN from 'bignumber.js'
import { useClientStore } from 'stores/client'
import { useEntitiesStore } from 'stores/entities'

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
      free: 0,
      freeHuman: '',
      reserved: 0,
      miscFrozen: 0, // bonded
      locked: 0, // locked
      transferrable: 0,
      nonce: ''
    }
    this.ledger = null
    this.tokenBalances = []
    // unsubscribes
    this.unsubscribeTokenBalances = null
    this.unsubscribeBalances = null
    // this.unsubscribeRewardPoints = null
    // validator info
    this.validator = validator
    this.identityType = 'identity_none' // identity_plus | identity_check | identity_verified
    this.hasIdentity = false
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
    this.otherStaked = 0
    this.ownStaked = 0
    this.totalStaked = 0
    this.currentRewardPoints = 0
    this.erasRewardPoints = []
    this.payee = ''
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
    await this.fetchIdentity()
    await this.updateParentIdentity()
    await this.updateSuperdentity()
    await this.fetchBalances()
    await this.fetchLedger()
    await this.fetchTokenBalances()
    // validator specific
    if (this.validator) {
      await this.updateStakerInfo()
    }

    // loading data done
    entitiesStore.decLoading()

    // this.reputation = computed(() => {
    //   return 5
    // })

    this.name = computed(() => {
      if (this?.parent && this?.parent?.identity?.info) {
        let parentName = this?.parent?.identity?.info?.display?.Raw
        if (!this.super) {
          return parentName
        }
        parentName += '/' + this?.super[ 1 ].Raw
        return parentName
      }

      // must come second as you can still have identity
      if (this?.identity && this?.identity?.info) {
        return this?.identity?.info?.display?.Raw
      }

      if (this.address) {
        return trimHash(this.address, 16)
      }

      return '<unknown>'
    })

    this.identityType = computed(() => {
      if (isVerifiedIdentity(this.identity || (this.parent && this.parent.identity))) {
        return 'identity_verified'
      }
      else if (this.identity && this.identity.info) {
        return 'identity_check'
      }
      else if (this.parent && this.parent.identity.info && this.super) {
        return 'identity_plus'
      }
      return 'identity_none'
    })

    this.hasIdentity = computed(() => {
      const value = this.identityType !== 'identity_none'
      console.log(`IdentityType (${ this.name }): ${ this.identityType }`)
      return value
    })

    this.nominatorCount = computed(() => {
      if (this.stakers && this.stakers.others && this.stakers.others.length > 0) {
        return this.stakers.others.length
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

      return 'unknown'
    })

    this.ownStaked = computed(() => {
      return this.stakers && 'own' in this.stakers ? this.formatTokenValue(normalizeValue(this.stakers.own)) : this.formatTokenValue(this.balances.locked)
    })

    this.totalStaked = computed(() => {
      return this.stakers && 'total' in this.stakers ? this.formatTokenValue(normalizeValue(this.stakers.total)) : 'unknown'
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
      = await clientStore.client.api.query.system.account(
        this.address, (balance) => {
          this.balances.free = balance.data.free.toString()
          this.balances.freeHuman = balance.data.free / Math.pow(10, clientStore.decimals[ 0 ])

          this.balances.reserved = balance.data.reserved.toString()
          this.balances.miscFrozen = balance.data.miscFrozen.toString() // bonded
          this.balances.feeFrozen = balance.data.feeFrozen.toString() // locked
          this.balances.locked = '' + Math.max(balance.data.miscFrozen, balance.data.feeFrozen)
          this.balances.transferrable = (balance.data.free - (Math.max(balance.data.miscFrozen, balance.data.feeFrozen))).toString()
          this.balances.nonce = balance.nonce.toHuman()
        })
  }

  async fetchIdentity () {
    const clientStore = useClientStore()

    const identity = await getIdentityInfo(this.address, clientStore.client.api)
    if (identity) {
      const identityHuman = identity.toHuman()
      if (identityHuman) {
        if (identityHuman.info) {
          this.identity = {}
          this.identity.info = identityHuman.info
        }
        if (identityHuman.judgements) {
          if (!this.identity) {
            this.identity = {}
          }
          // TODO: judgements will need to be checked for verified identities
          this.identity.judgements = identityHuman.judgements
        }
      }
      const identityJSON = identity.toJSON()
      if (identityJSON && 'deposit' in identityJSON) {
        if (!this.identity) {
          this.identity = {}
        }
        this.identity.deposit = identityJSON.deposit
      }
    }
  }

  async updateParentIdentity () {
    const clientStore = useClientStore()

    const parentIdentity = await getParentIdentity(this.address, clientStore.subIdentities, clientStore.client.api)
    if (parentIdentity) {
      const parentIdentityHuman = parentIdentity.toHuman()
      if (parentIdentityHuman) {
        if (parentIdentityHuman.info) {
          this.parent = {}
          this.parent.identity = {}
          this.parent.identity.info = parentIdentityHuman.info
        }
        const parentIdentityJSON = parentIdentity.toJSON()
        if (!this.parent) {
          this.parent = {}
          this.parent.identity = {}
        }
        if (parentIdentityHuman.judgements) {
          this.parent.identity.judgements = parentIdentityJSON.judgements
        }
      }
    }
  }

  async updateSuperdentity () {
    const clientStore = useClientStore()

    const superIdentity = await getSuperIdentity(this.address, clientStore.client.api)
    const superIdentityHuman = superIdentity.toHuman()
    if (superIdentityHuman) {
      this.super = superIdentityHuman
    }
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

    this.unsubscribeTokenBalances = await clientStore.client.api.query.assets.account.multi(a, (data) => {
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
