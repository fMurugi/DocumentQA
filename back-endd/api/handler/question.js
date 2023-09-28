import prisma from "../../db/dbConn.js";

//get all questions given a document id
export const getQuestions = async (req, res) => {
    const {id} = req.params
    try {
        const questions = await prisma.questions.findMany({
            where: {
                documentId: Number(id)
            }
        })
        res.json(questions)
    } catch (error) {
        
        res.json({error: "Unable to retrieve questions"})
    }
}

//get question by id   
export const getQuestionById = async (req, res) => {
    const {id} = req.params
    try {
        const question = await prisma.questions.findUnique({
            where: {
                id: id
            }
        })
        res.json(question)
    } catch (error) {
        res.json({error: "Unable to retrieve question"})
    }
}
//create question
export const createQuestion = async (req, res) => {
    const {question, answer,documentId} = req.body
    console.log(req.body)
    try {
        const newQuestion = await prisma.questions.create({
            data: {
                question,
                answer,
                belongsToId: documentId,
            }
        })
        res.json(newQuestion)
    } catch (error) {
        console.log(error)
        res.json({error})
    }
}

//delete question
export const deleteQuestion = async (req, res) => {
    const {id} = req.params
    try {
        const deletedQuestion = await prisma.questions.delete({
            where: {
                id: Number(id)
            }
        })
        res.json(deletedQuestion)
    } catch (error) {
        res.json({error: "Unable to delete question"})
    }
}