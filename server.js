const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db
//connect database and start server
MongoClient.connect('mongodb://jason:jason1@ds129801.mlab.com:29801/hubs', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(process.env.PORT || 8000, () => {
    console.log('listening on 8000')
  })
})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
//no longer have to serve up every file/images
app.use(express.static('public'))

//line 22-35 is the API
app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})
  })
})

app.get('/react', (req, res) => {
  // .find = find every single message in that collection
  // .toArry = turns that information into an array
  db.collection('messages').find().toArray((err, result) => {
     if (err) return console.log(err)
    res.json(result)
  })
})
//documents are objects that go into your collection

//create stuff and save to database
//create step of CRUD
app.post('/messages', (req, res) => {
  //save creates a document with this info in it
  db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})
//updating step of CRUD
app.put('/messages', (req, res) => {
  db.collection('messages')
  //find one specific docuemnt and update it
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    //sort picks out the order :top to bottom or bottom to top
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.put('/messagesDown', (req, res) => {
  db.collection('messages')
  //find one specific docuemnt and update it
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbDown:req.body.thumbDown + 1
    }
  }, {
    //sort picks out the order :top to bottom or bottom to top
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  // .findOneAndDelete finds one specific 'messages' document and deletes it
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
