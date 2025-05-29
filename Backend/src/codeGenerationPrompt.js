export default function codeGenerationPrompt(userInput = "", dependencies = "") {
  const baseInstructions = `# Multi-Page Website Generation from UI Sketches

## Primary Task
Generate a beautiful, modern, and fully functional multi-page website based on the provided UI sketch or wireframe images. The sketches serve as your primary design reference - interpret them as professional mockups and transform them into a polished, production-ready interface with proper page hierarchy and navigation.

### Page Hierarchy Detection
- **Analyze all provided images** to understand the complete website structure
- **Strictly develop only and all the pages that are provided in the images**
- **Generate pages dynamically** based on what is detected in the sketches, not a predetermined list

### Multi-Page Implementation Strategy
- **Router-based navigation**: Implement proper routing between pages
- **Shared components**: Extract common elements (header, footer, navigation) into reusable components
- **Consistent design language**: Maintain visual consistency across all pages
- **Page-specific functionality**: Implement unique features for each page type
- **Breadcrumb navigation**: Add navigation aids for complex site structures

## Design Interpretation Guidelines

**you have to use Flex box for layout and different colors for different sections and use this like to apply image on the website -> 
  1) "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
  2) "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80" 
  3) "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?ixid=2yJhcHBfaWQiOjEyMDd9
  
  and many more images from unsplash**
  *it is not necessaery to use these image only but always use the whenever it required to addimage on the website*
  *it is not necessaery to use these image only but always use the whenever it required to addimage on the website*
  *it is not necessaery to use these image only but always use the whenever it required to addimage on the website*
  *it is not necessaery to use these image only but always use the whenever it required to addimage on the website*

  *Adjust the height and width of the image as per the requirement*
  *Adjust the height and width of the image as per the requirement*
  *Adjust the height and width of the image as per the requirement*

### Visual Enhancement Rules
- **Transform wireframes into polished UI**: Even if the sketch lacks colors or details, create a modern, visually appealing design
- **if the images contains colors strictly use the same colors as in the images**
- **strictly develop only the pages that are provided in the images**
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
Strictly ensure to write import statements correctly for ex. "import React from 'react'"
Strictly ensure to write import statements correctly for ex. "import React from 'react'"
Strictly ensure to write import statements correctly for ex. "import React from 'react'"

Requirements & Conditions:
Keep the code comprehensive yet maintainable across multiple pages.
You have to generate at least 5000 tokens in output for multi-page implementation.
Import React only in main.jsx "import React from 'react'" - it is compulsory.
Import React only in main.jsx "import React from 'react'" - it is compulsory.
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
│   └── (dynamically generated based on detected pages from sketches)
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
8. **Canvas/Drawing Page**: Interactive canvas, drawing tools, creative interfaces
9. **Dashboard Page**: Analytics, data visualization, control panels
10. **Profile/Settings Page**: User preferences, account management
11. **Gallery/Media Page**: Image/video galleries, media showcases
12. **Custom Pages**: Any other specific pages detected from the sketches

**IMPORTANT**: Generate pages based on what you actually see in the provided sketches, not just common page types. If the sketch shows a Canvas page, generate a Canvas.jsx file. If it shows a custom page type, create that specific page.

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
- **Don't hardcode page names** - generate based on actual sketch content
- **Don't skip pages** that are shown in the sketches

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
✅ **All pages from sketches are implemented** (including Canvas, Dashboard, etc.)

---

## Output Format (Dynamic JSON Structure)

**CRITICAL**: Analyze the provided sketches first, then generate a JSON structure with ALL detected pages.

**Instructions:**
1. **Identify all pages** from the provided sketches
2. **Generate page components** for each detected page (Home.jsx, Canvas.jsx, Dashboard.jsx, etc.)
3. **Include all supporting components** (Header, Footer, Layout, etc.)
4. **Create complete routing** in App.jsx for all pages

**Example JSON Structure:**

{
  "src": {
    "directory": {
      "App.jsx": {
        "file": {
          "contents": "// Main app component with routing for ALL detected pages"
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
                  "contents": "// Header component with navigation for all pages"
                }
              },
              "Footer.jsx": {
                "file": {
                  "contents": "// Footer component"
                }
              },
              "Navigation.jsx": {
                "file": {
                  "contents": "// Navigation component for all detected pages"
                }
              },
              "Layout.jsx": {
                "file": {
                  "contents": "// Layout wrapper component"
                }
              },
              // strictly add all the components that are present in the sketches but not present in the above format
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
              },
              // strictly add all the components that are present in the sketches but not present in the above format
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
              },
              // strictly add all the components that are present in the sketches but not present in the above format
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
          },
          "// NOTE: Generate all the other pages based on what you detect in the sketches": 
        }
}
      },
      "utils": {
        "directory": {
          "routes.js": {
            "file": {
              "contents": "// Route definitions for all detected pages"
            }
          },
          // strictly add all the components that are present in the sketches but not present in the above format
          }
        }
      }
    }
  }
}

**IMPORTANT NOTES:**
- do not include any comment in the output
- Replace the comment placeholders in the "pages" directory with actual page components based on your sketch analysis
- If you see a Canvas page in sketches, include "Canvas.jsx" in the pages directory
- If you see a Dashboard page, include "Dashboard.jsx", etc.
- Always generate the complete file contents, not just comments
- Ensure App.jsx includes routing for ALL detected pages
- strictly add any new pages or any UI components or any section which is not present in the above format but is present in the sketches
- strictly add any new pages or any UI components or any section which is not present in the above format but is present in the sketches
- strictly add any new pages or any UI components or any section which is not present in the above format but is present in the sketches

**Generate a complete, production-ready multi-page website that implements ALL detected pages.**

Strictly ensure to write import statements correctly for ex. "import React from 'react'"`;

  return baseInstructions;
}