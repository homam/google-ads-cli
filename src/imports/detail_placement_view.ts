import { get_last_imported_conversion_from_gads, insert_google_ads_detail_placement_view } from "../db";
import { get_detail_placement_view } from "../google-api/detail_placement_view";

function dateToGoogleTimezone(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toJSON().split('T')[0];
}

export default async function import_detail_placement_view(customer_id: number) {

  async function go(count: number): Promise<number> {


    const default_from_date = dateToGoogleTimezone(new Date(new Date().valueOf() - 1000 * 3600 * 24 * 7))
    const latest = await get_last_imported_conversion_from_gads(customer_id)
    const from_date = !!latest ? dateToGoogleTimezone(latest.segments_date) : default_from_date
    const to_date = dateToGoogleTimezone(new Date(new Date(from_date).valueOf() + 1000 * 3600 * 24 * 3));

    console.log(`Fetching importing ${from_date} ... ${to_date}`)

    if (new Date(from_date) > new Date()) {
      return count;
    }

    console.debug(`Total Imported: ${count}.`)

    const response = await get_detail_placement_view(customer_id, {
      from_date,
      to_date
    })
    console.debug(`Fetched ${response.length}, importing...`)
    await insert_google_ads_detail_placement_view(customer_id, response)

    return go(count + response.length)
  }

  return go(0)

}