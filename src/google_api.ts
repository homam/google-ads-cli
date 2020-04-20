import { GoogleAdsApi } from 'google-ads-api'
import { CustomerClient, Campaign } from 'google-ads-node/build/lib/resources';

require('dotenv').config()

const client = new GoogleAdsApi({
  client_id: process.env.client_id as string,
  client_secret: process.env.client_secret as string,
  developer_token: process.env.developer_token as string,
})

function mkMCCCustomer() {
  return client.Customer({
    customer_account_id: process.env.login_customer_id as string,
    refresh_token: process.env.refresh_token as string
  })
}

export function mkCustomer(customer_account_id: string | number) {
  return client.Customer({
    login_customer_id: process.env.login_customer_id as string,
    refresh_token: process.env.refresh_token,
    customer_account_id: customer_account_id.toString(),
  })
}

export type GoogleAdsDetailPlacement = {
  campaign: {
    resource_name: string;
    id: number
  }
  ad_group: {
    resource_name: string;
    id: number
  }
  detail_placement_view: {
    resource_name: string;
    display_name: string;
    placement: string;
    placement_type: number;
    target_url: string;
  }
  metrics: {
    clicks: number;
    conversions: number;
    cost_micros: number;
    impressions: number;
  },
  segments: {
    date: string;
  }
}

export async function get_detail_placement_view(customer_account_id: number | string
  , {from_date, to_date} : {from_date: string; to_date: string;}) : Promise<GoogleAdsDetailPlacement[]> {
  return mkCustomer(customer_account_id).report({
    entity: 'detail_placement_view',
    attributes: ['detail_placement_view.placement', 'detail_placement_view.placement_type', 'detail_placement_view.resource_name', 'detail_placement_view.display_name', 'detail_placement_view.target_url', 'campaign.id', 'ad_group.id'],
    metrics: ['metrics.clicks', 'metrics.cost_micros', 'metrics.conversions', 'metrics.impressions'],
    segments: ['segments.date'],
    // constraints: { 'ad_group.status': enums.AdGroupStatus.ENABLED },
    from_date: from_date,
    to_date: to_date,
    order_by: 'metrics.clicks',
    sort_order: 'desc',
    limit: 100000,
  })
}

export async function get_all_mcc_customer_clients(): Promise<CustomerClient[]> {
  return mkMCCCustomer().customerClients.list()
    .then(xs => xs.map(x => x.customer_client))
}

export async function get_all_campaigns(customer_account_id: number | string) : Promise<Campaign[]> {
  return mkCustomer(customer_account_id).campaigns.list()
    .then(xs => xs.map(x => x.campaign))
}