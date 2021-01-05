
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
