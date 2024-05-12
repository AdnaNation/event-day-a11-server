const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vksh2ow.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('ServicesDB').collection('services');
    const bookingCollection = client.db('BookingsDB').collection('bookings');

    app.post('/addService', async (req, res) => {
        const addedService = req.body;
        console.log(addedService);
        const result = await serviceCollection.insertOne(addedService);
        res.send(result);
    })

    app.get('/services',async (req, res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        // console.log(result)
        res.send(result);
    })

    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await serviceCollection.findOne(query);
      res.send(result);
  })
  //  updating
  app.put('/services/:id', async(req, res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const editedService = req.body;
  
    const service = {
        $set: {
            serviceName: editedService.serviceName, 
            imgURL: editedService.imgURL, 
            price: editedService.price, 
            serviceArea: editedService.serviceArea, 
        }
    }
    const result = await serviceCollection.updateOne(filter, service, options);
    res.send(result);
  })

  // deleting
  app.delete('/services/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await serviceCollection.deleteOne(query);
    res.send(result);
})


  // booking

  app.post('/booking', async (req, res) => {
    const bookedService = req.body;
    console.log(bookedService);
    const result = await bookingCollection.insertOne(bookedService);
    res.send(result);
})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('Event day is running');
})
app.listen(port, ()=>{
    console.log(`Event Day Server is running on port ${port}`)
})