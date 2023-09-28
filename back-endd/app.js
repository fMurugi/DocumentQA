const express = require('express');
const multer = require('multer');
const { HfInference } = require('@huggingface/inference');
const fs = require('fs');
// const fetch = require('node-fetch');

const app = express();
const port = 3000;

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });
console.log(`multer:${upload}`);

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
    // Read the uploaded document
    const documentContent = fs.readFileSync(req.file.path, 'utf-8');

    // Get the question from the form
    const question = req.body.question;

    // Perform document question answering
    const result = await hf.documentQuestionAnswering({
      model: 'impira/layoutlm-document-qa',
      inputs: {
        question:question,
        image: await (await fetch('https://huggingface.co/spaces/impira/docquery/resolve/2359223c1837a7587402bda0f2643382a6eefeab/invoice.png')).blob(),
      },
    });
    console.log(result)

    res.send(`Answer:`, result.answer);
    console.log('Answer:', result.answer);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
