import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
dotenv.config();


export const searchWithAi = async (req,res) => {

    try {
         const { input } = req.body;
     
    if (!input) {
      return res.status(400).json({ message: "Search query is required" });
    }
 // case-insensitive
    const ai = new GoogleGenAI({});
const prompt=`You are an intelligent assistant for an LMS platform. A user will type any query about what they want to learn. Your task is to understand the intent and return one **most relevant keyword** from the following list of course categories and levels:

- App Development  
- AI/ML  
- AI Tools  
- Data Science  
- Data Analytics  
- Ethical Hacking  
- UI UX Designing  
- Web Development  
- Others  
- Beginner  
- Intermediate  
- Advanced  

Only reply with one single keyword from the list above that best matches the query. Do not explain anything. No extra text.

Query: ${input}
`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:prompt,
  });
  const keyword=response.text



    const courses = await Course.find({
      isPublished: true,
     $or: [
    { title: { $regex: input, $options: 'i' } },
    { subTitle: { $regex: input, $options: 'i' } },
    { description: { $regex: input, $options: 'i' } },
    { category: { $regex: input, $options: 'i' } },
    { level: { $regex: input, $options: 'i' } }
  ]
    });

    if(courses.length>0){
    return res.status(200).json(courses);
    }else{
       const courses = await Course.find({
      isPublished: true,
     $or: [
    { title: { $regex: keyword, $options: 'i' } },
    { subTitle: { $regex: keyword, $options: 'i' } },
    { description: { $regex: keyword, $options: 'i' } },
    { category: { $regex: keyword, $options: 'i' } },
    { level: { $regex: keyword, $options: 'i' } }
  ]
    });
       return res.status(200).json(courses);
    }


    } catch (error) {
        console.log(error)
        return res.status(500).json({message: `Failed to search with AI ${error.message}`})
    }
}

export const askAi = async (req, res) => {
  try {
    const { question, courseTitle, lectureTitle } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const ai = new GoogleGenAI({});
    const prompt = `You are a helpful and intelligent AI tutor for an online course platform called EduRova.
The student is currently taking the course: "${courseTitle || "General Studies"}" and watching the lecture: "${lectureTitle || "General Lecture"}".
They have asked you the following question:
"${question}"

Please provide a clear, educational, and concise response to help them understand the topic. Keep the answer structure easy to read.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return res.status(200).json({ answer: response.text });
  } catch (error) {
    console.error("AI Ask error:", error);
    return res.status(500).json({ message: `Failed to generate response: ${error.message}` });
  }
};