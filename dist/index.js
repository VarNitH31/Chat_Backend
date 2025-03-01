"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const PORT = process.env.PORT || 8080;
//@ts-ignore
const wss = new ws_1.WebSocketServer({ port: PORT });
let userCount = 0;
let allSockets = [];
wss.on("connection", (socket) => {
    userCount = userCount + 1;
    console.log(`user connected  #${userCount} `);
    socket.on("message", (message) => {
        // console.log("message recieved "+message.toString()+" from user");
        // // socket.send(`${message.toString()} sent from the server `)
        // allSockets.forEach((s)=>{
        //     s.send(message.toString()+":sent from the server")
        // })
        //@ts-ignore
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "join") {
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId,
                userName: parsedMessage.payload.userName
            });
            console.log(`${parsedMessage.payload.roomId}`);
            let currentUserRoom = parsedMessage.payload.roomId;
            for (let i = 0; i < allSockets.length; i++) {
                if (currentUserRoom == allSockets[i].room) {
                    // if(parsedMessage.payload.userName==allSockets[i].userName){
                    //     socket.send(JSON.stringify({
                    //         type:"error",
                    //         message:"dupplicate username"
                    //     }))
                    //     socket.close();
                    //     return;
                    // }
                    allSockets[i].socket.send(JSON.stringify({
                        type: "joined",
                        userName: parsedMessage.payload.userName
                    }));
                }
            }
        }
        if (parsedMessage.type === "chat") {
            // const currentUSerRoom=allSockets.find((x)=>x.socket == socket).room
            let currentUserRoom = null;
            for (let i = 0; i < allSockets.length; i++) {
                if (allSockets[i].socket == socket) {
                    currentUserRoom = allSockets[i].room;
                }
            }
            for (let i = 0; i < allSockets.length; i++) {
                if (currentUserRoom == allSockets[i].room) {
                    // allSockets[i].socket.send(`${parsedMessage.payload}`)
                    allSockets[i].socket.send(JSON.stringify({
                        message: parsedMessage.payload.message,
                        userName: parsedMessage.payload.userName,
                        timestamp: parsedMessage.payload.timestamp
                    }));
                }
            }
        }
    });
    // allSockets.push(socket);
    socket.on("disconnect", (ds) => {
        allSockets = allSockets.filter((s) => { s !== ds; });
        userCount = userCount - 1;
    });
});
