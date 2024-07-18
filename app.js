const express= require("express");
const app=express();
const morgan=require("morgan");
const port=3500
const cors = require('cors')
require('dotenv').config();

app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.use(cors());

app.use(morgan('dev'))


app.get("/", (req,res)=>{
    res.json({mensage:"Welcome to my server"})
}
)

app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
