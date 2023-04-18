const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const server = jsonServer.create();
const dbRouter = jsonServer.router('/tmp/db.json');
const cors = require('cors');
const fs = require('fs');
const middlewares = jsonServer.defaults({ noCors: true });

const SECRET_KEY = 'secret';

// allow other domain(port) to access
server.use(
  cors({
    origin: true,
    credentials: true,
    preflightContinue: false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
);
server.options('*', cors());

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);
// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.status(200).jsonp(req.query);
});

server.get('/reset', (req, res) => {
  fs.writeFile('/tmp/db.json', `{"users": []}`, function (err) {
    if (err) {
      console.log('writeFile failed: ' + err);
      res.jsonp({
        success: false,
      });
    } else {
      console.log('writeFile succeeded');
      res.jsonp({
        success: true,
      });
    }
  });
});

server.post('/api/v1/login', (req, res) => {
  let { username, password } = req.body;
  if (username == 'admin@gmail.com' && password == '123456') {
    let token = jwt.sign(
      {
        username,
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.jsonp({
      success: true,
      token,
      username,
    });
    return;
  }
  res.status(400).jsonp({
    success: false,
    message: 'Username or password is incorrect!',
  });
});

// middleware check authentication
server.use((req, res, next) => {
  let data = req.headers.authorization && req.headers.authorization.split(' ');
  if (data && data.length === 2) {
    let token = data[1];
    console.log('token', token);
    try {
      var decoded = jwt.verify(token, SECRET_KEY);
      if (decoded.username) {
        next();
      } else {
        res.sendStatus(401);
      }
    } catch {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
});

// check /tmp/db.json existed
server.use((req, res, next) => {
  try {
    const data = fs.readFileSync('/tmp/db.json', 'utf8');
    const objs = JSON.parse(data);
    if (!objs.users) {
      throw Error('something wrong on db.json, throw error to create!');
    }
    next();
  } catch (err) {
    fs.writeFile('/tmp/db.json', `{"users": []}`, (err) => {
      if (err) {
        console.log('writeFile failed: ' + err);
      } else {
        console.log('writeFile succeeded');
      }
      next();
    });
  }
});

server.get('/api/v1/account/detail', (req, res) => {
  let data = req.headers.authorization && req.headers.authorization.split(' ');
  if (data && data.length === 2) {
    let token = data[1];
    try {
      var decoded = jwt.verify(token, SECRET_KEY);
      if (decoded.username) {
        res.jsonp({
          username: 'admin',
          active: true,
          role: 'ADMIN',
          email: decoded.username,
        });
      } else {
        res.sendStatus(401);
      }
    } catch {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
});

server.use(
  jsonServer.rewriter({
    '/api/v1/*': '/$1',
  })
);
// Use default router
server.use(dbRouter);
// server.use('/*', (req, res, next) => {
//   res.jsonb({ message: 'not found!' });
//   next();
// });
const port = 8000;
server.listen(port, () => {
  console.log('JSON Server is running at: ' + port);
});
