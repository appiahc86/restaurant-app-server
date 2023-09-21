const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const runMigration = require("./models/index");
const runTriggers = require("./models/triggers/index");
const db = require("./config/db");
const uploader = require("express-fileupload");
const logger = require("./winston");
const transactionJob = require("./cron");
const axios = require("axios");

app.use(express.json());
app.use(cors());


// express-fileupload middleware
app.use(
    uploader({
        useTempFiles: true,
        limits: { fileSize: 10000000 }
    })
);


//Run cron jobs
transactionJob.start();

//Set TimeZone
process.env.TZ = 'Europe/Berlin';


    //Create database tables
(async () => {
    // await db.raw(`SET time_zone = 'UTC';`);
    await db.raw("SET FOREIGN_KEY_CHECKS=0");
    await runMigration();
    // await runTriggers();
    await db.raw("SET FOREIGN_KEY_CHECKS=1");
})()

const port = process.env.port || 3000;

//Socket instance
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
});


//Socket.io Connection
io.on('connection', (socket) => {

    //Send number of users online to client users
    io.to("admin-users").emit('onlineUsers', socket.adapter.sids.size)

    socket.on("join-admin-users", (args) => {
        socket.join('admin-users');
        io.to("admin-users").emit('onlineUsers', socket.adapter.sids.size)
    })

    //disconnect
    socket.on('disconnect', () => {
        io.to("admin-users").emit('onlineUsers', socket.adapter.sids.size);
    })

})

//Add io instance to each request
app.use((req, res, next) => {
    req.io = io;
    next();
})


//Load routes
const userIndexRouter = require("./client/routes/users/index");
const userAuthRouter = require("./client/routes/users/auth/userAuthRoutes");
const menuRouter = require("./client/routes/menu/menuRouter");
const menuItemsRouter = require("./client/routes/menuItems/menuItemsRouter");
const ordersRouter = require("./client/routes/orders/ordersRouter");


//Use Routes
app.use("/users", userIndexRouter);
app.use("/users/auth", userAuthRouter);
app.use("/menu", menuRouter);
app.use("/menuItems", menuItemsRouter);
app.use("/orders", ordersRouter);


//Load Admin routes
const adminIndexRouter = require("./admin/routes/indexRouter")
const adminMenuRouter = require('./admin/routes/menu/menuRouter');
const adminMenuItemsRouter = require("./admin/routes/menuItems/menuItemsRouter");
const adminOrdersRouter = require("./admin/routes/orders/ordersRouter")
const {log} = require("winston");


//Use Admin routes
app.use("/admin", adminIndexRouter);
app.use("/admin/menu", adminMenuRouter);
app.use("/admin/menuItems", adminMenuItemsRouter);
app.use("/admin/orders", adminOrdersRouter);

app.use(express.static('public'));

//404 handler
app.use((req, res, next) => {
    res.status(400).send('404');
})


//Handle errors
app.use((err, req, res, next) => {

    logger.error(err.message, err);
    res.status(400).send('Sorry, Entschuldigung, etwas ist schief gelaufen');

});


if (process.env.NODE_ENV !== 'production'){
    server.listen(port, async () => {
        logger.info(`server running on port ${port}`);
    })
}else server.listen();