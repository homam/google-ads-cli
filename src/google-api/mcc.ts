import { GoogleAdsApi } from 'google-ads-api'
import { CustomerClient } from 'google-ads-node/build/lib/resources';

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

export async function get_all_mcc_customer_clients(): Promise<CustomerClient[]> {
  return mkMCCCustomer().customerClients.list()
    .then(xs => xs.map(x => x.customer_client))
}
