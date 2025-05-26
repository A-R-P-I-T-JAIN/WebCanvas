export default function codeGenerationPrompt(userInput = "", dependencies = "") {
  const baseInstructions = `# Website Generation from UI Sketch

## Primary Task
Generate a beautiful, modern, and fully functional website based on the provided UI sketch or wireframe image. The sketch serves as your primary design reference - interpret it as a professional mockup and transform it into a polished, production-ready interface.

## Design Interpretation Guidelines

### Visual Enhancement Rules
- **Transform wireframes into polished UI**: Even if the sketch lacks colors or details, create a modern, visually appealing design
- **Color palette**: Choose a cohesive, contemporary color scheme (consider current design trends: gradients, soft shadows, modern neutrals)
- **Typography**: Implement a clear hierarchy with modern fonts and proper spacing
- **Interactive elements**: Add hover states, transitions, and micro-interactions
- **Responsive design**: Ensure mobile-first responsive behavior
- **Accessibility**: Include proper contrast ratios and semantic HTML

### Content Interpretation
- **Text elements**: If text appears large in the sketch, treat as headings; smaller text as body content
- **Placeholder content**: Generate realistic, contextually appropriate placeholder content
- **Images**: Replace "Image Here" or image placeholders with relevant Unsplash URLs
- **Icons**: Use appropriate icons that match the design context

${userInput ? `
## Additional Context
User provided description: "${userInput}"
Use this to inform functionality, theme, or specific requirements while staying true to the sketch layout.
` : ""}

***
Strictly insure to write import statements correctly for ex. "import React from 'react'"


Requirements & Conditions:
Keep the code minimal yet visually appealing.
You have to generate altest 3000 tokens in output
import React only in main.jsx "import React from 'react' it is complosury 
Implement only one or two core functionalities.
Ensure an elegant, modern UI following web design principles.
Use only Tailwind CSS for styling.
use react-router-dom if possible
Strictly avoid unnecessary imports or unused packages.

## Technical Implementation

### Framework: React + Vite

**React + Vite Project Structure:**

src/
├── App.jsx (main app component)
├── main.jsx (entry point - import React and index.css only)
├── index.css (global styles)
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── (other reusable components)
│   └── sections/
│       ├── Hero.jsx
│       ├── Features.jsx
│       └── (page sections)


**Import Rules:**
- main.jsx: Only import React, ReactDOM, App.jsx, and index.css
- Use ES6 imports consistently
- No imports from non-existent files
- Component names must match file names exactly

### Dependencies
**Available libraries:** ${dependencies || "None specified - use vanilla/built-in only"}
**Restriction:** Only use the libraries listed above. Do not import or reference any other packages.

### Styling Requirements
- **CSS Framework:** ${dependencies.includes("tailwind") ? "Tailwind CSS only" : "Modern CSS with Flexbox/Grid"}
- **No custom CSS modules** or external stylesheets beyond what's specified
- **Images:** Use Unsplash URLs only (format: https://images.unsplash.com/photo-[id]?w=800&q=80)
- **Color scheme:** Avoid pure black backgrounds; use modern design principles

## Quality Standards

### Functionality Requirements
- **Core features:** Implement 2-3 main functionalities that match the sketch purpose
- **Navigation:** Working navigation between sections/pages if indicated in sketch
- **Interactivity:** Buttons, forms, and interactive elements should be functional
- **Performance:** Optimize for loading speed and smooth interactions

### Code Quality
- **Clean architecture:** Component-based structure with clear separation of concerns
- **Error handling:** Include basic error boundaries and validation
- **Best practices:** Follow modern coding standards and conventions
- **Comments:** Add brief comments for complex logic

### Design Quality
- **Visual hierarchy:** Clear information architecture
- **Spacing:** Consistent margins, padding, and whitespace
- **Consistency:** Uniform styling across components
- **Polish:** Professional appearance with attention to detail

## Output Requirements

### Technical Specifications
- **File structure:** Match the specified directory structure exactly
- **Syntax:** Zero syntax errors, validated code
- **Dependencies:** All imports must reference existing files/packages
- **Responsive:** Mobile-first design with breakpoints
- **Accessibility:** WCAG 2.1 AA compliance basics

### Content Requirements
- **Minimum output:** Generate substantial, complete implementation (not minimal examples)
- **Realistic content:** Use meaningful placeholder text and relevant images
- **Complete features:** Don't leave functionality as "TODO" or placeholder

## Common Pitfalls to Avoid
- Don't create wireframe-looking output - make it look like a real, polished website
- Don't use undefined imports or non-existent dependencies
- Don't ignore the sketch layout - it's your primary reference
- Don't create overly minimal implementations - build complete features
- Don't use placeholder text like "Lorem ipsum" - use contextually relevant content

## Final Validation Checklist
✅ Layout matches the provided sketch accurately
✅ Visual design is modern and polished
✅ All imports resolve to existing files/packages
✅ Code runs without errors
✅ Responsive design works on mobile and desktop
✅ Interactive elements are functional
✅ Images load properly (using Unsplash URLs)
✅ Typography and spacing create clear hierarchy
✅ Color scheme is cohesive and modern
✅ Code follows specified file structure

---

**Generate a complete, production-ready implementation that transforms the provided sketch into a beautiful, functional website.**`;

  // Add framework-specific output format
  const outputFormat = `

## Output Format (JSON Structure)

{
  "src": {
    "directory": {
      "App.jsx": {
        "file": {
          "contents": "// Complete App component code"
        }
      },
      "main.jsx": {
        "file": {
          "contents": "// Entry point with proper imports"
        }
      },
      "index.css": {
        "file": {
          "contents": "/* Global styles and Tailwind imports */"
        }
      },
      "components": {
        "directory": {
          "layout": {
            "directory": {
              "Header.jsx": {
                "file": {
                  "contents": "// Header component"
                }
              },
              "Footer.jsx": {
                "file": {
                  "contents": "// Footer component"
                }
              }
            }
          },
          "ui": {
            "directory": {
              "Button.jsx": {
                "file": {
                  "contents": "// Reusable button component"
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

  return baseInstructions + outputFormat;
}