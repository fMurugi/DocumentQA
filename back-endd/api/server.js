import express from "express";
import router from "./router/router.js";
import morgan from "morgan";
import cors from "cors";
import prisma from "../db/dbConn.js";



import { createRequire } from "module";
const require = createRequire(import.meta.url);
const {HfInference} = require('@huggingface/inference');




const hf = new HfInference('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');



const app = express();


app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const options ={
   apiKey:"27811efac017286f5e58209bdef03961c9bf409550c91ad3b8a5e36ea6f50079",
   username:"sandbox"
}

const africastalking = require('africastalking')(options);
// add the  logic to send the content of this sms to the /ask endpoint and get the response

app.post('/', async(req, res) => {
   const question = req.body.text;
   
   // const data =  await prisma.document.findFirst({
   //    where:{
   //       id: "4709f91f-e00b-44af-bb51-cf1a3eb5de8b"
   //    }
   // })
   const data =  await prisma.document.findFirst({
      where:{
         
      },
      orderBy:{
         createdAt:"desc"
      }
      
   })
   console.log(data);

   const result = await hf.questionAnswering({
      model: 'deepset/roberta-base-squad2',
      inputs: {
        question: question,
        context:data.content,
      },
    });
    

   const sms = africastalking.SMS;
   const opts={
      to: '+254742086215',
      from:'13663',
      message: result.answer
   }
   sms.send(opts)
   .then(response => {
      console.log(response);
   })
   .catch(error => {
      console.log(error);
   })});

  
   // const getConetnt  = async() => {
   //    const response = await fetch('http://localhost:3006/api/docoment/4709f91f-e00b-44af-bb51-cf1a3eb5de8b', {
   //       method: 'GET',
   //     });
   //       console.log(response);
   //       const data = await response.json();
   //       console.log(data);
   //       return data.content;
   // }

app.get('/', (req, res) => {
   res.send("Hello World");
});



app.use('/api', router);

export default app;
