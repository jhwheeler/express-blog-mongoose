const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, closeServer, runServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Blog Posts', function() {
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should list posts on GET', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('array');
                res.body.length.should.be.at.least(1);
                const expectedKeys = ['title', 'content', 'author', 'publishDate'];
                res.body.forEach(function(item) {
                    item.should.be.an('object');
                    item.should.include.keys(expectedKeys);
                });
            });
    });

    it('should add a post on POST', function() {
        const newPost = {title: 'Latest news', content: 'Breaking news: Node.js is epic. Try it out.', author: 'Alacritas', publishDate: Date.now()};
        return chai.request(app)
            .post('/blog-posts')
            .send(newPost)
            .then(function(res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.an('object');
                res.body.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
                res.body.id.should.not.be.null;
                res.body.should.deep.equal(Object.assign(newPost, {id: res.body.id}));
            });
    });
    it('should update posts on PUT', function() {
        const updateData = {
            title: 'Hello, Worlds!',
            content: 'Life is truly simple. 1, 2, 3, 4 - you\'re done!',
            author: 'Alacritas'
        };

        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                updateData.id = res.body[0].id;
                return chai.request(app)
                    .put(`/blog-posts/${updateData.id}`)
                    .send(updateData)
            })
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('object');
                res.body.should.deep.equal(updateData);
            });
    });
    it('should delete posts on DELETE', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                return chai.request(app)
                    .delete(`/blog-posts/${res.body[0].id}`);
            })
            .then(function(res) {
                res.should.have.status(204);
            });
    });
});
