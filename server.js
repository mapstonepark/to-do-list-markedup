const express = require('express')
// calling the express npm so we can use it and make it required
const app = express()
// short hand saying whenever we say app, call the express function
const MongoClient = require('mongodb').MongoClient
// lets use mongo db and require it so we can connect to mongodb database
const PORT = 2121
// setting our port as 2121
require('dotenv').config()
// setting up a dotenv file so we can keep private data private


let db,
// this short hand is saying we are setting up variables and will define db later, but dbConnnectionStr is gonna be in the dot env file
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'
    // the database name we are using is called 'todo'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
// connect to my mongo db database please!!
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        // let me know I've connected successfully by console logging 'connected to whatever I named my database name please
        db = client.db(dbName)
        // db is going to be a variable that references my specific database
    })
    
app.set('view engine', 'ejs')
// I'm using ejs to display html, so this is where you go to grab 
app.use(express.static('public'))
// I have a public folder to hold my css and images and whatnot
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
//I'm gonna use json in this project
//these are you middlewares to make sure things run using the tools you want


app.get('/',async (request, response)=>{
    //this is a get request to dsiplay this information whenever someone views the home page. / is just the root of my page
    const todoItems = await db.collection('todos').find().toArray()
    // go to the database, go to the todo's documents and find all the objects in that collection, and throw it all into an array
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    //response.render('index.ejs', { items: todoItems, left: itemsLeft })
     db.collection('todos').find().toArray()
     .then(data => {
         db.collection('todos').countDocuments({completed: false})
        .then(itemsLeft => {
             response.render('index.ejs', { items: data, left: itemsLeft })
             // when you render the page on ejs, we're naming that data 'items'. Pass that array into the word items. So wherever you see items in ejs know that you are looking at this array.
         })
     })
     .catch(error => console.error(error))
     // if there is an error let me know man!
})

app.post('/addTodo', (request, response) => {
// this is the start of the post (create)
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    // go to the collection and look at the todos collection and insert an object with a thing property and completed property = false. You see that todoItem? Thats coming from the form on the ejs page. If we changed the name of that form we would need to update it here as well. This is going to grab the value that was in the todoItem form to store.
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
        // once you do that, go back and refresh the page please
    })
    .catch(error => console.error(error))
    //if it doesn't work hit me with an error message
})

app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})