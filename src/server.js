const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')
const moment = require('moment');
const defaultChat = require('./defaultChat');
const path = require('path');   // to deploy

app.use(express.static(__dirname))  // to deploy
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

moment.locale();

mongoose.Promise = Promise

const dbUrl = 'mongodb+srv://user:1234@cluster0.9qh4q.mongodb.net/chat?retryWrites=true&w=majority'

const Message = mongoose.model('Message', {
    name: String,
    message: String,
    date: String
})

io.on('connection', () => {
    console.log('a user connected')
})

mongoose.connect(dbUrl, {useUnifiedTopology: true, useNewUrlParser: true}, (err) => {
    console.log('mongo db connection', err)
})

app.get('/messages', (req, res) => {
    Message.find({}, (err, message) => {
        res.send(message)
    })
})

app.get('/messages/:user', (req, res) => {
    const user = req.params.user;
    Message.find({name: user}, (err, message) => {
        res.send(message)
    })
})

app.post('/messages', async (req, res) => {
    try {
        const message = new Message(req.body);
        message.date = moment(new Date()).format('MM/DD/YYYY h:mm:ss a')

        const savedMessage = await message.save();
        console.log('saved - ', savedMessage)
        const censored = await Message.findOne({message: 'badword'});  // to filter bad words

        if (censored)
            await Message.remove({_id: censored.id})
        else {
            io.emit('message', message) // send 'req.body' to 'socket.on('message', addMessages)' to the client(index.html)
        }

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('message post called')
    }
})

app.post('/reset', async (req, res) => {
    try {
        console.log("hello")
        /*await mongoose.connection.db.dropCollection('messages');  //drop the collection 'messages'
        await Message.collection.insertMany(defaultChat, {ordered: true});  //load dafaultChat and insert into the collection 'messages'
        io.emit('refreshScreen') // send it to 'socket.on('refreshScreen', ...)' to the client(index.html)*/
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('all messages reset')
    }
})

app.get('*', (req, res) => {  // to deploy (frontend + backend)
    res.sendFile(path.join(__dirname + '/index.html'));
})

const server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
});

