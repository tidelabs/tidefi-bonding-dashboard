// import { ref } from 'vue'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { useClientStore } from 'src/stores/client'
import { useEntitiesStore } from 'src/stores/entities'
import { normalizeValue } from '../helpers/utils'
import { addOrUpdateEntity, updateLastBlock } from './entity'
import { inject } from 'vue'

export class Client {
  constructor (chain) {
    this.chain = chain
    this.api = null

    this.bus = inject('bus')

    this.unsubscribeNewHeads = null
    this.unsubscribeSession = null
    this.unsubscribeNextElected = null
  }

  async connect () {
    const clientStore = useClientStore()

    clientStore.loading = true

    // initialise the provider to connect to the specified end-point
    const provider = new WsProvider(this.chain.rpc)

    // create the API and wait until ready
    const api = await ApiPromise.create({ provider })

    // must do this for event handling, otherwise an error
    // happens in the next block of code because of the proxy object
    this.api = api

    if (api) {
      // listen for errors
      api.on('error', (error) => {
        if (
          error.toString().includes('FATAL')
          || JSON.stringify(error).includes('FATAL')
        ) {
          console.log('The API had a FATAL error!', error)
          // this.logger.error('The API had a FATAL error... exiting!')
        }
      })

      // save to clientStore
      clientStore.api = api
      clientStore.client = this

      this.refetchAll()

      const [
        bondedEras,
        canceledSlashPayout,
        chillThreshold,
        currentPlannedSession,
        offendingValidators,
        slashRewardFraction,
        // eraElectionStatus,
        // activeValidatorIndices
        electionsCandidates,
        electionsMembers
        // erasHistoric,
        // accounts,
        // electedInfo
      ] = await Promise.all([
        this.api.query.staking.bondedEras(),
        this.api.query.staking.canceledSlashPayout(),
        this.api.query.staking.chillThreshold(),
        this.api.query.staking.currentPlannedSession(),
        this.api.query.staking.offendingValidators(),
        this.api.query.staking.slashRewardFraction(),
        // this.api.query.staking.eraElectionStatus(),
        // this.api.query.shared.activeValidatorIndices()
        this.api.query.elections.candidates(),
        this.api.query.elections.members()
        // this.api.derive.staking.erasHistoric(false),
        // this.api.query.staking.accounts(),
        // this.api.query.staking.electedInfo()
      ])

      console.log(
        'bondedEras:', bondedEras.toJSON(), '\n',
        'canceledSlashPayout:', canceledSlashPayout.toJSON(), '\n',
        'chillThreshold:', chillThreshold.toJSON(), '\n',
        'currentPlannedSession:', currentPlannedSession.toJSON(), '\n',
        'offendingValidators:', offendingValidators.toJSON(), '\n',
        'slashRewardFraction:', slashRewardFraction.toJSON(), '\n',
        // 'eraElectionStatus:', eraElectionStatus.toJSON(), '\n',
        // 'activeValidatorIndices:', activeValidatorIndices, '\n'
        'electionsCandidates:', electionsCandidates.toJSON(), '\n',
        'electionsMembers:', electionsMembers.toJSON(), '\n'
        // 'erasHistoric:', erasHistoric, '\n',
        // 'accounts:', accounts.toJSON(), '\n',
        // 'electedInfo:', electedInfo.toJSON(), '\n'
      )

      this.testing()

      this.unsubscribeNextElected = this.api.derive.staking.nextElected((elected) => {
        // console.log('Next Elected:', elected)
        clientStore.nextElected = elected.map((elect) => elect.toHuman())
      })

      this.unsubscribeNewHeads = api.derive.chain.subscribeNewHeads((header) => {
        // console.log(`#${ header.number }: ${ header.author }\n`)
        updateLastBlock(header.number.toNumber(), header.author.toString())
        // console.log(`(${ JSON.stringify(header.toJSON(), null, 2) })\n(${ JSON.stringify(header.toHuman(), null, 2) })\n`)
        const currentHeader = header.toHuman()
        // block number
        currentHeader.number = normalizeValue(currentHeader.number)
        clientStore.currentHeader = currentHeader

        this.fetchAuthoredBlocks()
      })

      this.unsubscribeSession = api.derive.session.progress((session) => {
        clientStore.session.eraLength = session.eraLength.toNumber()
        clientStore.session.eraProgress = session.eraProgress.toNumber()
        clientStore.session.sessionLength = session.sessionLength.toNumber()
        clientStore.session.sessionProgress = session.sessionProgress.toNumber()
        clientStore.session.sessionsPerEra = session.sessionsPerEra.toNumber()

        if (clientStore.session.sessionLength - clientStore.session.sessionProgress === 1) {
          // refetch data when session ends
          console.log('---------- SESSION ENDED ----------')
          this.refetchAll()
          this.bus.emit('session-ended')
        }

        if (clientStore.session.eraLength - clientStore.session.eraProgress === 1) {
          console.log('---------- ERA ENDED ----------')
        }
      })

      this.unsubscribeSomeOffline = api.events.imOnline.SomeOffline.is((offline) => {
        console.log('---------- SOME OFFLINE ----------\n', offline.toJSON())
        // not sure this can be cleared when a Validator is back on line
        // clientStore.offline = offline.toJSON()
      })

      clientStore.loading = false
    }
  }

  async testing () {
    const data = await Promise.all([
      // this.api.derive.staking.account(),
      // this.api.derive.staking.accounts(),
      this.api.derive.staking.currentPoints()
      // this.api.derive.staking.electedInfo(),
      // this.api.derive.staking.eraExposure(),
      // this.api.derive.staking.eraPrefs(),
      // this.api.derive.staking.eraSlashes(),
      // this.api.derive.staking.erasExposure(),
      // this.api.derive.staking.erasHistoric(),
      // this.api.derive.staking.erasPoints(),
      // this.api.derive.staking.erasPrefs(),
      // this.api.derive.staking.erasRewards(),
      // this.api.derive.staking.erasSlashes(),
      // this.api.derive.staking.keys() // requires 1 arg
      // this.api.derive.staking.keysMulti(),
      // this.api.derive.staking.nextElected() // done
      // this.api.derive.staking.overview(),
      // this.api.derive.staking.ownExposure(),
      // this.api.derive.staking.ownExposures(),
      // this.api.derive.staking.ownSlash(),
      // this.api.derive.staking.ownSlashes(),
      // this.api.derive.staking.query(),
      // this.api.derive.staking.queryMulti(),
      // this.api.derive.staking.stakerExposure(),
      // this.api.derive.staking.stakerExposures(),
      // this.api.derive.staking.stakerPoints(),
      // this.api.derive.staking.stakerPrefs(),
      // this.api.derive.staking.stakerRewards(),
      // this.api.derive.staking.stakerRewardsMulti(),
      // this.api.derive.staking.stakerRewardsMultiEras(),
      // this.api.derive.staking.stakerSlashes(),
      // this.api.derive.staking.stashes(),
      // this.api.derive.staking.validators(),
      // this.api.derive.staking.waitingInfo()
    ])

    console.log('values:', data)
  }

  disconnect () {
    // TODO: needs more handling
    if (this.api) {
      if (this.unsubscribeNewHeads) {
        this.unsubscribeNewHeads()
        this.unsubscribeNewHeads = null
      }
      if (this.unsubscribeSession) {
        this.unsubscribeSession()
        this.unsubscribeSession = null
      }
      if (this.unsubscribeSomeOffline) {
        this.unsubscribeSomeOffline()
        this.unsubscribeSomeOffline = null
      }
      if (this.unsubscribeNextElected) {
        this.unsubscribeNextElected()
        this.unsubscribeNextElected = null
      }

      this.api.disconnect()
    }
  }

  reconnect () {
    this.disconnect()
    this.connect()
  }

  // updates previous data asynchronously
  async refetchAll () {
    // wait on some dependencies
    await this.fetchChainInfo()
    await this.fetchConsts()
    await this.fetchAssets()
    await this.fetchEras()
    // others that are reactive
    this.fetchCounts()
    this.fetchErasTotalStake()
    this.fetchErasRewardPoints()
    this.fetchInvulnerables()
    this.fetchSubIdentities()
    // this.fetchElectedInfo()
    this.fetchEraExposure()
    this.fetchValidators()
    this.fetchAuthoredBlocks() // must come after validators
    this.fetchErasValidatorReward()
    this.fetchUnappliedSlashes()
  }

  async fetchChainInfo () {
    const clientStore = useClientStore()

    const [
      chain,
      nodeName,
      nodeVersion
    ] = await Promise.all([
      this.api.rpc.system.chain(),
      this.api.rpc.system.name(),
      this.api.rpc.system.version()
    ])

    this.chain = chain

    clientStore.nodeName = nodeName
    clientStore.nodeVersion = nodeVersion
    clientStore.decimals = chain.registry.chainDecimals
    clientStore.tokens = chain.registry.chainTokens

    return {
      chain,
      nodeName,
      nodeVersion
    }
  }

  async fetchConsts () {
    const clientStore = useClientStore()

    const [
      specName,
      implName,
      specVersion,
      bondingDuration,
      maxNominations,
      sessionsPerEra,
      maxNominatorRewardedPerValidator,
      maxElectingVoters,
      expectedBlockTime,
      existentialDeposit,
      historyDepth
      // nominationPoolsPalletId,
    ] = await Promise.all([
      this.api.consts.system.version.specName,
      this.api.consts.system.version.implName,
      this.api.consts.system.version.specVersion,
      this.api.consts.staking.bondingDuration,
      this.api.consts.staking.maxNominations,
      this.api.consts.staking.sessionsPerEra,
      this.api.consts.staking.maxNominatorRewardedPerValidator,
      this.api.consts.electionProviderMultiPhase.maxElectingVoters,
      this.api.consts.babe.expectedBlockTime,
      this.api.consts.balances.existentialDeposit,
      this.api.consts.staking.historyDepth || this.api.query.staking.historyDepth()
      // this.api.consts.nominationPools.palletId,
    ])

    const version = {
      specName: specName.toHuman(),
      implName: implName.toHuman(),
      specVersion: specVersion.toJSON()
    }
    clientStore.consts.version = version

    clientStore.consts.bondingDuration = bondingDuration.toJSON()
    clientStore.consts.maxNominations = maxNominations.toJSON()
    clientStore.consts.sessionsPerEra = sessionsPerEra.toJSON()
    clientStore.consts.maxNominatorRewardedPerValidator = maxNominatorRewardedPerValidator.toJSON()
    clientStore.consts.maxElectingVoters = maxElectingVoters.toJSON()
    clientStore.consts.expectedBlockTime = expectedBlockTime.toJSON()
    clientStore.consts.existentialDeposit = existentialDeposit.toJSON()
    clientStore.consts.historyDepth = historyDepth.toJSON()

    return {
      bondingDuration,
      maxNominations,
      sessionsPerEra,
      maxNominatorRewardedPerValidator,
      maxElectingVoters,
      expectedBlockTime,
      existentialDeposit,
      historyDepth
    }
  }

  async fetchAssets () {
    const clientStore = useClientStore()
    const assets = []

    const assetsMetadata = await this.api.query.assets.metadata.entries()

    assetsMetadata.forEach(([ key, data ]) => {
      const id = key.args[ 0 ].toJSON()
      const asset = data.toHuman()
      asset.decimals = parseInt(asset.decimals, 10)
      assets.push({
        id,
        asset
      })
    })

    clientStore.assets = assets

    return {
      assetsMetadata
    }
  }

  async fetchEras () {
    const clientStore = useClientStore()

    const [
      activeEra,
      currentEra
    ] = await Promise.all([
      this.api.query.staking.activeEra(),
      this.api.query.staking.currentEra()
    ])

    clientStore.activeEra = activeEra.toJSON()
    clientStore.currentEra = currentEra.toJSON()

    return {
      activeEra,
      currentEra
    }
  }

  async fetchCounts () {
    const clientStore = useClientStore()

    const [
      counterForNominators,
      counterForValidators,
      maxNominatorsCount,
      maxValidatorsCount,
      minimumValidatorCount,
      minNominatorBond,
      minValidatorBond,
      validatorCount,
      minCommission,
      totalIssuance
    ] = await Promise.all([
      this.api.query.staking.counterForNominators(),
      this.api.query.staking.counterForValidators(),
      this.api.query.staking.maxNominatorsCount(),
      this.api.query.staking.maxValidatorsCount(),
      this.api.query.staking.minimumValidatorCount(),
      this.api.query.staking.minNominatorBond(),
      this.api.query.staking.minValidatorBond(),
      this.api.query.staking.validatorCount(),
      this.api.query.staking.minCommission(),
      this.api.query.balances.totalIssuance()
    ])

    clientStore.counterForNominators = counterForNominators.toJSON()
    clientStore.counterForValidators = counterForValidators.toJSON()
    clientStore.maxNominatorsCount = maxNominatorsCount.toJSON()
    clientStore.maxValidatorsCount = maxValidatorsCount.toJSON()
    clientStore.minimumValidatorCount = minimumValidatorCount.toJSON()
    clientStore.minNominatorBond = minNominatorBond.toJSON()
    clientStore.minValidatorBond = minValidatorBond.toJSON()
    clientStore.validatorCount = validatorCount.toJSON()
    clientStore.minCommission = minCommission.toJSON()

    clientStore.totalIssuance = normalizeValue(totalIssuance.toHuman())

    return {
      counterForNominators,
      counterForValidators,
      maxNominatorsCount,
      maxValidatorsCount,
      minimumValidatorCount,
      minNominatorBond,
      minValidatorBond,
      validatorCount,
      totalIssuance
    }
  }

  async fetchInvulnerables () {
    const clientStore = useClientStore()

    const invulnerables = await this.api.query.staking.invulnerables()
    clientStore.invulnerables = invulnerables.toJSON()

    return {
      invulnerables
    }
  }

  async fetchErasTotalStake () {
    const clientStore = useClientStore()

    const erasTotalStaked = await this.api.query.staking.erasTotalStake(clientStore.currentEra)
    clientStore.erasTotalStaked = normalizeValue(erasTotalStaked.toHuman())

    // console.log('erasTotalStaked:', clientStore.erasTotalStaked)

    return {
      erasTotalStaked
    }
  }

  async fetchSubIdentities () {
    const clientStore = useClientStore()
    const subIdentities = []

    const subIdentityEntries = await this.api.query.identity.subsOf.entries()

    subIdentityEntries.forEach(([ key, data ]) => {
      (data.toJSON()[ 1 ]).forEach((sub) => {
        subIdentities.push({
          parent: key.toHuman()[ 0 ],
          sub
        })
      })
    })

    clientStore.subIdentities = subIdentities

    return {
      subIdentities
    }
  }

  async fetchValidators () {
    const clientStore = useClientStore()

    // all validators
    const validatorEntries = await this.api.query.staking.validators.entries()
    const ve = validatorEntries.map(([ key, data ]) => {
      return {
        address: key.args[ 0 ].toHuman(),
        data: data.toHuman()
      }
    })
    // console.log('ve:', ve)
    clientStore.validatorEntries = ve

    // validators of the current era
    const stakerEntries = await this.api.query.staking.erasStakers.entries(clientStore.currentEra)
    const se = stakerEntries.map(([ key, data ]) => {
      const address = key.args[ 1 ].toHuman()
      const stakers = data.toHuman()
      stakers.own = normalizeValue(stakers.own)
      stakers.total = normalizeValue(stakers.total)
      stakers.others = stakers.others.map((other) => {
        return {
          ...other,
          value: normalizeValue(other.value)
        }
      })
      const validatorEntry = validatorEntries.find(([key]) => key.args[ 0 ].toHuman() === address)
      const preferences = (validatorEntry && validatorEntry[ 1 ].toHuman()) || {
        commission: 0,
        blocked: false
      }

      return {
        address,
        stakers,
        preferences
      }
    })
    // console.log('se:', se)
    clientStore.stakerEntries = se

    ve.forEach(async (val) => {
      addOrUpdateEntity(val.address, true)
    })
  }

  /*
    {
      info: Array
        [{
          accountId: xxxxx,
          controllerId: xxxxx,
          exposure: {
            total: #####,
            own: #####,
            others: [

            ]
          },
          nominators: [] // always seems to be empty
          rewardDestination: Staked | Stash | Controller | Account | None,
          stakingLedger: {
            stash: ???,
            total: #####,
            active: Bool,
            unlocking: Bool,
            claimedRewards: ???
          },
          stashId: #####,
          validatorPrefs: {
            commission: #####,
            blocked: Bool
          }
        }],
        nextElected: [
          address
        ],
        validators: [
          address
        ]
    }
  */
  async fetchElectedInfo () {
    const clientStore = useClientStore()
    const electedInfo = []

    // console.log('staking api:', this.api.derive.staking)
    const electedInfoEra = await this.api.derive.staking.electedInfo(clientStore.currentEra)
    // console.log('electedInfoEra:', electedInfoEra)
    electedInfo.info = electedInfoEra.info.map((info) => {
      return {
        accountId: info.accountId.toHuman(),
        controllerId: info.controllerId ? info.controllerId.toHuman() : info.controllerId,
        exposure: info.exposure.toHuman(),
        nominators: info.nominators.map((nominator) => nominator.toHuman()),
        rewardDestination: info.rewardDestination.toHuman(),
        stakingLedger: info.stakingLedger.toHuman(),
        stashId: info.stashId.toHuman(),
        validatorPrefs: info.validatorPrefs.toHuman()
      }
    })
    electedInfo.nextElected = electedInfoEra.nextElected.map((elected) => elected.toHuman())
    electedInfo.validators = electedInfoEra.validators.map((validator) => validator.toHuman())
    // console.log('electedInfo:', electedInfo)
  }

  /*
    {
      era: x,
      nominators: Object { nominator: Array }
      validators: : Object { validator: Array }
    }
  */
  async fetchEraExposure () {
    // const clientStore = useClientStore()
    // const eraExposure = await this.api.derive.staking.eraExposure(clientStore.currentEra)
    // console.log('eraExposure:', eraExposure)
  }

  async fetchErasRewardPoints () {
    const clientStore = useClientStore()
    const rewardPoints = []

    const erasRewardPoints = await this.api.query.staking.erasRewardPoints.entries()
    erasRewardPoints.forEach(([ key, rewards ]) => {
      rewardPoints.push({
        era: key.args[ 0 ].toJSON(),
        rewards: rewards.toJSON()
      })
    })

    // this array needs sorting
    rewardPoints.sort((a, b) => a.era - b.era)

    clientStore.rewardPoints = rewardPoints

    // console.log('rewardPoints:', rewardPoints)

    return {
      erasRewardPoints
    }
  }

  async fetchErasValidatorReward () {
    const clientStore = useClientStore()
    const rewardsHistory = []

    const erasValidatorReward = await this.api.query.staking.erasValidatorReward.entries() // (clientStore.currentEra - 1)
    erasValidatorReward.forEach(([ key, rewards ]) => {
      const era = key.args[ 0 ].toJSON()
      rewardsHistory.push({
        era,
        rewards: rewards.toString()
      })
    })

    // this array needs sorting
    rewardsHistory.sort((a, b) => a.era - b.era)

    // console.log('rewardsHistory:', rewardsHistory)

    clientStore.rewardsHistory = rewardsHistory

    return {
      erasValidatorReward
    }
  }

  async fetchUnappliedSlashes () {
    const clientStore = useClientStore()
    // const slashes = []

    const unappliedSlashes = await this.api.query.staking.unappliedSlashes(clientStore.previousEra)

    // TODO: needs more work
    clientStore.slashes = unappliedSlashes

    return {
      unappliedSlashes
    }
  }

  async fetchAuthoredBlocks () {
    const clientStore = useClientStore()
    const entitiesStore = useEntitiesStore()
    const authoredBlocks = []

    const authoredBlocksEntries = await clientStore.client.api.query.imOnline.authoredBlocks.entries() // (clientStore.activeEra.index - 1, this.address)
    authoredBlocksEntries.forEach(([ key, blocks ]) => {
      const address = key.args[ 1 ].toJSON()
      authoredBlocks.push({
        address,
        blocks: blocks.toJSON()
      })
    })

    // console.log('authoredBlocks:', authoredBlocks)
    entitiesStore.getActiveValidators.forEach((validator) => {
      const authoredBlock = authoredBlocks.find((authoredBlock) => authoredBlock.address === validator.address)
      if (authoredBlock) {
        validator.blockCount = authoredBlock.blocks
      }
    })
  }
}
