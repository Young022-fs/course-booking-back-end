let express = require("express");
let app = express();
const mongodbAccess = require('./mongodbAccess'); 
const { ObjectId } = require("mongodb");

const cors = require("cors");
app.use(cors());
app.use(express.json());
app.set('json spaces', 3);
const path = require('path');

app.use(express.static('views'));

mongodbAccess.connectDB();

// Logging middleware
app.use((req, res, next) => {
  console.log(`A ${req.method} request came from ${req.url}`);
  next();
});

// Add middleware to set up collection based on the URL parameter
app.param('collectionName', (req, res, next, collectionName) => {
  req.collectionName = collectionName;
  next();
});

app.get('/collections/:collectionName', async function(req, res, next) {
    console.log("Fetching data from collection:", req.collectionName); 
    try {
        const results = await mongodbAccess.getCollection(req.collectionName);
        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'No data found' });
        }
        console.log("Results count:", results.length); 
        res.json(results);
    } catch (err) {
        console.error('Error fetching docs', err.message);
        next(err); 
    }
});

app.get('/collections1/:collectionName', async function(req, res, next) {
  try {
    const results = await mongodbAccess.getCollection(req.params.collectionName);
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }
    res.json(results);
  } catch (err) {
    console.error('Error fetching docs', err.message);
    next(err); 
  }
});

app.get('/collections/:collectionName/:max/:sortAspect/:sortAscDesc', async function(req, res, next) {
  try {
    // Since we don't have direct access to the collection now, we need to use our mongodbAccess functions
    // This would need to be implemented in mongodbAccess.js
    res.status(501).json({ message: 'Not implemented' });
  } catch (err) {
    console.error('Error fetching docs', err.message);
    next(err); 
  }
});

app.get('/collections/:collectionName/:id', async function(req, res, next) {
  try {
    // This would need to be implemented in mongodbAccess.js
    res.status(501).json({ message: 'Not implemented' });
  } catch (err) {
    console.error('Error fetching docs', err.message);
    next(err); 
  }
});

app.post('/collections/:collectionName', async function(req, res, next) {
  try {
    // This would need to be implemented in mongodbAccess.js
    res.status(501).json({ message: 'Not implemented' });
  } catch (err) {
    console.error('Error fetching docs', err.message);
    next(err); 
  }
});

app.delete('/collections/:collectionName/:id', async function(req, res, next) {
  try {
    // This would need to be implemented in mongodbAccess.js
    res.status(501).json({ message: 'Not implemented' });
  } catch (err) {
    console.error('Error fetching docs', err.message);
    next(err); 
  }
});

app.put('/collections/:collectionName/:id', async function(req, res, next) {
  try {
    // This would need to be implemented in mongodbAccess.js
    res.status(501).json({ message: 'Not implemented' });
  } catch (err) {
    console.error('Error fetching docs', err.message);
    next(err); 
  }
});

app.get("/search/:searchValue", async function(req, res, next) {
  try {
    const results = await mongodbAccess.search(req.params.searchValue);
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No matches found' });
    }
    res.json(results);
  } catch (err) {
    console.error("Error searching:", err.message);
    next(err);
  }
});

app.post("/checkout", async (req, res) => {
  try {
    console.log("Checkout request received:", req.body);
    
    // Validate that cart is present and not empty
    if (!req.body.cart || !Array.isArray(req.body.cart) || req.body.cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid" });
    }
    
    // Validate required fields
    if (!req.body.firstname || !req.body.lastname || !req.body.phone) {
      return res.status(400).json({ error: "Missing required customer information" });
    }
    
    // Process the order
    const result = await mongodbAccess.addOrder(req.body);
    
    res.status(201).json({ message: "Order Completed", orderId: result.orderId });
  } catch (error) {
    console.error("Order processing error:", error);
    res.status(500).json({ error: "Order could not be completed", details: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'An error occurred', details: err.message });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});