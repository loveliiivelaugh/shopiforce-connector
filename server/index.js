const express = require('express')
const axios = require("axios").default;
const cors = require('cors')
// salesforce specific dependencies
const httpClient = require('request');
const jsforce = require('jsforce');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;
// shopify specific dependencies
const Shopify = require('shopify-api-node');



// Setup HTTP server
const app = express()

app.use(cors());

//initialize session
app.use(session({
  secret: 'S3CRE7',
  resave: true,
  saveUninitialized: true
}));

//bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

// shopify connection
const shopify = new Shopify({
  shopName: 'Michael-io',
  apiKey: 'c86473ef90e0bae0a3820c95f3fe0e3c',
  password: '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'
});

//jsForce connection
const oauth2 = new jsforce.OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl: 'https://mindful-goat-q634g5-dev-ed.my.salesforce.com',
  //clientId and Secret will be provided when you create a new connected app in your SF developer account
  clientId: '3MVG9Kip4IKAZQEV9.8QSad7M3G5czNcF6_bEj0V6nPLbMgSoOvKH4ltPLKB.vae12X4rA4i7wgw.Vza4pzIW', // ? Consumer Key ??
  clientSecret: 'EE78F8E2A495E5729FF692C47D83C3A9CCE7DCFC0E48EA24F56E08535FC8E1CD',
  //redirectUri : 'http://localhost:' + port +'/token'
  redirectUri: 'http://localhost:8080/token'
});

// Serve static assets
/*app.use(express.static(path.join(__dirname, '../build')));*/

/**
 * Login endpoint
 */
app.get("/auth/login", function (req, res) {
  // Redirect to Salesforce login/authorization page
  res.redirect(oauth2.getAuthorizationUrl({
    scope: 'api id web refresh_token'
  }));
});

/**
 * Login callback endpoint (only called by Force.com)
 */
app.get('/token', function (req, res) {

  const conn = new jsforce.Connection({
    oauth2: oauth2
  });
  const code = req.query.code;
  conn.authorize(code, function (err, userInfo) {
    if (err) {
      return console.error("This error is in the auth callback: " + err);
    }

    console.log('Access Token: ' + conn.accessToken);
    console.log('Instance URL: ' + conn.instanceUrl);
    console.log('refreshToken: ' + conn.refreshToken);
    console.log('User ID: ' + userInfo.id);
    console.log('Org ID: ' + userInfo.organizationId);

    req.session.accessToken = conn.accessToken;
    req.session.instanceUrl = conn.instanceUrl;
    req.session.refreshToken = conn.refreshToken;

    var string = encodeURIComponent('true');
    res.redirect('http://localhost:3000/?valid=' + string);
  });
});

// GET shopify orders
app.get('/api/shopify/orders', function(req, res) {

  // if auth has not been set, redirect to index
  if (!req.session.accessToken || !req.session.instanceUrl) {
    res.redirect('/');
  }

  const orders = shopify.order
    .list({ limit: 10 })
    .then((orders) => {
      console.log(orders);
      res.json(orders);
    })
    .catch((err) => console.error(err))

});


app.get('/api/shopify/products', function(req, res) {

  // if auth has not been set, redirect to index
  if (!req.session.accessToken || !req.session.instanceUrl) {
    res.redirect('/');
  }

  // pagination
  (async () => {
    let params = { limit: 10 };
  
    do {
      const products = await shopify.product.list(params);

      console.log(products);
      res.json(products);

      params = products.nextPageParameters;
    } while (params !== undefined);
  })().catch(console.error);
});

//todo need to come back to this -- I am having trouble inserting the new records into Shopify
// create customers from Salesforce to Shopify
app.post('/api/shopify/customers', function(req, res) {
  console.log("Request from client: ")
  console.log(req.body)
  // if auth has not been set, redirect to index
  if (!req.session.accessToken || !req.session.instanceUrl) {
    res.redirect('/');
  }
  const customers = req.body;
  try {
  customers.forEach((customer) => {
    console.log(customer)
        shopify.customer.create(customer.Id, {
          "customer": {
            "first_name": customer.Name,
            "last_name": customer.Id,
            "email": customer.Id + "@" + customer.Name + ".com",
            "phone": "+15557779898",
            "verified_email": true,
            "addresses": [
              {
                "address1": "123 Oak St",
                "city": "Ottawa",
                "province": "ON",
                "phone": "555-1212",
                "zip": "123 ABC",
                "last_name": "Lastnameson",
                "first_name": "TEST",
                "country": "CA"
              }
            ]
          }
        })
      console.log(customer.Name + " created!")  
    }
  )}
  catch (error) {
    console.log(error)
  }
  
    
  //   .catch((error) => {
  //     console.log(error);
  //     res.send(error);
  //   });

  // })
})

app.post('/api/accounts', function(req, res) {
  res.send( req.body )
  console.log( req.body )
})

// ? SALESFORCE
//get a list of accounts.
app.get('/api/accounts', function (req, res) {

  // if auth has not been set, redirect to index
  if (!req.session.accessToken || !req.session.instanceUrl) {
    res.redirect('/');
  }

  //SOQL query
  let q = 'SELECT id, name, Account.owner.name, Phone, Website, BillingCity, BillingCountry, BillingPostalCode, BillingState, BillingStreet FROM account LIMIT 100';

  //instantiate connection
  let conn = new jsforce.Connection({
    oauth2: {
      oauth2
    },
    accessToken: req.session.accessToken,
    instanceUrl: req.session.instanceUrl
  });

  //set records array
  let records = [];
  let query = conn.query(q)
    .on("record", function (record) {
      records.push(record);
    })
    .on("end", function () {
      console.log("total in database : " + query.totalSize);
      console.log("total fetched : " + query.totalFetched);
      console.log(records)
      res.json(records);
    })
    .on("error", function (err) {
      console.error(err);
    })
    .run({
      autoFetch: true,
      maxFetch: 4000
    });
});

// POST to update account info
app.post('/api/accountInfo', function (req, res) {


  // if auth has not been set, redirect to index
  if (!req.session.accessToken || !req.session.instanceUrl) {
    res.redirect('/');
  }

  //instantiate connection
  let conn = new jsforce.Connection({
    oauth2: {
      oauth2
    },
    accessToken: req.session.accessToken,
    instanceUrl: req.session.instanceUrl
  });


  let p = req.body;
  console.log(JSON.stringify(p));
  //assign site URL to variable
  let selectedAccount = p.selectedAccount;
  console.log(selectedAccount);
  //parse request body to create case object for SF
  //set records array
  let recs = [];
  //set placeholder variable
  let x = '';
  //create query to return account Id
  let q = "SELECT Name, Account.owner.name, Phone, Website, BillingCity, BillingCountry, BillingPostalCode, BillingState, BillingStreet FROM Account WHERE Id = '" + selectedAccount + "'";
  console.log(q);

  //set records array
  let records = [];
  let query = conn.query(q)
    .on("record", function (record) {
      records.push(record);
    })
    .on("end", function () {
      console.log("total in database : " + query.totalSize);
      console.log("total fetched : " + query.totalFetched);
      res.json(records);
    })
    .on("error", function (err) {
      console.error(err);
    })
    .run({
      autoFetch: true,
      maxFetch: 4000
    });
});

// GET list of contact
app.get("/api/contacts", function(req, res) {

    // if auth has not been set, redirect to index
    if (!req.session.accessToken || !req.session.instanceUrl) {
      res.redirect('/');
    }
  
    //SOQL query
    let q = 'SELECT id, name FROM contact LIMIT 100';
  
    //instantiate connection
    let conn = new jsforce.Connection({
      oauth2: {
        oauth2
      },
      accessToken: req.session.accessToken,
      instanceUrl: req.session.instanceUrl
    });

    //set records array
  let records = [];
  let query = conn.query(q)
    .on("record", function (record) {
      records.push(record);
    })
    .on("end", function () {
      console.log("total in database : " + query.totalSize);
      console.log("total fetched : " + query.totalFetched);
      console.log(records)
      res.json(records);
    })
    .on("error", function (err) {
      console.error(err);
    })
    .run({
      autoFetch: true,
      maxFetch: 4000
    });

})

// POST to create products
app.post('/api/products', function (req, res) {


  // if auth has not been set, redirect to index
  if (!req.session.accessToken || !req.session.instanceUrl) {
    res.redirect('/');
  }

  //instantiate connection
  let conn = new jsforce.Connection({
    oauth2: {
      oauth2
    },
    accessToken: req.session.accessToken,
    instanceUrl: req.session.instanceUrl
  });

  let p = req.body;
  console.log(p)
  //set records array
  let records = [];
  p.forEach(record => {
    records.push(record)
    console.log(record)
    console.log(" added to records array.")
  })

  try {
    conn.create("Product2", records)
    console.log("Congratulations, products inserted into Salesforce.")
  } catch (error) {
    console.log(error)
  }

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});