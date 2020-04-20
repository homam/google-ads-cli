CREATE TABLE google_ads_detail_placement_view (
  id BIGSERIAL PRIMARY KEY,
  customer_id bigint,
  campaign_id bigint,
  ad_group_id bigint,
  detail_placement_view_resource_name text NOT NULL,
  segments_date timestamp with time zone NOT NULL,
  detail_placement_view_display_name text,
  detail_placement_view_placement text,
  detail_placement_view_placement_type integer,
  detail_placement_view_target_url text,
  metrics_clicks bigint,
  metrics_conversions bigint,
  metrics_cost_micros bigint,
  metrics_impressions bigint
);
-- Already added by CREATE TABLE
-- CREATE UNIQUE INDEX google_ads_detail_placement_view_pkey ON google_ads_detail_placement_view(id int8_ops);
CREATE UNIQUE INDEX google_ads_detail_placement_view_campaign_id_ad_group_id_detail ON google_ads_detail_placement_view(
  customer_id int8_ops,
  campaign_id int8_ops,
  ad_group_id int8_ops,
  detail_placement_view_resource_name text_ops,
  segments_date timestamptz_ops DESC
);
CREATE INDEX google_ads_detail_placement_view_segments_date_idx ON google_ads_detail_placement_view(segments_date timestamptz_ops DESC);
CREATE INDEX google_ads_detail_placement_view_customer_id_idx ON google_ads_detail_placement_view(customer_id int8_ops DESC);
CREATE INDEX google_ads_detail_placement_view_campaign_id_idx ON google_ads_detail_placement_view(campaign_id int8_ops DESC);
CREATE INDEX google_ads_detail_placement_view_ad_group_id_idx ON google_ads_detail_placement_view(ad_group_id int8_ops DESC);
CREATE INDEX google_ads_detail_placement_view_detail_placement_view_resource ON google_ads_detail_placement_view(detail_placement_view_resource_name text_ops);
CREATE INDEX google_ads_detail_placement_view_detail_placement_view_display_ ON google_ads_detail_placement_view(detail_placement_view_display_name text_ops);
CREATE INDEX google_ads_detail_placement_view_detail_placement_view_placemen ON google_ads_detail_placement_view(detail_placement_view_placement text_ops);
CREATE INDEX google_ads_detail_placement_view_detail_placement_view_target_u ON google_ads_detail_placement_view(detail_placement_view_target_url text_ops);