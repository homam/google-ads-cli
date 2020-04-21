import { Campaign } from 'google-ads-node/build/lib/resources';
import { mkCustomer } from './mcc';

export async function get_all_campaigns(customer_account_id: number | string): Promise<Campaign[]> {
  return mkCustomer(customer_account_id).campaigns.list()
    .then(xs => xs.map(x => x.campaign))
}