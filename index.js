const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://CloudUser1:CloudComputingSS21@cloudcomputingcluster.xypsx.mongodb.net/cloudcomputingcluster?retryWrites=true&w=majority";
/*client.connect(err => {
  const collection = client.db("cloudcomputingcluster").collection("users");
  collection.insertOne({
    name: "Test"
  });
*/
  // perform actions on the collection object

async function run(name) {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db('cloudcomputingcluster')
    await db.collection('users').insertOne({
          name: name
        }
    )
    const randomUser = await db.collection('users').aggregate([ { $sample: { size: 1 } } ]).toArray();
    console.log(randomUser);
    //await client.close();
    const xUser = await db.collection('users').aggregate([ { $sample: { size: 1 } } ]).toArray();
    console.log(xUser);
    await client.close();
  } catch (err) {
    console.log(err.stack);
  }
  finally {
    await client.close();
  }
}

async function getall(){
  console.log("sad");
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://CloudUser1:CloudComputingSS21@cloudcomputingcluster.xypsx.mongodb.net/cloudcomputingcluster?retryWrites=true&w=majority";

  await MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("cloudcomputingcluster");
    dbo.collection("users").find({}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
  });
}

async function getbyname(){
  console.log("mit name");
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://CloudUser1:CloudComputingSS21@cloudcomputingcluster.xypsx.mongodb.net/cloudcomputingcluster?retryWrites=true&w=majority";

  await MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("cloudcomputingcluster");
    dbo.collection("users").find(({name :'Kris'})).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
  });
}

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
let onlineMap = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
 // socket.on("hello", (arg) => {
 //   io.emit('hello', arg);
 // });
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('join', name => {
    onlineMap.set(socket.id, name);
    getall();
    getbyname();
    run(name).catch(console.dir);
    io.emit('hello', name + " has joined the chat");
    io.emit('join', Array.from(onlineMap));
  });

  socket.on('disconnect', () => {
    io.emit('hello', onlineMap.get(socket.id) + " has left the chat");
    onlineMap.delete(socket.id);
  //  io.emit('leave', socket.name);
    io.emit('join', Array.from(onlineMap));
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
