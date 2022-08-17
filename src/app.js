const express= require('express')
require('./db/db')
const app = express()
const userRoutes = require('./routes/user')
const TaskRoutes = require('./routes/task')

const port= process.env.PORT || PORT

// app.use(function(req, res, next) {
//     if(req.method=== 'GET') res.send("Get Requests are not supported")
//     else next()
// })

// app.use((req,res,next)=>{
//     res.status(503).send("Down due to Maintenance")
// })

app.use(express.json())
app.use(userRoutes)
app.use(TaskRoutes)



app.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}`)
})

// const multer= require('multer')
// const upload=multer({
//     dest:'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter: function(req,file,cb){
//         const regex= /\.(doc|docx)$/gi
//         if(regex.test(file.originalname)){
//           return  cb(null,true)
//         }

//         cb(new Error('File type is not supported!'))
//     }
// })

// const Task = require('./model/task.js')
// const User = require('./model/user.js')

// const fun=async function(){
//     // const task = await Task.findById('62fa48fde58ef6412105a5e8')
//     //  await task.populate('owner')
//     // console.log(task.owner)

//     const user= await User.findById('62f951d8129a7a883bfc24e1')
//     await user.populate('tasks')
//     console.log(user.tasks)


// }

// app.post('/upload', upload.single('upload') , async (req, res) => {
//     res.send()
// })

// fun()