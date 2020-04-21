import * as pgp from 'pg-promise'
import { clean_merge } from './clean_merge'
import { GoogleAdsDetailPlacement } from './google-api/detail_placement_view'
const db = pgp.default()(process.env.sigma_connection_string as string)

export type DBGoogleAdsDetailPlacement = {
  segments_date: Date
}

function cleanString(str: string) {
  if(str === null || typeof str === 'undefined') {
    return null
  }
  return str.replace(/\'/g, "''")
}

export function insert_google_ads_detail_placement_view(customer_id: number, input: GoogleAdsDetailPlacement[]) {
  const cleaned_up_input = clean_merge(input) as GoogleAdsDetailPlacement[]
  return db.none(`
    INSERT INTO google_ads_detail_placement_view (
        customer_id
      , campaign_id
      , ad_group_id
      , detail_placement_view_resource_name
      , segments_date
      , detail_placement_view_display_name
      , detail_placement_view_placement
      , detail_placement_view_placement_type
      , detail_placement_view_target_url
      , metrics_clicks
      , metrics_conversions
      , metrics_cost_micros
      , metrics_impressions
    ) VALUES 
    ${cleaned_up_input.map(i => `(
        ${customer_id}
      , ${i.campaign.id}
      , ${i.ad_group.id}
      , '${cleanString(i.detail_placement_view.resource_name)}'
      , '${cleanString(i.segments.date)}T00:00:00+02:00'
      , '${cleanString(i.detail_placement_view.display_name)}'
      , '${cleanString(i.detail_placement_view.placement)}'
      , ${i.detail_placement_view.placement_type}
      , '${cleanString(i.detail_placement_view.target_url)}'
      , ${i.metrics.clicks}
      , ${i.metrics.conversions}
      , ${i.metrics.cost_micros}
      , ${i.metrics.impressions}
    )`).join(',')} ON CONFLICT (customer_id, campaign_id, ad_group_id, detail_placement_view_resource_name, segments_date) DO
      UPDATE
        SET 
            metrics_clicks = EXCLUDED.metrics_clicks
          , metrics_conversions = EXCLUDED.metrics_conversions
          , metrics_cost_micros = EXCLUDED.metrics_cost_micros
          , metrics_impressions = EXCLUDED.metrics_impressions;
    ;
  `)
}

export function get_last_conversion(customer_id: number) : Promise<DBGoogleAdsDetailPlacement | null>{
  return db.oneOrNone(`
    SELECT * FROM google_ads_detail_placement_view WHERE customer_id = $1 ORDER BY segments_date DESC LIMIT 1;
  `, [customer_id])
}