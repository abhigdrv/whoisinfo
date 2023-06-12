const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');

const whois = require('whois-json');
const domain = 'abhishekvishwakarma.com';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors())
app.set('view engine', 'ejs');

app.get("/merged", (req, res) => {
    const data = {
        query: '',
        result: []
    };
    res.render('./merged', data);
});

app.post("/merged", async (req, res) => {
    let whoInfos;
    if(req.body && req.body.name){
        let domains = req.body.name.split(',');
        const results = await Promise.all(domains.map(domain => whois(domain)));
        whoInfos = results;
    }    
    const data = {
        query: req.body?.name || '',
        domains:req.body?.name.split(','),
        result: whoInfos
    };
    res.render('./merged', data);
});

app.get("/namecheap", (req, res) => {
    const data = {
        query: '',
        result: []
    };
    res.render('./namecheap', data);
});

app.get("/", (req, res) => {
    const data = {
        query: '',
        result: []
    };
    res.render('./dashboard', data);
});

app.get("/report", (req, res) => {
    fs.readFile('finalFourCharDomainList.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }    
        const jsonData = JSON.parse(data);
        const fData = {
            query: '',
            result: jsonData.slice(0, 5000)
        };
        res.render('./report', fData);
    });
});

app.get('/api/report', (req, res) => {
    fs.readFile('finalFourCharDomainList.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }    
        let jsonData = JSON.parse(data);
        if(req.query.available == 1) jsonData = jsonData.filter(val => val.Available == 'available')
        const page = parseInt(req.query.page) || 1;
        const perPage = 100;
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedData = jsonData.slice(startIndex, endIndex);
        res.json(paginatedData);
    });
  });

app.get("/namecheapDashboard", (req, res) => {
    const data = {
        query: '',
        result: []
    };
    res.render('./namecheapDashboard', data);
});

app.post("/namecheapDashboard", async (req, res) => {
    let whoInfos;
    let searchTerm;
    if(req.body.name.includes(",")){
        searchTerm = req.body.name;
    }else{
        searchTerm = req.body.name.split(' ').join(', ');
    }
    let url = 'https://api.namecheap.com/xml.response?ApiUser=ramizmedia&ApiKey=381f6fc3d9da4f3a90addb35f95d6e73&UserName=ramizmedia&Command=namecheap.domains.check&ClientIp=172.19.128.1&DomainList='+searchTerm;
    await axios.get(url).then(response => {
        xml2js.parseString(response.data, (error, result) => {
            if (error) {
              console.error(error);
            } else {
                if(result && result.ApiResponse && result.ApiResponse.CommandResponse && result.ApiResponse.CommandResponse[0].DomainCheckResult)
                {
                    whoInfos = result.ApiResponse.CommandResponse[0].DomainCheckResult
                }else{
                    whoInfos = []
                }
            }
          });
    })
    .catch(error => {
        console.error(error);
    });
    const data = {
        result:whoInfos
    }
    res.render('./namecheapDashboard', data);
});

app.post("/", async (req, res) => {
    let whoInfos;
    if(req.body && req.body.name){
        let domains = req.body.name.split(',');
        const results = await Promise.all(domains.map(domain => whois(domain)));
        whoInfos = results;
    }    
    const data = {
        query: req.body?.name || '',
        domains:req.body?.name.split(','),
        result: whoInfos
    };
    res.render('./dashboard', data);
});

app.post("/namecheap", async (req, res) => {
    let whoInfos;
    let searchTerm;
    if(req.body.name.includes(",")){
        searchTerm = req.body.name;
    }else{
        searchTerm = req.body.name.split(' ').join(', ');
    }
    let url = 'https://api.namecheap.com/xml.response?ApiUser=ramizmedia&ApiKey=381f6fc3d9da4f3a90addb35f95d6e73&UserName=ramizmedia&Command=namecheap.domains.check&ClientIp=172.19.128.1&DomainList='+searchTerm;
    await axios.get(url).then(response => {
        xml2js.parseString(response.data, (error, result) => {
            if (error) {
              console.error(error);
            } else {
                if(result && result.ApiResponse && result.ApiResponse.CommandResponse && result.ApiResponse.CommandResponse[0].DomainCheckResult)
                {
                    whoInfos = result.ApiResponse.CommandResponse[0].DomainCheckResult
                }else{
                    whoInfos = []
                }
            }
          });
    })
    .catch(error => {
        console.error(error);
    });
    const data = {
        result:whoInfos
    }
    res.render('./namecheap', data);
});

app.post("/response", async (req, res) => {
    let whoInfos;
    if(req.body && req.body.name){
        let domains = req.body.name.split(',');
        const results = await Promise.all(domains.map(domain => whois(domain)));
        whoInfos = results;
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