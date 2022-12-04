import BN from 'bignumber.js'
import { useClientStore } from 'src/stores/client'

export const DefaultParams = {
  auctionAdjust: 0,
  auctionMax: 0,
  falloff: 0.05,
  maxInflation: 0.1,
  minInflation: 0.025,
  stakeTarget: 0.5
}

export function calcInflation (stakingTotal) {
  const clientStore = useClientStore()

  const BN_MILLION = BN(1000000)

  const totalStaked = BN(stakingTotal)
  const totalIssuance = BN(clientStore.totalIssuance)
  const numAuctions = BN(clientStore.numAuctions)
  // console.log('numAuctions:', numAuctions.toNumber())

  const stakedFraction
    = totalStaked.isZero() || totalIssuance.isZero()
      ? 0
      : totalStaked.multipliedBy(BN_MILLION).div(totalIssuance).toNumber() / BN_MILLION.toNumber()

  const idealStake
    = DefaultParams.stakeTarget
      - Math.min(DefaultParams.auctionMax, numAuctions.toNumber()) * DefaultParams.auctionAdjust

  const idealInterest = DefaultParams.maxInflation / idealStake

  const inflation
    = 100
    * (DefaultParams.minInflation
      + (stakedFraction <= idealStake
        ? (stakedFraction * (idealInterest - (DefaultParams.minInflation / idealStake)))
        : (((idealInterest * idealStake) - DefaultParams.minInflation) * Math.pow(2, (idealStake - stakedFraction) / DefaultParams.falloff))
      ))

  return {
    idealInterest,
    idealStake,
    inflation,
    stakedFraction,
    stakedReturn: stakedFraction ? inflation / stakedFraction : 0
  }
}
