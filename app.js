'use strict';
//require modules
const koa = require('koa');
const Router = require('koa-router');
const db = require('mongoose');
const http2 = require('http2');
const fs = require('fs');
const logger = require('koa-logger');
const morgan = require('koa-morgan');
const serve = require('koa-static');
//create Object
const app = module.exports = new koa();
const router = new Router();
//config
const serverOption = {
    key : fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};
const accessLogStream = fs.createWriteStream(__dirname + '/access.log',
    { flags: 'a' });
db.Promise = global.Promise;
//use middleware\
db.connect("mongodb://localhost:27017/mail")
    .then(() => {
        console.log('connect success');
    })
    .catch(err=>{
        console.error(err);
    });

app.use(serve(__dirname+"/public"));
app.use(logger());
app.use(render);
app.use(morgan('dev',{stream : accessLogStream}));
//handle 404
app.use(async(ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            ctx.throw(404)
        }
    } catch (err) {
        ctx.status = err.status || 500;
        if (ctx.status === 404) {
            //Your 404.view
            await ctx.render('404.html')
        } else {
            //other_error view
            await ctx.render('other_error')
        }
    }
});
//route
router.get('/',(ctx) =>{
    ctx.render('index.html');
});

app.use(router.routes());
app.use(router.allowedMethods());

const server = http2.createSecureServer(serverOption,app.callback());
server.listen(3000);
