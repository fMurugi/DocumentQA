const express = require('express');
const multer = require('multer');
const axios = require('axios'); // Import Axios
const { HfInference } = require('@huggingface/inference');
const fs = require('fs');
const pdf = require('pdf-parse');

const app = express();
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

// Create an Axios instance with a timeout
const axiosInstance = axios.create({
  timeout: 60000, // Adjust the timeout value (in milliseconds) as needed
});

// Handle document upload and question asking
app.post('/ask', upload.single('document'), async (req, res) => {
    try {
        const documentStream = fs.createReadStream(req.file.path);
        const chunks = [];

        // Create a promise to read the stream and collect chunks
        const collectChunks = new Promise((resolve, reject) => {
            documentStream.on('data', (chunk) => {
                chunks.push(chunk);
            });
            documentStream.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            documentStream.on('error', (error) => {
                reject(error);
            });
        });

        // Wait for the promise to resolve and then parse the PDF data
        const pdfBuffer = await collectChunks;
        const pdfData = await pdf(pdfBuffer);

        // Extract text from pdfData
        const documentContent = pdfData.text;
        const documentContentWithoutLineBreaks = documentContent.replace(/\n/g, ' ');

        // Get the question from the form
        const question = req.body.question;

        // Perform document question answering with Axios
        const result = await axiosInstance.post('https://your-api-url.com', {
            question: question,
            context: documentContentWithoutLineBreaks,
        });

        res.send(`Answer: ${result.data.answer}`);
        console.log(result.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
