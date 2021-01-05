
// GET shopify products
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
