const mongooes = require('mongoose')
const validator = require('validator')
const bcrypt= require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = mongooes.Schema({
    name:{
        type: 'string',
        required:true,
        trim:true
    },
    age:{
        type: 'number',
        required:true,
        validate:(value)=>{
            if(value<1) throw new Error('Age cant be negative')
        }
    },
    email:{
        type:'string',
        unique:true,
        trim:true,
        required:true,
        validate:(value)=>{
            if(!validator.isEmail(value)) throw new Error('Invalid email address')
        }
    },
    password:{
        type:'string',
        minLength:6,
        trim:true,
        required:true,
        validate:(value)=>{
            if(value.toLowerCase().includes('password')) throw new Error('Password cant include password')
        }
    },
    tokens:[{
        token:{
        type:'string',
        required:true
    }
    }],
    avatar:{
        type: "Buffer"
    }
},{
    timestamps:true
    })

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.statics.findByCredentials = async function(email,password){
  
    const user = await User.findOne({email:email})
    if(!user) throw new Error({error:'User not found'})
    const isValid= await bcrypt.compare(password,user.password)
    if(!isValid) new Error({error: 'User not found'})
    return user
}


userSchema.methods.toJSON = function(){
    const user=this
    const userObject =user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.createToken= async function(){
    const user=this
    const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECERT , {expiresIn:'2h'});
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token 

}

// const authenticateUser=function(){
//     const user=this
// }

userSchema.pre('save',async function(next){
    const user=this
        if(user.isModified('password')){
            user.password= await bcrypt.hash(user.password , 8 )
            next()
        }
})

//middleware to delete task if user is deleted
userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner:user._id})
    next()
})

const User = mongooes.model('User',userSchema)

module.exports = User