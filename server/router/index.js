const express = require('express')
const router = express.Router();


router.get('/', (req, res) => (
  res.send(
    'Congratulations this server is running at port 8080.\nThis is our Shopify and Salesforce connector app.'
    )
));
// Define Routes
// shopify
router.use('/api/shopify/orders', require('./api/shopify-orders'));
router.use('/api/shopify/products', require('./api/shopify-products'));
router.use('/api/shopify/customers', require('./api/shopify-customers'));
// salesforce
router.use('/api/accounts', require('./api/salesforce-accounts'));
router.use('/api/contacts', require('./api/salesforce-contacts'));
router.use('/api/products', require('./api/salesforce-products'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

module.exports = router;