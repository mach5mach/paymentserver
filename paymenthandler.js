const lnbitsAPI = require('./lnbitsAPI');

class PaymentHandler{
    constructor(tor_domain, invoice_key, admin_key, webhookurl)
    {
        lnbitsAPI.tor_domain = tor_domain;
        lnbitsAPI.invoice_key = invoice_key;
        lnbitsAPI.admin_key = admin_key;
        this.webhookurl = webhookurl;
    }

    registerPaymentHandlers(io, socket) {

    const getWallet = (callback) => {
        lnbitsAPI.getWallet()
        .then((data) =>
        {
            console.log(data);
            callback("", data);
        })
        .catch((reason) =>
        {
            console.log(reason);
            callback(reason, "");
        });
    }
  
    const createInvoice = (amount, memo = "", callback) => {
        lnbitsAPI.createInvoice(amount, memo, this.webhookurl)
            .then((data) =>
            {
                console.log(data);
                callback("", data);
            })
            .catch((reason) =>
            {
                console.log(reason);
                callback(reason, "");
            });
      }

    const payInvoice = (bolt11, callback) => {
        lnbitsAPI.payInvoice(bolt11)
            .then((data) =>
            {
                console.log(data);
                callback("", data);
            })
            .catch((reason) =>
            {
                console.log(reason);
                callback(reason, "");
            });
      }

    const decodeInvoice = (invoice, callback) => {
        lnbitsAPI.decodeInvoice(invoice)
          .then((data) =>
          {
              console.log(data);
              callback("", data);
          })
          .catch((reason) =>
          {
              console.log(reason);
              callback(reason, "");
          });
    }

    const checkInvoice = (payment_hash, callback) => {
        lnbitsAPI.checkInvoice(payment_hash)
            .then((data) =>
            {
                console.log(data);
                callback("", data);
            })
            .catch((reason) =>
            {
                console.log(reason);
                callback(reason, "");
            });
      }
  
    socket.on('payment:getWallet', getWallet);
    socket.on('payment:createInvoice', createInvoice);
    socket.on('payment:payInvoice', payInvoice);
    socket.on('payment:decodeInvoice', decodeInvoice);
    socket.on('payment:checkInvoice', checkInvoice);
  }
}

module.exports = PaymentHandler;