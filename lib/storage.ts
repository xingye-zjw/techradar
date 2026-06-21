// lib/storage.ts - 统一的 localStorage 管理层

const STORAGE_KEYS = {
  PROGRESS: 'techradar_progress',
  FAVORITES: 'techradar_favorites',
  RECENT: 'techradar_recent',
  SIDEBAR_STATE: 'techradar_sidebar',
} as const;

// ============ 类型定义 ============

export interface LearningProgress {
  nodes: Record<string, NodeProgress>;
  lastVisited?: { node: string; day: number; timestamp: number };
}

export interface NodeProgress {
  completedDays: number[];
  startedAt?: number;
  lastVisitedAt?: number;
}

export interface Favorites {
  terms: string[];
  intel: string[];
  nodes: string[];
  tools: string[];
}

export interface RecentVisit {
  type: 'node' | 'intel' | 'tool' | 'glossary' | 'task';
  slug: string;
  title: string;
  visitedAt: number;
}

export type SidebarState = 'expanded' | 'collapsed';

// ============ 存储工具函数 ============

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getItem<T>(key: string, defaultValue: T): T {
  if (!isClient()) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save to localStorage: ${key}`, e);
  }
}

// ============ 学习进度 ============

export function getProgress(): LearningProgress {
  return getItem<LearningProgress>(STORAGE_KEYS.PROGRESS, { nodes: {} });
}

export function saveProgress(data: LearningProgress): void {
  setItem(STORAGE_KEYS.PROGRESS, data);
}

export function getNodeProgress(nodeId: string): NodeProgress {
  const progress = getProgress();
  return progress.nodes[nodeId] || { completedDays: [] };
}

export function saveNodeProgress(nodeId: string, data: NodeProgress): void {
  const progress = getProgress();
  progress.nodes[nodeId] = data;
  saveProgress(progress);
}

export function toggleDayComplete(nodeId: string, day: number): boolean {
  const progress = getNodeProgress(nodeId);
  const isCompleted = progress.completedDays.includes(day);
  if (isCompleted) {
    progress.completedDays = progress.completedDays.filter(d => d !== day);
  } else {
    progress.completedDays = [...progress.completedDays, day];
  }
  saveNodeProgress(nodeId, progress);
  return !isCompleted;
}

export function setLastVisited(node: string, day: number): void {
  const progress = getProgress();
  progress.lastVisited = { node, day, timestamp: Date.now() };
  saveProgress(progress);
}

// ============ 收藏功能 ============

export function getFavorites(): Favorites {
  return getItem<Favorites>(STORAGE_KEYS.FAVORITES, {
    terms: [],
    intel: [],
    nodes: [],
    tools: [],
  });
}

export function saveFavorites(data: Favorites): void {
  setItem(STORAGE_KEYS.FAVORITES, data);
}

export function toggleFavorite(type: 'terms' | 'intel' | 'nodes' | 'tools', slug: string): boolean {
  const favorites = getFavorites();
  const list = favorites[type];
  const isFavorited = list.includes(slug);
  if (isFavorited) {
    favorites[type] = list.filter(s => s !== slug);
  } else {
    favorites[type] = [...list, slug];
  }
  saveFavorites(favorites);
  return !isFavorited;
}

export function isFavorited(type: 'terms' | 'intel' | 'nodes' | 'tools', slug: string): boolean {
  const favorites = getFavorites();
  return favorites[type].includes(slug);
}

// ============ 最近访问 ============

const MAX_RECENT_ITEMS = 10;

export function getRecentVisits(): RecentVisit[] {
  return getItem<RecentVisit[]>(STORAGE_KEYS.RECENT, []);
}

export function addRecentVisit(visit: Omit<RecentVisit, 'visitedAt'>): void {
  const recent = getRecentVisits();
  // 移除同一类型的同一slug记录
  const filtered = recent.filter(
    item => !(item.type === visit.type && item.slug === visit.slug)
  );
  // 添加到最前面
  const newItem: RecentVisit = { ...visit, visitedAt: Date.now() };
  const updated = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
  setItem(STORAGE_KEYS.RECENT, updated);
}

export function clearRecentVisits(): void {
  setItem(STORAGE_KEYS.RECENT, []);
}

// ============ 侧边栏状态 ============

export function getSidebarState(): SidebarState {
  return getItem<SidebarState>(STORAGE_KEYS.SIDEBAR_STATE, 'expanded');
}

export function setSidebarState(state: SidebarState): void {
  setItem(STORAGE_KEYS.SIDEBAR_STATE, state);
}

export function toggleSidebar(): SidebarState {
  const current = getSidebarState();
  const next = current === 'expanded' ? 'collapsed' : 'expanded';
  setSidebarState(next);
  return next;
}
