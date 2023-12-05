const connecToMongo = require("./db");
var cors = require('cors');

connecToMongo();
const express = require("express");
const app = express();
const port = 4000;


// if you want to use res.body than use this middle vare
app.use(cors())
app.use(express.json())

// app.get("/", (req, res) => {
//   res.send("Hello Amir!");
// });

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))
app.listen(port, () => {
  console.log(`iNotebook Backend listening on port at  http://localhost:${port}`);
});
