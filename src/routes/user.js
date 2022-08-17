const express = require('express')
const User = require('../model/user')
const auth = require('../middleware/authentication')
const multer= require('multer')
const sharp= require('sharp')

const routes = new express.Router();

routes.post('/users', async (req,res)=>{

    try{
    const user=new User(req.body)
    const token= await user.createToken()
    await user.save()
        res.status(201).send({user,token})
    } 
    catch(e){
        res.status(500).send(e)
    }

})

routes.post('/users/login',async (req,res)=>{
    try{
        const user= await User.findByCredentials(req.body.email,req.body.password)
        const token= await user.createToken()
        res.send({user,token})
    }
    catch(e){
        res.status(400).send(e)
    }
})

routes.get('/users/me',auth , async (req, res)=>{

    try{
        res.send(req.user)
    }
    catch(error){ 
        res.status(500).send(error)
     }
})

routes.post('/users/logout', auth , (req, res) =>{
    try{
        req.user.tokens = req.user.tokens.filter((token) =>{ 
        return token.token !== req.token 
        })
        req.user.save()
        res.send({Message: 'User logged out Successfully'})
    }
    catch(error){
        res.status(400).send(error)
    }
})

routes.post('/users/logoutAll', auth , (req, res) => {

    try{
        req.user.tokens = []
        req.user.save()
        res.send({Message: 'User logged out Successfully from everywhere'})
    }
    catch(error){
        res.status(400).send({Message: 'User logged out from everwhere Successfully'})
    }

})

routes.patch('/users/update', auth , async (req,res) => {
    let updateableItems = ['name', 'age', 'email', 'password',]
    let ItemsToUpdate = Object.keys(req.body)

    let isValidToUpdate = ItemsToUpdate.every(Items => updateableItems.includes(Items))
    if(!isValidToUpdate) return res.status(404).send({error: 'Invalid List to Update Item'})

    try{
    //  const user= await User.findOneAndUpdate(req.params.id , req.body ,{ new: true , runValidators: true})
        ItemsToUpdate.forEach((value) => {
            req.user[value] = req.body[value]
        })
         await req.user.save()
        res.send(req.user)
    }
    catch(err){
        res.status(500).send(err)
    }

})

routes.delete('/users/me',auth , async (req,res)=>{

    try{
    req.user.remove()
    res.status(200).send(req.user)
    }
    catch(err){
        res.status(400).send(err)
    }

})

//endpoint for uploading file for with multer

const upload=multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter:function(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/i)){
            cb(new Error('Please Upload a image file'))
    }
        cb(null,true)
    },
    preservePath: true
})

routes.get('/users/me/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) throw new Error()

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch(e){
        res.status(400).send(e)
    }
} )


routes.post('/users/me/avatar', auth,upload.single('avatar'),async function(req, res){
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})


routes.delete('/users/me/avatar', auth,async function(req, res){
        try{
        if(!req.user.avatar) throw new Error("Profile Image Does no exist")

        req.user.avatar = undefined
        await req.user.save()
        res.send()

        }
        catch(e){
            res.status(400).send({error: e.message})
        }
})

module.exports= routes