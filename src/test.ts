import { mkCustomer } from "./google-api/mcc"


async function main() {
  const result = await mkCustomer('2944916627')
  // .remarketingActions.create({
  //   tag_snippets: [{
  //     type: "WEBPAGE",
  //     event_snippet: '',
  //      global_site_tag: '',
  //     page_format: 'HTML'
  //   }]
  // })
  //  .conversionUploads.uploadClickConversions([
  //   {

  //   }
  // ])
  // .userLists.get(1006852349)
  console.log(result)
}

main().then(console.log).catch(console.error)