import { GoogleAdsApi, types, enums } from 'google-ads-api'
import fs from 'fs'
require('dotenv').config()

// 1. Create a new client with your credentials
const client = new GoogleAdsApi({
  client_id: process.env.client_id as string,
  client_secret: process.env.client_secret as string,
  developer_token: process.env.developer_token as string,
})

// 2. Load a customer with a valid CID & authentication
const customer = client.Customer({
  login_customer_id: process.env.login_customer_id as string,
  customer_account_id: process.env.customer_account_id as string,
  refresh_token: process.env.refresh_token as string,
})

async function main() {
  // 3. Use the query method for querying customer data
  // var query = `SELECT 
  //     campaign.name, campaign.status, campaign.id
  //   FROM 
  //     campaign`
  // const response = await customer.query(query)

  const response = await customer.report({
    entity: 'detail_placement_view',
    attributes: ['detail_placement_view.placement', 'detail_placement_view.placement_type', 'detail_placement_view.resource_name', 'detail_placement_view.display_name', 'detail_placement_view.target_url'],
    metrics: ['metrics.clicks', 'metrics.cost_micros', 'metrics.conversions', 'metrics.impressions'],
    segments: ['segments.date'],
    // constraints: { 'ad_group.status': enums.AdGroupStatus.ENABLED },
    from_date: '2020-04-10',
    to_date: '2020-04-20',
    order_by: 'metrics.clicks',
    sort_order: 'desc',
    limit: 50,
  })

  fs.writeFileSync('./detail_placement_view_daily.json', JSON.stringify(response, null, 2), 'utf8')

  return response

  

  // console.log('response', response)

  // const del = await customer.campaignCriteria.delete('customers/2944916627/campaignCriteria/9832190300~1568598385')
  // console.log(del)

  // var response = await customer.campaignCriteria.list();

  // fs.writeFileSync('./campaignCriteria.json', JSON.stringify(response, null, 2), 'utf8')

  // return del

  // return await customer.campaignCriteria.create({
  //   status: enums.CampaignCriterionStatus.ENABLED,
  //   type: enums.CriterionType.PLACEMENT,
  //   placement: {
  //     url: "www.hogarmania.com"
  //   },
  //   campaign: "customers/2944916627/campaigns/9832190300", 
  //   negative: true
  // })

  // return result
}

main().then(console.log).catch(console.error)


/*
      SELECT
          ad_group.id,
          ad_group.name,
          metrics.clicks,
          segments.device
      FROM
          ad_group
      WHERE
          metrics.impressions > 10
          AND segments.date DURING LAST_30_DAYS
      LIMIT 5
*/