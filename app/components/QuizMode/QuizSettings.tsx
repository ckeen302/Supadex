import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { QuizMode, Difficulty, QuestionType } from './types'

interface QuizSettingsProps {
  onStart: (settings: QuizSettings) => void;
}

interface QuizSettings {
  mode: QuizMode;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  questionCount: number;
  enableTimer: boolean;
  enableSound: boolean;
  enableHints: boolean;
}

export default function QuizSettings({ onStart }: QuizSettingsProps) {
  const [settings, setSettings] = useState<QuizSettings>({
    mode: 'standard',
    difficulty: 'medium',
    questionTypes: ['name', 'type'],
    questionCount: 10,
    enableTimer: true,
    enableSound: true,
    enableHints: false,
  });

  const questionTypes: QuestionType[] = [
    'name', 'type', 'move', 'stat', 'ability',
    'evolution', 'location', 'cry', 'silhouette',
    'pokedex', 'effectiveness'
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[rgba(24,191,191,0.1)] border-[#18BFBF]">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Quiz Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Quiz Mode</Label>
            <Select
              value={settings.mode}
              onValueChange={(value: QuizMode) => 
                setSettings(prev => ({ ...prev, mode: value }))
              }
            >
              <SelectTrigger className="bg-[rgba(24,191,191,0.2)] border-[#18BFBF] text-white">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
                <SelectItem value="standard" className="text-white">Standard</SelectItem>
                <SelectItem value="timeAttack" className="text-white">Time Attack</SelectItem>
                <SelectItem value="survival" className="text-white">Survival</SelectItem>
                <SelectItem value="daily" className="text-white">Daily Challenge</SelectItem>
                <SelectItem value="challenge" className="text-white">Challenge Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Difficulty</Label>
            <Select
              value={settings.difficulty}
              onValueChange={(value: Difficulty) => 
                setSettings(prev => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger className="bg-[rgba(24,191,191,0.2)] border-[#18BFBF] text-white">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
                <SelectItem value="easy" className="text-white">Easy</SelectItem>
                <SelectItem value="medium" className="text-white">Medium</SelectItem>
                <SelectItem value="hard" className="text-white">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Question Types</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {questionTypes.map((type) => (
              <Button
                key={type}
                variant={settings.questionTypes.includes(type) ? "default" : "outline"}
                onClick={() => {
                  setSettings(prev => ({
                    ...prev,
                    questionTypes: prev.questionTypes.includes(type)
                      ? prev.questionTypes.filter(t => t !== type)
                      : [...prev.questionTypes, type]
                  }))
                }}
                className={`${
                  settings.questionTypes.includes(type)
                    ? 'bg-[#18BFBF] text-[#0F2F2F]'
                    : 'bg-[rgba(24,191,191,0.1)] text-white'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white">Enable Timer</Label>
            <Switch
              checked={settings.enableTimer}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, enableTimer: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white">Enable Sound Effects</Label>
            <Switch
              checked={settings.enableSound}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, enableSound: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white">Enable Hints</Label>
            <Switch
              checked={settings.enableHints}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, enableHints: checked }))
              }
            />
          </div>
        </div>

        <Button 
          onClick={() => onStart(settings)}
          className="w-full bg-[#18BFBF] text-[#0F2F2F] hover:bg-[#18BFBF]/80"
          disabled={settings.questionTypes.length === 0}
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
}

