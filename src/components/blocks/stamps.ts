import { Coffee, Flame, Home, Heart, Leaf, Moon, Music, Save, Skull, Star, Sun, Zap, type LucideIcon } from 'lucide-react'

export interface StampDef { id: string; label: string; Icon: LucideIcon }

/** The 12 stamps on the wall. Ids are stored in blocks, so never rename them. */
export const STAMPS: StampDef[] = [
  { id: 'house', label: 'Home sweet home', Icon: Home },
  { id: 'star', label: 'Star', Icon: Star },
  { id: 'heart', label: 'Heart', Icon: Heart },
  { id: 'floppy', label: 'Floppy disk', Icon: Save },
  { id: 'bolt', label: 'Lightning bolt', Icon: Zap },
  { id: 'music', label: 'Music', Icon: Music },
  { id: 'skull', label: 'Skull', Icon: Skull },
  { id: 'leaf', label: 'Leaf', Icon: Leaf },
  { id: 'sun', label: 'Sun', Icon: Sun },
  { id: 'flame', label: 'Flame', Icon: Flame },
  { id: 'moon', label: 'Moon', Icon: Moon },
  { id: 'coffee', label: 'Coffee', Icon: Coffee },
]

export const getStamp = (id: string) => STAMPS.find((s) => s.id === id)
