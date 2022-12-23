const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { query } = require("express");
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
function verifyJwt(req,res,next){
 const authHeader=req.headers.authorization
 if(!authHeader){
 return res.status(401).send({message:"unauthorized access"})
 }
 const token=authHeader.split(" ")[1]
 jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
  if(err){
   return res.send(401).send({message:"unauthorized access"})
  }
  req.decoded=decoded
  next()
 })
}
async function run() {
  try {
    const servicesCollection = client
      .db("serviceReviewer")
      .collection("services");
    const blogCollection = client.db("serviceReviewer").collection("blogs");
    const reviewCollection = client.db("serviceReviewer").collection("reviews");
    const orderCollection = client.db("serviceReviewer").collection("orders");
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res.send({ token });
    });
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const limit = req.query.limit;
      if (limit) {
        const limitNumber = parseInt(limit);
        const services = await cursor.limit(limitNumber).toArray();
        res.send(services);
      } else {
        const services = await cursor.toArray();
        res.send(services);
      }
    });
    app.get("/reviews", async (req, res) => {
      let query = {};
      const id = req.query.serviceId;
      let sort = req.query.sortBy;
      const email = req.query.email;
      if (id) {
        query = { serviceId: id };
      }
      if (email) {
        query = { reviewBy: email };
      }
      if (sort === "descending") {
        const cursor = reviewCollection.find().sort({ insertDate: -1 });
        const result = await cursor.toArray();
        res.send(result);
      } else {
        const cursor = reviewCollection.find(query);
        const review = await cursor.toArray();
        res.send(review);
      }
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const insertDate = new Date();
      const result = await reviewCollection.insertOne({
        ...review,
        insertDate,
      });
      res.send(result);
    });

    app.get("/orders",verifyJwt, async (req, res) => {
      const decoded=req.decoded;
      if(decoded.email!==req.query.email){
        return res.status(401).send({message:"unauthorized access"})
      }
      let query = {};

      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    // delete orders
    app.delete("/orders/:ordersId", async (req, res) => {
      const id = req.params.ordersId;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });
    // update order status
    app.patch("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: status,
        },
      };
      const result = await orderCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    // delete reviews:
    app.delete("/reviews/:reviewId", async (req, res) => {
      const id = req.params.reviewId;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
    // update reviews
    app.patch("/reviews/:updateId", async (req, res) => {
      const id = req.params.updateId;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          ...req.body,
          insertDate: new Date(),
        },
      };
      const result = await reviewCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    // blogs api
    app.get("/blogs", async (req, res) => {
      const query = {};
      const cursor = blogCollection.find(query);
      const blogs = await cursor.toArray();
      res.send(blogs);
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
