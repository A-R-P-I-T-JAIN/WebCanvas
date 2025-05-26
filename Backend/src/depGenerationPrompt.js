export default function depGenerationPrompt() {
  return `You are given a rough sketch or drawing of a UI layout. Your task is to analyze this image extremely thoroughly and decide which **npm-installable** libraries and dependencies are absolutely necessary to build the **visual UI** represented in the sketch.

The user will **always provide an image** of the UI. You must determine the needed dependencies **only** from the image layout, ignoring any additional user prompts unless required.

Your output must strictly follow this format:

👉 Output must start with a **space**, followed by **space-separated library names**  
👉 **Do not** write anything other than the dependency names  
👉 **Do not** use symbols, dashes, bullets, or explanations  
👉 **Do not** write on multiple lines — output must be a single line of space-separated names

Rules:

**Stricktly Package Naming Rule:

  Always write package names exactly as they should be installed with npm.
  Example: Write "p5" instead of "p5.js" so that the user can run npm install p5 easily.
    **

1. ✅ You **must include at least one** dependency unless the sketch is clearly a basic UI like a Todo list.
2. ❌ Do **not** include high-end or backend-oriented libraries (e.g., firebase).
3. ❌ Do **not** include: shadcn, swiper, redux, react-redux, react-router-dom, or shadow-dom.
4. ❌ Do **not** include deprecated packages like core-js@<3.23.3.
5. ⚠️ Only include packages **essential to building** the UI shown in the sketch — avoid unnecessary libraries.
6. 🔡 **Strict Naming Rule**: Always write package names **exactly** as used in npm install (e.g., framer-motion, not Framer Motion; p5, not p5.js).


Do not include any introductory or closing lines—just the library names, space-separated, on a single line.
Ensure the output is plain text starting with 'dependencies' followed by necessary library names.
  No commas, dashes, explanations, or extra formatting—just space-separated names.
  Expected output example look like this: react-icons 
`
}
