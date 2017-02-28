const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {Post} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
    console.info('seeding blog post data');
    const seedData = [];

    for (let i=1; i<=10; i++) {
        seedData.push(generateBlogData());
    }
    return Post.insertMany(seedData);
}

function generateBlogData() {
    return {
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        },
        title: faker.lorem.words(),
        content: faker.lorem.paragraphs(),
        created: Date.now()
    }
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Posts API Resource', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedBlogData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    })

    describe('GET endpoint', function() {

        it ('should return all existing posts', function() {
            let res;
            return chai.request(app)
                .get('/blog-posts')
                .then(function(_res) {
                    res = _res;
                    console.log(res.body);
                    res.should.have.status(200);
                    res.body.posts.should.have.length.of.at.least(1);
                    return Post.count();
                })
            .then(function(count) {
                res.body.posts.should.have.length.of(count);
            });
        });

        it('should return posts with right field', function() {
            let resPost;
            return chai.request(app)
                .get('/blog-posts')
                .then(function(res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.posts.should.be.an('array');
                    res.body.posts.should.have.length.of.at.least(1);

                    res.body.posts.forEach(function(post) {
                        post.should.be.an('object');
                        post.should.include.keys(
                            'id', 'author', 'title', 'content');
                    });
                    resPost = res.body.posts[0];
                    return Post.findById(resPost.id);
                })
                .then(function (post) {
                    resPost.id.should.equal(post.id);
                    resPost.author.should.equal(post.apiRep().author);
                    resPost.title.should.equal(post.title);
                    resPost.content.should.equal(post.content);
                });
        });
    });

    describe('POST endpoint', function() {
        it('should add a new post', function() {

            const newPost = generateBlogData();

            return chai.request(app)
                .post('/blog-posts')
                .send(newPost)
                .then(function(res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.an('object');
                    res.body.should.include.keys(
                        'id', 'title', 'author', 'content');
                    res.body.title.should.equal(newPost.title);
                    res.body.id.should.not.be.null;
                    res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
                    res.body.content.should.equal(newPost.content);

                    return Post.findById(res.body.id);
                })
                .then(function(post) {
                    post.title.should.equal(newPost.title);
                    post.author.firstName.should.equal(newPost.author.firstName);
                    post.author.lastName.should.equal(newPost.author.lastName);
                    post.content.should.equal(newPost.content);
                });
        });
    });

    describe('PUT endpoint', function() {
        it('should update fields you send', function() {
            const updateData = {
                title: 'The best post ever',
                content: 'Lorem ipsum blipsum fipsum.'
            };

            return Post
                .findOne()
                .exec()
                .then(function(post) {
                    updateData.id = post.id;

                    return chai.request(app)
                        .put(`/blog-posts/${post.id}`)
                        .send(updateData);
                })
                .then(function(res) {
                    res.should.have.status(201);

                    return Post.findById(updateData.id).exec();
                })
                .then(function(post) {
                    post.title.should.equal(updateData.title);
                    post.content.should.equal(updateData.content);
                });
        });
    });

    describe('DELETE endpoint', function() {
        it('should delete post by id', function() {
            let post;

            return Post
                .findOne()
                .exec()
                .then(function(_post) {
                    post = _post;
                    return chai.request(app).delete(`/blog-posts/${post.id}`);
                })
                .then(function(res) {
                    res.should.have.status(204);
                    return Post.findById(post.id).exec();
                })
                .then(function(_post) {
                    should.not.exist(_post)
                });
        });
    });
});
