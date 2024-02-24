
const express = require('express')
const app = express();
const cors = require ("cors")
app.use(cors());
app.use(express.json());
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended:false}))



const rotaUsuario = require("./routes/rotaUsuario");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}))

app.use((req,res,next)=>{
 res.header("Access-Control-Allow-Origin","*");

 res.header(
 "Access-Control-Allow-Headers",
 "Origin,X-Requested-with, Content-Type, Accept,Autorization"

 );
 if(req.method === "OPTIONS"){
    res.header("Access-Control-Allow-Methods","PUT,PATCH,DELETE, GET")
    return res.status(200).send({});
 }
 next();
})

app.use("/usuario",rotaUsuario);
app.use((req, res, next)=>{
     const erro = new Error("não encontrado");
     erro.status(404);
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    return res.json({
        erro:{
            mensagem:error.menssage
        }
    })
})
module.exports = app