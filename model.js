let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let postSchema = mongoose.Schema({
    id: {type: String, require: true},
    title: {type: String, require: true},
    content: {type: String},
    author: {type: String, require: true},
    publishDate: {type: Date}
});

let Posts = mongoose.model('blog-posts-model', postSchema);

let PostArray = {
    getAllPosts: async function() {
        return Posts.find()
                    .then(posts => posts)
                    .catch(err => { throw Error(err) });
    },
    getPostsByAuthor: async function(name) {
        return Posts.find({author: name})
                    .then(posts => posts)
                    .catch(err => { throw Error(err) });
    },
    post: async function(post) {
        return Posts.create(post)
                    .then(newPost => newPost)
                    .catch(err => { throw Error(err) });
    },
    delete: async function(id) {
        return Posts.findOneAndDelete({id: id})
                    .then(deleted => deleted)
                    .catch(err => { throw Error(err) });
    },
    updatePost: async function(newPost) {
        return Posts.findOneAndUpdate({id: newPost.id}, {$set: newPost})
                    .then(post => post)
                    .catch(err => { throw Error(err) });
    }
};

module.exports = {PostArray};