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



const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Set up the /calculate route
app.post("/generate", async (req, res) => {
  try {
    // Ensure the request contains the 'text' field
    const { text } = req.body;

    if (!text) {
      return res.status(400).send("Text field is required!");
    }

    const parts = [
      { text: `You are trained to generate Excalidraw JSON representations for website UI components and layouts based on text descriptions. Each UI component should consist of multiple Excalidraw elements like rectangles, ellipses, text boxes, and lines. Use the appropriate properties (type, id, fillStyle, strokeWidth, strokeColor, backgroundColor, width, height, x, y, angle) to create modern, responsive website UI elements.
    
    Below are some examples of Excalidraw JSON element codes for different shapes:
    
    Example 1: Rectangle
    {
        "type": "rectangle",
        "id": "rect-1",
        "fillStyle": "solid",
        "strokeWidth": 2,
        "strokeColor": "#000000",
        "backgroundColor": "#ffcc00",
        "width": 100,
        "height": 50,
        "x": 100,
        "y": 100,
        "angle": 0
    }
    
    Example 2: Ellipse
    {
        "type": "ellipse",
        "id": "ellipse-1",
        "fillStyle": "solid",
        "strokeWidth": 2,
        "strokeColor": "#000000",
        "backgroundColor": "#00ff00",
        "width": 100,
        "height": 100,
        "x": 200,
        "y": 100,
        "angle": 0
    }
    
    Example 3: Text
    {
        "type": "text",
        "id": "text-1",
        "fillStyle": "solid",
        "strokeWidth": 1,
        "strokeColor": "#000000",
        "backgroundColor": "#ffffff",
        "width": 50,
        "height": 30,
        "x": 150,
        "y": 200,
        "angle": 0,
        "text": "Hello World",
        "fontFamily": "Arial",
        "fontSize": 16
    }
    
    Example 4: Line (using a rectangle as a line)
    {
        "type": "rectangle",
        "id": "line-1",
        "fillStyle": "solid",
        "strokeWidth": 2,
        "strokeColor": "#000000",
        "backgroundColor": "#000000",
        "width": 200,
        "height": 2,
        "x": 100,
        "y": 300,
        "angle": 0
    }
    
    UI Component Examples:
    
    Example 1: Website Header with Navigation
    [
        {
            "type": "rectangle",
            "id": "header-bg",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "#2563eb",
            "width": 800,
            "height": 80,
            "x": 0,
            "y": 0,
            "angle": 0
        },
        {
            "type": "text",
            "id": "logo",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 100,
            "height": 30,
            "x": 20,
            "y": 25,
            "angle": 0,
            "text": "LOGO",
            "fontFamily": "Arial",
            "fontSize": 24
        },
        {
            "type": "text",
            "id": "nav-home",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 50,
            "height": 20,
            "x": 400,
            "y": 30,
            "angle": 0,
            "text": "Home",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "text",
            "id": "nav-about",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 50,
            "height": 20,
            "x": 470,
            "y": 30,
            "angle": 0,
            "text": "About",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "text",
            "id": "nav-services",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 60,
            "height": 20,
            "x": 540,
            "y": 30,
            "angle": 0,
            "text": "Services",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "text",
            "id": "nav-contact",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 60,
            "height": 20,
            "x": 620,
            "y": 30,
            "angle": 0,
            "text": "Contact",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "rectangle",
            "id": "cta-button",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeColor": "#ffffff",
            "backgroundColor": "#10b981",
            "width": 80,
            "height": 40,
            "x": 700,
            "y": 20,
            "angle": 0
        },
        {
            "type": "text",
            "id": "cta-text",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 60,
            "height": 20,
            "x": 710,
            "y": 30,
            "angle": 0,
            "text": "Get Started",
            "fontFamily": "Arial",
            "fontSize": 14
        }
    ]
    
    Example 2: Footer Section
    [
        {
            "type": "rectangle",
            "id": "footer-bg",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#000000",
            "backgroundColor": "#1f2937",
            "width": 800,
            "height": 200,
            "x": 0,
            "y": 400,
            "angle": 0
        },
        {
            "type": "text",
            "id": "footer-title",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 100,
            "height": 30,
            "x": 50,
            "y": 420,
            "angle": 0,
            "text": "Company Name",
            "fontFamily": "Arial",
            "fontSize": 20
        },
        {
            "type": "text",
            "id": "footer-description",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#9ca3af",
            "backgroundColor": "transparent",
            "width": 250,
            "height": 40,
            "x": 50,
            "y": 450,
            "angle": 0,
            "text": "Building amazing digital experiences for modern businesses.",
            "fontFamily": "Arial",
            "fontSize": 14
        },
        {
            "type": "text",
            "id": "footer-links-title",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 80,
            "height": 20,
            "x": 350,
            "y": 420,
            "angle": 0,
            "text": "Quick Links",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "text",
            "id": "footer-link-1",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#9ca3af",
            "backgroundColor": "transparent",
            "width": 60,
            "height": 20,
            "x": 350,
            "y": 450,
            "angle": 0,
            "text": "About Us",
            "fontFamily": "Arial",
            "fontSize": 14
        },
        {
            "type": "text",
            "id": "footer-link-2",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#9ca3af",
            "backgroundColor": "transparent",
            "width": 60,
            "height": 20,
            "x": 350,
            "y": 475,
            "angle": 0,
            "text": "Privacy Policy",
            "fontFamily": "Arial",
            "fontSize": 14
        },
        {
            "type": "text",
            "id": "contact-title",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 80,
            "height": 20,
            "x": 550,
            "y": 420,
            "angle": 0,
            "text": "Contact Info",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "text",
            "id": "contact-email",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#9ca3af",
            "backgroundColor": "transparent",
            "width": 150,
            "height": 20,
            "x": 550,
            "y": 450,
            "angle": 0,
            "text": "info@company.com",
            "fontFamily": "Arial",
            "fontSize": 14
        },
        {
            "type": "rectangle",
            "id": "footer-divider",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#374151",
            "backgroundColor": "#374151",
            "width": 700,
            "height": 1,
            "x": 50,
            "y": 520,
            "angle": 0
        },
        {
            "type": "text",
            "id": "copyright",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#6b7280",
            "backgroundColor": "transparent",
            "width": 300,
            "height": 20,
            "x": 50,
            "y": 540,
            "angle": 0,
            "text": "© 2024 Company Name. All rights reserved.",
            "fontFamily": "Arial",
            "fontSize": 12
        }
    ]
    
    Example 3: Hero Section
    [
        {
            "type": "rectangle",
            "id": "hero-bg",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "#f3f4f6",
            "width": 800,
            "height": 400,
            "x": 0,
            "y": 80,
            "angle": 0
        },
        {
            "type": "text",
            "id": "hero-title",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#1f2937",
            "backgroundColor": "transparent",
            "width": 400,
            "height": 60,
            "x": 200,
            "y": 180,
            "angle": 0,
            "text": "Welcome to Our Amazing Platform",
            "fontFamily": "Arial",
            "fontSize": 32
        },
        {
            "type": "text",
            "id": "hero-subtitle",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#6b7280",
            "backgroundColor": "transparent",
            "width": 500,
            "height": 40,
            "x": 150,
            "y": 250,
            "angle": 0,
            "text": "Discover innovative solutions that transform your business",
            "fontFamily": "Arial",
            "fontSize": 18
        },
        {
            "type": "rectangle",
            "id": "hero-cta-primary",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#2563eb",
            "backgroundColor": "#2563eb",
            "width": 120,
            "height": 50,
            "x": 280,
            "y": 320,
            "angle": 0
        },
        {
            "type": "text",
            "id": "hero-cta-primary-text",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 80,
            "height": 20,
            "x": 300,
            "y": 335,
            "angle": 0,
            "text": "Get Started",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "rectangle",
            "id": "hero-cta-secondary",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeColor": "#6b7280",
            "backgroundColor": "transparent",
            "width": 120,
            "height": 50,
            "x": 420,
            "y": 320,
            "angle": 0
        },
        {
            "type": "text",
            "id": "hero-cta-secondary-text",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#6b7280",
            "backgroundColor": "transparent",
            "width": 80,
            "height": 20,
            "x": 440,
            "y": 335,
            "angle": 0,
            "text": "Learn More",
            "fontFamily": "Arial",
            "fontSize": 16
        }
    ]
    
    Example 4: Card Component
    [
        {
            "type": "rectangle",
            "id": "card-bg",
            "fillStyle": "solid",
            "strokeWidth": 1,
            "strokeColor": "#e5e7eb",
            "backgroundColor": "#ffffff",
            "width": 300,
            "height": 200,
            "x": 50,
            "y": 100,
            "angle": 0
        },
        {
            "type": "rectangle",
            "id": "card-image",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#d1d5db",
            "backgroundColor": "#d1d5db",
            "width": 280,
            "height": 120,
            "x": 60,
            "y": 110,
            "angle": 0
        },
        {
            "type": "text",
            "id": "card-title",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#1f2937",
            "backgroundColor": "transparent",
            "width": 250,
            "height": 25,
            "x": 70,
            "y": 240,
            "angle": 0,
            "text": "Card Title",
            "fontFamily": "Arial",
            "fontSize": 18
        },
        {
            "type": "text",
            "id": "card-description",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#6b7280",
            "backgroundColor": "transparent",
            "width": 250,
            "height": 20,
            "x": 70,
            "y": 265,
            "angle": 0,
            "text": "Brief description of the card content",
            "fontFamily": "Arial",
            "fontSize": 14
        }
    ]
    
    Example 5: Form Component
    [
        {
            "type": "rectangle",
            "id": "form-bg",
            "fillStyle": "solid",
            "strokeWidth": 1,
            "strokeColor": "#e5e7eb",
            "backgroundColor": "#ffffff",
            "width": 400,
            "height": 300,
            "x": 200,
            "y": 100,
            "angle": 0
        },
        {
            "type": "text",
            "id": "form-title",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#1f2937",
            "backgroundColor": "transparent",
            "width": 200,
            "height": 30,
            "x": 300,
            "y": 120,
            "angle": 0,
            "text": "Contact Form",
            "fontFamily": "Arial",
            "fontSize": 24
        },
        {
            "type": "rectangle",
            "id": "input-name",
            "fillStyle": "solid",
            "strokeWidth": 1,
            "strokeColor": "#d1d5db",
            "backgroundColor": "#f9fafb",
            "width": 320,
            "height": 40,
            "x": 240,
            "y": 160,
            "angle": 0
        },
        {
            "type": "text",
            "id": "input-name-placeholder",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#9ca3af",
            "backgroundColor": "transparent",
            "width": 100,
            "height": 20,
            "x": 250,
            "y": 170,
            "angle": 0,
            "text": "Your Name",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "rectangle",
            "id": "input-email",
            "fillStyle": "solid",
            "strokeWidth": 1,
            "strokeColor": "#d1d5db",
            "backgroundColor": "#f9fafb",
            "width": 320,
            "height": 40,
            "x": 240,
            "y": 220,
            "angle": 0
        },
        {
            "type": "text",
            "id": "input-email-placeholder",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#9ca3af",
            "backgroundColor": "transparent",
            "width": 100,
            "height": 20,
            "x": 250,
            "y": 230,
            "angle": 0,
            "text": "Your Email",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "rectangle",
            "id": "submit-button",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#2563eb",
            "backgroundColor": "#2563eb",
            "width": 100,
            "height": 40,
            "x": 350,
            "y": 280,
            "angle": 0
        },
        {
            "type": "text",
            "id": "submit-text",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 60,
            "height": 20,
            "x": 370,
            "y": 290,
            "angle": 0,
            "text": "Submit",
            "fontFamily": "Arial",
            "fontSize": 16
        }
    ]
    
    Example 6: Sidebar Navigation
    [
        {
            "type": "rectangle",
            "id": "sidebar-bg",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#374151",
            "backgroundColor": "#374151",
            "width": 250,
            "height": 600,
            "x": 0,
            "y": 0,
            "angle": 0
        },
        {
            "type": "text",
            "id": "sidebar-logo",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 100,
            "height": 30,
            "x": 20,
            "y": 30,
            "angle": 0,
            "text": "Dashboard",
            "fontFamily": "Arial",
            "fontSize": 20
        },
        {
            "type": "rectangle",
            "id": "nav-item-1",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#2563eb",
            "backgroundColor": "#2563eb",
            "width": 210,
            "height": 40,
            "x": 20,
            "y": 100,
            "angle": 0
        },
        {
            "type": "text",
            "id": "nav-text-1",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#ffffff",
            "backgroundColor": "transparent",
            "width": 80,
            "height": 20,
            "x": 35,
            "y": 110,
            "angle": 0,
            "text": "Home",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "text",
            "id": "nav-text-2",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#d1d5db",
            "backgroundColor": "transparent",
            "width": 80,
            "height": 20,
            "x": 35,
            "y": 160,
            "angle": 0,
            "text": "Analytics",
            "fontFamily": "Arial",
            "fontSize": 16
        },
        {
            "type": "text",
            "id": "nav-text-3",
            "fillStyle": "solid",
            "strokeWidth": 0,
            "strokeColor": "#d1d5db",
            "backgroundColor": "transparent",
            "width": 80,
            "height": 20,
            "x": 35,
            "y": 200,
            "angle": 0,
            "text": "Settings",
            "fontFamily": "Arial",
            "fontSize": 16
        }
    ]
    
    Now, based on the given text description, generate the corresponding Excalidraw JSON code for website UI components.
    
    Task: Generate an Excalidraw JSON representation for a UI component based on the following description:
    "{description}"
    
    The UI component should include various shapes, text elements, and layouts based on the description, following the Excalidraw element examples shown above. Ensure that the JSON is properly formatted and contains the appropriate attributes such as type, id, fillStyle, strokeWidth, strokeColor, backgroundColor, width, height, x, y, and angle.
    
    UI Design Guidelines:
    - Use modern color schemes (blues, grays, greens for primary actions)
    - Implement proper spacing and alignment
    - Create clear visual hierarchy with typography
    - Use appropriate contrast ratios for accessibility
    - Include interactive elements like buttons and form fields
    - Follow common UI patterns and conventions
    
    Ensure the JSON includes the following properties for each element:
    - type: The type of the element (e.g., "rectangle", "ellipse", "text")
    - id: A unique identifier for the element
    - fillStyle: The fill style of the element (e.g., "solid")
    - strokeWidth: The width of the stroke for lines and shapes
    - strokeColor: The color of the stroke
    - backgroundColor: The background color (use "transparent" for text overlays)
    - width: The width of the element
    - height: The height of the element
    - x: The x-coordinate of the element's position
    - y: The y-coordinate of the element's position
    - angle: The rotation angle of the element (default is 0)
    - text: The content of the text element (only for type: "text")
    - fontFamily: The font family (only for type: "text")
    - fontSize: The font size (only for type: "text")
    
    Important Notes:
    - Do not use the type "line" directly. Instead, use a narrow rectangle to simulate a line
    - Use modern web colors and design patterns
    - Create responsive-looking layouts that follow current UI/UX best practices
    - The generated JSON should be valid and ready to use in Excalidraw without further modification
    - Use a variety of colors appropriate for web interfaces, not just black and white
    - Does not include type:"star" in your code
    
    The output should reflect all specified details precisely without any additional comments or explanations. Make sure the JSON is correctly formatted and valid for use in Excalidraw.` },
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
