import { mkCustomer } from "./mcc"

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