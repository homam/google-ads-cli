import import_detail_placement_view from './imports/detail_placement_view'
import yargs from 'yargs'
import { get_all_mcc_customer_clients } from './google-api/mcc';
import { get_all_campaigns } from './google-api/campaign';
import { BiddingStrategyType, CampaignStatus } from 'google-ads-node/build/lib/enums'
import { get_latest_redshift_conversions } from './redshift/db';
import { upload_conversions, get_conversion_actions, test_upload_conversions } from './google-api/upload_conversions';
import fs from 'fs'
import { insert_redshift_conversions, get_redshift_conversion_to_upload, update_redshift_conversions_upload_status } from './db';
import { RedshiftConversion } from './redshift/types';
const columnify = require('columnify')
const R = require("ramda")
require('dotenv').config()

function getEnumKeyByEnumValue(myEnum: any, enumValue: number) {
  let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
  return keys.length > 0 ? keys[0] : null;
}

const args = yargs// eslint-disable-line
  .usage('Usage: $0 <command> [options]')
  .command('clients', 'Get List of Clients for this MCC', yargs =>
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
  .command('upload', 'Upload conversions', yargs =>
    yargs.example('$0 upload conversions --client-id 2199136284', 'upload all the conversions for the given client account')
      .command('conversions', 'Upload Conversions', yargs =>
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
  .command('redshift', 'Import data from redshift', yargs =>
    yargs.example('$0 redshift import conversions', 'import conversions data from redshift')
      .command('import', 'Import conversions data from redshift', yargs =>
        yargs.command('conversions', 'Import conversions data from redshift').demandCommand()
      ).demandCommand()
      .strict()
  )
  .demandCommand()
  .strict()
  .example('$0 clients --filter ES', 'List all clients whose name start with ES')
  .example('$0 campaigns --client-id 2199136284', 'List campaigns for the given client account')
  .example('$0 import placements -client-id 2944916627', 'Import placements for all campaigns of the given account')
  .example('$0 upload conversions -client-id 2944916627', 'Upload conversions for all campaigns of the given account')
  .help('h')
  .alias('h', 'help')
  .argv;

const commands = args._
async function main() {
  try {
    switch (commands[0]) {
      case 'clients':
        render_clients()
        break;

      case 'import':
        const [, import_what] = args._
        import_data(import_what, parseInt(args["client-id"].replace(/-/, '')))
        break;

      case 'campaigns':
        render_campaigns(parseInt(args["client-id"].replace(/-/, '')))
        break;

      case 'upload':
        return upload(parseInt(args["client-id"].replace(/-/, '')))
        break;

      case 'redshift':
        if (commands[1] === 'import' && commands[2] === 'conversions') {
          return import_redshift_conversions();
        }
        break;


      default:
        console.error(`⚠️Unrecognized Command ${commands[0]}`)
        break;
    }
  } catch (ex) {
    console.error(ex)
  }

}

main().then(console.log).catch(console.error)

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
    .filter(({ name }) =>
      (!args.filter || args.filter.length === 0) ? true
        : (name?.indexOf(args.filter) || 0) > -1
    )
  console.log(columnify(clients))
}


async function import_redshift_conversions() {
  const conversions = (await get_latest_redshift_conversions(3))
  await insert_redshift_conversions(conversions)
  console.log(columnify([{
    imported: conversions.length
  }]))
}

async function upload(client_id: number) {

  const conversion_actions = await get_conversion_actions(client_id)
  const conversion_actions_map = new Map(conversion_actions.map(c => [c.conversion_action.name, c.conversion_action.resource_name]))

  const campaigns = await get_all_campaigns(client_id);
  console.log(`${campaigns.length} campaigns fetched`)
  const conversions = (await get_redshift_conversion_to_upload(campaigns.map(c => c.id?.toString() || '')))
    .map(x => ({
      ...x,
      conversion_name: conversion_actions_map.get(x.conversion_name)
    }))

  console.log(`${conversions.length} conversions fetched`)

  const conversions_to_upload = conversions.filter(c => !!c.conversion_name) as (RedshiftConversion & { conversion_name: string })[]

  console.log(`${conversions_to_upload.length} conversions to upload`)

  if (conversions_to_upload.length === 0) {
    console.log('Cannot find the conversion action associated with imported conversions (Sigma)')
    console.log(columnify([
      {
        total_uploaded: 0,
        errors: 0
      }
    ]))
  } else {

    const upload_result = await upload_conversions(client_id, conversions_to_upload)

    await update_redshift_conversions_upload_status(upload_result)

    console.log(columnify([
      {
        total_uploaded: upload_result.filter(x => x[0].uploaded).length,
        errors: upload_result.filter(x => !x[0].uploaded).length
      }
    ]))
  }

}