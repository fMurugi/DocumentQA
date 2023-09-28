import prisma from "../../db/dbConn.js";
 
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const {HfInference} = require('@huggingface/inference');
const fs = require('fs');
const pdf = require('pdf-parse');

const hf = new HfInference('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');



export const ask = async(req, res)=> {
    try {
      const docBuffer = fs.readFileSync(req.file.path);
  
      // Parse the PDF data using pdf-parse
      const pdfData = await pdf(docBuffer);
  
      // Extract text from pdfData
      const documentContent = pdfData.text;
      const documentContentWithoutLineBreaks = documentContent.replace(/\n/g, ' ');
  
      // Get the question from the form
      const question = req.body.question;
      

      // create method to save document to database
      const newDocument = await prisma.document.create({
        data: {
          name: req.file.originalname,
          content: documentContentWithoutLineBreaks,
        },
      });


  

      // res.json(newDocument
  
      // Perform document question answering
      const result = await hf.questionAnswering({
        model: 'deepset/roberta-base-squad2',
        inputs: {
          question: question,
          context: documentContentWithoutLineBreaks,
        },
      });
  
      res.json({ document: newDocument, result: result });
       console.log(result);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred.' });
    }

  
  }

  
