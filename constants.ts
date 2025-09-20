import { RunnerLevel } from './types';

export const RUNNER_LEVELS: RunnerLevel[] = [
    { name: '★황금 레벨★', level: 'LV MAX', minDistance: 100, color: 'bg-yellow-400', textColor: 'text-yellow-400' },
    { name: '킵초게', level: 'LV 5', minDistance: 80, color: 'bg-pink-500', textColor: 'text-pink-500' },
    { name: '이봉주', level: 'LV 4', minDistance: 60, color: 'bg-mint-400', textColor: 'text-green-400' }, // 민트색으로 변경 고려 (tailwind.config.js 필요) 일단 green
    { name: '러너', level: 'LV 3', minDistance: 40, color: 'bg-sky-400', textColor: 'text-sky-400' },
    { name: '초보러너', level: 'LV 2', minDistance: 20, color: 'bg-yellow-300', textColor: 'text-yellow-300' },
    { name: '런린이', level: 'LV 1', minDistance: 0, color: 'bg-gray-200', textColor: 'text-gray-900' } // 런린이는 흰색(gray-200) 배경에 검은 글씨
];
