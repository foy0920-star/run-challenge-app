
import { RunnerLevel } from './types';

export const RUNNER_LEVELS: RunnerLevel[] = [
    { name: '킵초게', level: 'LV 5', minDistance: 80, color: 'bg-pink-500', textColor: 'text-pink-500' },
    { name: '이봉주', level: 'LV 4', minDistance: 60, color: 'bg-green-400', textColor: 'text-green-400' },
    { name: '러너', level: 'LV 3', minDistance: 40, color: 'bg-sky-400', textColor: 'text-sky-400' },
    { name: '초보러너', level: 'LV 2', minDistance: 20, color: 'bg-yellow-300', textColor: 'text-yellow-300' },
    { name: '런린이', level: 'LV 1', minDistance: 0, color: 'bg-gray-200', textColor: 'text-gray-200' }
];

export const GOLD_LEVEL_MIN_DISTANCE = 100;
export const GOLD_LEVEL_COLOR = 'bg-yellow-400';
