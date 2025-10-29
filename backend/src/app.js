import express from "express"
import {createServer} from "node:http";
import {Server} from "socket.io"
import mongoose from "mongoose"
import { connectToSocket } from "./contollers/socketManager.js";
import cors from "cors"
import userRoutes from "./routes/users.routes.js"
const app=express();
const server=createServer(app);
const io=connectToSocket(server);

app.set("port",(process.env.PORT || 8000))
app.use(cors());
app.use(express.json({limit :"40kb"}));
app.use(express.urlencoded({limit :"40kb",extended:true}));
app.use("/api/v1/users",userRoutes);


const start=async()=>{
  const connectiondb=await mongoose.connect("mongodb+srv://prajapativishnumunna_db_user:2tLxumMqzAvkqTxk@cluster0.tfgqrzw.mongodb.net/")

  console.log(`Mongo Connect to DB host :${connectiondb.connection.host}`)
  server.listen(app.get("port"),()=>{
    console.log("Hello World");
  });
}

start();