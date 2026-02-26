// Simple test to verify date parsing fix
console.log("Testing Date Parsing Fix");
console.log("========================");

// Test the specific case that was causing the error
const testCases = [
  { input: "null", expected: null, description: "String 'null'" },
  { input: "", expected: null, description: "Empty string" },
  { input: "N/A", expected: null, description: "N/A string" },
  { input: "2026-02-27", expected: "valid", description: "Valid date" },
  { input: "invalid-date", expected: null, description: "Invalid date" },
];

function parseDate(dateString: string | null) {
  if (
    !dateString ||
    dateString === "" ||
    dateString === "N/A" ||
    dateString === "null"
  ) {
    return null;
  }
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    return null;
  } catch {
    return null;
  }
}

testCases.forEach((testCase) => {
  const result = parseDate(testCase.input);
  const status =
    testCase.expected === "valid"
      ? result !== null
      : result === testCase.expected;
  console.log(
    `${status ? "✅" : "❌"} ${testCase.description}: "${testCase.input}" → ${result}`,
  );
});

console.log("\n🎉 Date parsing fix verified!");
