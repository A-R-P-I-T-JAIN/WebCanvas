// export default function codeGenerationPrompt(userInput = "", dependencies = "") {
//   const baseInstructions = `# Website Generation from UI Sketch

// ## Primary Task
// Generate a beautiful, modern, and fully functional website based on the provided UI sketch or wireframe image. The sketch serves as your primary design reference - interpret it as a professional mockup and transform it into a polished, production-ready interface.

// ## Design Interpretation Guidelines

// ### Visual Enhancement Rules
// - **Transform wireframes into polished UI**: Even if the sketch lacks colors or details, create a modern, visually appealing design
// - **Color palette**: Choose a cohesive, contemporary color scheme (consider current design trends: gradients, soft shadows, modern neutrals)
// - **Typography**: Implement a clear hierarchy with modern fonts and proper spacing
// - **Interactive elements**: Add hover states, transitions, and micro-interactions
// - **Responsive design**: Ensure mobile-first responsive behavior
// - **Accessibility**: Include proper contrast ratios and semantic HTML

// ### Content Interpretation
// - **Text elements**: If text appears large in the sketch, treat as headings; smaller text as body content
// - **Placeholder content**: Generate realistic, contextually appropriate placeholder content
// - **Images**: Replace "Image Here" or image placeholders with relevant Unsplash URLs
// - **Icons**: Use appropriate icons that match the design context

// ${userInput ? `
// ## Additional Context
// User provided description: "${userInput}"
// Use this to inform functionality, theme, or specific requirements while staying true to the sketch layout.
// ` : ""}

// ***
// Strictly insure to write import statements correctly for ex. "import React from 'react'"


// Requirements & Conditions:
// Keep the code minimal yet visually appealing.
// You have to generate altest 3000 tokens in output
// import React only in main.jsx "import React from 'react' it is complosury 
// Implement only one or two core functionalities.
// Ensure an elegant, modern UI following web design principles.
// Use only Tailwind CSS for styling.
// use react-router-dom if possible
// Strictly avoid unnecessary imports or unused packages.

// ## Technical Implementation

// ### Framework: React + Vite

// **React + Vite Project Structure:**

// src/
// ├── App.jsx (main app component)
// ├── main.jsx (entry point - import React and index.css only)
// ├── index.css (global styles)
// ├── components/
// │   ├── layout/
// │   │   ├── Header.jsx
// │   │   ├── Footer.jsx
// │   │   └── Layout.jsx
// │   ├── ui/
// │   │   ├── Button.jsx
// │   │   ├── Card.jsx
// │   │   └── (other reusable components)
// │   └── sections/
// │       ├── Hero.jsx
// │       ├── Features.jsx
// │       └── (page sections)


// **Import Rules:**
// - main.jsx: Only import React, ReactDOM, App.jsx, and index.css
// - Use ES6 imports consistently
// - No imports from non-existent files
// - Component names must match file names exactly

// ### Dependencies
// **Available libraries:** ${dependencies || "None specified - use vanilla/built-in only"}
// **Restriction:** Only use the libraries listed above. Do not import or reference any other packages.

// ### Styling Requirements
// - **CSS Framework:** ${dependencies.includes("tailwind") ? "Tailwind CSS only" : "Modern CSS with Flexbox/Grid"}
// - **No custom CSS modules** or external stylesheets beyond what's specified
// - **Images:** Use Unsplash URLs only (format: https://images.unsplash.com/photo-[id]?w=800&q=80)
// - **Color scheme:** Avoid pure black backgrounds; use modern design principles

// ## Quality Standards

// ### Functionality Requirements
// - **Core features:** Implement 2-3 main functionalities that match the sketch purpose
// - **Navigation:** Working navigation between sections/pages if indicated in sketch
// - **Interactivity:** Buttons, forms, and interactive elements should be functional
// - **Performance:** Optimize for loading speed and smooth interactions

// ### Code Quality
// - **Clean architecture:** Component-based structure with clear separation of concerns
// - **Error handling:** Include basic error boundaries and validation
// - **Best practices:** Follow modern coding standards and conventions
// - **Comments:** Add brief comments for complex logic

// ### Design Quality
// - **Visual hierarchy:** Clear information architecture
// - **Spacing:** Consistent margins, padding, and whitespace
// - **Consistency:** Uniform styling across components
// - **Polish:** Professional appearance with attention to detail

// ## Output Requirements

// ### Technical Specifications
// - **File structure:** Match the specified directory structure exactly
// - **Syntax:** Zero syntax errors, validated code
// - **Dependencies:** All imports must reference existing files/packages
// - **Responsive:** Mobile-first design with breakpoints
// - **Accessibility:** WCAG 2.1 AA compliance basics

// ### Content Requirements
// - **Minimum output:** Generate substantial, complete implementation (not minimal examples)
// - **Realistic content:** Use meaningful placeholder text and relevant images
// - **Complete features:** Don't leave functionality as "TODO" or placeholder

// ## Common Pitfalls to Avoid
// - Don't create wireframe-looking output - make it look like a real, polished website
// - Don't use undefined imports or non-existent dependencies
// - Don't ignore the sketch layout - it's your primary reference
// - Don't create overly minimal implementations - build complete features
// - Don't use placeholder text like "Lorem ipsum" - use contextually relevant content

// ## Final Validation Checklist
// ✅ Layout matches the provided sketch accurately
// ✅ Visual design is modern and polished
// ✅ All imports resolve to existing files/packages
// ✅ Code runs without errors
// ✅ Responsive design works on mobile and desktop
// ✅ Interactive elements are functional
// ✅ Images load properly (using Unsplash URLs)
// ✅ Typography and spacing create clear hierarchy
// ✅ Color scheme is cohesive and modern
// ✅ Code follows specified file structure

// ---

// **Generate a complete, production-ready implementation that transforms the provided sketch into a beautiful, functional website.**`;

//   // Add framework-specific output format
//   const outputFormat = `

// ## Output Format (JSON Structure)

// {
//   "src": {
//     "directory": {
//       "App.jsx": {
//         "file": {
//           "contents": "// Complete App component code"
//         }
//       },
//       "main.jsx": {
//         "file": {
//           "contents": "// Entry point with proper imports"
//         }
//       },
//       "index.css": {
//         "file": {
//           "contents": "/* Global styles and Tailwind imports */"
//         }
//       },
//       "components": {
//         "directory": {
//           "layout": {
//             "directory": {
//               "Header.jsx": {
//                 "file": {
//                   "contents": "// Header component"
//                 }
//               },
//               "Footer.jsx": {
//                 "file": {
//                   "contents": "// Footer component"
//                 }
//               }
//             }
//           },
//           "ui": {
//             "directory": {
//               "Button.jsx": {
//                 "file": {
//                   "contents": "// Reusable button component"
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }
// `;

//   return baseInstructions + outputFormat;
// }

export default function codeGenerationPrompt(userInput = "", dependencies = "") {
  const baseInstructions = `# Multi-Page Website Generation from UI Sketches

## Primary Task
Generate a beautiful, modern, and fully functional multi-page website based on the provided UI sketch or wireframe images. The sketches serve as your primary design reference - interpret them as professional mockups and transform them into a polished, production-ready interface with proper page hierarchy and navigation.

## Multi-Page Analysis & Structure

### Page Hierarchy Detection
- **Analyze all provided images** to understand the complete website structure
- **Determine page order** based on logical user flow and common web patterns:
  - Home/Landing page (usually has hero sections, overview content)
  - About/Company page (team info, company details)
  - Services/Products page (feature listings, product catalogs)
  - Portfolio/Gallery page (showcase work, case studies)
  - Contact page (forms, contact information)
  - Blog/News page (article listings, content pages)
- **Create logical navigation flow** that makes sense for user experience
- **Identify common elements** across pages (header, footer, navigation)

### Multi-Page Implementation Strategy
- **Router-based navigation**: Implement proper routing between pages
- **Shared components**: Extract common elements (header, footer, navigation) into reusable components
- **Consistent design language**: Maintain visual consistency across all pages
- **Page-specific functionality**: Implement unique features for each page type
- **Breadcrumb navigation**: Add navigation aids for complex site structures

## Design Interpretation Guidelines

### Visual Enhancement Rules
- **Transform wireframes into polished UI**: Even if the sketch lacks colors or details, create a modern, visually appealing design
- **if the images contains colors strictly use the colors in the images**
- **Consistent color palette**: Choose a cohesive, contemporary color scheme across all pages
- **Typography hierarchy**: Implement consistent font usage and sizing across the entire site
- **Interactive elements**: Add hover states, transitions, and micro-interactions
- **Responsive design**: Ensure mobile-first responsive behavior for all pages
- **Accessibility**: Include proper contrast ratios and semantic HTML throughout

### Content Interpretation
- **Page-specific content**: Generate realistic, contextually appropriate content for each page
- **Navigation structure**: Create intuitive menu systems based on detected pages
- **Cross-page consistency**: Maintain consistent branding and design patterns
- **Images**: Replace placeholders with relevant Unsplash URLs for each page context
- **Call-to-actions**: Implement logical CTAs that guide users through the site

${userInput ? `
## Additional Context
User provided description: "${userInput}"
Use this to inform functionality, theme, or specific requirements while staying true to the sketch layouts and maintaining logical page flow.
` : ""}

***
Strictly ensure to write import statements correctly for ex. "import React from 'react'"

Requirements & Conditions:
Keep the code comprehensive yet maintainable across multiple pages.
You have to generate at least 5000 tokens in output for multi-page implementation.
Import React only in main.jsx "import React from 'react'" - it is compulsory.
Implement complete navigation and routing functionality.
Ensure an elegant, modern UI following web design principles across all pages.
Use only Tailwind CSS for styling.
Use react-router-dom for multi-page navigation.
Strictly avoid unnecessary imports or unused packages.

## Technical Implementation

### Framework: React + Vite + React Router

**Multi-Page React + Vite Project Structure:**

src/
├── App.jsx (main app with routing)
├── main.jsx (entry point - import React and index.css only)
├── index.css (global styles)
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Navigation.jsx
│   │   └── Layout.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── (other reusable components)
│   └── sections/
│       ├── Hero.jsx
│       ├── Features.jsx
│       └── (page-specific sections)
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Services.jsx
│   ├── Portfolio.jsx
│   ├── Contact.jsx
│   └── (other detected pages)
└── utils/
    └── routes.js (route definitions)

**Import Rules:**
- main.jsx: Only import React, ReactDOM, App.jsx, and index.css
- App.jsx: Import BrowserRouter, Routes, Route from react-router-dom
- Use ES6 imports consistently
- No imports from non-existent files
- Component names must match file names exactly

### Dependencies
**Available libraries:** ${dependencies || "react-router-dom (required for multi-page)"}
**Restriction:** Only use the libraries listed above. Do not import or reference any other packages.

### Routing Implementation
- **Main routing structure** in App.jsx using React Router
- **Dynamic navigation** based on detected pages
- **404 error handling** for undefined routes
- **Smooth page transitions** if animation libraries are available
- **Active navigation states** to show current page

### Styling Requirements
- **CSS Framework:** Tailwind CSS only
- **Consistent styling** across all pages
- **Responsive navigation** that works on all screen sizes
- **Images:** Use contextually appropriate Unsplash URLs for each page
- **Modern design principles** applied consistently

## Quality Standards

### Multi-Page Functionality Requirements
- **Complete routing system:** All detected pages should be accessible via navigation
- **Working navigation:** Header/footer navigation should work across all pages
- **Page-specific features:** Each page should have its unique functionality
- **Form handling:** Contact forms and other interactive elements should work
- **Performance:** Optimize for loading speed across all pages

### Code Quality
- **Modular architecture:** Clear separation between pages, components, and layout
- **Reusable components:** Extract common elements to avoid code duplication
- **Route management:** Clean routing structure with proper error handling
- **State management:** Handle page-specific and shared state appropriately
- **Best practices:** Follow modern React and routing conventions

### Design Quality
- **Visual consistency:** Maintain design language across all pages
- **Navigation clarity:** Users should always know where they are
- **Information architecture:** Logical content organization
- **Cross-page flow:** Smooth user experience when navigating between pages

## Page Detection Logic

### Common Page Types to Identify:
1. **Home/Landing Page**: Hero sections, overview content, main CTAs
2. **About Page**: Team info, company story, mission/vision
3. **Services/Products Page**: Feature listings, pricing, product details
4. **Portfolio/Work Page**: Project showcases, case studies, galleries
5. **Contact Page**: Contact forms, location info, contact details
6. **Blog/News Page**: Article listings, content management
7. **FAQ/Support Page**: Help sections, documentation

### Navigation Structure Rules:
- **Primary navigation**: Main pages in header/top navigation
- **Secondary navigation**: Sub-pages or related content
- **Footer navigation**: Additional links, legal pages, social media
- **Mobile navigation**: Responsive hamburger menu for small screens

## Output Requirements

### Technical Specifications
- **Complete routing implementation** with all detected pages
- **Functional navigation** between all pages
- **Responsive design** that works across all pages and devices
- **Error-free code** with proper imports and dependencies
- **SEO-friendly structure** with proper page titles and meta information

### Content Requirements
- **Comprehensive implementation** with all pages fully developed
- **Realistic, contextual content** for each page type
- **Complete navigation system** with working links
- **Interactive elements** appropriate for each page

## Common Pitfalls to Avoid
- Don't create single-page output when multiple pages are provided
- Don't ignore the logical flow and hierarchy of pages
- Don't create broken navigation or routing
- Don't use inconsistent design across pages
- Don't leave pages incomplete or as placeholders
- Don't forget to implement proper routing structure

## Final Validation Checklist
✅ All page layouts match the provided sketches accurately
✅ Logical page hierarchy and navigation flow implemented
✅ Complete routing system with working navigation
✅ Visual design is consistent and modern across all pages
✅ All imports resolve to existing files/packages
✅ Multi-page application runs without errors
✅ Responsive design works on all pages
✅ Interactive elements are functional on each page
✅ Images load properly with contextually appropriate content
✅ Navigation clearly indicates current page
✅ Code follows proper multi-page architecture

---

**Generate a complete, production-ready multi-page website that implements all detected pages with proper routing, navigation, and consistent design language.**`;

  // Add framework-specific output format
  const outputFormat = `

## Output Format (JSON Structure)

{
  "src": {
    "directory": {
      "App.jsx": {
        "file": {
          "contents": "// Main app component with routing setup"
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
                  "contents": "// Header component with navigation"
                }
              },
              "Footer.jsx": {
                "file": {
                  "contents": "// Footer component"
                }
              },
              "Navigation.jsx": {
                "file": {
                  "contents": "// Navigation component"
                }
              },
              "Layout.jsx": {
                "file": {
                  "contents": "// Layout wrapper component"
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
              },
              "Card.jsx": {
                "file": {
                  "contents": "// Reusable card component"
                }
              }
            }
          },
          "sections": {
            "directory": {
              "Hero.jsx": {
                "file": {
                  "contents": "// Hero section component"
                }
              },
              "Features.jsx": {
                "file": {
                  "contents": "// Features section component"
                }
              }
            }
          }
        }
      },
      "pages": {
        "directory": {
          "Home.jsx": {
            "file": {
              "contents": "// Home page component"
            }
          },
          "About.jsx": {
            "file": {
              "contents": "// About page component"
            }
          },
          "Services.jsx": {
            "file": {
              "contents": "// Services page component"
            }
          },
          "Contact.jsx": {
            "file": {
              "contents": "// Contact page component"
            }
          }
        }
      },
      "utils": {
        "directory": {
          "routes.js": {
            "file": {
              "contents": "// Route definitions and navigation data"
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