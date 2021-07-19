const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

app = express();
app.use(express.static('build'));
app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());
const mongoDBURI = process.env.MONGODB_URI;

mongoose
  .connect(mongoDBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => console.log('Connected to mongoDB'));

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String
});

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Blog = mongoose.model('blog', blogSchema);

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.get('/', (req, res) => {
  res.redirect('/api/blogs');
});

app.get('/api/blogs', (req, res) => {
  Blog.find({})
    .then((data) => res.send(data))
    .catch(() => res.send({ error: 'Unable to get data from database' }));
});

app.get('/api/blogs/:id', (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  Blog.findById(id)
    .then((data) => res.send(data))
    .catch(() => next());
});

app.post('/api/blogs', (req, res) => {
  const blog = new Blog({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  });
  blog
    .save()
    .then(() => res.send(blog))
    .catch(() => res.send({ error: 'Unable to add a new blog' }));
});

app.delete('/api/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndRemove(id)
    .then(() => res.status(204).end())
    .catch((err) => console.log(err));
});

app.put('/api/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndUpdate(id, {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  })
    .then((updatedBlog) => res.send(updatedBlog))
    .catch((err) => console.log(err));
});

app.use(unknownEndpoint);

const PORT = 3080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
