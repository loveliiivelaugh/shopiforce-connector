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

app.post()

app.put()

app.patch()

app.delete()