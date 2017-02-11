const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Post} = require('./models');

const app = express();
app.use(boderParser.json());

app.get('/blog-posts', (req, res) => {
    Restaurant
        .find()
        .limit(10)
        .exec()
        .then(posts=> {
            res.json({
                posts: posts.map(
                    (post) => post.apiRep())
            });
        })
        .catch(
            err => {
                console.error(err);
                res.status(500).json({message: 'Internal Server Error'});
            });
});

app.get('/blog-posts/:id', (req, res) => {
    Restaurant
        .findById(req.params.id)
        .exec()
        .then(post => res.json(post.apiRep()))
        .catch(err => {
            console.err(err);
            res.status(500).json({message: 'Internal Server Error'});
        });
});

app.post('/blog-posts', (req, res) => {

    const requiredFields = ['title', 'content', 'author'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Post
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author
        })
        .then(
            post => res.status(201).json(post.apiRep())
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal Server Error'});
        });
});

app.put('/blog-posts/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id (${req.params.id} and request body id` +
            `(${req.body.id}) must match`);
        console.error(mesage);
        res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updatableFields = ['title', 'content', 'author'];

    updatableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Post
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .exec()
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

app.delete('/blog-posts/:id', (req, res) => {
    Post
        .findByIdAndDelete(req.params.id)
        .exec()
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

app.use('*', (req, res) => {
    res.status(404).json({message: 'Not Found'});
});

let server;

function runServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        server = app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve(server);
        })
        .on('error', err => {
            reject(err);
        });
    });
}

function closeServer() {
    return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
