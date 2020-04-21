import import_detail_placement_view from './imports/detail_placement_view'
import yargs from 'yargs'
import { get_all_mcc_customer_clients } from './google-api/mcc';
import { get_all_campaigns } from './google-api/campaign';
import { BiddingStrategyType, CampaignStatus } from 'google-ads-node/build/lib/enums'
const columnify = require('columnify')
require('dotenv').config()

function getEnumKeyByEnumValue(myEnum: any, enumValue: number) {
  let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
  return keys.length > 0 ? keys[0] : null;
}

const args = yargs// eslint-disable-line
  .usage('Usage: $0 <command> [options]')
  .command('clients','Get List of Clients for this MCC', yargs => 
    yargs.option('filter', {
      alias: 'f',
      describe: 'Filter the result',
      type: 'string'
    })
  )
  .command('campaigns', 'List campaigns for the given client account', yargs => 
    yargs.example('$0 campaigns --client-id 2199136284', 'list campaigns for the given client account')
    .option('client-id', {
      alias: 'c',
      describe: 'Client ID (Google Ads Account ID)',
      type: 'string',
      demandOption: true,
    })
  )
  .command('import', 'Import data from given client account', yargs =>
    yargs.example('$0 import placements --client-id 2199136284', 'list campaigns for the given client account')
    .command('placements', 'Import Placements', yargs =>
      yargs.option('client-id', {
        alias: 'c',
        describe: 'Client ID (Google Ads Account ID)',
        type: 'string',
        demandOption: true,
      })
    )
    .demandCommand()
    .strict()
  )
  .demandCommand()
  .strict()
  .example('$0 clients --filter ES', 'List all clients whose name start with ES')
  .example('$0 campaigns --client-id 2199136284', 'List campaigns for the given client account')
  .example('$0 import placements -client-id 2944916627', 'Import placements for all campaigns of the given account')
  .help('h')
  .alias('h', 'help')
  .argv;    

// console.log(args)
const command = args._[0]

switch (command) {
  case 'clients':
    render_clients()
    break;

  case 'import':
    const [, import_what] = args._
    import_data(import_what, parseInt(args["client-id"].replace(/-/, '')))
    break;

  case 'campaigns':
    render_campaigns(parseInt(args["client-id"].replace(/-/,'')))
    break;
  default:
    console.error(`⚠️Unrecognized Command ${command}`)
    break;
}

async function import_data(import_what: string, customer_id: number) {
  switch (import_what) {
    case 'placements':
      return import_placements(customer_id)
  
    default:
      console.error(`⚠️Unrecognized Import ${import_what}`)
      break;
  }
}

async function import_placements(customer_id: number) {

  const total = await import_detail_placement_view(customer_id)
  console.log(`Total imported: ${total}`)

  return total
}

async function render_campaigns(client_id: number) {
  const result = (await get_all_campaigns(client_id))
  
  console.log(columnify(result.map(c => ({
    id: c.id,
    name: c.name,
    active: getEnumKeyByEnumValue(CampaignStatus, c.status as number),
    bidding_strategy_type: getEnumKeyByEnumValue(BiddingStrategyType, c.bidding_strategy_type as number),
    frequency_caps: (c.frequency_caps?.length || 0) === 0 ? 'None' : 'Some',
  }))))
}

async function render_clients() {
  const clients = (await get_all_mcc_customer_clients()).map(c => ({
    id: c.id
  , time_zone: c.time_zone
  , name: c.descriptive_name
  , d: !args.filter ? null : c.descriptive_name?.indexOf(args.filter)
  }))
  .filter(({name}) => 
    (!args.filter || args.filter.length === 0) ? true
    : (name?.indexOf(args.filter) || 0) > -1
  )
  console.log(columnify(clients))
}
