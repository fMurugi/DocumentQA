import express from "express";
import router from "./router/router.js";
import morgan from "morgan";
import cors from "cors";
import prisma from "../db/dbConn.js";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { TextLoader } from "langchain/document_loaders/fs/text";



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

const textSplitter = new RecursiveCharacterTextSplitter({
   chunkSize: 500,
   chunkOverlap: 0,
 });


 
 const embeddings = new OpenAIEmbeddings();
 const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
 
 const template = `Use the following pieces of context to answer the question at the end.
 If you don't know the answer, just say that you don't know, don't try to make up an answer.
 Use three sentences  and keep the answer as concise as possible.
 Always say "thanks for asking!" at the end of the answer.
 {context}
 Question: {question}
 Helpful Answer:`;

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

app.post('/askLangChain', async(req, res) => {
   const question = req.body.text;
   
   // const data =  await prisma.document.findFirst({
   //    where:{
   //       id: "4709f91f-e00b-44af-bb51-cf1a3eb5de8b"
   //    }
   // })
   const loader = new TextLoader("./folders/document.txt");
   const data = await loader.load();
   console.log(data);
   
     
     // Split the document into chunks
     const splitDocs = await textSplitter.splitDocuments(data);
     console.log(splitDocs)
 
     // Create or update the vector store with the new document chunks
     const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
     const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
       prompt: PromptTemplate.fromTemplate(template),
     });
     // Get relevant documents based on a question
     const relevantDocs = await vectorStore.similaritySearch(question);
 
     console.log(relevantDocs.length);
 
     // Use LangChain to answer the question
     const response = await chain.call({
       query: question
     });
    

 
     console.log(response);
     
   //   res.json({data:response, document: newDocument});

   const sms = africastalking.SMS;
   const opts={
      to: '+254742086215',
      from:'13663',
      message: response.text
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




app.use('/api', router);

export default app;


