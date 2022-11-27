import { normalizeValue } from '../helpers/utils'

export async function stakerRewards (api, address, withActivity = true) {
  const rewardsContainer = await api.derive.staking.stakerRewards(address, withActivity)

  const rewards = rewardsContainer.map((data) => {
    const validators = Object.keys(data.validators).map((key) => {
      const validator = data.validators[ key ]
      const pool = validator.total.toJSON()
      const reward = validator.value.toJSON()
      // console.log(
      //   key,
      //   total,
      //   value
      // )
      return {
        key, // validator address
        pool, // validator pool
        reward // reward
      }
    })
    // console.log('validators', validators)
    return {
      ...data,
      era: data.era.toJSON(),
      eraReward: normalizeValue(data.eraReward.toHuman()),
      validators
    }
  })
  // console.log('rewards:', rewards)

  // const rewards = rewardsContainer.map((data) => {
  //   return data.map((data2) => {
  //     data2.era = data2.era.toJSON()
  //     data2.eraReward = normalizeValue(data2.eraReward.toHuman())
  //     const keys = Object.keys(data2.validators)
  //     if (keys.length > 0) {
  //       const validators2 = {}
  //       keys.forEach((key) => {
  //         validators2[ key ] = {
  //           total: data2.validators[ key ].total.toJSON(),
  //           value: data2.validators[ key ].value.toJSON()
  //         }
  //       })
  //       data2.validators = validators2
  //     }
  //     return data2
  //   })
  // })

  return rewards
}
