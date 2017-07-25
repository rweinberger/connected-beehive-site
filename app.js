var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sse = sse = require('./sse')

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
var exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', 'hbs');

// sse
var connections = []
  , nums = {mostRecent: 0, visible: []}

app.use(sse)

app.get('/push', function(req, res) {
  num = req.query.num;
  console.log('NUMBER IS '+num);
  nums.mostRecent = num;
  nums.visible.push(num);
  if(nums.visible.length > 10){
    nums.visible.shift();
  };
  connections[0].sseSend(nums);
  // for(var i = 0; i < connections.length; i++) {
  //   connections[i].sseSend(nums)
  // }
  res.sendStatus(200)
})

app.get('/stream', function(req, res) {
  res.sseSetup()
  res.sseSend(nums)
  connections.push(res)
})

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;