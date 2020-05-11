import { mkCustomer } from './mcc';
import { RedshiftConversion } from '../redshift/types';
const R = require("ramda")

export async function get_conversion_actions(customer_account_id: number | string) {
  return mkCustomer(customer_account_id).conversionActions.list()
}

export async function upload_conversions(customer_account_id: number | string, conversions: RedshiftConversion[]): 
  Promise<([{ index: number, uploaded: boolean, error?: string }, RedshiftConversion])[]> {
  const result = await mkCustomer(customer_account_id).conversionUploads.uploadClickConversions(conversions.map(c =>(
    {
      gclid: c.gclid,
      currency_code: c.conversion_currency,
      conversion_date_time: c.conversion_time,
      conversion_action: c.conversion_name,
    }))
  , {
    partial_failure: true
  }) as { partial_failure_error: any[], results_list: any[] }[]

  
  const { partial_failure_error, results_list } = result[0]

  const errors = !partial_failure_error ? [] : (partial_failure_error as any).errors.map((e: any) => ([
    e.location.field_path_elements.find(
      (e: {index?: number}) => typeof e.index != "undefined"
    ).index
    , e.message
  ]))

  const errorsMap = new Map(errors)
  const uploads = results_list.map(
    (x: any, i: number) => ({ index: i, ...(typeof x.gclid != "undefined" ? { uploaded: true } : { uploaded: false, error: errorsMap.get(i) as string }) })
  )
  return R.zip(uploads, conversions)
}

export async function test_upload_conversions(customer_account_id: number | string) {
  return mkCustomer(customer_account_id).conversionUploads.uploadClickConversions([
    {
      "gclid": "XXXaIQobChMIq6v-g_Wj6QIVwRgbCh0ZRwSYEAEYASAAEgIJc_D_BwE",
      "conversion_action": "customers/2944916627/conversionActions/429118975",
      "conversion_date_time": "2020-05-08 09:06:50+00:00",
      "currency_code": "EUR"
    },
    {
      "gclid": "EAIaIQobChMIq6v-g_Wj6QIVwRgbCh0ZRwSYEAEYASAAEgIJc_D_BwE",
      "conversion_action": "customers/2944916627/conversionActions/429118975",
      "conversion_date_time": "2020-05-08 09:06:50+00:00",
      "currency_code": "EUR"
    },
    {
      "gclid": "EAIaIQobChMIq6v-g_Wj6QIVwRgbCh0ZRwSYEAEYASAAEgIJc_D_BwE",
      "conversion_action": "customers/2944916627/conversionActions/429118975",
      "conversion_date_time": "2020-05-08 09:06:50+00",
      "currency_code": "EUR"
    }
  ], {partial_failure: true})
}