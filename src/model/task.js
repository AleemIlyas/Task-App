const mongoose =require('mongoose');


const taskSchema = mongoose.Schema({
    title:{
        type: 'string',
        required:true,
        trim:true
    },
    description:{
        type: 'string',
        required:true,
        trim:true
    },
    complete:{
        type: 'boolean',
        default:false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    }
},{
    timestamps: true
})

const Task=mongoose.model('Task',taskSchema)
module.exports= Task