const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const app = express();

const uri = "mongodb+srv://amitchotu09:database123@website.nryhmnn.mongodb.net/";
const client = new MongoClient(uri);

// Serve static files from the current directory
app.use(express.static(__dirname));

// Add this route to serve your HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'lithium.html'));
});

app.get('/api/lithium-price', async (req, res) => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB');
    const database = client.db("Lithium");
    const collection = database.collection("Price");
    const data = await collection.find({})
                                  .project({ 
                                    Date: 1, 
                                    Avg: { $convert: { input: "$Avg(USD/mt)", to: "double" }}, // Ensure Avg is a number
                                    _id: 0 
                                  })
                                  .sort({ Date: -1 })
                                  .limit(50)
                                  .toArray();
    console.log('Data fetched:', data.length, 'records');
    console.log('Sample data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching lithium price data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

app.get('/api/sentiments', async (req, res) => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB');
    const database = client.db("Lithium");
    const collection = database.collection("Sentiments");
    const data = await collection.find({})
                                  .project({ 
                                    Date: 1, 
                                    Hour: 1,
                                    SS: { $convert: { input: "$SS", to: "double" }}, // Ensure SS is a number
                                    _id: 0 
                                  })
                                  .sort({ Date: 1 })
                                  .toArray();
    console.log('Data fetched:', data.length, 'records');
    console.log('Sample data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
