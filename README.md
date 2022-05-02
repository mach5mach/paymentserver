# paymentserver
A payment server that connects to a custodial Lightning node

# Prerequisites
A LN that uses LNBits to generates tor API keys

# Setup
The paymentserver needs access to the LNBits API information.  Clone this git repo locally.

# 1. .env file
Create a .env file in the root of the directory.  The following mandatory keys need to be present to run.  Add this to your .env file.

```
  HIDDEN_DIR=/var/lib/tor/hidden_service/  
```
  
The following keys need to be present if storing LNBits API in this file.

```
  LNBITS_TOR_DOMAIN=[tordomain.onion]  
  LNBITS_INVOICE_KEY=[invoice key]  
  LNBITS_ADMIN_KEY=[admin key]
```

# 2. paymentserver.json file
When running the paymentserver as part of a docker-compose network, you can supply the LNBits API info by using secrets.  In the event that both secrets and .env files are used, the secrets will override the .env file.  Modify the paymentserver.json to look like the following:

```json
{  
	"lnbits_tor_domain": "[tordomain.onion]",  
	"lnbits_invoice_key": "[invoice key]",  
	"lnbits_admin_key": "[admin key]"
}
```
  
# Usage
Run as either a standalone docker image or as part of a docker-compose network
