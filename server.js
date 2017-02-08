const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('bodyparser');

const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();

const app = express();

app.use(morgan('common'));

BlogPosts.create(
        'Hello, World!',
        'Life is simple. Want something? Here\'s how to get it: 1. Imagine 2. Research 3. Analyze 4. Act',
        'Alacritas');

app.get('/blog-posts', (req, res) => {
    res.json(BlogPosts.get());
});

app.post('/blog-posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author', 'publishDate'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    const blogPost = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
    res.status(201).json(blogPost);
});

app.put('/blog-posts/:id', (req, res) => {
    const requiredFields = ['title', 'content', 'author', 'publishDate'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    if (req.params.id !== req.body.id) {
        const message = (
            `Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`);
        console.error(message);
        return res.status(400).send(message);
    }
    console.log(`Updating blog post \`${req.body.id}\``);
    const updatedPost = BlogPost.update({
        id: req.params.id,
        title: req.params.title,
        content: req.params.content,
        author: req.params.author,
        publishDate: req.params.publishDate
    });
    req.status(204).json(updatedPost);
});

app.delete('/blog-posts/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    console.log(`Deleted post \`${req.params.id}\` from blog`);
    req.status(204).end();
});

app.listen(process.env.PORT || 8080, () => {
    console.log(`The app is listening on port ${process.env.PORT || 8080}`);
});
