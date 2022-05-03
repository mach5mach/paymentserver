const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require("body-parser");
const helmet = require('helmet');
const socketio = require("socket.io");
const fs = require('fs');
require('dotenv').config();

const hostname = '0.0.0.0';
const port = 6000;

//set lnbitsAPI sensitive information
lnbitsAPI_tor_domain = process.env.LNBITS_TOR_DOMAIN ?? "";;
lnbitsAPI_invoice_key = process.env.LNBITS_INVOICE_KEY ?? "";
lnbitsAPI_admin_key = process.env.LNBITS_ADMIN_KEY ?? "";

var filename = process.env.SECRETS ? process.env.SECRETS : "";
if(filename)
{
	const data = fs.readFileSync(filename);
	if (!data) {
		console.log("Could not get lnbits info from secrets");
	}
	else
	{
		const obj = JSON.parse(data.toString().trim());
		lnbitsAPI_tor_domain = obj.lnbits_tor_domain ?? lnbitsAPI_tor_domain;
		lnbitsAPI_invoice_key = obj.lnbits_invoice_key ?? lnbitsAPI_invoice_key;
		lnbitsAPI_admin_key = obj.lnbits_admin_key ?? lnbitsAPI_admin_key;
	}
}		

var tor_domain = '';
var tor_port = port;
var hidden_dir = process.env.HIDDEN_DIR ?? "";
filename = path.join(hidden_dir, 'hostname');
if(filename)
{
  const data = fs.readFileSync(filename)
	if (!data) {
		console.log("Could not get local tor address.");
	}
	else {
		tor_domain = data.toString().trim();	
	}
}
else
{
	console.log("Could not get local tor address.")
}

const app = express();
const server = http.createServer(app);

app.use(
	helmet({
		permittedCrossDomainPolicies: false,
	})
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));

app.use('/static', express.static('node_modules'));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');//`http://${hostname}:${port}/`);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
	next();
});

//pre-flight requests
app.options('*', function(req, res) {
	res.send(200);
});

var invoicewebhook = "invoicewebhook";
app.post(`/${invoicewebhook}`, (req, res) => {
  console.log(req.body) // Call your action on the request here
  //create an API call to a client
  //may need to change this depending on what data is actually reported back
  io.sockets.emit(`${invoicewebhook}`, req.body);
  res.status(200).end() // Responding is important
})

const io = socketio(server, {
	cors: {
	    origin: true, //[`http://${hostname}:${port}/`, `http://${tor_domain}:${tor_port}`],
	    methods: ["GET", "POST"]
	  }
});

var count = 0;

const PaymentHandler = require('./paymenthandler');
const url = `http://${tor_domain}:${tor_port}/${invoicewebhook}`;

const paymentHandler = new PaymentHandler(
	lnbitsAPI_tor_domain,
	lnbitsAPI_invoice_key,
	lnbitsAPI_admin_key,
	url
	);

io.sockets.on('connection', function(socket) {
  count++;
  io.sockets.emit('message', { count: count });

  socket.on('disconnect', function(){
      count--;
      io.sockets.emit('message', { count: count });
  });

  paymentHandler.registerPaymentHandlers(io, socket);
});

server.listen(port, hostname, (err) => {
	if (err) {
		throw err;
	}
	console.log(`Payment server running at http://${hostname}:${port}/`);
});


process.on('SIGTERM', function () {
  server.close(function () {
    console.log("Payment server shutting down");
  });
});

module.exports = server;
