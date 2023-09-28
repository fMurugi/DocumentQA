// import express from 'express';
// import multer from 'multer';
// import { HfInference } from '@huggingface/inference';
// import fs from 'fs';
// import pdf from 'pdf-parse';

import { ok } from "assert";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const express = require('express');
const multer = require('multer');
const { HfInference } = require('@huggingface/inference');
const fs = require('fs');
const pdf = require('pdf-parse');

const cors = require('cors'); // Import the cors middleware



const app = express();
app.use(cors()); // Use the cors middleware
const port = process.env.PORT || 3005;

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize the Hugging Face Inference
const hf = new HfInference('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');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve HTML page for uploading documents and asking questions
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle document upload and question asking
app.post('/ask', upload.single('document'), async (req, res) => {
    try {
        const docBuffer = fs.readFileSync(req.file.path);
        
        // Parse the PDF data using pdf-parse
        const pdfData = await pdf(docBuffer);

        // Extract text from pdfData
        const documentContent = pdfData.text
        // console.log(documentContent)
        const documentContentWithoutLineBreaks = documentContent.replace(/\n/g, ' ');
        
        // Get the question from the form
        const question = req.body.question;

        // Perform document question answering
        const result = await hf.questionAnswering({
            model: 'deepset/roberta-base-squad2',
            inputs: {
                question:question,
                context: documentContentWithoutLineBreaks,
            },
        });

        // res.send(`Answer: ${result.answer}`);
        // res.send(result.answer);
        res.json(result);
        console.log(result)
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
