import * as pgp from 'pg-promise'
import { RedshiftConversion } from './types'
const db = pgp.default()(process.env.redshift_connection_string as string)

export function get_latest_redshift_conversions(since_days_before: number) : Promise<RedshiftConversion[]>{
  return db.many(
    `SELECT
    rockman_id,
    us.country_code,
    bc,
    gclid,
    'Sigma' AS "conversion_name",
    us.sale_timestamp :: timestamp at time zone 0 as sale_timestamp,
    to_char(us.sale_timestamp, 'YYYY-MM-DD HH24:MI:SS') || '+00:00' as conversion_time,
    'EUR' "conversion_currency"
    FROM (
            SELECT
                  DISTINCT rockman_id
                , JSON_EXTRACT_PATH_TEXT(query_string, 'bc') bc
                , JSON_EXTRACT_PATH_TEXT(query_string, 'gclid') gclid
                , country_code
            FROM pacman
            WHERE JSON_EXTRACT_PATH_TEXT(query_string, 'gclid') <> '' AND "timestamp" >= current_date - '7 days'::INTERVAL
              AND rockman_id in (
                SELECT user_subscriptions.rockman_id
                FROM user_subscriptions
                WHERE
                    "sale_timestamp" >= current_date - ($1 || ' days')::INTERVAL
            ) AND IS_VALID_JSON(query_string)
        ) as p
        LEFT JOIN user_subscriptions us USING (rockman_id)
        
    order by us.country_code, p.bc, us.sale_timestamp
    `
  , [since_days_before.toString()])
}