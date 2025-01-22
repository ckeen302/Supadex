import { useState, useEffect } from 'react'
import { Achievement } from './types'
import { Trophy } from 'lucide-react'

interface AchievementPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 bg-[rgba(24,191,191,0.9)] border-2 border-[#18BFBF] rounded-lg p-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-yellow-300" />
        <div>
          <h3 className="font-bold text-white">{achievement.name}</h3>
          <p className="text-sm text-white/80">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}

