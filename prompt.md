Build a complete production-ready web application called "Descrify".

The final result must be a fully runnable Next.js project, not pseudocode or partial snippets.

All files must be complete and coherent.
All dependencies must be included.
The project must compile and run after installing dependencies and adding GEMINI_API_KEY.

--------------------------------

PROJECT OVERVIEW

Descrify is a free AI-powered web application that generates SEO-optimized descriptions for:

• properties for sale  
• apartments / vacation rentals / holiday homes  

The user fills in property information and optionally uploads images.

The AI then generates structured descriptions suitable for real estate portals and booking platforms.

--------------------------------

TECH STACK

Use the following stack:

• Next.js (latest) with App Router  
• TypeScript  
• Tailwind CSS  
• Google GenAI SDK (Gemini API)  
• React Hook Form  
• Zod validation  

Constraints:

• No database  
• No authentication  
• No payments  
• No user accounts  
• No scraping of Booking.com or other portals  
• No automatic reading/importing of listing URLs  
• No OCR pipelines  
• No persistent image storage  

API key must never be hardcoded.
Access it only through:

process.env.GEMINI_API_KEY

--------------------------------

AI MODEL

Use Gemini model:

gemini-1.5-flash

Requirements:

• Define the model in a reusable constant in lib/ai.ts  
• Use the official Google GenAI SDK  
• All AI requests must run server-side in a Next.js route handler  
• Never call Gemini directly from the client  

--------------------------------

USAGE LIMIT

Implement a simple anonymous rate limit.

Each user may generate:

MAX 5 descriptions per 24 hours.

Requirements:

• limit based on IP address  
• implemented in the server API route  
• use a lightweight in-memory store  

If the limit is exceeded return:

"You have reached the daily limit of 5 generations. Please try again in 24 hours."

Also return the number of remaining generations.

Example UI display:

"2 of 5 generations used today"

--------------------------------

FORM STRUCTURE

The form must have three sections.

SECTION 1 – BASIC INFORMATION

• Property type (Apartment / House / Villa / Studio / Land)  
• Listing type (For sale / Vacation rental)  
• Location (City + region)  
• Property size (m²)  
• Bedrooms  
• Bathrooms  
• Max guests (only if Vacation rental)

--------------------------------

SECTION 2 – LOCATION AND AMENITIES

• Distance to sea  
• Distance to city center  
• Nearby attractions  

Amenities checkboxes:

• Pool  
• Balcony  
• Terrace  
• Garden  
• Parking  
• Sea view  
• Air conditioning  
• Modern kitchen  
• BBQ area  
• Private entrance  
• Pet friendly  
• Fast WiFi  

Optional field:

Location highlights

Placeholder example:

"close to the beach, near the old town, peaceful countryside setting"

--------------------------------

SECTION 3 – ADDITIONAL DETAILS

• Year built / renovated  
• Interior style (modern / luxury / rustic / minimalist)  
• Special highlights  

Textarea:

"Describe anything unique about the property"

--------------------------------

IMAGE SUPPORT

Allow optional image upload.

Rules:

• maximum 3 images  
• accepted formats: jpg, jpeg, png, webp  
• max 5MB per image  
• show preview thumbnails  

Images should NOT be stored permanently.

They should be processed in memory only for the request.

If images are present, Gemini should attempt to detect visible features:

• pool  
• balcony  
• sea view  
• terrace  
• garden  
• modern interior  
• kitchen  
• outdoor area  

If image analysis fails, continue generation using only text inputs.

--------------------------------

AI OUTPUT FORMAT

Gemini must return structured JSON.

Schema:

{
  "seoTitle": string,
  "shortDescription": string,
  "longDescription": string,
  "listingVersion": string,
  "detectedImageFeatures": string[],
  "suggestedKeywords": string[]
}

Constraints:

• SEO title max 50 characters  
• Short description 2–3 sentences  
• Long description 250–350 words  

Output must:

• sound natural and premium  
• avoid repetitive wording  
• avoid generic AI phrases  
• focus on lifestyle and experience  
• highlight location benefits  
• be suitable for property portals  

The AI must never invent amenities or location features that were not provided by the user or visible in images.

Normalize formatting:
trim whitespace and clean line breaks.

--------------------------------

SERVER PROMPT REQUIREMENT

Create a strong system prompt positioning the AI as:

• a professional real estate copywriter  
• an SEO specialist  
• experienced in vacation rental listings  

The prompt should:

• adapt output depending on listing type  
• incorporate provided property data  
• optionally integrate image observations  
• avoid hallucinations  
• produce persuasive but realistic marketing copy  

--------------------------------

UI / DESIGN REQUIREMENTS

Use a modern SaaS design with Tailwind CSS.

Design direction:

• premium modern SaaS style  
• large hero section  
• rounded-2xl / rounded-3xl  
• subtle glassmorphism  
• dark background with light cards (or vice versa)  
• spacious layout  

Layout:

Desktop:
left = form  
right = live preview results

Mobile:
stacked layout.

Main CTA button text:

"Generate better description"

UX features:

• loading state during generation  
• disabled button while generating  
• validation messages  
• clean API error display  
• copy-to-clipboard buttons  
• reset form button  
• example data autofill  
• image preview before submit  

Generated output must appear in separate cards with copy buttons.

--------------------------------

PROJECT STRUCTURE

Use a clean modular structure:

app/
components/
lib/
types/

--------------------------------

CODE REQUIREMENTS

Generate:

1. full folder structure  
2. package.json with all dependencies  
3. Tailwind config  
4. Next.js config  
5. environment example file  
6. form components  
7. validation schema  
8. Gemini API route  
9. utility functions  
10. reusable UI components  

Include:

.env.local.example

GEMINI_API_KEY=your_api_key_here

--------------------------------

ERROR HANDLING

Validate both:

• incoming API request
• Gemini response format

If Gemini returns invalid JSON:

return a safe user-friendly error message.

--------------------------------

FINAL REQUIREMENT

Do NOT generate mockups.

Generate the full working codebase.

The UI must look like a real premium SaaS product — not a hackathon demo.

--------------------------------

After generating the codebase also include:

• instructions to install dependencies
• instructions to run locally
• example usage flow