export default function codeFixPrompt(
  error = "",
  code = "",
  dependencies = ""
) {
  `Strictly follow these instructions to generate a complete React Vite project from scratch and ensure that the following error does not occur:

    🚫 Error to Prevent:
    ${error || ""}
    
    ✅ Instructions:
    
    Generate a fully functional React Vite project with proper dependencies and file structure.
    Ensure all imports are correctly resolved:
    Use exact package names for external modules.
    Verify that all installed packages exist in package.json.
    Correct local file import paths to match actual locations.
    If necessary, configure vite.config.js for proper module resolution.
    Ensure that external dependencies are handled correctly, including adding them to build.rollupOptions.external if needed.
    📦 Dependencies to Include & Use in Code:
    Use the following dependencies in the generated project:
    ${dependencies || ""}
    
    🛠 Code Requirements:
    
    The generated code must be complete and free of import resolution errors.
    Utilize the provided dependencies in the code to create a functional project.
    Do not alter structure, formatting, or style unnecessarily.
    Fix any related issues if detected, ensuring a fully working project.
    📌 Response Format:
    
    Return only the entire generated code.
    No explanations, comments, or extra content.
    Ensure the project runs successfully without requiring manual fixes.
    This is the error -> ${error || ""}
    This is the code -> ${code || ""}
    These are the dependencies -> ${dependencies || ""}    


    expected output: {
      "src": {
        "directory": {
          "App.jsx": {
            "file": {
              "contents": "all the code here inside backticks"
            }
          },
          "App.css": {
            "file": {
              "contents": "all the code here inside backticks"
            }
          },
          "components": {
            "directory": {
              "Header.jsx": {
                "file": {
                  "contents": "all the code here inside backticks"
                }
              },
              "Footer.jsx": {
                "file": {
                  "contents": "all the code here inside backticks"
                }
              }
            }
          },
          "index.css": {
            "file": {
              "contents": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
            }
          },
          "main.jsx": {
            "file": {
              "contents": "import \"./index.css\";\nimport React from \"react\";\nimport ReactDOM from \"react-dom/client\";\nimport App from \"./App.jsx\";\n\nconst root = ReactDOM.createRoot(document.getElementById(\"root\"));\nroot.render(<App />);"
            }
          }
        }
      }
    }

    `;
}
