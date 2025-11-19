import { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { Hitbox, HitboxType } from '../../types';
import { AnimationPanel } from './AnimationPanel';

export const Properties = () => {
  const { project, updateFramePivot, addHitbox, updateHitbox, deleteHitbox } =
    useProjectStore();
  const { currentFrameIndex } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'pivot' | 'hitbox' | 'animation'>('pivot');

  const currentFrame = project?.frames[currentFrameIndex];

  if (!currentFrame) return null;

  const handleAddHitbox = (type: HitboxType) => {
    const newHitbox: Hitbox = {
      id: crypto.randomUUID(),
      type,
      rect: { x: 0, y: 0, width: 8, height: 8 },
    };
    addHitbox(currentFrameIndex, newHitbox);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">プロパティ</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('pivot')}
          className={`px-3 py-1 rounded text-xs ${
            activeTab === 'pivot'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          ピボット
        </button>
        <button
          onClick={() => setActiveTab('hitbox')}
          className={`px-3 py-1 rounded text-xs ${
            activeTab === 'hitbox'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          当たり判定
        </button>
        <button
          onClick={() => setActiveTab('animation')}
          className={`px-3 py-1 rounded text-xs ${
            activeTab === 'animation'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          アニメーション
        </button>
      </div>

      {activeTab === 'pivot' && (
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">ピボット X</label>
            <input
              type="number"
              value={currentFrame.pivot.x}
              onChange={(e) =>
                updateFramePivot(currentFrameIndex, {
                  ...currentFrame.pivot,
                  x: parseInt(e.target.value) || 0,
                })
              }
              className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">ピボット Y</label>
            <input
              type="number"
              value={currentFrame.pivot.y}
              onChange={(e) =>
                updateFramePivot(currentFrameIndex, {
                  ...currentFrame.pivot,
                  y: parseInt(e.target.value) || 0,
                })
              }
              className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
            />
          </div>
          <button
            onClick={() => {
              const width = project?.settings.width || 32;
              const height = project?.settings.height || 32;
              updateFramePivot(currentFrameIndex, {
                x: Math.floor(width / 2),
                y: Math.floor(height / 2),
              });
            }}
            className="w-full px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            中央に配置
          </button>
        </div>
      )}

      {activeTab === 'hitbox' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => handleAddHitbox('hitbox')}
              className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            >
              + 攻撃判定
            </button>
            <button
              onClick={() => handleAddHitbox('hurtbox')}
              className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
            >
              + 被弾判定
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentFrame.hitboxes.map((hitbox, index) => (
              <div key={hitbox.id} className="bg-gray-700 p-2 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold">
                    {hitbox.type === 'hitbox' ? '🔴 攻撃判定' : '🟢 被弾判定'} #{index + 1}
                  </span>
                  <button
                    onClick={() => deleteHitbox(currentFrameIndex, hitbox.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    🗑️
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">X</label>
                    <input
                      type="number"
                      value={hitbox.rect.x}
                      onChange={(e) =>
                        updateHitbox(currentFrameIndex, hitbox.id, {
                          rect: { ...hitbox.rect, x: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Y</label>
                    <input
                      type="number"
                      value={hitbox.rect.y}
                      onChange={(e) =>
                        updateHitbox(currentFrameIndex, hitbox.id, {
                          rect: { ...hitbox.rect, y: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Width</label>
                    <input
                      type="number"
                      value={hitbox.rect.width}
                      onChange={(e) =>
                        updateHitbox(currentFrameIndex, hitbox.id, {
                          rect: { ...hitbox.rect, width: parseInt(e.target.value) || 1 },
                        })
                      }
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Height</label>
                    <input
                      type="number"
                      value={hitbox.rect.height}
                      onChange={(e) =>
                        updateHitbox(currentFrameIndex, hitbox.id, {
                          rect: { ...hitbox.rect, height: parseInt(e.target.value) || 1 },
                        })
                      }
                      className="w-full bg-gray-600 text-white px-2 py-1 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'animation' && (
        <AnimationPanel />
      )}
    </div>
  );
};
