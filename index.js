const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.DB_PASSWORD}@genius-car-cluster.etmukv1.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
      const reviewsCollection=client.db('serviceReviewer').collection('services')
      app.get("/", async (req, res) => {
        const query = {};
        const cursor = reviewsCollection.find(query);
        const services = await cursor.limit(3).toArray();
        res.send(services);
      });
      
      app.get("/services", async (req, res) => {
        const query = {};
        const cursor = reviewsCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
      });
      
      app.get("/services/:id", async (req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const service = await reviewsCollection.findOne(query);
        res.send(service);
        console.log(query )
      });
    }
    finally{

    }

}
run().catch(error=>console.log(error))


app.get("/", (req, res) => {
  res.send("reviewing api is coming");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
