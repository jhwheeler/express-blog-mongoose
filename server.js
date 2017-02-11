const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Post} = require('./models');

const app = express();
app.use(boderParser.json());

app.get('/restaurants', (req, res) => {
    Restaurant
        .find()
        .limit(10)
        .exec()
        .then(restaurants => {
            res.json({
                restaurants: restaurants.map(
                    (restaurant) => restaurant.apiRep())
            });
        })
        .catch(
            err => {
                console.error(err);
                res.status(500).json({message: 'Internal Server Error'});
            });
});

app.get('/restaurants/:id', (req, res) => {
    Restaurant
        .findById(req.params.id)
        .exec()
        .then(restaurant => res.json(restaurant.apiRep()))
        .catch(err => {
            console.err(err);
            res.status(500).json({message: 'Internal Server Error'});
        });
});

app.post('/restaurants', (req, res) => {

    const requiredFields = ['title', 'content', 'author'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    Restaurant
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author
        })
        .then(
            restaurant => res.status(201).json(restaurant.apiRep())
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal Server Error'});
        });
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
