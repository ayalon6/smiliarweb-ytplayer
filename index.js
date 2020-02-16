const Joi = require('joi');
const uuid = require('uuid-random');
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors')
const url = require("url");
const fetchVideoInfo = require('youtube-info');



app.use(express.json());
app.use(express.static('client/build'));
app.use(cors());

let playlist = [];

app.get('/api/playlist', (req, res) => {
    res.send(playlist);
})

app.post('/api/playlist/', (req, res) => {

    const { error } = validatePlaylist(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    let clipExsits = playlist.find(c => c.url == req.body.url);
    let vid = url.parse(req.body.url).query.split('v=')

    if (!clipExsits && vid[1]) {
        fetchVideoInfo(vid[1], (err, vidInfo) => {
            if (err) throw new Error(err);
            const clip = { id: vid[1], ...req.body, ...vidInfo };
            playlist.push(clip);
            res.send(playlist)
        })

    }
})

app.delete('/api/playlist/:id', (req, res) => {
    const id = req.params.id;
    let clip = playlist.find(c => c.id == id);
    if (!clip) {
        res.status(404).send('Invalid id');
    }
    playlist = playlist.filter(clip => {
        if (clip.id != id)
            return clip
    });

    res.send(playlist);
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'))
});

const port = process.env.PORT || 6969;
app.listen(port, () => { console.log('listening on ', port) });

function validatePlaylist(data) {

    const schema = {
        url: Joi.string().uri().required(),
    }
    return Joi.validate(data, schema);

}