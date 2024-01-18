const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { connect } = require('./config/db');
const { router } = require('./api/router');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./middlewares');
const DataModel = require('./data.model');
require('dotenv').config();

// app middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true }));

// app config
app.set('view engine', 'ejs');

// server static files
app.use(express.static('public'));
app.use('/css', express.static('public/css'));
app.use('/image', express.static('public/image'));

// define socket.io
const server = http.createServer(app);
const io = new Server(server);

// Connect to MongoDb Database
connect().then(async (client) => {
    console.log('connected to database');
    // get app database
    const db = client.db('ichat');

    const dataModel = new DataModel();

    // api router
    if (db) {
        app.use(router);
    }

    io.sockets.on('connection', (socket) => {
        console.log('connect to socket io', socket.id);

        socket.on('setData', (data) => {
            io.emit('newData', data);
        })
    })

    // page router
    app.get('/', isAuthenticated, async (req, res) => {
        const token = req.token;
        jwt.verify(
            token,
            process.env.SECRET_KEY,
            async function (error, decoded) {
                if (error) {
                    res.status(403).json({ status: false, error: error })
                }

                const users = await dataModel.getListUser(decoded._id);
                const listChat = await dataModel.getListChat(decoded._id);
                // res.status(200).json({users: users, listChat: listChat});
                res.render('pages/window-chat/index', { currentUser: decoded, listChat: listChat, dataChat: null, users: users });
            }
        )
    });

    app.get('/:id', isAuthenticated, async (req, res) => {
        const { id } = req.params;
        const token = req.token;

        jwt.verify(
            token,
            process.env.SECRET_KEY,
            async function (error, decoded) {
                if (error) {
                    res.status(403).json({ status: false, error: error })
                }

                const users = await dataModel.getListUser(decoded._id);
                const listChat = await dataModel.getListChat(decoded._id);
                const conversation = await dataModel.getConversation(decoded._id, id);
                // res.status(200).json(conversation);
                res.render('pages/window-chat/index', { currentUser: decoded, listChat: listChat, dataChat: conversation, users: users });
            }
        )
    })

    app.get('/login', (req, res) => {
        res.render('pages/auth/login');
    });

});

server.listen(4050, () => {
    console.log('Server running succesfully on port 4050');
});