import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GROUP_LETTERS = 'ABCDEFGH'.split('');

export function getGroupCount(teamCount: number): number {
  return teamCount / 4;
}

export function getTeamsPerGroup(): number {
  return 4;
}

export function formatMatchTime(time: string | null): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatMatchDate(date: string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getStageName(stage: string): string {
  const names: Record<string, string> = {
    group: 'Group Stage',
    quarterfinal: 'Quarter Final',
    semifinal: 'Semi Final',
    final: 'Final',
  };
  return names[stage] || stage;
}

export function getStageShortName(stage: string): string {
  const names: Record<string, string> = {
    quarterfinal: 'QF',
    semifinal: 'SF',
    final: 'F',
  };
  return names[stage] || stage;
}
