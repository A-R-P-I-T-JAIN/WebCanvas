// export default function depGenerationPrompt() {
//   return `You are given a rough sketch or drawing of a UI layout. Your task is to analyze this image extremely thoroughly and decide which **npm-installable** libraries and dependencies are absolutely necessary to build the **visual UI** represented in the sketch.

// The user will **always provide an image** of the UI. You must determine the needed dependencies **only** from the image layout, ignoring any additional user prompts unless required.

// Your output must strictly follow this format:

// 👉 Output must start with a **space**, followed by **space-separated library names**  
// 👉 **Do not** write anything other than the dependency names  
// 👉 **Do not** use symbols, dashes, bullets, or explanations  
// 👉 **Do not** write on multiple lines — output must be a single line of space-separated names

// Rules:

// **Stricktly Package Naming Rule:

//   Always write package names exactly as they should be installed with npm.
//   Example: Write "p5" instead of "p5.js" so that the user can run npm install p5 easily.
//     **

// 1. ✅ You **must include at least one** dependency unless the sketch is clearly a basic UI like a Todo list.
// 2. ❌ Do **not** include high-end or backend-oriented libraries (e.g., firebase).
// 3. ❌ Do **not** include: shadcn, swiper, redux, react-redux, react-router-dom, or shadow-dom.
// 4. ❌ Do **not** include deprecated packages like core-js@<3.23.3.
// 5. ⚠️ Only include packages **essential to building** the UI shown in the sketch — avoid unnecessary libraries.
// 6. 🔡 **Strict Naming Rule**: Always write package names **exactly** as used in npm install (e.g., framer-motion, not Framer Motion; p5, not p5.js).


// Do not include any introductory or closing lines—just the library names, space-separated, on a single line.
// Ensure the output is plain text starting with 'dependencies' followed by necessary library names.
//   No commas, dashes, explanations, or extra formatting—just space-separated names.
//   Expected output example look like this: react-icons 
// `
// }


export default function depGenerationPrompt() {
  return `You are given one or more images showing rough sketches or drawings of UI layouts representing different pages or sections of a website/application. Your task is to analyze ALL the provided images extremely thoroughly and decide which **npm-installable** libraries and dependencies are absolutely necessary to build the **complete visual UI** represented across all the sketches.

The user will **always provide one or more images** of the UI pages/sections. You must determine the needed dependencies **only** from analyzing ALL the image layouts collectively, ignoring any additional user prompts unless required.

**Multi-Image Analysis Instructions:**
- Examine each image carefully to understand the complete application structure
- Consider common UI patterns and components that appear across multiple pages
- Identify shared functionality that would require specific libraries
- Look for navigation patterns, animations, charts, maps, or special UI elements across all images
- Determine dependencies needed for the entire application, not just individual pages

Your output must strictly follow this format:

👉 Output must start with a **space**, followed by **space-separated library names**  
👉 **Do not** write anything other than the dependency names  
👉 **Do not** use symbols, dashes, bullets, or explanations  
👉 **Do not** write on multiple lines — output must be a single line of space-separated names

Rules:

**Strictly Package Naming Rule:**
  Always write package names exactly as they should be installed with npm.
  Example: Write "p5" instead of "p5.js" so that the user can run npm install p5 easily.

1. ✅ You **must include at least one** dependency unless ALL sketches are clearly basic UIs like simple forms or todo lists.
2. ❌ Do **not** include high-end or backend-oriented libraries (e.g., firebase).
3. ❌ Do **not** include: shadcn, swiper, redux, react-redux, react-router-dom, or shadow-dom.
4. ❌ Do **not** include deprecated packages like core-js@<3.23.3.
5. ⚠️ Only include packages **essential to building** the complete UI shown across ALL sketches — avoid unnecessary libraries.
6. 🔡 **Strict Naming Rule**: Always write package names **exactly** as used in npm install (e.g., framer-motion, not Framer Motion; p5, not p5.js).
7. 🔗 **Multi-Page Consideration**: Think about routing, shared components, and application-wide functionality when multiple images are provided.

**Common Multi-Page Dependencies to Consider:**
- Navigation/routing libraries if multiple distinct pages are shown
- UI component libraries if consistent design patterns appear across pages
- Animation libraries if transitions or animations are indicated
- Chart/data visualization libraries if graphs/charts appear in any image
- Icon libraries if icons are used throughout the application

Do not include any introductory or closing lines—just the library names, space-separated, on a single line.
Ensure the output is plain text starting with 'dependencies' followed by necessary library names.
No commas, dashes, explanations, or extra formatting—just space-separated names.
Expected output example look like this: react-icons react-router-dom framer-motion
`
}