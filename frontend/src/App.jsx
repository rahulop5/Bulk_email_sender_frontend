import axios from "axios";
import { useState, useEffect} from "react";

function App() {
  const [data , setdata]=useState("");
  useEffect(()=>{
    getdata();
  }, [])
  async function getdata(){
    const response=await axios.get("/api/");
    setdata(response.data);
  }

  return (
    <>
      <h1>{data}</h1>
    </>
  )
}

export default App
