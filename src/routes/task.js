const express=require('express')
const mongoose=require('mongoose')
const Task=require('../model/task')
const auth=require('../middleware/authentication')

const routes = new express.Router();

routes.post('/task',auth ,async (req, res)=>{

    try{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    const tasks= await task.save()
     res.status(201).send(tasks)
     }
    catch(error){
        res.status(400).send(error)
    }
})


// endpoint from get specific tasks /users?complete=true
// endpoint for get task pagination /users?limit=2&skip=1
// endpoint for sort /users?sortBy=name:asc
routes.get('/task', auth , async (req, res)=>{
    const match={}
    const sort={}
    // console.log(req.query) for url params

    if(req.query.completed){
        match.complete = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const data= req.query.sortBy.split(":")
        sort[data[0]]= data[1] === 'dsc'?-1:1
    }

    try{
     await req.user.populate({
        path:'tasks',
        match,
        options:{
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
            }
    
     })
        res.send(req.user.tasks)
    }
    catch(error){
        res.status(500).send(error.message)
    }
})


routes.get('/task/:id',auth ,async (req, res)=>{
    try{
        const task= await Task.findOne({_id:req.params.id , owner:req.user._id})
        if(!task) return res.status(400).send()

        res.send(task)
    }
    catch(error){
        res.status(400).send(error)
    }
})

routes.patch('/task/:id', auth , async (req, res) => {
    const taskFields = ['title','description','complete']
    const ToUpdate = Object.keys(req.body)
   const isValidToUpdate = ToUpdate.every(task=> taskFields.includes(task));
    if(!isValidToUpdate) return res.status(404).send({error:'Invalid Property To Update'})

    try{

     // const task= await Task.findOneAndUpdate(req.body.id, req.body , {new:true , runValidators:true })
     const task= await Task.findOne({_id:req.params.id, owner:req.user._id})
     if(!task) return res.status(404).send()
    ToUpdate.forEach(update=> task[update]=req.body[update])
     await task.save()
    res.send(task)
    }
    catch(err){
        res.status(500).send(err)
    }

})

routes.delete('/task/:taskId', auth ,  async (req, res)=>{

    try{
        const task = await Task.findOneAndDelete({_id:req.params.taskId, owner:req.user._id})
        if(!task) return res.status(404).send()
        res.status(200).send(task)
    }
    catch(err){
        res.status(400).send(err)
    }
})

module.exports = routes