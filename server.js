let express = require("express");
let morgan = require("morgan")
let bodyParser = require("body-parser");
let uuid = require("uuid");
let mongoose = require("mongoose");
let {PostArray} = require("./model.js")
const  {DATABASE_URL, PORT} = require("./config.js");


let app = express();
let jsonParser = bodyParser.json();
//js, css and html in the 'public' named folder
app.use(express.static("public"));
app.use(morgan("dev"));

//Default data

let posts = [{
    id: uuid.v4(),
    title: "One Hundred Years of Solitude",
    content: "One of the 20th century's enduring works. Is a widely beloved and acclaimed novel.",
    author: "Gabriel Garcia Marquez",
    publishDate: new Date('April 13, 2019 17:40:10')

},
{
    id: uuid.v4(),
    title: "Crime and Punishment",
    content: "It is a murder story, told from a murder;s point of view, that implicates even the most innocent reader in its enormities.",
    author: "Fyodor Dostoyevsky",
    publishDate: new Date('March 25, 2018 11:54:23')
},
{
    id: uuid.v4(),
    title: "Anna Karenina",
    content: "Anna Karenina tells of the doomed love affair between the sensuous and rebellious Anna and the dashing officer, Count Vronsky.",
    author: "Leo Tolstoy",
    publishDate: new Date('July 18, 2018 19:47:42')
},
{
    id: uuid.v4(),
    title: "To Kill a Mockingbird",
    content: "As a Southern Gothic novel and a Bildungsroman, the primary themes of To Kill a Mockingbird involve racial injustice and the destruction of innocence.",
    author: "Harper Lee",
    publishDate: new Date('Novemeber 2, 2018 21:32:21')
}];

//Server functions

app.get("/blog-posts", (req, res, next) => {
    PostArray.getAllPosts()
            .then(posts => {
                res.status(200).json(posts)
            })
            .catch(() => {
                res.statusMessage = "Something went wrong with the DB. Please try again later";
                return res.status(500).json({
                    message: res.statusMessage,
                    status: 500
                });
            });
});

app.get("/blog-postAuthor", (req, res, next) => {
    let author = req.query.author;
   
    if(!author) {
        res.statusMessage = "Author field is missing in paramenters";
        return res.status(406).json({
            message: res.statusMessage,
            status: 406
        });
    }

    PostArray.getPostsByAuthor(author)
            .then(posts => {
                if(posts.length == 0) {
                    res.statusMessage = "The author does not exist";
                    return res.status(404).json({
                        message: res.statusMessage,
                        status: 404
                    });
                }

                return res.status(200).json(posts);
            })
            .catch(err => { throw Error(err) });
});

app.post("/blog-posts", jsonParser, (req, res) => {
    let request = req.body
    let title = request.title;
    let content = request.content;
    let author = request.author;
    let publishDate = request.publishDate;

    if(!title || !content || !author || !publishDate) {
        res.statusMessage = "All fields must have a value";
        return res.status(406).json({
            message: res.statusMessage, 
            status: 406
        });
    }

    let id = uuid.v4();
    
    let postEntry = {id, title, content, author, publishDate};
    PostArray.post(postEntry)
            .then(post => 
                res.status(201).json(post))
            .catch(err => 
            { throw Error(err); 
            })
    
});

app.delete("/blog-posts/:id", (req, res) => {
    let deleteId = req.params.id;
    PostArray.delete(deleteId)
            .then(deleted => {
                if(deleted) {
                    return res.status(200).json({
                        message: "Post succesfully deleted",
                        status: 200
                    });
                }

                res.statusMessage = "This id does not exist";
                return res.status(404).json({
                    message: res.statusMessage,
                    status: 404
                });
            })
            .catch(err => { 
                throw Error(err) 
            });
});

app.put("/blog-posts/:id", jsonParser, (req, res) => {
    let paramId = req.params.id;
    let bodyId = req.body.id;
    let title = req.body.title;
    let content = req.body.content;
    let author = req.body.author;
    let publishDate = req.body.publishDate;

    if(!paramId) {
        res.statusMessage = "The id is required to update a post";
        return res.status(406).json({
            message: statusMessage, 
            status: 406
            });
    }

    if(paramId != bodyId) {
        res.statusMessage = "The id parameter and the body id are not the same";
        return res.status(409).json({
            message: res.statusMessage, 
            status: 409
            });
    }

    PostArray.updatePost(req.body)
            .then(newPost => {
                if(!newPost) {
                    res.statusMessage = "This id does not exist";
                    return res.status(404).json({
                        message: res.statusMessage,
                        status: 404
                    });
                }
                return res.status(202).json({
                    message: "Post succesfully updated",
                    status: 202
                });
            })
            .catch(err => { 
                throw Error(err)
            });
});

let server;

function runServer(PORT, databaseURL) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseURL, err => {
            if(err) {
                return reject(err);
            }
            else {
                server = app.listen(PORT, () => {
                    console.log(`App is running on port ${PORT}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    return reject(err);
                });
            }
        });
    });
}

function closeServer(){
    return mongoose.disconnect()
                   .then(() => {
                       return new Promise((resolve, reject) => {
                           server.close( err => {
                               if (err){
                                   return reject(err);
                               }
                               else{
                                   resolve();
                               }
                           });
                       });
                   });
}

runServer(PORT, DATABASE_URL)
    .catch(err => {
        console.log(err);
    });

module.exports = { app, runServer, closeServer };
