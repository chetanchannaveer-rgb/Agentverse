import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuizCard from "@/components/QuizCard";
import { Sparkles, Calendar, BookOpen, Brain, Clock } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface StudyScheduleItem {
  day: number;
  title: string;
  duration: string;
  topics: string[];
  description: string;
  completed: boolean;
}

interface StudySchedule {
  topic: string;
  totalDuration: string;
  estimatedHoursPerDay: number;
  schedule: StudyScheduleItem[];
  tips?: string[];
}

export default function LearningAssistant() {
  const [topic, setTopic] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [generationError, setGenerationError] = useState<string>("");

  // Schedule generation state
  const [scheduleTopic, setScheduleTopic] = useState("");
  const [scheduleDuration, setScheduleDuration] = useState("");
  const [scheduleGoals, setScheduleGoals] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);
  const [scheduleError, setScheduleError] = useState<string>("");
  const [currentSchedule, setCurrentSchedule] = useState<StudySchedule | null>(null);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setGenerationError("");
    
    try {
      const response = await fetch("/api/learning/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          goals: learningGoal || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions generated");
      }

      setQuizQuestions(data.questions);
      setQuizGenerated(true);
      setScore({ correct: 0, total: data.questions.length });
    } catch (error) {
      console.error("Quiz generation error:", error);
      setGenerationError("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
  };

  const handleGenerateSchedule = async () => {
    setIsGeneratingSchedule(true);
    setScheduleError("");
    
    try {
      const response = await fetch("/api/learning/generate-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: scheduleTopic,
          duration: scheduleDuration,
          goals: scheduleGoals || undefined,
          studentEmail: studentEmail.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate schedule");
      }

      const data = await response.json();
      
      if (!data.schedule || !data.schedule.schedule) {
        throw new Error("No schedule generated");
      }

      setCurrentSchedule(data.schedule);
      setScheduleGenerated(true);
      setEmailNotificationsEnabled(data.emailNotificationsEnabled || false);
      
      if (data.emailNotificationsEnabled) {
        console.log("✅ Email notifications enabled for schedule");
      }
    } catch (error) {
      console.error("Schedule generation error:", error);
      setScheduleError("Failed to generate schedule. Please try again.");
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  const handleToggleDayComplete = (dayIndex: number) => {
    if (!currentSchedule) return;
    
    setCurrentSchedule({
      ...currentSchedule,
      schedule: currentSchedule.schedule.map((item, index) =>
        index === dayIndex ? { ...item, completed: !item.completed } : item
      )
    });
  };

  return (
    <div className="min-h-screen">
      <div className="py-12 px-8 border-b">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Learning Assistant</h1>
          <p className="text-muted-foreground">
            AI-powered quiz generation and personalized study schedules
          </p>
        </div>
      </div>

      <div className="py-8 px-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="quiz" className="w-full">
            <TabsList>
              <TabsTrigger value="quiz">Generate Quiz</TabsTrigger>
              <TabsTrigger value="schedule">Study Schedule</TabsTrigger>
              <TabsTrigger value="progress">My Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="quiz" className="mt-6">
              {!quizGenerated ? (
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-primary" />
                    Create Your Quiz
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="topic">Topic or Subject</Label>
                      <Input
                        id="topic"
                        placeholder="e.g., JavaScript, React, Python, Machine Learning"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mt-2"
                        data-testid="input-topic"
                      />
                    </div>
                    <div>
                      <Label htmlFor="learning-goal">Learning Goals (Optional)</Label>
                      <Textarea
                        id="learning-goal"
                        placeholder="Describe what you want to learn or focus on..."
                        value={learningGoal}
                        onChange={(e) => setLearningGoal(e.target.value)}
                        className="mt-2"
                        data-testid="textarea-goals"
                      />
                    </div>
                    {generationError && (
                      <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                        {generationError}
                      </div>
                    )}
                    <Button
                      onClick={handleGenerateQuiz}
                      disabled={!topic.trim() || isGenerating}
                      className="w-full h-12"
                      data-testid="button-generate-quiz"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isGenerating ? "Generating Quiz..." : "Generate Quiz with AI"}
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-semibold">Quiz: {topic}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Score: {score.correct} / {score.total} correct
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuizGenerated(false);
                          setScore({ correct: 0, total: 0 });
                          setQuizQuestions([]);
                          setGenerationError("");
                        }}
                        data-testid="button-new-quiz"
                      >
                        New Quiz
                      </Button>
                    </div>
                  </Card>

                  {quizQuestions.map((question, index) => (
                    <QuizCard
                      key={index}
                      question={question}
                      questionNumber={index + 1}
                      onAnswer={handleAnswer}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              {!scheduleGenerated ? (
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Generate Study Schedule
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="schedule-topic">Topic or Subject</Label>
                      <Input
                        id="schedule-topic"
                        placeholder="e.g., Python Programming, Machine Learning, React"
                        value={scheduleTopic}
                        onChange={(e) => setScheduleTopic(e.target.value)}
                        className="mt-2"
                        data-testid="input-schedule-topic"
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule-duration">Learning Duration</Label>
                      <Input
                        id="schedule-duration"
                        placeholder="e.g., 1 week, 2 weeks, 1 month"
                        value={scheduleDuration}
                        onChange={(e) => setScheduleDuration(e.target.value)}
                        className="mt-2"
                        data-testid="input-schedule-duration"
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule-goals">Learning Goals (Optional)</Label>
                      <Textarea
                        id="schedule-goals"
                        placeholder="Describe what you want to learn or focus on..."
                        value={scheduleGoals}
                        onChange={(e) => setScheduleGoals(e.target.value)}
                        className="mt-2"
                        data-testid="textarea-schedule-goals"
                      />
                    </div>
                    <div>
                      <Label htmlFor="student-email">Email for Daily Updates (Optional)</Label>
                      <Input
                        id="student-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="mt-2"
                        data-testid="input-student-email"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Get daily schedule updates delivered to your inbox
                      </p>
                    </div>
                    {scheduleError && (
                      <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                        {scheduleError}
                      </div>
                    )}
                    <Button
                      onClick={handleGenerateSchedule}
                      disabled={!scheduleTopic.trim() || !scheduleDuration.trim() || isGeneratingSchedule}
                      className="w-full h-12"
                      data-testid="button-generate-schedule"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isGeneratingSchedule ? "Generating Schedule..." : "Generate Schedule with AI"}
                    </Button>
                  </div>
                </Card>
              ) : currentSchedule && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold">{currentSchedule.topic}</h2>
                        <p className="text-muted-foreground mt-1">
                          {currentSchedule.totalDuration} • {currentSchedule.estimatedHoursPerDay} hours/day
                        </p>
                        {emailNotificationsEnabled && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                            ✓ Daily email notifications enabled
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setScheduleGenerated(false);
                          setCurrentSchedule(null);
                          setScheduleTopic("");
                          setScheduleDuration("");
                          setScheduleGoals("");
                          setStudentEmail("");
                          setScheduleError("");
                          setEmailNotificationsEnabled(false);
                        }}
                        data-testid="button-new-schedule"
                      >
                        New Schedule
                      </Button>
                    </div>
                    
                    {currentSchedule.tips && currentSchedule.tips.length > 0 && (
                      <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Study Tips
                        </h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {currentSchedule.tips.map((tip, index) => (
                            <li key={index} className="flex gap-2">
                              <span>•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>

                  {currentSchedule.schedule.map((day, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div 
                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                              day.completed 
                                ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            Day {day.day}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">{day.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {day.duration}
                              </p>
                            </div>
                            <Button
                              variant={day.completed ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleToggleDayComplete(index)}
                              data-testid={`button-toggle-day-${day.day}`}
                            >
                              {day.completed ? "Completed" : "Mark Complete"}
                            </Button>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">Topics:</p>
                            <div className="flex flex-wrap gap-2">
                              {day.topics.map((topicItem, topicIndex) => (
                                <span
                                  key={topicIndex}
                                  className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                                >
                                  {topicItem}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-3">
                            {day.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <Brain className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Study Hours</p>
                      <p className="text-2xl font-bold">42h</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Topics</h3>
                <div className="space-y-2">
                  {["JavaScript ES6", "React Hooks", "TypeScript Basics", "Node.js Express"].map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                      <span className="text-sm">{topic}</span>
                      <span className="text-sm text-muted-foreground">85% mastery</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
