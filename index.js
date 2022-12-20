const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.DB_PASSWORD}@genius-car-cluster.etmukv1.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const servicesCollection = client
      .db("serviceReviewer")
      .collection("services");
    const reviewCollection = client.db("serviceReviewer").collection("reviews");
    const orderCollection = client.db("serviceReviewer").collection("orders");
    app.get("/", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/reviews", async (req, res) => {
      let query = {};
      const id = req.query.serviceId;
      const email = req.query.email;

      if (id) {
        query = { serviceId: id };
      }
      if (email) {
        query = { reviewBy: email };
      }
      console.log(email);

      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
      console.log(review);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    app.get("/orders", async (req, res) => {
      let query = {};

      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
      console.log(orders);
    });
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
      console.log(result);
    });
    // delete reviews:
    app.delete("/reviews/:serviceId", async (req, res) => {
      const id = req.params.serviceId;
      console.log(id);
      const query = { serviceId: id };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
   
  } finally {
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("reviewing api is coming");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
