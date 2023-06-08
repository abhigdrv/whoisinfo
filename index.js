const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');
const axios = require('axios');
const xml2js = require('xml2js');
const chunkSize = 20;

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

app.get("/namecheapDashboard", (req, res) => {
    const data = {
        query: '',
        result: []
    };
    res.render('./namecheapDashboard', data);
});

app.post("/namecheapDashboard", async (req, res) => {
    let whoInfos = [];
    let searchTerm;
    let searchTermLength = 0;
    let searchTermArray = [];
    if(req.body.name.includes(",")){
        searchTerm = req.body.name;
        searchTermArray = req.body.name.split(',');
        searchTermLength = req.body.name.split(',').length;
    }else{
        searchTerm = req.body.name.split(' ').join(', ');
        searchTermArray = req.body.name.split(' ');
        searchTermLength = req.body.name.split(' ').length;
    }
    
    const chunkResult = chunkArray(searchTermArray, chunkSize);
    await chunkResult.forEach(async (chunk, index) => {

        let url = 'https://api.namecheap.com/xml.response?ApiUser=ramizmedia&ApiKey=381f6fc3d9da4f3a90addb35f95d6e73&UserName=ramizmedia&Command=namecheap.domains.check&ClientIp=172.19.128.1&DomainList='+chunk.join(', ');
        await axios.get(url).then(response => {
            xml2js.parseString(response.data, (error, result) => {
                if (error) {
                  console.error(error);
                } else {
                    if(result && result.ApiResponse && result.ApiResponse.CommandResponse && result.ApiResponse.CommandResponse[0].DomainCheckResult)
                    {
                        whoInfos.push(...result.ApiResponse.CommandResponse[0].DomainCheckResult)
                    }else{
                        whoInfos = []
                    }
                }
              });
        })
        .catch(error => {
            console.error(error);
        });
        console.log('Api called ', index)
        
    })

    

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

  function chunkArray(array, chunkSize) {
    const chunks = [];
    let index = 0;
  
    while (index < array.length) {
      chunks.push(array.slice(index, index + chunkSize));
      index += chunkSize;
    }
  
    return chunks;
  }


app.listen(port, function(err){
    if(err) console.log(err)
    console.log('listening', port)
});