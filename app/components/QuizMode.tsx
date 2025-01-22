'use client'

import { useState, useEffect } from 'react'
import { Pokemon } from '@/types/pokemon'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface QuizModeProps {
  pokemonList: Pokemon[]
}

type QuestionType = 'name' | 'type' | 'move' | 'stat' | 'whos-that-pokemon'

interface Question {
  type: QuestionType
  pokemon: Pokemon
  options: string[]
  correctAnswer: string
}

interface QuizSettings {
  questionCount: number
  questionTypes: QuestionType[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function QuizMode({ pokemonList }: QuizModeProps) {
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    questionCount: 10,
    questionTypes: ['name', 'whos-that-pokemon'],
    difficulty: 'medium'
  })
  const [isSetupMode, setIsSetupMode] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [isTimeUp, setIsTimeUp] = useState(false)

  useEffect(() => {
    if (!isSetupMode) {
      generateQuiz()
    }
  }, [isSetupMode])

  useEffect(() => {
    if (!isSetupMode && !answered && !isTimeUp) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            setIsTimeUp(true)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isSetupMode, answered, isTimeUp, currentQuestionIndex])

  const generateQuiz = () => {
    const newQuestions: Question[] = []
    for (let i = 0; i < quizSettings.questionCount; i++) {
      newQuestions.push(generateQuestion())
    }
    setQuestions(newQuestions)
    setCurrentQuestionIndex(0)
    setScore(0)
    setTimeLeft(getTimeForDifficulty())
    setIsTimeUp(false)
  }

  const generateQuestion = (): Question => {
    const pokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)]
    const questionType = quizSettings.questionTypes[Math.floor(Math.random() * quizSettings.questionTypes.length)]
    let options: string[] = []
    let correctAnswer = ''

    switch (questionType) {
      case 'name':
      case 'whos-that-pokemon':
        correctAnswer = pokemon.name
        options = [pokemon.name, ...getRandomPokemonNames(pokemonList, 3, pokemon.name)]
        break
      case 'type':
        correctAnswer = pokemon.types[0]
        options = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy']
        options = [correctAnswer, ...options.filter(t => t !== correctAnswer).sort(() => 0.5 - Math.random()).slice(0, 3)]
        break
      case 'move':
        const move = pokemon.moves[Math.floor(Math.random() * pokemon.moves.length)]
        correctAnswer = move.name
        options = [move.name, ...getRandomMoves(pokemonList, 3, move.name)]
        break
      case 'stat':
        const stat = pokemon.stats[Math.floor(Math.random() * pokemon.stats.length)]
        correctAnswer = stat.value.toString()
        options = [stat.value.toString(), ...getRandomStats(3, stat.value)]
        break
    }

    return {
      type: questionType,
      pokemon,
      options: options.sort(() => 0.5 - Math.random()),
      correctAnswer
    }
  }

  const handleAnswer = (answer: string) => {
    if (!answered && !isTimeUp) {
      setAnswered(true)
      setSelectedAnswer(answer)
      if (answer === questions[currentQuestionIndex]?.correctAnswer) {
        setScore(score + 1)
      }
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setAnswered(false)
          setSelectedAnswer(null)
          setTimeLeft(getTimeForDifficulty())
          setIsTimeUp(false)
        } else {
          setIsSetupMode(true)
        }
      }, 2000)
    }
  }

  const toggleQuestionType = (type: QuestionType) => {
    setQuizSettings(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }))
  }

  const handleQuestionCountChange = (value: string) => {
    const count = parseInt(value)
    if (!isNaN(count) && count > 0 && count <= 50) {
      setQuizSettings(prev => ({ ...prev, questionCount: count }))
    }
  }

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    setQuizSettings(prev => ({ ...prev, difficulty }))
  }

  const startQuiz = () => {
    if (quizSettings.questionTypes.length > 0) {
      setIsSetupMode(false)
    }
  }

  const getTimeForDifficulty = () => {
    switch (quizSettings.difficulty) {
      case 'easy':
        return 20
      case 'medium':
        return 15
      case 'hard':
        return 10
      default:
        return 15
    }
  }

  if (isSetupMode) {
    return (
      <div className="h-full flex flex-col p-4 text-white">
        <h2 className="text-2xl font-semibold uppercase tracking-wider mb-6">Pokémon Quiz</h2>
        <Card className="bg-[rgba(24,191,191,0.1)] border-[#18BFBF]">
          <CardHeader>
            <CardTitle className="text-white">Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-white">Number of Questions:</label>
              <Select
                value={quizSettings.questionCount.toString()}
                onValueChange={handleQuestionCountChange}
              >
                <SelectTrigger className="w-full bg-[rgba(24,191,191,0.2)] border-[#18BFBF] text-white">
                  <SelectValue placeholder="Select question count" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
                  {[5, 10, 15, 20, 25, 30].map(count => (
                    <SelectItem 
                      key={count} 
                      value={count.toString()}
                      className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
                    >
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-white">Difficulty:</label>
              <Select
                value={quizSettings.difficulty}
                onValueChange={(value: 'easy' | 'medium' | 'hard') => handleDifficultyChange(value)}
              >
                <SelectTrigger className="w-full bg-[rgba(24,191,191,0.2)] border-[#18BFBF] text-white">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
                  <SelectItem 
                    value="easy"
                    className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
                  >
                    Easy
                  </SelectItem>
                  <SelectItem 
                    value="medium"
                    className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
                  >
                    Medium
                  </SelectItem>
                  <SelectItem 
                    value="hard"
                    className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
                  >
                    Hard
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <h3 className="text-lg mb-2 text-white">Question Types:</h3>
              <div className="flex flex-wrap gap-2">
                {(['name', 'whos-that-pokemon', 'type', 'move', 'stat'] as QuestionType[]).map(type => (
                  <Button
                    key={`question-type-${type}`}
                    onClick={() => toggleQuestionType(type)}
                    variant={quizSettings.questionTypes.includes(type) ? "default" : "outline"}
                    className={`${
                      quizSettings.questionTypes.includes(type) 
                        ? 'bg-[#18BFBF] text-white' 
                        : 'bg-[rgba(24,191,191,0.1)] text-white hover:bg-[rgba(24,191,191,0.3)]'
                    }`}
                  >
                    {type === 'whos-that-pokemon' ? "WHO'S THAT POKEMON" : type.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Button
          onClick={startQuiz}
          disabled={quizSettings.questionTypes.length === 0}
          className="mt-auto p-2 bg-[#18BFBF] text-white disabled:opacity-50 hover:bg-[#18BFBF]/80"
        >
          START QUIZ
        </Button>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="h-full flex flex-col p-4 pb-4 text-white"> {/* Update 2 */}
      <div className="pokemon-entry bg-[rgba(24,191,191,0.1)] mb-4 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold text-white">
            {getQuestionText(currentQuestion)} ({currentQuestionIndex + 1}/{questions.length})
          </span>
          <span className="text-lg font-semibold text-white">Time: {timeLeft}s</span>
        </div>
        <Progress value={(timeLeft / getTimeForDifficulty()) * 100} className="mt-2" />
      </div>
      <div className="flex-grow flex flex-col items-center justify-center mb-4">
        <div className="w-[300px] h-[300px] relative flex items-center justify-center mb-4"> {/* Update 1 */}
          <img
            src={currentQuestion?.pokemon.image || "/placeholder.svg"}
            alt="Mystery Pokemon"
            className="w-full h-full object-contain pixelated"
            style={{ 
              filter: (currentQuestion?.type === 'name' || currentQuestion?.type === 'whos-that-pokemon') && !answered && !isTimeUp ? 'brightness(0)' : 'none',
            }}
          />
        </div>
        <div className="w-full grid grid-cols-2 gap-2"> {/* Update 3 */}
          {currentQuestion?.options.map((option, index) => (
            <Button
              key={`answer-${currentQuestionIndex}-${index}`}
              onClick={() => handleAnswer(option)}
              className={`p-4 text-center transition-colors ${
                answered || isTimeUp
                  ? option === currentQuestion.correctAnswer
                    ? 'bg-green-500 text-white'
                    : option === selectedAnswer
                    ? 'bg-red-500 text-white'
                    : 'bg-[rgba(24,191,191,0.1)] text-white'
                  : 'bg-[rgba(24,191,191,0.1)] text-white hover:bg-[rgba(24,191,191,0.2)]'
              }`}
              disabled={answered || isTimeUp}
            >
              <span className="text-lg">{option}</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="pokemon-entry bg-[rgba(24,191,191,0.1)] text-white p-4 rounded-lg">
        <span className="text-lg font-semibold">SCORE: {score}/{questions.length}</span>
      </div>
    </div>
  )
}

function getRandomPokemonNames(pokemonList: Pokemon[], count: number, exclude: string): string[] {
  return pokemonList
    .map(p => p.name)
    .filter(name => name !== exclude)
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
}

function getRandomMoves(pokemonList: Pokemon[], count: number, exclude: string): string[] {
  const allMoves = pokemonList.flatMap(p => p.moves.map(m => m.name))
  return [...new Set(allMoves)]
    .filter(name => name !== exclude)
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
}

function getRandomStats(count: number, exclude: number): string[] {
  return Array.from({ length: count }, () => 
    Math.floor(Math.random() * 200 + 1)
  )
    .filter(stat => stat !== exclude)
    .map(String)
}

function getQuestionText(question: Question | undefined): string {
  if (!question) return "Loading..."

  switch (question.type) {
    case 'name':
    case 'whos-that-pokemon':
      return "WHO'S THAT POKEMON?"
    case 'type':
      return `WHAT IS ${question.pokemon.name.toUpperCase()}'S TYPE?`
    case 'move':
      return `WHICH MOVE CAN ${question.pokemon.name.toUpperCase()} LEARN?`
    case 'stat':
      const stat = question.pokemon.stats.find(s => s.value.toString() === question.correctAnswer)
      return `WHAT IS ${question.pokemon.name.toUpperCase()}'S ${stat?.name.toUpperCase()} STAT?`
    default:
      return "Unknown question type"
  }
}

