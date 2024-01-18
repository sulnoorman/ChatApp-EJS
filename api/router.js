const express = require('express');
const router = express.Router();
const { authLogin, authLogout } = require('./auth');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendMessage } = require('./messages');
const { isAuthenticated } = require('../middlewares');

// router midldewares
router.use(cors());
router.use(bodyParser.json());

// Auth router
router.post('/auth/login', authLogin);
router.post('/auth/logout', authLogout);

// Message router
router.post('/post/message', isAuthenticated, sendMessage);

module.exports = { router }