"use client";

/**
 * 快捷键帮助面板
 * 显示所有可用的键盘快捷键
 */

import { SHORTCUT_GROUPS } from "@/lib/use-keyboard-shortcuts";

interface ShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsPanel({ isOpen, onClose }: ShortcutsPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <span>⌨️</span>
            <span>键盘快捷键</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-neutral-300">{shortcut.desc}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded text-neutral-300">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-neutral-600 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
          <p className="text-xs text-neutral-500 text-center">
            按 <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-800 border border-neutral-700 rounded">?</kbd> 随时显示此面板
          </p>
        </div>
      </div>
    </div>
  );
}
