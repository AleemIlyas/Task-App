const User = require('../model/user')
const jwt= require('jsonwebtoken');

const auth = async function(req, res, next) {
    try{ 
        const token = req.headers['authorization'].replace('Bearer ', '');
        const verification = await jwt.verify(token , process.env.JWT_SECERT)
        const user = await User.findOne({_id:verification._id , 'tokens.token':token })
        if(!user) throw new Error()

        req.token = token
        req.user = user
        next()
    }
    catch(e){
        res.status(401).send({error: 'Please Authenticate!'});
    }
}

module.exports = auth