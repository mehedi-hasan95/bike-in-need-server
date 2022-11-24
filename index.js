const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.BIKE_DB_USERNAME}:${process.env.BIKE_DB_PASSWORD}@cluster0.k4gmzpi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const bikeCategory = client.db("bikeInNeed").collection("category");

app.get('/category', async (req, res) => {
    const query = {};
    const cursor = await bikeCategory.find(query).toArray();
    res.send(cursor)
})



app.get('/', (req, res) => {
    res.send('Bike In Need!')
})

app.listen(port, () => {
    console.log(`Bike In Need server running on: ${port}`)
})