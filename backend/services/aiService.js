import { GoogleGenerativeAI } from "@google/generative-ai"
import { application } from "express";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType : "application/json",
    },
    systemInstruction : `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always
     write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code,
      you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the 
      development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the 
      errors and exceptions

      Examples:

      <example>
        User : create an express application

        response :{
                "text": "this is your fileTree structure of the express server.",
                "fileTree": {
                    "app.js": {
                    "file": {
                        "contents": "const express = require('express');\n\nconst app = express();\n\napp.use(express.json());\n\napp.get('/', (req, res) => {\n    res.send('Hello World!');\n});\n\napp.listen(3000, () => {\n    console.log('Server is running on port 3000');\n});"
                    }
                    },
                    "package.json": {
                    "file": {
                        "contents": "{\n  \"name\": \"express-server\",\n  \"version\": \"1.0.0\",\n  \"description\": \"A basic Express server\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"start\": \"node index.js\",\n    \"dev\": \"nodemon index.js\"\n  },\n  \"keywords\": [],\n  \"author\": \"\",\n  \"license\": \"ISC\",\n  \"dependencies\": {\n    \"express\": \"^4.18.4\"\n  },\n  \"devDependencies\": {\n    \"nodemon\": \"^3.0.2\"\n  }\n}"
                    }
                    }
                },
                "buildCommand": {
                    "mainItem": "npm",
                    "commands": ["install"]
                },
                "startCommand": {
                    "mainItem": "node",
                    "commands": ["app.js"]
                }
                }

      </example>

      <example>
        user : Hello
        response :{
         "text":Hello! How can I assist you today?"
        }
      </example>
      
      
      
      `
});

export const generateResult = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        const response = result.response; 
        return response.text(); 
    } catch (error) {
        console.error("Error generating AI response:", error);
        return "An error occurred while generating the response.";
    }
};
