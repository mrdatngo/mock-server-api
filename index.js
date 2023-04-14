const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const server = jsonServer.create();
const dbRouter = jsonServer.router('tmp/db.json');
const cors = require('cors');
const { json } = require('body-parser');
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

server.post('/api/v1/login', (req, res) => {
  let { username, password } = req.body;
  console.log('login param', username, password, req.body);
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
  console.log('here', req.headers.authorization);
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

// Use default router
server.use('/api/v1', dbRouter);
// server.use('/*', (req, res, next) => {
//   res.jsonb({ message: 'not found!' });
//   next();
// });
const port = 8000;
server.listen(port, () => {
  console.log('JSON Server is running at: ' + port);
});
