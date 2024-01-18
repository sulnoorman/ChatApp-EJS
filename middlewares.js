const isAuthenticated = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.render('pages/auth/login');
    }
    
    req.token = token;
    next();
}

module.exports = { isAuthenticated }
