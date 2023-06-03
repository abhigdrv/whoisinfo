const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const whois = require('whois-json');
const domain = 'abhishekvishwakarma.com';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors())
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    const data = {
        query: '',
        result: []
    };
    res.render('./merged', data);
});

app.post("/", async (req, res) => {
    let whoInfos;
    if(req.body && req.body.name){
        let domains = req.body.name.split(',');
        const results = await Promise.all(domains.map(domain => whois(domain)));
        whoInfos = results;
        console.log(results, 'finalResults');
    }    
    const data = {
        query: req.body?.name || '',
        domains:req.body?.name.split(','),
        result: whoInfos
    };
    res.render('./merged', data);
});

app.post("/response", async (req, res) => {
    let whoInfos;
    if(req.body && req.body.name){
        let domains = req.body.name.split(',');
        const results = await Promise.all(domains.map(domain => whois(domain)));
        whoInfos = results;
        console.log(results, 'finalResults');
    }    
    const data = {
        query: req.body?.name || '',
        domains:req.body?.name.split(','),
        result: whoInfos
    };
    res.render('./response', data);
});

app.post('/whois', async (req, res) => {
    try {
      const domains = req.body.domains;
      const results = await Promise.all(domains.map(domain => whois(domain)));
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  });


app.listen(port, function(err){
    if(err) console.log(err)
    console.log('listening', port)
});