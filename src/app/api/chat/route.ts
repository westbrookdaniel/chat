// const result = streamText({
//   model,
//   messages,
//   system,
//   async onFinish({ response }) {
//     const nextMessages = appendResponseMessages({
//       messages,
//       responseMessages: response.messages,
//     });
//
//     await updateThread({
//       where: { id },
//       data: { data: { ...currentData, messages: nextMessages } },
//     });
//
//     if (thread.title === "Untitled") {
//       const title = await generateText({
//         model,
//         prompt: JSON.stringify(nextMessages),
//         system:
//           "Generate a concise, descriptive title (max 30 characters) for this chat thread based on the conversation content. The title should capture the main topic or purpose of the discussion. Do not include quotes in your response. ONLY respond with the title.",
//       });
//
//       await updateThread({
//         where: { id },
//         data: { title: title.text.trim() || "Untitled" },
//       });
//     }
//   },
// });
