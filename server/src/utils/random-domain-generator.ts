const words = [
  'phoenix',
  'cherry',
  'bubble',
  'elderberry',
  'cayon',
  'grape',
  'honeydew',
  'kiwi',
  'lemon',
  'rosemary',
];

// Function to generate a unique timestamp-based string
function generateTimestampId(): string {
  const timestamp = Date.now();
  return timestamp.toString();
}

export function generateUniqueSubdomainName(): string {
  // Randomly select one fruit
  const randomFruit = words[Math.floor(Math.random() * words.length)];

  // Generate a unique timestamp-based ID
  const uniqueId = generateTimestampId();

  // Return the formatted subdomain
  return `${randomFruit}-${uniqueId}`;
}
