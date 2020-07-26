const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

mongoose.Promise = Promise

const dbUrl = 'mongodb+srv://user:1234@cluster0.9qh4q.mongodb.net/chat?retryWrites=true&w=majority'

const Message = mongoose.model('Message', {
    name: String,
    message: String,
    date: String
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
        const savedMessage = await message.save();
        console.log('saved')
        const censored = await Message.findOne({message: 'badword'});  // to filter bad words

        if (censored)
            await Message.remove({_id: censored.id})
        else {
            io.emit('message', req.body)
        }

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('message post called')
    }
})

app.post('/reset', async (res) => {
    try {
        await mongoose.Collection('messages').drop();
        /*db.createCollection('hotels');
        db.collection('hotels').insert([{
                initials:'bw',
                upvotes: 0,
                reviews: [],
            },{
                initials:'rpc',
                upvotes: 0,
                reviews: [],
            },{
                initials:'spis',
                upvotes: 0,
                reviews: [],
            }]
        )*/
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('All messages reset')
    }
})

io.on('connection', (socket) => {
    console.log('a user connected')
})

mongoose.connect(dbUrl, {useUnifiedTopology: true, useNewUrlParser: true}, (err) => {
    console.log('mongo db connection', err)
})

const server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
});

