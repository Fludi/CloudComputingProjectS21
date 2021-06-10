const crypto = require('crypto');
const helmet = require("helmet");
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://CloudUser1:CloudComputingSS21@cloudcomputingcluster.xypsx.mongodb.net/cloudcomputingcluster?retryWrites=true&w=majority";

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
    // gets a random entry from the database
    const randomUser = await db.collection('users').aggregate([ { $sample: { size: 1 } } ]).toArray();
    console.log(randomUser);
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

//gets all data entries from the database
async function getall(){
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

//gets all data entries from the database with a specific name
async function getbyname(){
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

/* Unused Hash-function -- does not work
async function hashIt(password){
  const salt = await bcrypt.genSalt(6);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
}
*/

const app = require('express')();
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        "default-src": ["'self'"],
        "connect-src": ["'self'", "'unsafe-inline'"],
        "script-src": ["'unsafe-inline'", "'self'"],
        "object-src": ["'none'"],
      },
    })
);


const http = require('http').Server(app);
const io = require('socket.io')(http, { maxHttpBufferSize: 10e7});
const port = process.env.PORT || 3000;
let onlineMap = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

  //login function
  async function login(log){
    // database connection
    log.pnw = crypto.createHash('md5').update(log.pnw).digest("hex");
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb+srv://CloudUser1:CloudComputingSS21@cloudcomputingcluster.xypsx.mongodb.net/cloudcomputingcluster?retryWrites=true&w=majority";
    await MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      //defines database
      var dbo = db.db("cloudcomputingcluster");
      // search for a database entry with name = loginname
      dbo.collection("benutzerdaten").findOne({name :log.unm}, function(err, result) {
        if (err) throw err;

        //if user does exist and password is correct continue login
        if (result != null && !log.new) {
          if (log.unm == result.name && log.pnw == result.password) {
            io.to(socket.id).emit('details', {scs: true, nme: log.unm, msg: "Success"});
          }

          else {
            io.to(socket.id).emit('details', {scs: false, nme: log.unm, msg: "Login failed: Incorrect password"});
          }

        } else if (result != null && log.new) {
          io.to(socket.id).emit('details', {scs: false, nme: log.unm, msg: "Registration failed: Username already taken"});

        } else {
          if (!log.new) {
            io.to(socket.id).emit('details', {scs: false, nme: log.unm, msg: "Login failed: Username does not exist"});

            //if user does not exist yet, create a new entry in the database continue registration
          } else {
            dbo.collection("benutzerdaten").insertOne({
              name: log.unm,
              password: log.pnw
            });
            io.to(socket.id).emit('details', {scs: true, nme: log.unm, msg: "Success"});
          }
        }

        //close database connection
        db.close();
      });
    });
  }

//---------------------------------------------------------------------------------------------------------------------

  socket.on("details", log => {
    login(log);
  });

  //if server gets a normal message, he then distributs it to a)all sockets b)to only one socket c)a groub of sockets
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

    //sends to all users
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

  //creates a message for every new user and updates the list of online users
  socket.on('join', name => {
    onlineMap.set(socket.id, name);
    io.emit('hello', name + " has joined the chat");
    io.emit('join', Array.from(onlineMap));
  });

  //creates and sends a multimedia message
  socket.on('leave', file => {
    var sendCount = 0;
    let recipMap = new Map(file.recip);
    let recipId;
    let recipArr = [];
    for (recipId of recipMap.keys()) {
      io.sockets.sockets.get(recipId).join("multiCast");
      recipArr.push(onlineMap.get(recipId));
      sendCount++;
    }

    //sends to all users
    if (sendCount == 0) {
      io.emit('leave', file);
    }

    //sends a private message
    else if (sendCount == 1) {
      io.to(recipId).emit('leave', {type: file.type, msg: "->privat " + file.msg, data: file.data});
    }

    //sends a message to multiple participants
    else if (sendCount > 1) {
      io.in("multiCast").emit('leave', {type: file.type, msg: "->send to: " + recipArr + " " + file.msg, data: file.data});
    }

    for (recipId of recipMap.keys()) {
      io.sockets.sockets.get(recipId).leave("multiCast");
    }
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