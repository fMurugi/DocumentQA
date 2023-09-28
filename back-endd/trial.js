
const { HfInference } = require('@huggingface/inference');

async function performQuestionAnswering() {
  // Replace 'YOUR_HUGGING_FACE_API_TOKEN' with your actual Hugging Face API token
  const hf = new HfInference('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');

  try {
    const result = await hf.questionAnswering({
      model: 'deepset/roberta-base-squad2',
      inputs: {
        question: 'What is  javsScript?',
        context: 'JavaScript is a programming language that is commonly used for web development.It allows you to create dynamic and interactive web pages  The capital of France is Paris',
      },
    });

    console.log('Answer:', result.answer);
    console.log('Confidence Score:', result.score);
    console.log('Start Position:', result.start);
    console.log('End Position:', result.end);
  } catch (error) {
    console.error('Error:', error);
  }
}

performQuestionAnswering();
