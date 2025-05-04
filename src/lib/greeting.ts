export function getGreeting() {
  const hours = new Date().getHours();
  return hours < 12
    ? "Good Morning"
    : hours < 18
      ? "Good Afternoon"
      : "Good Evening";
}
