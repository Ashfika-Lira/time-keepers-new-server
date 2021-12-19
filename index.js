const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hwgc0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('watch');
        const watchCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        //post a review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);

        });

        //post method for get orders by ID
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

        // UPDATE ORDER OR INSERT ORDER
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            // console.log('put hit', email)
            const filter = { email: email };
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    role: "admin"
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc, option);
            res.json(result);
        });
        app.put('users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: user.name,
                    img: user.img,
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // get method
        app.get('/products', async (req, res) => {
            const cursor = watchCollection.find({});
            const allWatches = await cursor.toArray();
            res.send(allWatches);
        });
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const allReviews = await cursor.toArray();
            res.send(allReviews);
        });
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query);
            res.send(result);
        });

        //single get method
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const result = await watchCollection.findOne(query);
            res.json(result);
        })

        console.log('connected to db_ref')
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Watch Server');
});

app.listen(port, () => {
    console.log('Running Watch Server on port:', port);
})
