const jwt = require('jsonwebtoken');
const { getConnectedClient } = require('../../config/db');

async function authLogin(req, res) {
    try {
        const client = await getConnectedClient();
        const db = client.db('ichat');
        const usersCollection = await db.collection('users');
        const { username, password } = req.body

        const isUserExist = await usersCollection.findOne({ username });
        if (!isUserExist) return res.status(401).json({ error: 'User Tidak Terdaftar' });
        const passwordMatch = isUserExist.password === password
        if (!passwordMatch) return res.status(401).json({ error: 'Password Salah' });
        const token = jwt.sign(
            isUserExist,
            process.env.SECRET_KEY
        );

        res.cookie('jwt', token, {
            // HttpOnly: true,
            maxAge: 3600000,
            // secure: true
        });
        res.status(201).json({
            success: true,
            message: 'Berhasil Login',
            user: isUserExist
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ messages: 'Internal Server Error' });
    }
}

async function authLogout(req, res) {
    res.clearCookie('jwt');
    res.sendStatus(204);
}

module.exports = { authLogin, authLogout }