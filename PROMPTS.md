# Prompts for Building "Friction"

This document contains prompts that have been used for building Friction. Gemini has been used to generate some of the code, while google search has been used alongside. The respective prompts for gemini are as follows:

## 1. Initial Architecture & Setup
> "i want to build a web app called Friction that acts as a cognitive speed bump for toxic comments. if a user tries to post a toxic comment they have to pass a reading comprehension quiz based on the article they are commenting on. i want to use cloudflare workers for the backend workers ai with llama 3.3 for the intelligence and durable objects for storing the state like the comment and the quiz session. The frontend should be a react app. can you help me set this up? i want to keep the backend and frontend in separate folders"

## 2. Backend Implementation
> "ok lets start with the backend. give me a wrangler.toml configuration. i need bindings for workers ai and a durable object class named FrictionVault"

> "now write the FrictionVault durable object class in typescript. it needs to store a session when created containing the users comment the article text and the generated quiz. it should also have a method to verify answers. if the answers are correct it should mark the session as solved and return the original comment"

> "now i need the main worker code. i am using hono. write a script that has a post /api/submit endpoint. it receives comment and articleText. use env.AI with llama 3.3 to check if the comment is toxic. if it is toxic ask the ai to generate a 3 question multiple choice quiz based on the article text. then store everything in the FrictionVault DO and return the quiz to the user. if its not toxic just return a success message"

> "i need to add verification. add a post /api/verify endpoint to the worker code. it takes quizId and answers. look up the durable object by id and call the verification method"

## 3. Frontend Implementation
> "now for the frontend. i created a vite react project. i need a component called ArticleView that displays a dummy controversial article about ai replacing software engineers. make it look like a modern blog post"

> "make another component called QuizModal. it should pop up when the user tries to post a toxic comment. it needs to display the questions passed to it and let the user select options. it should have a verify and post button"

> "now i need the App.tsx. here is the plan: show the ArticleView. have a textarea for comments. when the user clicks post send the comment to my backend api at /api/submit. if the backend says its blocked show the QuizModal. when the user submits the quiz send answers to /api/verify. if verification passes add the comment to the list. assume i have the components imported"

## 4. Styling & Polish
> "can you give me some css to make this look premium? i want a dark theme with a deep gray background indigo accents and glassmorphism effects. just give me a big css file i can paste into index.css"

> "the json parsing in the worker code i wrote earlier is failing sometimes because the ai returns extra text. here is the code i have. can you rewrite the parsing part to be more robust? [PASTE CODE]"
