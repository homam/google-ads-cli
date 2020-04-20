
## .env file:
```
# Get these values from Google Cloud
client_id=
client_secret=

# Check https://opteo.com/dev/google-ads-api/#authentication
refresh_token=

# The MCC account
login_customer_id=

# Get developer_token from the manager account
developer_token=

# The client account
customer_account_id=

# Needs write access to sigma db
sigma_connection_string=
```


----

Example adding and removing a negative placement

```typescript
var response = await customer.campaignCriteria.list();

const added = await customer.campaignCriteria.create({
  status: enums.CampaignCriterionStatus.ENABLED,
  type: enums.CriterionType.PLACEMENT,
  placement: {
    url: "www.hogarmania.com"
  },
  campaign: "customers/2944916627/campaigns/9832190300", 
  negative: true
})

const del = await customer.campaignCriteria.delete('customers/2944916627/campaignCriteria/9832190300~1568598385')
```