import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Trophy, Coffee, Brain, Store, X, Moon, Sun, Info, ChevronRight } from 'lucide-react';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';
type Theme = 'light' | 'dark';

interface Task {
  id: number;
  name: string;
  completed: boolean;
  points: number;
  sessionId: number;
}

interface Character {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  unlocked: boolean;
}

interface BonusResult {
  points: number;
  isSpinning: boolean;
}

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [points, setPoints] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showStore, setShowStore] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [currentSessionId, setCurrentSessionId] = useState(Date.now());
  const [bonus, setBonus] = useState<BonusResult>({ points: 0, isSpinning: false });
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 'default',
      name: 'NDGM Student',
      icon: '👨‍🎓',
      description: 'Default character',
      cost: 0,
      unlocked: true
    },
    {
      id: 'ninja',
      name: 'Focus Ninja',
      icon: '🥷',
      description: 'Master of concentration',
      cost: 200,
      unlocked: false
    },
    {
      id: 'astronaut',
      name: 'Space Explorer',
      icon: '👨‍🚀',
      description: 'Reaches for the stars',
      cost: 500,
      unlocked: false
    },
    {
      id: 'wizard',
      name: 'Time Management Wizard',
      icon: '🧙‍♂️',
      description: 'Controls the flow of time',
      cost: 1000,
      unlocked: false
    },
    {
      id: 'robot',
      name: 'A.I. Robot',
      icon: '🤖',
      description: 'Efficiency incarnate',
      cost: 3000,
      unlocked: false
    },
    {
      id: 'cat',
      name: 'Normal House Cat',
      icon: '🐱',
      description: 'Surprisingly productive',
      cost: 5000,
      unlocked: false
    },
    {
      id: 'hacker',
      name: 'Hacker Man',
      icon: '👨‍💻',
      description: 'Master of time and space',
      cost: 10000,
      unlocked: false
    }
  ]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(characters[0]);

  const getModeTime = (mode: TimerMode) => {
    switch (mode) {
      case 'work': return 25 * 60;
      case 'shortBreak': return 5 * 60;
      case 'longBreak': return 10 * 60;
    }
  };

  const spinBonus = () => {
    setBonus({ points: 0, isSpinning: true });
    const possiblePoints = [0, 50, 100, 500, 1000];
    const randomIndex = Math.floor(Math.random() * possiblePoints.length);
    
    setTimeout(() => {
      const bonusPoints = possiblePoints[randomIndex];
      setBonus({ points: bonusPoints, isSpinning: false });
      setPoints(p => p + bonusPoints);
    }, 2000);
  };

  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'work') {
        setPoints((p) => p + 200); // Points for completing Pomodoro
        setCompletedPomodoros((p) => p + 1);
        spinBonus(); // Trigger bonus roulette
        setMode(completedPomodoros % 4 === 3 ? 'longBreak' : 'shortBreak');
        setCurrentSessionId(Date.now()); // New session for task points
      } else {
        setPoints((p) => p + 50); // Points for completing break
        setMode('work');
      }
      setTimeLeft(getModeTime(mode === 'work' ? 
        (completedPomodoros % 4 === 3 ? 'longBreak' : 'shortBreak') : 
        'work'
      ));
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, completedPomodoros]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const skipTimer = () => {
    setTimeLeft(getModeTime(mode === 'work' ? 
      (completedPomodoros % 4 === 3 ? 'longBreak' : 'shortBreak') : 
      'work'
    ));
    if (mode === 'work') {
      setMode(completedPomodoros % 4 === 3 ? 'longBreak' : 'shortBreak');
    } else {
      setMode('work');
    }
    setIsRunning(false);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        name: newTask,
        completed: false,
        points: 50,
        sessionId: currentSessionId
      }]);
      setNewTask('');
    }
  };

  const toggleTask = (taskId: number) => {
    const completedTasksInSession = tasks.filter(
      t => t.completed && t.sessionId === currentSessionId
    ).length;

    setTasks(tasks.map(task => {
      if (task.id === taskId && !task.completed) {
        const shouldAwardPoints = completedTasksInSession < 3;
        if (shouldAwardPoints) {
          setPoints(p => p + task.points);
        }
        return { ...task, completed: true };
      }
      return task;
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const purchaseCharacter = (character: Character) => {
    if (points >= character.cost && !character.unlocked) {
      setPoints(p => p - character.cost);
      setCharacters(chars => chars.map(c => 
        c.id === character.id ? { ...c, unlocked: true } : c
      ));
    }
  };

  const selectCharacter = (character: Character) => {
    if (character.unlocked) {
      setSelectedCharacter(character);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen p-8 transition-colors ${
      theme === 'light' ? 'bg-green-50' : 'bg-gray-900'
    }`}>
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-2xl shadow-xl p-8 mb-8 transition-colors ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}>
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className={`flex items-center gap-4 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                <Trophy className="w-6 h-6" />
                <span className="text-xl font-semibold">Points: {points}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'light' 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setShowInfo(true)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'light' 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <Info className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowStore(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    theme === 'light'
                      ? 'bg-green-100 hover:bg-green-200 text-green-700'
                      : 'bg-green-900 hover:bg-green-800 text-green-100'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  Store
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className={`text-4xl font-bold flex items-center gap-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>
                PomoGame! <span role="img" aria-label="tomato">🍅</span>
              </h1>
            </div>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-4xl">{selectedCharacter.icon}</span>
              <h2 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>
                {selectedCharacter.name}
              </h2>
            </div>
            {bonus.isSpinning && (
              <div className="animate-pulse text-xl font-bold text-yellow-500 mb-4">
                Spinning bonus wheel...
              </div>
            )}
            {!bonus.isSpinning && bonus.points > 0 && (
              <div className="text-xl font-bold text-yellow-500 mb-4">
                Bonus: +{bonus.points} points! 🎉
              </div>
            )}
          </div>

          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-4 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>
              {formatTime(timeLeft)}
            </div>
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={toggleTimer}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 transition-colors"
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                onClick={skipTimer}
                className={`rounded-full p-4 transition-colors ${
                  theme === 'light'
                    ? 'bg-gray-200 hover:bg-gray-300'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <SkipForward className={`w-6 h-6 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`} />
              </button>
            </div>
            <div className="flex justify-center gap-4">
              {mode === 'work' ? (
                <Brain className="w-6 h-6 text-green-500" />
              ) : (
                <Coffee className="w-6 h-6 text-blue-500" />
              )}
              <span className={`font-medium ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </span>
            </div>
          </div>

          <div className={`border-t ${
            theme === 'light' ? 'border-gray-200' : 'border-gray-700'
          } pt-8`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Tasks</h2>
            <form onSubmit={addTask} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task..."
                  className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === 'light'
                      ? 'border bg-white text-gray-800'
                      : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  }`}
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    task.completed
                      ? theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                      : theme === 'light' ? 'bg-white border' : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <span className={`${task.completed ? 'line-through' : ''} ${
                    theme === 'light' ? 'text-gray-800' : 'text-gray-300'
                  }`}>
                    {task.name}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>+{task.points} pts</span>
                    {!task.completed && (
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="text-green-500 hover:text-green-600"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showStore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className={`rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${
                  theme === 'light' ? 'text-gray-800' : 'text-white'
                }`}>Character Store</h2>
                <button
                  onClick={() => setShowStore(false)}
                  className={theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map(character => (
                  <div
                    key={character.id}
                    className={`border rounded-lg p-4 ${
                      character.unlocked
                        ? theme === 'light' ? 'bg-green-50' : 'bg-green-900'
                        : theme === 'light' ? 'bg-white' : 'bg-gray-700'
                    } ${selectedCharacter.id === character.id ? 'ring-2 ring-green-500' : ''}`}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-4xl">{character.icon}</span>
                      <div>
                        <h3 className={`font-bold ${
                          theme === 'light' ? 'text-gray-800' : 'text-white'
                        }`}>{character.name}</h3>
                        <p className={theme === 'light' ? 'text-sm text-gray-600' : 'text-sm text-gray-300'}>
                          {character.description}
                        </p>
                      </div>
                    </div>
                    {character.unlocked ? (
                      <button
                        onClick={() => selectCharacter(character)}
                        className={`w-full py-2 px-4 rounded-lg ${
                          selectedCharacter.id === character.id
                            ? 'bg-green-500 text-white'
                            : theme === 'light'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-green-800 text-green-100 hover:bg-green-700'
                        }`}
                      >
                        {selectedCharacter.id === character.id ? 'Selected' : 'Select'}
                      </button>
                    ) : (
                      <button
                        onClick={() => purchaseCharacter(character)}
                        disabled={points < character.cost}
                        className={`w-full py-2 px-4 rounded-lg ${
                          points >= character.cost
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : theme === 'light'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Purchase ({character.cost} points)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className={`rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${
                  theme === 'light' ? 'text-gray-800' : 'text-white'
                }`}>How PomoGame! Works</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className={theme === 'light' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>
                <div className="space-y-4">
                  <section>
                    <h3 className={`text-xl font-bold mb-2 ${
                      theme === 'light' ? 'text-gray-800' : 'text-white'
                    }`}>Points System</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Complete a Pomodoro: +200 points</li>
                      <li>Complete a task: +50 points (max 3 tasks per session)</li>
                      <li>Finish a break: +50 points</li>
                      <li>Bonus roulette after each Pomodoro: 0-1000 points</li>
                    </ul>
                  </section>
                  <section>
                    <h3 className={`text-xl font-bold mb-2 ${
                      theme === 'light' ? 'text-gray-800' : 'text-white'
                    }`}>Characters</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>NDGM Student (Free) - Start your journey</li>
                      <li>Focus Ninja (200 points) - Your first upgrade</li>
                      <li>Space Explorer (500 points) - Reach for the stars</li>
                      <li>Time Management Wizard (1,000 points) - Master of time</li>
                      <li>A.I. Robot (3,000 points) - Peak efficiency</li>
                      <li>Normal House Cat (5,000 points) - Surprisingly effective</li>
                      <li>Hacker Man (10,000 points) - Ultimate achievement</li>
                    </ul>
                  </section>
                  <section>
                    <h3 className={`text-xl font-bold mb-2 ${
                      theme === 'light' ? 'text-gray-800' : 'text-white'
                    }`}>How to Play</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Set your tasks for the session</li>
                      <li>Start the 25-minute Pomodoro timer</li>
                      <li>Complete tasks while the timer runs</li>
                      <li>Earn points and spin the bonus wheel</li>
                      <li>Take breaks to recharge</li>
                      <li>Unlock new characters as you progress</li>
                    </ol>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;