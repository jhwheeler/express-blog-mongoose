const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('common'));

const postsRouter = require('./postsRouter');

app.use('/blog-posts', postsRouter);

app.listen(process.env.PORT || 8080, () => {
    console.log(`The app is listening on port ${process.env.PORT || 8080}`);
});
