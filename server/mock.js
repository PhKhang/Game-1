const playerData = [
  // Send to client
  { id: 1, username: "A", password: "123", score: 0, isConnected: false },
  { id: 2, username: "B", password: "456", score: 0, isConnected: false },
  { id: 3, username: "C", password: "789", score: 0, isConnected: false },
  { id: 4, username: "D", password: "abc", score: 0, isConnected: false },
];

const questions = [
  // Round 1
  [
    {
      id: 1,
      type: "short-phrase",
      content:
        '<p>What is the <strong>capital</strong> of France?</p> <img src="/cc25.jpg" width=50 alt="coding-challenge" />',
      time: 20,
      answer: "Paris",
      hints: [
        "It's in Western Europe",
        "It's known for a famous tower",
        "It's on the Seine River",
        "It starts with 'P'",
      ],
    },
    {
      id: 2,
      type: "short-phrase",
      content:
        '<p>What is the chemical symbol for gold?</p> <img src="/cc25.jpg" width=50 alt="coding-challenge" />',
      time: 20,
      answer: "Au",
      hints: [
        "Its atomic number is 79.",
        "Used in jewelry and electronics.",
        "It's a precious yellow metal.",
        'The symbol comes from the Latin word "Aurum."',
      ],
    },
  ],
  // Round 2
  [
    {
      id: 3,
      type: "short-phrase",
      content: "<p>Who painted the ceiling of the Sistine Chapel?</p>",
      time: 20,
      answer: "Michelangelo",
      hints: [
        "He was also a sculptor, not just a painter.",
        'He created the famous "David" statue.',
        "He worked during the Renaissance period.",
        "The project took about four years to complete.",
      ],
    },
    {
      id: 4,
      type: "short-phrase",
      content:
        '<p>Which planet is known as the "Red Planet"?</p> <img src="/cc25.jpg" width=50 alt="coding-challenge" />',
      time: 20,
      answer: "Mars",
      hints: [
        "It's the fourth planet from the Sun.",
        "Has the tallest volcano in the solar system.",
        "Its color is due to iron oxide (rust) on the surface.",
        "NASA has sent multiple rovers there.",
      ],
    },
  ],
];

exports.playerData = playerData;
exports.questions = questions;