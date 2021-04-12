const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://CloudUser1:CloudComputingSS21@cloudcomputingcluster.xypsx.mongodb.net/cloudcomputingcluster?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("cloudcomputingcluster").collection("users");
  console.log("Connected correctly to server1");
  collection.insertOne({
    name: "Test"
  });
  console.log("Connected correctly to server2");

  // perform actions on the collection object
  client.close();
  console.log("Connected correctly to server3");
});
/*async function run() {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db('cloudcomputingcluster')
    await db.collection('users').insertOne({
          name: 'Ludwig',
          alter: 21
        }
    )
  } catch (err) {
    console.log(err.stack);
  }
  finally {
    await client.close();
  }
}
run().catch(console.dir);
*/

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

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

  socket.on('join', msg => {
    socket.name = msg
    io.emit('hello', socket.name + " has joined the chat");

    //has do be reworked!
    io.emit('join', socket.name);
  });

  socket.on('disconnect', () => {
    io.emit('hello', socket.name + " has left the chat");
  //  io.emit('leave', socket.name);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
