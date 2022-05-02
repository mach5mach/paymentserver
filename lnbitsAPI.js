const { exec } = require('child_process');
    
const socks5_host = "127.0.0.1";
const socks5_port = "9050";

exports.tor_domain = "";
exports.invoice_key = "";
exports.admin_key = "";

const _getWalletAsync = () => {
	return new Promise((resolve, reject) => {
		if(!_isValidTorDomain())
		{
			reject("Tor domain not valid");
		}
		if(!_isValidInvoiceKey())
		{
			reject("Invoice key not valid");
		}
		if(!_isValidAdminKey())
		{
			reject("Admin key not valid");
		}

		const request = "GET";
		const endpoint = "/api/v1/wallet";
	
		exec(`curl -X ${request} --socks5-hostname "${socks5_host}:${socks5_port}" http://${exports.tor_domain}${endpoint} -H "X-Api-Key: ${exports.invoice_key}"`,
	 		(error, stdout) => {
				error ? reject(error) : resolve(stdout);
		});
	});
}

exports.getWallet = async () => {
	return await _getWalletAsync();
}

const _createInvoiceAsync = function(amount, memo = "", url = "http://127.0.0.1")
{
	return new Promise((resolve, reject) => {
		if(!_isValidTorDomain())
		{
			reject("Tor domain not valid");
		}
		if(!_isValidInvoiceKey())
		{
			reject("Invoice key not valid");
		}
		if(!_isValidAdminKey())
		{
			reject("Admin key not valid");
		}
		if(!_isValidAmount(amount))
		{
			reject("Amount not valid");
		}
		if(!_isValidMemo(memo))
		{
			reject("Memo not valid");
		}
		if(!_isValidURL(url))
		{
			reject("URL not valid");
		}

		const request = "POST";
		const endpoint = "/api/v1/payments";
		const jsonparams = `{"out": false, "amount": ${amount}, "memo": "${memo}", "webhook": "${url}"}`;
		
		exec(`curl -X ${request} --socks5-hostname "${socks5_host}:${socks5_port}" http://${exports.tor_domain}${endpoint} -d '${jsonparams}' -H "X-Api-Key: ${exports.invoice_key}" -H "Content-type: application/json"`, 
			(error, stdout) => { 
				error ? reject(error) : resolve(stdout);
		});
	});
}

exports.createInvoice = async (amount, memo = "", url = "http://127.0.0.1") => {
	return await _createInvoiceAsync(amount, memo, url);
}

const _payInvoice = function(bolt11)
{
	return new Promise((resolve, reject) => {
		if(!_isValidTorDomain())
		{
			reject("Tor domain not valid");
		}
		if(!_isValidInvoiceKey())
		{
			reject("Invoice key not valid");
		}
		if(!_isValidAdminKey())
		{
			reject("Admin key not valid");
		}
		if(!_isValidBolt11(bolt11))
		{
			reject("Bolt11 not valid");
		}

		const request = "POST";	
		const endpoint = "/api/v1/payments";
		const jsonparams = `{"out": true, "bolt11": "${bolt11}"}`;	
		
		exec(`curl -X ${request} --socks5-hostname "${socks5_host}:${socks5_port}" http://${exports.tor_domain}${endpoint} -d '${jsonparams}' -H "X-Api-Key: ${exports.admin_key}" -H "Content-type: application/json"`, 
			(error, stdout) => { 
				error ? reject(error) : resolve(stdout);
		});
	});
}

exports.payInvoice = async (bolt11) => {
	return await _payInvoice(bolt11);
}

const _decodeInvoice = function(invoice)
{
	return new Promise((resolve, reject) => {
		if(!_isValidTorDomain())
		{
			reject("Tor domain not valid");
		}
		if(!_isValidInvoiceKey())
		{
			reject("Invoice key not valid");
		}
		if(!_isValidAdminKey())
		{
			reject("Admin key not valid");
		}
		if(!_isValidBolt11(invoice))
		{
			reject("Invoice not valid");
		}

		const request = "POST";	
		const endpoint = "/api/v1/payments/decode";
		const jsonparams = `{"data": "${invoice}"}`;		
		
		
		exec(`curl -X ${request} --socks5-hostname "${socks5_host}:${socks5_port}" http://${exports.tor_domain}${endpoint} -d '${jsonparams}' -H "X-Api-Key: ${exports.invoice_key}" -H "Content-type: application/json"`, 
			(error, stdout) => { 
				error ? reject(error) : resolve(stdout);
		});
	});
}

exports.decodeInvoice = async (invoice) => {
	return await _decodeInvoice(invoice);
}

const _checkInvoice = function(payment_hash)
{
	return new Promise((resolve, reject) => {
		if(!_isValidTorDomain())
		{
			reject("Tor domain not valid");
		}
		if(!_isValidInvoiceKey())
		{
			reject("Invoice key not valid");
		}
		if(!_isValidAdminKey())
		{
			reject("Admin key not valid");
		}
		if(!_isValidPaymentHash(payment_hash))
		{
			reject("Payment hash not valid");
		}

		const request = "GET";	
		const endpoint = `/api/v1/payments/${encodeURIComponent(payment_hash)}`;

		exec(`curl -X ${request} --socks5-hostname "${socks5_host}:${socks5_port}" http://${exports.tor_domain}${endpoint} -H "X-Api-Key: ${exports.invoice_key}" -H "Content-type: application/json"`, 
			(error, stdout) => { 
				error ? reject(error) : resolve(stdout);
		});
	});
}

exports.checkInvoice = async (payment_hash) => {
	return await _checkInvoice(payment_hash);
}

function _isValidTorDomain() {
	if(typeof exports.tor_domain === 'string') {
		if(exports.tor_domain.lastIndexOf('onion') > -1)
		{
			return true;
		}
	}
	return false;
}

function _isValidInvoiceKey() {
	if(typeof exports.invoice_key === 'string') {
		if(exports.invoice_key.length == 32)
		{
			return true;
		}
	}
	return false;
}

function _isValidAdminKey() {
	if(typeof exports.invoice_key === 'string') {
		if(exports.invoice_key.length == 32)
		{
			return true;
		}
	}
	return false;
}

function _isValidAmount(amount) {
	if(typeof amount === 'number') {
		if(amount > 0)
		{
			return true;
		}
	}
	return false;
}

function _isValidMemo(memo) {
	if(typeof memo === 'string') {
		return true;
	}
	return false;
}

function _isValidURL(url) {
	if(typeof url === 'string') {
		var urltest;
		try {
			urltest = new URL(url);
			return urltest.protocol === "http:" || urltest.protocol === "https:";
		}
		catch(err)
		{
			return false;
		}
	}
	return false;
}

function _isValidBolt11(bolt11) {
	if(typeof bolt11 === 'string') {
		if(bolt11.startsWith("lnbc")) {
			if(bolt11.length >= 190 && bolt11.length < 1000)
			{	//1000 is an arbitrary upper limit to prevent malicious attacks but allow some buffer
				return true;
			}
		}
	}
	return false;
}

function _isValidPaymentHash(payment_hash) {
	if(typeof payment_hash === 'string') {
		if(payment_hash.length == 64)
		{	
			return true;
		}
	}
	return false;
}

