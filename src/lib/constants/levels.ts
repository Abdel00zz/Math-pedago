import type { Level } from '@/types'

export const LEVELS: Level[] = ['TCS', '1BSE', '1BSM', '2BSE', '2BSM', '2BECO']

export const LEVEL_LABELS: Record<Level, string> = {
  TCS: 'Tronc Commun Scientifique',
  '1BSE': '1ère Bac Sciences Expérimentales',
  '1BSM': '1ère Bac Sciences Mathématiques',
  '2BSE': '2ème Bac Sciences Expérimentales',
  '2BSM': '2ème Bac Sciences Mathématiques',
  '2BECO': '2ème Bac Sciences Économiques',
}

export const LEVEL_COLORS: Record<Level, string> = {
  TCS: 'bg-blue-500',
  '1BSE': 'bg-green-500',
  '1BSM': 'bg-purple-500',
  '2BSE': 'bg-orange-500',
  '2BSM': 'bg-red-500',
  '2BECO': 'bg-yellow-500',
}
