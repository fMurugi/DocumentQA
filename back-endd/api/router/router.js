import { Router } from "express";
import { getDocuments,getDocumentById,createDocument,deleteDocument } from "../handler/documents.js";
import { getQuestionById,getQuestions,createQuestion,deleteQuestion } from "../handler/question.js";
import { ask } from "../handler/ask.js";

import multer from 'multer';
const upload = multer({dest: 'uploads/'});

/**
 * document router
 */
const router = Router();

router.get("/documents",upload.single('document'), (getDocuments));
router.get("/documents/:id", (getDocumentById));
router.post("/documents", (createDocument));
router.delete("/documents/:id", (deleteDocument));

/**
 * question router
    */  

router.get("/questions/:id", (getQuestionById));
  router.get("/questions", (getQuestions));
    router.post("/questions", (createQuestion));
        router.delete("/questions/:id", (deleteQuestion));

  
  router.post("/ask",upload.single('document'), (ask));
  
  


export default router;