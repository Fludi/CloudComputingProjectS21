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
  } catch (err) {
    console.log(err.stack);
  }
  finally {
    await client.close();
  }
}


const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
let users = new Map();

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
    users.set(socket.id, name);
    run(name).catch(console.dir);
    io.emit('hello', name + " has joined the chat");
    io.emit('join', Array.from(users));
  });

  socket.on('disconnect', () => {
    io.emit('hello', socket.name + " has left the chat");

  //  io.emit('leave', socket.name);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
