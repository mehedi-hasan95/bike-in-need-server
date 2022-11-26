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

// JWT 

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_KEY, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run() {
    try {
        const bikeCategory = client.db("bikeInNeed").collection("categories");
        const bikeDetails = client.db("bikeInNeed").collection("details");
        const registerUser = client.db("bikeInNeed").collection("users");


        // Midleware to Verify admin 
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await registerUser.findOne(query);
            if (user.role !== 'admin') {
                return res.status(403).send({ message: 'Unauthorize Access' });
            }
            next();
        }

        app.get('/categories', async (req, res) => {
            const query = {};
            const cursor = await bikeCategory.find(query).toArray();
            res.send(cursor)
        })

        // Register User Info 
        app.post('/products/add', async (req, res) => {
            const user = req.body;
            const result = await bikeDetails.insertOne(user);
            res.send(result);
        })

        // Bike Details 
        app.get('/categories/:category', async (req, res) => {
            const details = req.params.category;
            const query = { category: details };
            const cursor = await bikeDetails.find(query).toArray();
            res.send(cursor)
        })


        // Register User Info 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await registerUser.insertOne(user);
            res.send(result);
        })

        // Prevent all except admin
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await registerUser.findOne(query);
            res.send({ isAdmin: user?.status === 'admin' })
        })

        // Prevent all except admin
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await registerUser.findOne(query);
            res.send({ isSeller: user?.status === 'Seller' })
        })

        // All Seller display on admin site 
        app.get('/users/seller', async (req, res) => {
            const query = {status: { $eq: 'Seller' } };
            const cursor = await registerUser.find(query).toArray();
            res.send(cursor);
        })
        // All Buyer display on admin site 
        app.get('/users/buyer', async (req, res) => {
            const query = {status: { $eq: 'Bayer' } };
            const cursor = await registerUser.find(query).toArray();
            res.send(cursor);
        })

        // Delete a User
        app.delete('/users/:id', async (req, res) => {
            const doctor = req.params.id;
            const query = { _id: ObjectId(doctor) }
            const result = await registerUser.deleteOne(query);
            console.log(result);
            res.send(result);
        })



        // JWT Token
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await registerUser.findOne(query);
            if (result) {
                const token = jwt.sign({ email }, process.env.ACCESS_KEY, { expiresIn: '1h' });
                return res.send({ token })
            }
            res.status(403).send({ message: 'Unauthorize Access' })
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