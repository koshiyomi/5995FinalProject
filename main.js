let mongoose = require('mongoose') // 引入 mongoose
let url = "mongodb://localhost:27017/mytest"; // 本地数据库地址
mongoose.connect(url, {useNewUrlParser: true})

// connect() 返回一个状态待定（pending）的连接，可以用来判断连接成功或失败
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Successful connection to "+url)
});




let express = require('express')()

express.get('/',function (request, response) {
    response.send("hello world!")
})


express.listen(3000)

express.set('views', './views'); // 添加视图路径
express.engine('html', require('ejs').renderFile); // 将EJS模板映射至".html"文件
express.set('view engine', 'html'); // 设置视图引擎

/*
 express.js: 配置引擎
*/
express.get('/view', function (request, response) {
    response.render('index')
})


// API Key: AIzaSyCSmjAzovVzgyFgD5CkIwOVi3UOKe7L9iA