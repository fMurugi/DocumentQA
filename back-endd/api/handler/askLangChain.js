// Document loader
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { TextLoader } from "langchain/document_loaders/fs/text";
import prisma from "../../db/dbConn.js";


import { createRequire } from "module";
const require = createRequire(import.meta.url);

const fs = require('fs');
const pdf = require('pdf-parse');
// Define your LangChain components and initialize them outside of the route handler
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
  
 
  
  // Define your Express route for processing requests
  export const askLangChain=async (req, res) => {
    try {
      // Retrieve the document from the request body
      const document = req.body.document;
      // read data form this document and store it in .txt file
      const docBuffer = fs.readFileSync(req.file.path);

      
         // Parse the PDF data using pdf-parse
      const pdfData = await pdf(docBuffer);
  
      // Extract text from pdfData
      const documentContent = pdfData.text;
      const documentContentWithoutLineBreaks = documentContent.replace(/\n/g, ' ');
        
      const folderPath = './folders'; // Replace with your desired folder path

    // Define the file name and path where the .txt file will be created
    const fileName = 'document.txt'; // Replace with your desired file name
    const filePath = `${folderPath}/${fileName}`;

    // Write the document data to the .txt file
    fs.writeFile(filePath, documentContentWithoutLineBreaks, (err) => {
    if (err) {
        console.error(`Error writing file: ${err}`);
        // Handle the error here
    } else {
        console.log(`File saved at: ${filePath}`);
        // Continue with processing the file or response here
    }
    });
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
      const question = req.body.question;
      const relevantDocs = await vectorStore.similaritySearch(question);
  
      console.log(relevantDocs.length);
  
      // Use LangChain to answer the question
      const response = await chain.call({
        query: question
      });
       // create method to save document to database
       const newDocument = await prisma.document.create({
        data: {
          name: req.file.originalname,
          content: documentContentWithoutLineBreaks,
        },
      });

  
      console.log(response);
      
      res.json({data:response, document: newDocument});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  };