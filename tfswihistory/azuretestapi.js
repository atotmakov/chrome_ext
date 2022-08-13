const express = require("express");

const app = express();

app.use(express.json());

app.get("/get_wi_icon", (req, res) => {
  return res.status(200).json({ icon: { url: 'get_wi_icon_url' } });
});

//app.get('/user/:id', (req, res) => {
//  res.send(`user ${req.params.id}`)
//})

app.get("/get_wi/_apis/wit/workitems/1", (req, res) => {
  let result = { id : 1,
                 fields: { 'System.WorkItemType': 'witype' }, 
                 relations: {},
                  _links: { 'workItemType': { href: `${req.protocol}://${req.hostname}:${req.client.localPort}/get_wi_icon` }, 'html': { href: 'htmllink' } } };
  return res.status(200).json(result);
});

module.exports = app;