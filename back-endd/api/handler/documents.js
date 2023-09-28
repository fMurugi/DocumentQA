import prisma from "../../db/dbConn.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require('fs');
const pdf = require('pdf-parse');

//get all documents 
export const getDocuments = async (req, res) => {
    try {
        const documents = await prisma.document.findMany()
        res.json(documents)
    } catch (error) {
        res.json({error: "Unable to retrieve documents"})
    }
}

//get document by id let it contain aslo its questions
//include questions related to this document

export const getDocumentById = async (req, res) => {
    const {id} = req.params
    console.log("Fetching document with ID:", id);
    try {
        const document = await prisma.document.findFirst({
            where: {
                id: id
            },
            include: {
                Questions: true
            },
        })
        if (!document) {
            console.log("Document not found");
            // If the document is not found, return a 404 response
            res.status(404).json({ error: "Document not found" });
            return;
        }
        console.log("Document found:", document);
        res.json(document)
    } catch (error) {
        console.error("Error fetching document:", error)
        res.status(500).json({error: "Unable to retrieve document"})
    }
}


//create document 
//document doesnt have a url it has name and content
export const createDocument = async (req, res) => {
    const {name} = req.body
    try {

    const docBuffer = fs.readFileSync(req.file.path);
  
    // Parse the PDF data using pdf-parse
    const pdfData = await pdf(docBuffer);

    // Extract text from pdfData
    const documentContent = pdfData.text;
    const documentContentWithoutLineBreaks = documentContent.replace(/\n/g, ' ');

        const newDocument = await prisma.document.create({
            data: {
                name,
                content:documentContentWithoutLineBreaks
            }
        })
        res.json(newDocument)
    } catch (error) {
        res.json({error: error})
        console.log(error)
        res.json({error: "Unable to create document"})
    }
}

//delete document
export const deleteDocument = async (req, res) => {
    const {id} = req.params
    try {
        const deletedDocument = await prisma.document.delete({
            where: {
                id: Number(id)
            }
        })
        res.json(deletedDocument)
    } catch (error) {
        res.json({error: "Unable to delete document"})
    }
}