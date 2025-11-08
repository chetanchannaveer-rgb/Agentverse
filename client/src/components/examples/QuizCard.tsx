import QuizCard from '../QuizCard';

export default function QuizCardExample() {
  const sampleQuestion = {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    explanation: "Paris is the capital and largest city of France, known for the Eiffel Tower, Louvre Museum, and rich cultural heritage."
  };

  return (
    <div className="max-w-2xl">
      <QuizCard
        question={sampleQuestion}
        questionNumber={1}
        onAnswer={(correct) => console.log('Answer correct:', correct)}
      />
    </div>
  );
}
