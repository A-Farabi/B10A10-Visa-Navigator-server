const express = require('express')
const cors = require('cors')
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mrtaf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('Visa Navigator server is running')
})

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

    const visaCollection = client.db("visaDB").collection('visa')
    const appliedVisaCollection = client.db("visaDB").collection('appliedVisa')

    app.post('/Visa', async (req, res)=>{
      const newAddingVisa = req.body
      const result = await visaCollection.insertOne(newAddingVisa)
      res.send(result)
    })

    app.get('/Visa', async (req, res) => {
      try {
        const cursor = visaCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching visas:", error);
        res.status(500).send("Failed to fetch visas.");
      }
    });


    app.get('/visa/:id', async (req, res) => {
      const id = req.params.id;
      const visa = await visaCollection.findOne({ _id: new ObjectId(id) });
      res.send(visa);
    });
    
    app.post('/appliedVisa', async (req, res)=>{
      const newApplied = req.body
      const result = await appliedVisaCollection.insertOne(newApplied)
      res.send(result)
    })

    app.get('/appliedVisa', async (req, res) => {
      try {
        const cursor = appliedVisaCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching visas:", error);
        res.status(500).send("Failed to fetch visas.");
      }
    });

    app.delete("/appliedVisa/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appliedVisaCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/Visa", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send("Email query parameter is required.");
      }
      try {
        const query = { email: email };
        const visas = await visaCollection.find(query).toArray();
        res.send(visas);
      } catch (error) {
        res.status(500).send("Failed to fetch visas.");
      }
    });

    
    app.delete("/Visa/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/Visa/:id", async (req, res) => {
      const id = req.params.id;
      const updatedVisa = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: updatedVisa,
      };
      const result = await visaCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    
    
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, ()=>{
    console.log(`visa navigator server is running on port: ${port}`);
})