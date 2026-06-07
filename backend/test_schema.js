import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const schema = {
  type: "OBJECT",
  properties: {
    text: {
      type: "STRING"
    },
    fileTree: {
      type: "OBJECT",
      additionalProperties: {
        type: "OBJECT",
        properties: {
          file: {
            type: "OBJECT",
            properties: {
              contents: {
                type: "STRING"
              }
            },
            required: ["contents"]
          }
        },
        required: ["file"]
      }
    }
  },
  required: ["text"]
};

async function testSchema() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const result = await model.generateContent("Create a simple index.html file inside a fileTree");
    console.log("Success! Generated JSON:");
    console.log(result.response.text());
  } catch (err) {
    console.error("Failed with schema:", err);
  }
}

testSchema();
