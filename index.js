const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


// middle ware
// {
//   origin: ['http://localhost:5173'],
//   credentials: true
// }
app.use(cors());   
app.use(express.json());
// app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g2fbusk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// middlewares-------------------------------------------------------

// const logger = async(req, res, next) => {
//   console.log('called:', req.host, req.originalUrl);
//   next();
// }

// const verifyToken = async(req, res, next) => {
//    const token = req.cookies?.token;
//    console.log(req.cookies.token);
//    console.log('value of token in middle ware', token);
//    if(!token){
//     return res.status(401).send({message: 'not authorized'})
//    }
//    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     // error================================

//     if(err){
//       console.log(err);
//       return req.status(401).send({message: 'unauthorized'})
//     }

//     // if token is valid then it would be decoded
//     console.log('value in the token', decoded);
//     req.user = decoded;
//     next()
//    })
  
// }


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const serviceCollection = client.db('carDoctor').collection('services');
    const bookingCollection = client.db('carDoctor').collection('bookings');

    // Auth Related API========================================================

    // app.post('/jwt', logger, async(req, res) => {
    //   const user = req.body;
    //   console.log(user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
    //   res
    //   .cookie('token', token,{
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: 'none'
    //   })
    //   .send({success: true})
    // })



    // service Related API______________________________________________________

    app.get('/services',  async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};

      const options = {
        // Include only the `title` and others fields in the returned document
        projection: {title: 1, service_id: 1, price: 1 , img: 1},
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    })


    // bookings=============================================================

    app.get('/bookings',  async(req, res) => {
      console.log(req.query.email);
      // console.log('took took token', req.cookies.token);
      // console.log(req.cookies.token);
      // console.log('user in the valid', req.user);
      // if(req.query.email !== req.user.email){
      //   return res.status(403).send({message: 'forbidden access'})
      // }

      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    })


    app.post('/bookings', async(req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })

    app.patch('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedBooking = req.body;
      console.log(updatedBooking);

      const updatedDoc = {
        $set : {
          status : updatedBooking.status
        }
      }
      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result)
    })

    app.delete('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
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



app.get('/', (req, res) => {
    res.send('cars doctor is running')
})

app.listen(port, () => {
    console.log(`car doctor is running on the port ${port}`);
})