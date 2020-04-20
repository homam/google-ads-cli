import R from 'ramda'

const groupByLenses = [
    R.lensPath(['campaign', 'id'])
  , R.lensPath(['ad_group', 'id'])
  , R.lensPath(['detail_placement_view', 'resource_name'])
  , R.lensPath(['segments', 'date'])
  , R.lensPath(['campaign', 'id'])
  , R.lensPath(['ad_group', 'id'])
]

const groupByKey = x => groupByLenses.map(l => 
  R.view(l, x)
).join(":")

const aggregateLenses = [
    R.lensPath(['metrics', 'clicks'])
  , R.lensPath(['metrics', 'conversions'])
  , R.lensPath(['metrics', 'cost_micros'])
  , R.lensPath(['metrics', 'impressions'])
]

const _aggregate_seed = aggregateLenses.reduce((acc, l) => 
  R.set(l, 0, acc)
, {})

const aggregate = xs => xs.reduce((acc, x) => 
  aggregateLenses.reduce((a, l) =>  
    R.over(l, y => y + R.view(l, x), a)
  ,acc)
)

export function clean_merge(data) {
  return R.pipe(
    R.map(x => R.merge({
      key: groupByKey(x)
    }, x))
    , R.groupBy(x => x.key)
    , R.map(xs => aggregate(xs))
    , R.toPairs, R.chain(([_key, value]) => value)
  )(data)
}
