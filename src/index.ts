import fs from 'fs'
import sync_detail_placement_view from './imports/detail_placement_view'
require('dotenv').config()

async function main() {
  const customer_id = 2199136284 // 2944916627;

  const total = await sync_detail_placement_view(customer_id)
  console.log(`Total Synced: ${total}`)

  return total
}

main().then(console.log).catch(console.error)
