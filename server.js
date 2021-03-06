const express = require('express');
const cors = require('cors');
const db = require('./data/dbConfig.js');

const posts = require('./data/helpers/postDb.js')
const users = require('./data/helpers/userDb.js')
const tags = require('./data/helpers/tagDb.js')

const port = 5555;
const server = express();
server.use(express.json());
server.use(cors({ origin: 'http://localhost:3000' }));

const sendUserError = (status, message, res) => {
    res.status(status).json({ errorMessage: message });
    return;
}

server.get('/', (req, res) => {
    res.send("Hello from express!");
})

const tagUpperCase = (req, res, next) => {
    tags
        .get()
        .then(tag => {
            tag.map((tag, i) => {
                tag.tag.toUpperCase();
            })
        })
    next();
}

// USERS
server.get('/api/users', (req, res) => {
    users
        .get()
        .then(user => {
            // console.log(user);
            if(!user){
                sendUserError(404, 'The user with specified id does not exist', res)
            } else{
                res.json(user);
            }
        })
        .catch(err => {
            sendUserError(500, 'There was an error retrieving the users', res)
        })
})

server.get('/api/users/:id', (req, res) => {
    users
        .get(req.params.id)
        .then(user => {
            console.log(user);
            if(!user){
                sendUserError(404, 'The user with specified id does not exist', res)
            } else{
                res.json(user);
            }
        })
        .catch(err => {
            sendUserError(500, 'There was an error retrieving the user', res)
        })
})

server.get('/api/users/:id/posts', (req, res) => {
    users
        .getUserPosts(req.params.id)
        .then(user => {
            console.log(user);
            if(!user){
                sendUserError(404, 'The users posts with specified id do not exist', res)
            } else{
                res.json(user);
            }
        })
        .catch(err => {
            sendUserError(500, 'There was an error retrieving the users posts', res)
        })
})

server.post('/api/users', (req, res) => {
    const { name } = req.body;
    if(!name){
        sendUserError(400, "Please provide a name for the user", res);
    }
    users
        .insert({ name })
        .then(user => {
            res.json(user)
        })
        .catch(err => {
            sendUserError(500, 'There was an error posting the user', res)
        })
})

server.put('/api/users/:id', (req, res) => {
    const { name } = req.body;
    if(!name){
        sendUserError(400, "Please provide a name for the user", res);
    }
    users
        .update(req.params.id, {name})
        .then(user => {
            if(user === 0){
                sendUserError(404, "The user with the specified ID does not exist.", res)
            } else{
                res.json(user);
            }
        })
        .catch(err => {
            sendUserError(500, "The user information could not be modified.", res)
        })
})

server.delete('/api/users/:id', (req, res) => {
    users
        .remove(req.params.id)
        .then(user => {
            if(user === 0){
                sendUserError(404, 'The user with specified id does not exist', res);
            } else {
                res.json({ success: `User with id ${req.params.id} has been removed from system`});
            }
        })
        .catch(err => {
            sendUserError(500, "The user could not be removed", res)
        })
})

//POSTS
server.get('/api/posts', (req, res) => {
    posts
        .get()
        .then(post => {
            // console.log(post);
            res.json({ post });
        })
        .catch(err => {
            sendUserError(500, 'There was an error retrieving the posts', res)
        })
})

server.get('/api/posts/:id', (req, res) => {
    posts   
        .get(req.params.id)
        .then(post => {
            // console.log(post);
            if(!post){
                sendUserError(404, 'The post with specified id does not exist', res)
            } else{
                res.json({ post });
            }
        })
        .catch(err => {
            sendUserError(500, 'There was an error retrieving the post', res)
        })
})

server.get('/api/posts/:id/tags', (req, res) => {
    posts
        .getPostTags(req.params.id)
        .then(post => {
            // console.log(post);
            if(post.length === 0){
                sendUserError(404, 'This post does not contain any tags', res)
            } else{
                res.json(post);
            }
        })
        .catch(err => {
            sendUserError(500, 'There was an error retrieving the posts tags', res)
        })
})

server.post('/api/posts', (req, res) => {
    const { text, userId } = req.body;
    if(!text || !userId){
        sendUserError(400, "Please provide text and a userId for the post", res);
    }
    posts
        .insert({ text, userId })
        .then(post => {
            res.json(post)
        })
        .catch(err => {
            sendUserError(500, 'There was an error creating the post', res)
        })
})

server.put('/api/posts/:id', (req, res) => {
    const { text, userId } = req.body;
    if(!text || !userId){
        sendUserError(400, "Please provide text and a userId for the post", res);
    }
    posts
        .update(req.params.id, {text, userId})
        .then(post => {
            if(post === 0){
                sendUserError(404, "The post with the specified ID does not exist.", res)
            } else{
                res.json(post);
            }
        })
        .catch(err => {
            sendUserError(500, "The post information could not be modified.", res)
        })
})

server.delete('/api/posts/:id', (req, res) => {
    posts
        .remove(req.params.id)
        .then(post => {
            if(post === 0){
                sendUserError(404, 'The post with specified id does not exist', res);
            } else {
                res.json({ success: `Post with id ${req.params.id} has been removed from system`});
            }
        })
        .catch(err => {
            sendUserError(500, "The post could not be removed", res)
        })
})

//TAGS
server.get('/api/tags', tagUpperCase, (req, res) => {
    tags
        .get()
        .then(tag => {
            // console.log(tag);
            res.json({ tag });
        })
})

server.get('/api/tags/:id', tagUpperCase, (req, res) => {
    tags   
        .get(req.params.id)
        .then(tag => {
            // console.log(tag);
            if(!tag){
                sendUserError(404, 'The tag with specified id does not exist', res)
            } else{
                res.json({ tag });
            }
        })
        .catch(err => {
            sendUserError(500, 'There was an error retrieving the tag', res)
        })
})

server.post('/api/tags', tagUpperCase, (req, res) => {
    const { tag } = req.body;
    if(!tag){
        sendUserError(400, "Please provide a tag for the post", res);
    }
    tags
        .insert({ tag })
        .then(tag => {
            res.json(tag)
        })
        .catch(err => {
            sendUserError(500, 'There was an error creating the tag', res)
        })
})

server.put('/api/tags/:id', tagUpperCase, (req, res) => {
    const { tag } = req.body;
    if(!tag){
        sendUserError(400, "Please provide a tag for the post", res);
    }
    tags
        .update(req.params.id, {tag})
        .then(tag => {
            if(tag === 0){
                sendUserError(404, "The tag with the specified ID does not exist.", res)
            } else{
                res.json(tag);
            }
        })
        .catch(err => {
            sendUserError(500, "The tag information could not be modified.", res)
        })
})

server.delete('/api/tags/:id', tagUpperCase, (req, res) => {
    tags
        .remove(req.params.id)
        .then(tag => {
            if(tag === 0){
                sendUserError(404, 'The tag with specified id does not exist', res);
            } else {
                res.json({ success: `Tag with id ${req.params.id} has been removed from system`});
            }
        })
        .catch(err => {
            sendUserError(500, "The tag could not be removed", res)
        })
})

server.listen(port, () => console.log(`Server is running on port ${port}`));