import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  onAnswer: (correct: boolean) => void;
}

export default function QuizCard({ question, questionNumber, onAnswer }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const answerIndex = parseInt(selectedAnswer);
    const correct = answerIndex === question.correctAnswer;
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  return (
    <Card className="p-6" data-testid={`card-quiz-${questionNumber}`}>
      <div className="mb-4">
        <span className="text-sm font-medium text-muted-foreground">Question {questionNumber}</span>
        <h3 className="text-lg font-semibold mt-1" data-testid="text-question">
          {question.question}
        </h3>
      </div>

      <RadioGroup value={selectedAnswer || ""} onValueChange={setSelectedAnswer} disabled={submitted}>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                submitted
                  ? index === question.correctAnswer
                    ? "bg-green-500/10 border-green-500/20"
                    : selectedAnswer === String(index)
                    ? "bg-red-500/10 border-red-500/20"
                    : ""
                  : "hover-elevate"
              }`}
            >
              <RadioGroupItem value={String(index)} id={`option-${questionNumber}-${index}`} />
              <Label
                htmlFor={`option-${questionNumber}-${index}`}
                className="flex-1 cursor-pointer text-sm"
              >
                {option}
              </Label>
              {submitted && index === question.correctAnswer && (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
              {submitted && selectedAnswer === String(index) && index !== question.correctAnswer && (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
          ))}
        </div>
      </RadioGroup>

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="w-full mt-4"
          data-testid="button-submit-answer"
        >
          Submit Answer
        </Button>
      )}

      {submitted && question.explanation && (
        <div className={`mt-4 p-4 rounded-lg ${
          isCorrect 
            ? "bg-green-500/10 border border-green-500/20" 
            : "bg-red-500/10 border border-red-500/20"
        }`}>
          <p className="text-sm font-medium mb-1">
            {isCorrect ? "Correct!" : "Incorrect"}
          </p>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
        </div>
      )}
    </Card>
  );
}
