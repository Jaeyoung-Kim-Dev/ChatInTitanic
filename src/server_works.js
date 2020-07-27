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
            io.emit('message', req.body) // send 'req.body' to 'socket.on('message', addMessages)' to the client(index.html)
        }

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('message post called')
    }
})

app.post('/reset', async (req, res) => { // todo: 리셋 후에 새로 고침이 안됨.
    try {
        await mongoose.connection.db.dropCollection('messages');
        const defaultChat = [
            {
                name: "RUTH",
                message: "Tell us of the accommodations in steerage, Mr. Dawson. I hear they're quite good on this ship.",
                date: "04-14-1912 19:21"
            },
            {
                name: "JACK",
                message: "The best I've seen, m'am. Hardly any rats.",
                date: "04-14-1912 19:21"
            },
            {
                name: "CAL",
                message: "Mr. Dawson is joining us from third class. He was of some assistance to my fiancee last night.\n" +
                    "This is foie gras. It's goose liver.",
                date: "04-14-1912 19:21"
            },
            {
                name: "GUGGENHEIM",
                message: "What is Hockly hoping to prove, bringing this... bohemian... up here?",
                date: "04-14-1912 19:21"
            },
            {
                name: "WAITER",
                message: "How do you take your caviar, sir?",
                date: "04-14-1912 19:21"
            },
            {
                name: "CAL",
                message: "Just a soupcon of lemon...\n" +
                    "...it improves the flavor with champagne.",
                date: "04-14-1912 19:21"
            },
            {
                name: "JACK",
                message: "No caviar for me, thanks.\n" +
                    "Never did like it much.",
                date: "04-14-1912 19:21"
            },
            {
                name: "RUTH",
                message: "And where exactly do you live, Mr.Dawson?",
                date: "04-14-1912 19:22"
            },
            {
                name: "JACK",
                message: "Well, right now my address is the RMS Titanic. After that, I'm on God's good humor.",
                date: "04-14-1912 19:22"
            },
            {
                name: "RUTH",
                message: "You find that sort of rootless existence appealing, do you?",
                date: "04-14-1912 19:22"
            },
            {
                name: "JACK",
                message: "Well... it's a big world, and I want to see it all before I go. \n" +
                    "My father was always talkin' about goin' to see the ocean.\n" +
                    "He died in the town he was born in, and never did see it.\n" +
                    "You can't wait around, because you never know what hand you're going to get dealt next.\n" +
                    "See, my folks died in a fire when I was fifteen, and I've been on the road since.\n" +
                    "Something like that teaches you to take life as it comes at you.\n" +
                    "To make each day count.",
                date: "04-14-1912 19:22"
            },
            {
                name: "MOLLY",
                message: "Well said, Jack.",
                date: "04-14-1912 19:22"
            },
            {
                name: "ROSE",
                message: "To making it count.",
                date: "04-14-1912 19:23"
            },
            {
                name: "RUTH",
                message: "How is it you have the means to travel, Mr. Dawson?",
                date: "04-14-1912 19:23"
            },
            {
                name: "JACK",
                message: "I work my way from place to place.\n" +
                    "Tramp steamers and such.\n" +
                    "I won my ticket on Titanic here in a lucky hand at poker.\n" +
                    "A very lucky hand.",
                date: "04-14-1912 19:23"
            },
            {
                name: "GRACIE",
                message: "All life is a game of luck.",
                date: "04-14-1912 19:23"
            },
            {
                name: "CAL",
                message: "A real man makes his own luck, Archie.",
                date: "04-14-1912 19:23"
            },
            {
                name: "ROSE",
                message: "Mr. Andrews, what are you doing? \n" +
                    "I see you everywhere writing in this little book.\n" +
                    "Increase number of screws in hat hooks from 2 to 3.\n" +
                    "You build the biggest ship in the world and this preoccupies you?!",
                date: "04-14-1912 19:24"
            },
            {
                name: "ISMAY",
                message: "He knows every rivet in her, don't you Thomas?",
                date: "04-14-1912 19:24"
            },
            {
                name: "ANDREWS",
                message: "All three million of them.",
                date: "04-14-1912 19:24"
            },
            {
                name: "ISMAY",
                message: "His blood and soul are in the ship.\n" +
                    "She may be mine on paper, but in the eyes of God she belongs to Thomas Andrews.",
                date: "04-14-1912 19:24"
            },
            {
                name: "ROSE",
                message: "Your ship is a wonder, Mr. Andrews. Truly.",
                date: "04-14-1912 19:24"
            },
            {
                name: "ANDREWS",
                message: "Thank you, Rose.",
                date: "04-14-1912 19:24"
            },
        ]

        await defaultChat.forEach(chat => {
            const message = new Message(chat);
            message.save();
        })

        io.emit('refresh') // send it to 'socket.on('refresh', ...)' to the client(index.html)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('all messages reset')
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

