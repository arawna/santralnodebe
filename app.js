const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require("http");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

const server = http.createServer(app);
const io = require("socket.io")(server , { cors: { origin: "*" }});

io.on("connection", (socket) => {
    console.log("Bağlandı: " + socket.id);
    socket.on("joinRoom", (roomName) => {
        io.sockets.adapter.sids.get(socket.id).forEach((room) => {
            if(room != socket.id){
                socket.leave(room);
            }
        })
        socket.join(roomName);
        console.log(`Odaya katıldı: ${socket.id} - ${roomName}`);
        console.log(`Oldugum Odaler: ${socket.id} - ${io.sockets.adapter.sids.get(socket.id).size}`);
    })

    socket.on("sendMessage", (data) => {
        io.to(data.room).emit("receiveMessage", data);
        console.log(data);
    })
});


app.post("/agentCallDetail",(req,res) => {
    let {agentDid,callerNumber,callerName,tc,note} = req.body;
    console.log(req.body)
    io.to(agentDid).emit("receiveMessage", {agentDid,callerNumber,callerName,tc,note});
    res.json({isSuccess:true})
})


server.listen(process.env.PORT || 3005, () => console.log(`Server started on port ${process.env.PORT || 3005}`));
