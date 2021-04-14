const bcrypt = require('bcrypt');
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

async function login(log){
  console.log("mit name");
  console.log(log.unm);
  console.log(log.pnw);
  var hashed = await hashIt(log.pnw);
  console.log(hashed);
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

async function hashIt(password){
  const salt = await bcrypt.genSalt(6);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
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
  //});

  socket.on("leave", log => {
    //TODO: Datenbankabgleich (wenn username noch nicht existiert dann füge username und passwort hinzu. Wenn username existiert vergleiche Passwörter)
    console.log(log.unm);
    login(log);
    //if(//successful) {
      io.to(socket.id).emit('leave', {scs: true, nme: log.unm});
    //}
    //else if(//no success) {
    //  io.to(socket.id).emit('leave', {scs: false, nme: log.nme});
    //}
  });

  socket.on('chat message', msg => {
    var sendCount = 0;
    let recipMap = new Map(msg.recip);
    let recipId;
    let recipArr = [];
    for (recipId of recipMap.keys()) {
      io.sockets.sockets.get(recipId).join("multiCast");
      recipArr.push(onlineMap.get(recipId));
      sendCount++;
    }

    if (sendCount == 0) {
      io.emit('chat message', msg.msg);
    }

    //sends a private message
    else if (sendCount == 1) {
      io.to(recipId).emit('chat message', "->privat " + msg.msg);
    }

    //sends a message to multiple participants
    else if (sendCount > 1) {
      io.in("multiCast").emit('chat message', "->send to: " + recipArr + " " + msg.msg);
    }

    for (recipId of recipMap.keys()) {
      io.sockets.sockets.get(recipId).leave("multiCast");
    }
  });

  socket.on('join', name => {
    onlineMap.set(socket.id, name);
    // getall();
    // getbyname();
    // run(name).catch(console.dir);
    io.emit('hello', name + " has joined the chat");
    io.emit('join', Array.from(onlineMap));
  });

  //if a socket dissconnects everybody gets a message and list of online users get updated
  socket.on('disconnect', () => {
    if(onlineMap.has(socket.id)) {
      io.emit('hello', onlineMap.get(socket.id) + " has left the chat");
      onlineMap.delete(socket.id);
      io.emit('join', Array.from(onlineMap));
    }
  });

});

  http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
  });
