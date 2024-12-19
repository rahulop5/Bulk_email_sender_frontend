import express from "express";
import cors from "cors";

const app=express();
app.use(cors({
    //static link
    origin: "http://localhost:5173"
}));

app.get("/", (req, res)=>{
    res.send("hello from server");
});

app.listen(3000);