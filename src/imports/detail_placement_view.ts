import { get_last_conversion, insert_google_ads_detail_placement_view } from "../db";
import { get_detail_placement_view } from "../google_api";

function dateToGoogleTimezone(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toJSON().split('T')[0];
}

export default async function sync_detail_placement_view(customer_id: number) {

  async function go(count: number): Promise<number> {

    const default_from_date = dateToGoogleTimezone(new Date(new Date().valueOf() - 1000 * 3600 * 24 * 7))
    const latest = await get_last_conversion(customer_id)
    const from_date = !!latest ? dateToGoogleTimezone(latest.segments_date) : default_from_date
    const to_date = dateToGoogleTimezone(new Date(new Date(from_date).valueOf() + 1000 * 3600 * 24 * 3));

    if (new Date(to_date) > new Date()) {
      return count;
    }

    console.debug(`Total Synced: ${count}. Now syncing ${from_date} ... ${to_date}`)

    const response = await get_detail_placement_view(customer_id, {
      from_date,
      to_date
    })
    await insert_google_ads_detail_placement_view(customer_id, response)

    return go(count + response.length)
  }

  return go(0)

}