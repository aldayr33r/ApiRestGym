const express= require("express");
const app=express();
const morgan=require("morgan");
const port=3500;
const rutas = require('./routes/gym_router')
const cors = require('cors')
require('dotenv').config();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);


app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.use(cors());

app.use(morgan('dev'))
app.use(session({
	key: 'session_cookie_name',
	secret: '123456',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));
const options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'session_test'
};
const sessionStore = new MySQLStore(options);
// Optionally use onReady() to get a promise that resolves when store is ready.
/* 	sessionStore.onReady().then(() => {
		// MySQL session store ready for use.
		console.log('MySQLStore ready');
	}).catch(error => {
		// Something went wrong.
		console.error(error);
	});  */
app.use(rutas)

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
