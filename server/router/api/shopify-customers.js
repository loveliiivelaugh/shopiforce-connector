
//todo need to come back to this -- I am having trouble inserting the new records into Shopify
// POST create customers from Salesforce to Shopify
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

