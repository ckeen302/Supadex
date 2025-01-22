import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Clock, Zap } from "lucide-react"
import type { QuizStats as QuizStatsType } from "./types"

interface QuizStatsProps {
  stats: QuizStatsType
}

export default function QuizStats({ stats }: QuizStatsProps) {
  const accuracy = stats.totalQuestions > 0 ? (stats.correctAnswers / stats.totalQuestions) * 100 : 0
  const experienceToNextLevel = 1000 - (stats.experiencePoints % 1000)
  const experienceProgress = (stats.experiencePoints % 1000) / 10

  return (
    <Card className="bg-[rgba(24,191,191,0.1)] border-[#18BFBF]">
      <CardHeader>
        <CardTitle className="text-xl text-white">Your Quiz Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[rgba(24,191,191,0.2)] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <h3 className="font-semibold text-white">Level {stats.level}</h3>
            </div>
            <Progress value={experienceProgress} className="h-2" />
            <p className="text-sm mt-1 text-white/80">{experienceToNextLevel} XP to next level</p>
          </div>

          <div className="bg-[rgba(24,191,191,0.2)] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <h3 className="font-semibold text-white">Accuracy</h3>
            </div>
            <Progress value={accuracy} className="h-2" />
            <p className="text-sm mt-1 text-white/80">{accuracy.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[rgba(24,191,191,0.2)] p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <div>
                <h3 className="font-semibold text-white">Best Streak</h3>
                <p className="text-2xl font-bold text-white">{stats.highestStreak}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(24,191,191,0.2)] p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-300" />
              <div>
                <h3 className="font-semibold text-white">Avg. Time</h3>
                <p className="text-2xl font-bold text-white">{stats.averageTime.toFixed(1)}s</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(24,191,191,0.2)] p-4 rounded-lg">
          <h3 className="font-semibold mb-3 text-white">Recent Achievements</h3>
          <div className="grid grid-cols-1 gap-2">
            {stats.achievements
              .filter((a) => a.unlockedAt)
              .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
              .slice(0, 3)
              .map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-2 p-2 bg-[rgba(24,191,191,0.1)] rounded">
                  <Trophy className="w-4 h-4 text-yellow-300" />
                  <div>
                    <p className="font-medium text-white">{achievement.name}</p>
                    <p className="text-sm text-white/80">{achievement.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

