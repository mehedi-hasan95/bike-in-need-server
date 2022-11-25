const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.BIKE_DB_USERNAME}:${process.env.BIKE_DB_PASSWORD}@cluster0.k4gmzpi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const bikeCategory = client.db("bikeInNeed").collection("categories");
        const bikeDetails = client.db("bikeInNeed").collection("details");

        app.get('/categories', async (req, res) => {
            const query = {};
            const cursor = await bikeCategory.find(query).toArray();
            res.send(cursor)
        })

        // Bike Details 
        app.get('/categories/:category', async (req, res) => {
            const details = req.params.category;
            const query = { category: details };
            const cursor = await bikeDetails.find(query).toArray();
            res.send(cursor)
        })
    }
    finally {

    }
}
run().catch(console.log);





app.get('/', (req, res) => {
    res.send('Bike In Need!')
})

app.listen(port, () => {
    console.log(`Bike In Need server running on: ${port}`)
})