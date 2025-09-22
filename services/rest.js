// const geminiService = require("./geminiService"); // Adjust path if needed
// async function testGeminiAPI() {
//   if (!geminiService.isAvailable) {
//     console.log("Gemini API is not available.");
//     return;
//   }

//   // Test 1: Skill recommendations
//   const userSkills = ["JavaScript", "React"];
//   const jobTitle = "Full Stack Developer";
//   const recommendations = await geminiService.getEnhancedRecommendations(
//     userSkills,
//     5,
//     jobTitle
//   );
//   console.log("=== Skill Recommendations ===");
//   console.log(JSON.stringify(recommendations, null, 2));

//   // Test 2: Learning path
//   const fromSkill = "HTML";
//   const toSkill = "React";
//   const learningPath = await geminiService.getEnhancedLearningPath(
//     fromSkill,
//     toSkill
//   );
//   console.log("\n=== Learning Path ===");
//   console.log(JSON.stringify(learningPath, null, 2));
// }

// testGeminiAPI();
