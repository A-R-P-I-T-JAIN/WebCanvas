// Import the required modules
import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import codeGenerationPrompt from "./src/codeGenerationPrompt.js";
import depGenerationPrompt from "./src/depGenerationPrompt.js";
import codeErrorreductionPrompt from "./src/codeErrorreductionPrompt.js";
import codeFixPrompt from "./src/codeFixPrompt.js";
import { ESLint } from "eslint";

dotenv.config();
// Initialize express app
const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: [
      "https://weblyai.vercel.app",
      "https://weblyai.vercel.app/websitegenerator",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ], // Allow only your frontend domain
    credentials: true, // Allow sending cookies/auth headers
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);// Add CORS middleware here

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Store generated data in variables
let currentDependencies = "";
let currentCleanedCode = "";
let currentCommand = "echo 'No command set'";
let userData = {};

// Set up multer for handling image uploads
const upload = multer({ dest: "uploads/" });

async function lintCode(code) {
  const eslint = new ESLint({ fix: true });
  const results = await eslint.lintText(code);
  return results[0].output || code; // Return fixed code or original
}

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

function cleanJSONCode(inputCode) {
  return inputCode
    .replace(/^```(json|javascript|js)?[\r\n]*/gm, "")
    .replace(/```$/gm, "")
    .replace(/^""[\r\n]*/gm, "")
    .replace(/^`[\r\n]*/gm, "")
    .trim();
}

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

app.post("/api/set-command", (req, res) => {
  const { command } = req.body;
  if (command) {
    currentCommand = command;
    res.json({ success: true, message: "Command updated successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid command" });
  }
});

app.post("/api/get-user-prompt", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No image file uploaded.");
    }

    const imagePath = req.file.path;
    const mimeType = req.file.mimetype;
    const userPrompt = req.body.userPrompt;
  const userId = req.body.userId;

    console.log(userId, userPrompt);

    const imagePart = fileToGenerativePart(imagePath, mimeType);

    // Generate dependencies and code
    const depGenerationPromptText = depGenerationPrompt();
    // console.log("depGenerationPromptText ---> ",depGenerationPromptText);
    const depGenerationPromptResult = await model.generateContent(
      [depGenerationPromptText, imagePart]
    );
    // console.log("depGenerationPromptResult ---> ",depGenerationPromptResult.response.candidates[0].content);
    const currentDependenciesRaw = depGenerationPromptResult.response.text().replace("`", "").replaceAll("`$", "");

    console.log("currentDependenciesRaw ---> ", currentDependenciesRaw);

    const currentDependencies = await lintCode(currentDependenciesRaw);

    const codeGenerationPromptText = codeGenerationPrompt(
      userPrompt,
      currentDependencies,
    );

    const generatedCode = await model.generateContent([codeGenerationPromptText, imagePart]);

    const errorFreeGeneratePrompt = await codeErrorreductionPrompt(
      generatedCode.response.text()
    );

    const generation_config = {
      temperature: 0.7,
      top_p: 0.9,
      max_output_tokens: 7000,
    };

    const errorFreeCode = await model.generateContent(errorFreeGeneratePrompt, {
      generationConfig: generation_config,
    });
    console.log("errorFreeCode ---> ", errorFreeCode.response.text());

    const cleanedRawCode = await cleanJSONCode(errorFreeCode.response.text());
    console.log("1");

    const cleanedCode = await lintCode(cleanedRawCode);
    console.log("2");


    // console.log(cleanedCode);

    userData = {
      ...userData,
      [userId]: {
        code: cleanedCode,
        dependencies: currentDependencies,
      },
    };

    // console.log("Saved UserData ---> ", userData);

    const acctualData = Object.entries(userData).find(([id, usersData]) => {
      if (id === userId) {
        return usersData;
      }
    });

    if (!acctualData) {
      return res.status(404).json({ error: "User data not found" });
    }

    // console.log("acctualData ---> ", acctualData[0]);

    // console.log(req.session.currentCleanedCode);
    res.json({ 
      code: acctualData[1].code, 
      dependencies: acctualData[1].dependencies 
    });
  } catch (error) {
    console.error("Error in processing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/get-command", async (req, res) => {
  const { dependencies } = req.body;

  res.json({
    command: `npm install vite react@18 react-dom@18 @vitejs/plugin-react postcss@^8.4.35 tailwindcss@^3.4.1 --save-dev autoprefixer eslint react-router-dom react-icons globals@^15.0.0 ${dependencies} `,
    secondCommand: `npm install eslint-plugin-import eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh globals@^15.0.0 --save-dev`,
    thirdCommand: `npm pkg set type=module`,
    fourthCommand: `npx eslint src/**/*.{js,jsx} --format json`,
    fifthCommand: `npx vite build --emptyOutDir`,
  });
});

const takeInput = async (error, code, dependencies) => {
  try {
    const codeFixPrompts = codeFixPrompt(error, code, dependencies);
    const someErrorFreeCode = await model.generateContent(codeFixPrompts);

    const errorFreeCode = cleanJSONCode(someErrorFreeCode.response.text());

    const secondVerification = await model.generateContent(
      codeErrorreductionPrompt(errorFreeCode, error)
    );

    return cleanJSONCode(secondVerification.response.text());
  } catch (err) {
    console.error("Error generating content:", err);
    return "";
  }
};

app.post("/api/errorcorrection", async (req, res) => {
  try {
    const { code, error, dependencies } = req.body;
    if (code && error) {
      const errorFreeCode = await takeInput(error, code, dependencies);
      const clearedCode = cleanJSONCode(errorFreeCode);
      return res.json({ cleancode: clearedCode || "" });
    }
    return res.json({ cleancode: "Nothing" });
  } catch (err) {
    console.error("Error processing request:", err);
    return res.status(500).json({ error: "Error processing request" });
  }
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Set up the /calculate route
app.post("/calculate", upload.single("image"), async (req, res) => {
  try {
    // Check if an image was uploaded
    if (!req.file) {
      return res.status(400).send("No image file uploaded.");
    }

    // Get the path of the uploaded image
    const imagePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Convert the image to generative part for the API request
    const imagePart = fileToGenerativePart(imagePath, mimeType);

    // Define the prompt
    const prompt = `You are given an image that may contain mathematical equations, graphical problems, physics-related questions, or other types of visual content. Your task is to identify the type of problem and provide only the final answer based on the following guidelines:

Mathematical Equations: If the image contains a mathematical expression or equation, solve it using the PEMDAS rule (Parentheses, Exponents, Multiplication and Division, Addition and Subtraction). Provide only the final result.

Physics Problems: If the image includes a physics-related question, compute the solution using the appropriate formulas or principles and provide only the final result.

Graphical/Geometrical Problems: If the image represents a geometrical figure or graphical math problem, analyze the image and provide only the final result.

Other Visual Content: If the image contains other types of content (e.g., word problems, abstract concepts, diagrams, etc.), interpret the image and provide only the final result.

Please provide only the answer without any additional explanation or reasoning.`;

    // Make the request to Google Gemini API
    const result = await model.generateContent([prompt, imagePart]);

    // Log the result
    console.log(result.response.text());

    // Send back the result to the client
    res.send(result.response.text());
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete uploaded image:", err);
    });
  }
});

// Set up the /calculate route
app.post("/generate", async (req, res) => {
  try {
    // Ensure the request contains the 'text' field
    const { text } = req.body;

    if (!text) {
      return res.status(400).send("Text field is required!");
    }
    // Define the prompt based on the user's input
    const prompt = `Generate an Excalidraw JSON representation for a drawing based on the following description: "${text}". Ensure that the output consists solely of Excalidraw elements, accurately reflecting the requested drawing with the appropriate shapes, colors, text, and other details.

The JSON format should atleast include the following properties for each element:

- **type**: The type of the element (e.g., "rectangle", "ellipse", "line", "text").
- **id**: A unique identifier for the element.
- **fillStyle**: The fill style of the element (e.g., "solid").
- **strokeWidth**: The width of the stroke for lines and shapes.
- **strokeColor**: The color of the stroke.
- **backgroundColor**: The background color (only for shapes that have a background).
- **width**: The width of the element (for shapes).
- **height**: The height of the element (for shapes).
- **x**: The x-coordinate of the element's position.
- **y**: The y-coordinate of the element's position.
- **angle**: The rotation angle of the element (default is 0).

Here's the format to follow:

[
    {
        "type": "{element_type}",
        "id": "{unique_id}",
        "fillStyle": "{fill_style}",
        "strokeWidth": {stroke_width},
        "strokeColor": "{stroke_color}",
        "backgroundColor": "{background_color}",
        "width": {element_width},
        "height": {element_height},
        "x": {position_x},
        "y": {position_y},
        "angle": {angle_value}
    },
    ...
]
    And make sure does not include type:"line" in your code, instead use rectangle to make a line.

The output should reflect all specified details precisely without any additional comments or explanations. Make sure the JSON is correctly formatted and valid for use in Excalidraw.Try to use different colors for different elements, Use combination of colors not only shades of black and white.`;

    const parts = [
      { text: `You are trained to generate Excalidraw JSON representations for drawings based on the following text descriptions. Each drawing should consist of multiple Excalidraw elements like rectangles, ellipses, text boxes, and lines. Use the appropriate properties (type, id, fillStyle, strokeWidth, strokeColor, backgroundColor, width, height, x, y, angle) to create the requested drawings.Below are some examples of Excalidraw JSON element codes for different shapes:\nExample 1: Rectangle\n{\n    \"type\": \"rectangle\",\n    \"id\": \"rect-1\",\n    \"fillStyle\": \"solid\",\n    \"strokeWidth\": 2,\n    \"strokeColor\": \"#000000\",\n    \"backgroundColor\": \"#ffcc00\",\n    \"width\": 100,\n    \"height\": 50,\n    \"x\": 100,\n    \"y\": 100,\n    \"angle\": 0\n}\nExample 2: Ellipse\n{\n    \"type\": \"ellipse\",\n    \"id\": \"ellipse-1\",\n    \"fillStyle\": \"solid\",\n    \"strokeWidth\": 2,\n    \"strokeColor\": \"#000000\",\n    \"backgroundColor\": \"#00ff00\",\n    \"width\": 100,\n    \"height\": 100,\n    \"x\": 200,\n    \"y\": 100,\n    \"angle\": 0\n}\nExample 3: Text\n{\n    \"type\": \"text\",\n    \"id\": \"text-1\",\n    \"fillStyle\": \"solid\",\n    \"strokeWidth\": 1,\n    \"strokeColor\": \"#000000\",\n    \"backgroundColor\": \"#ffffff\",\n    \"width\": 50,\n    \"height\": 30,\n    \"x\": 150,\n    \"y\": 200,\n    \"angle\": 0,\n    \"text\": \"Hello World\",\n    \"fontFamily\": \"Arial\",\n    \"fontSize\": 16\n}\nExample 4: Line (using a rectangle as a line)\n{\n    \"type\": \"rectangle\",\n    \"id\": \"line-1\",\n    \"fillStyle\": \"solid\",\n    \"strokeWidth\": 2,\n    \"strokeColor\": \"#000000\",\n    \"backgroundColor\": \"#000000\",\n    \"width\": 200,\n    \"height\": 2,\n    \"x\": 100,\n    \"y\": 300,\n    \"angle\": 0\n}\nsome complex examples:\nExample 1: A Red Car[\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"car-body\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#ff0000\",\n        \"width\": 200,\n        \"height\": 60,\n        \"x\": 100,\n        \"y\": 100,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"wheel-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#555555\",\n        \"width\": 40,\n        \"height\": 40,\n        \"x\": 120,\n        \"y\": 160,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"wheel-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#555555\",\n        \"width\": 40,\n        \"height\": 40,\n        \"x\": 240,\n        \"y\": 160,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"car-window\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#99ccff\",\n        \"width\": 60,\n        \"height\": 30,\n        \"x\": 140,\n        \"y\": 110,\n        \"angle\": 0\n    }\n]\nExample 2: A Laptop Placed on a Table[\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"laptop-screen\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#0000ff\",\n        \"width\": 120,\n        \"height\": 80,\n        \"x\": 150,\n        \"y\": 100,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"laptop-keyboard\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#cccccc\",\n        \"width\": 120,\n        \"height\": 20,\n        \"x\": 150,\n        \"y\": 180,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"table-top\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#8B4513\",\n        \"backgroundColor\": \"#DEB887\",\n        \"width\": 300,\n        \"height\": 20,\n        \"x\": 100,\n        \"y\": 220,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"table-leg-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#8B4513\",\n        \"backgroundColor\": \"#8B4513\",\n        \"width\": 20,\n        \"height\": 100,\n        \"x\": 100,\n        \"y\": 240,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"table-leg-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#8B4513\",\n        \"backgroundColor\": \"#8B4513\",\n        \"width\": 20,\n        \"height\": 100,\n        \"x\": 380,\n        \"y\": 240,\n        \"angle\": 0\n    }\n]\nExample 3: A Tree[\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"tree-trunk\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#8B4513\",\n        \"width\": 40,\n        \"height\": 100,\n        \"x\": 200,\n        \"y\": 200,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"tree-leaves-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#00cc00\",\n        \"width\": 100,\n        \"height\": 80,\n        \"x\": 170,\n        \"y\": 120,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"tree-leaves-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#00cc00\",\n        \"width\": 80,\n        \"height\": 60,\n        \"x\": 190,\n        \"y\": 80,\n        \"angle\": 0\n    }\n]\nExample 4: A House[\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"house-body\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#ffcc00\",\n        \"width\": 150,\n        \"height\": 100,\n        \"x\": 100,\n        \"y\": 200,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"door\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#8B4513\",\n        \"width\": 40,\n        \"height\": 60,\n        \"x\": 140,\n        \"y\": 240,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"window-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#99ccff\",\n        \"width\": 40,\n        \"height\": 40,\n        \"x\": 110,\n        \"y\": 210,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"window-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#99ccff\",\n        \"width\": 40,\n        \"height\": 40,\n        \"x\": 180,\n        \"y\": 210,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"roof\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#ff0000\",\n        \"width\": 160,\n        \"height\": 60,\n        \"x\": 95,\n        \"y\": 140,\n        \"angle\": -0.3\n    }\n]\nExample 5: A Sun[\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"sun\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#FFD700\",\n        \"backgroundColor\": \"#FFD700\",\n        \"width\": 100,\n        \"height\": 100,\n        \"x\": 100,\n        \"y\": 50,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"sun-ray-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#FFD700\",\n        \"backgroundColor\": \"#FFD700\",\n        \"width\": 80,\n        \"height\": 2,\n        \"x\": 140,\n        \"y\": 0,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"sun-ray-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#FFD700\",\n        \"backgroundColor\": \"#FFD700\",\n        \"width\": 80,\n        \"height\": 2,\n        \"x\": 140,\n        \"y\": 140,\n        \"angle\": 0\n    }\n]\nSure! Below are 8 examples of complex Excalidraw JSON code for various objects. These examples demonstrate how you can combine basic shapes like rectangles, ellipses, and lines to represent more intricate objects such as a car, laptop, table, and tree.Example 1: A Red Carjson[\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"car-body\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#ff0000\",\n        \"width\": 200,\n        \"height\": 60,\n        \"x\": 100,\n        \"y\": 100,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"wheel-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#555555\",\n        \"width\": 40,\n        \"height\": 40,\n        \"x\": 120,\n        \"y\": 160,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"wheel-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#555555\",\n        \"width\": 40,\n        \"height\": 40,\n        \"x\": 240,\n        \"y\": 160,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"car-window\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#99ccff\",\n        \"width\": 60,\n        \"height\": 30,\n        \"x\": 140,\n        \"y\": 110,\n        \"angle\": 0\n    }\n]\nExample 2: A Laptop Placed on a Tablejson[\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"laptop-screen\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#0000ff\",\n        \"width\": 120,\n        \"height\": 80,\n        \"x\": 150,\n        \"y\": 100,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"laptop-keyboard\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#cccccc\",\n        \"width\": 120,\n        \"height\": 20,\n        \"x\": 150,\n        \"y\": 180,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"table-top\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#8B4513\",\n        \"backgroundColor\": \"#DEB887\",\n        \"width\": 300,\n        \"height\": 20,\n        \"x\": 100,\n        \"y\": 220,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"table-leg-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#8B4513\",\n        \"backgroundColor\": \"#8B4513\",\n        \"width\": 20,\n        \"height\": 100,\n        \"x\": 100,\n        \"y\": 240,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"table-leg-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#8B4513\",\n        \"backgroundColor\": \"#8B4513\",\n        \"width\": 20,\n        \"height\": 100,\n        \"x\": 380,\n        \"y\": 240,\n        \"angle\": 0\n    }\n]\nExample 3: A Treejson[\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"tree-trunk\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#8B4513\",\n        \"width\": 40,\n        \"height\": 100,\n        \"x\": 200,\n        \"y\": 200,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"tree-leaves-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#00cc00\",\n        \"width\": 100,\n        \"height\": 80,\n        \"x\": 170,\n        \"y\": 120,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"tree-leaves-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#00cc00\",\n        \"width\": 80,\n        \"height\": 60,\n        \"x\": 190,\n        \"y\": 80,\n        \"angle\": 0\n    }\n]\nExample 4: A Housejson[\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"house-body\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#ffcc00\",\n        \"width\": 150,\n        \"height\": 100,\n        \"x\": 100,\n        \"y\": 200,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"door\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#8B4513\",\n        \"width\": 40,\n        \"height\": 60,\n        \"x\": 140,\n        \"y\": 240,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"window-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#99ccff\",\n        \"width\": 40,\n        \"height\": 40,\n        \"x\": 110,\n        \"y\": 210,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"window-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#99ccff\",\n        \"width\": 40,\n        \"height\": 40,\n        \"x\": 180,\n        \"y\": 210,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"roof\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#ff0000\",\n        \"width\": 160,\n        \"height\": 60,\n        \"x\": 95,\n        \"y\": 140,\n        \"angle\": -0.3\n    }\n]\nExample 5: A Sunjson[\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"sun\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#FFD700\",\n        \"backgroundColor\": \"#FFD700\",\n        \"width\": 100,\n        \"height\": 100,\n        \"x\": 100,\n        \"y\": 50,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"sun-ray-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#FFD700\",\n        \"backgroundColor\": \"#FFD700\",\n        \"width\": 80,\n        \"height\": 2,\n        \"x\": 140,\n        \"y\": 0,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"sun-ray-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#FFD700\",\n        \"backgroundColor\": \"#FFD700\",\n        \"width\": 80,\n        \"height\": 2,\n        \"x\": 140,\n        \"y\": 140,\n        \"angle\": 0\n    }\n]\nExample 6: A Cloud[\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"cloud-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#808080\",\n        \"backgroundColor\": \"#FFFFFF\",\n        \"width\": 80,\n        \"height\": 50,\n        \"x\": 150,\n        \"y\": 50,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"cloud-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#808080\",\n        \"backgroundColor\": \"#FFFFFF\",\n        \"width\": 70,\n        \"height\": 40,\n        \"x\": 180,\n        \"y\": 40,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"cloud-3\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#808080\",\n        \"backgroundColor\": \"#FFFFFF\",\n        \"width\": 60,\n        \"height\": 30,\n        \"x\": 170,\n        \"y\": 60,\n        \"angle\": 0\n    }\n]\nExample 7: A Car Wheel with Spokes\n[\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"wheel\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#000000\",\n        \"backgroundColor\": \"#555555\",\n        \"width\": 60,\n        \"height\": 60,\n        \"x\": 200,\n        \"y\": 200,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"spoke-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 1,\n        \"strokeColor\": \"#ffffff\",\n        \"backgroundColor\": \"#ffffff\",\n        \"width\": 50,\n        \"height\": 2,\n        \"x\": 210,\n        \"y\": 230,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"spoke-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 1,\n        \"strokeColor\": \"#ffffff\",\n        \"backgroundColor\": \"#ffffff\",\n        \"width\": 50,\n        \"height\": 2,\n        \"x\": 210,\n        \"y\": 230,\n        \"angle\": 1.57\n    }\n]\nExample 8: A Tree with Fruit[\n    {\n        \"type\": \"rectangle\",\n        \"id\": \"tree-trunk\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#8B4513\",\n        \"backgroundColor\": \"#8B4513\",\n        \"width\": 40,\n        \"height\": 100,\n        \"x\": 200,\n        \"y\": 200,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"tree-leaves\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#00cc00\",\n        \"backgroundColor\": \"#00cc00\",\n        \"width\": 120,\n        \"height\": 100,\n        \"x\": 170,\n        \"y\": 120,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"fruit-1\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#ff0000\",\n        \"backgroundColor\": \"#ff0000\",\n        \"width\": 20,\n        \"height\": 20,\n        \"x\": 190,\n        \"y\": 150,\n        \"angle\": 0\n    },\n    {\n        \"type\": \"ellipse\",\n        \"id\": \"fruit-2\",\n        \"fillStyle\": \"solid\",\n        \"strokeWidth\": 2,\n        \"strokeColor\": \"#ff0000\",\n        \"backgroundColor\": \"#ff0000\",\n        \"width\": 20,\n        \"height\": 20,\n        \"x\": 230,\n        \"y\": 170,\n        \"angle\": 0\n    }\n]\n\nNow, based on the given text description, generate the corresponding Excalidraw JSON code.Task:Generate an Excalidraw JSON representation for a drawing based on the following description:\"{description}\"The drawing should include various shapes, text elements, and lines based on the description, following the Excalidraw element examples shown above. Ensure that the JSON is properly formatted and contains the appropriate attributes such as type, id, fillStyle, strokeWidth, strokeColor, backgroundColor, width, height, x, y, and angle.Ensure the JSON includes the following properties for each element:type: The type of the element (e.g., \"rectangle\", \"ellipse\", \"text\").id: A unique identifier for the element.fillStyle: The fill style of the element (e.g., \"solid\").strokeWidth: The width of the stroke for lines and shapes.strokeColor: The color of the stroke.backgroundColor: The background color (for shapes with a background).width: The width of the element (for shapes).height: The height of the element (for shapes).x: The x-coordinate of the element's position.y: The y-coordinate of the element's position.angle: The rotation angle of the element (default is 0).text: The content of the text element (only for type: \"text\").fontFamily: The font family (only for type: \"text\").fontSize: The font size (only for type: \"text\").Important Notes:Do not use the type \"line\" directly. Instead, use a narrow rectangle to simulate a line.Use different colors for different elements. Avoid using only black and white shades; try using a variety of colors.The generated JSON should be valid and ready to use in Excalidraw without further modification.And make sure does not include type:"line" in your code, instead use rectangle to make a line.The output should reflect all specified details precisely without any additional comments or explanations. Make sure the JSON is correctly formatted and valid for use in Excalidraw.Try to use different colors for different elements, Use combination of colors not only shades of black and white.And does not include type:"star"` },
      { text: `input: ${text}` },
      { text: "output: " },
    ];

    // Make the request to the Gemini API (replace model.generateContent with the actual API call function)
    // const result = await model.generateContent(prompt);

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      // safetySettings: Adjust safety settings
      // See https://ai.google.dev/gemini-api/docs/safety-settings
    });

    // Check if the response exists and send the result to the client
    if (result && result.response && typeof result.response.text === 'function') {
      const responseText = await result.response.text();
      // console.log(responseText);
      res.send(responseText);
    } else {
      throw new Error('Unexpected API response');
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
