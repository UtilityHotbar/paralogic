var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var whisper = require('whisper-node');
const formidable = require("formidable")
var fs = require('fs');
const tmp = require('tmp');
const OpenAI = require("openai");

const openai = new OpenAI();
tmp.setGracefulCleanup();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.post('/get_transcription', (req, res) => {
    console.log('Got a POST request')

    const form = new formidable.IncomingForm({'multiple': true});
    form.parse(req, (err, fields, files) => {
        console.log('fields: ', fields);
        console.log('files: ', files);
        var name = tmp.tmpNameSync({postfix: ".ogg"});
        fs.copyFileSync(files.file[0].filepath, name)
        openai.audio.transcriptions.create({
          file: fs.createReadStream(name),
          model: "whisper-1",
        }).then((out)=>{
          console.log('got output',out)
          res.send(out)

        });
    });

})

app.post('/get_chat_completion', (req, res) => {
    console.log('Incoming chat request', req.body)
    openai.chat.completions.create({model: 'gpt-4o', messages: req.body}).then(
      (completion)=>{
        console.log('Completion is',completion.choices[0].message.content)
        res.send(completion.choices[0].message.content)
      }
    )
})

module.exports = app;
