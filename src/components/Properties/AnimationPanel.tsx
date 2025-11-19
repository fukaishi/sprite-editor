import { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { Animation } from '../../types';

export const AnimationPanel = () => {
  const { project, addAnimation, updateAnimation, deleteAnimation } = useProjectStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAnimName, setNewAnimName] = useState('');
  const [newAnimFps, setNewAnimFps] = useState(12);
  const [selectedFrames, setSelectedFrames] = useState<number[]>([]);

  if (!project) return null;

  const handleCreateAnimation = () => {
    if (!newAnimName.trim() || selectedFrames.length === 0) return;

    const newAnimation: Animation = {
      id: crypto.randomUUID(),
      name: newAnimName,
      frameIndices: selectedFrames,
      loop: true,
      fps: newAnimFps,
    };

    addAnimation(newAnimation);
    setNewAnimName('');
    setSelectedFrames([]);
  };

  const toggleFrameSelection = (frameIndex: number) => {
    setSelectedFrames((prev) =>
      prev.includes(frameIndex)
        ? prev.filter((i) => i !== frameIndex)
        : [...prev, frameIndex].sort((a, b) => a - b)
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-700 p-3 rounded">
        <h4 className="text-sm font-semibold mb-2">新規アニメーション作成</h4>
        <div className="space-y-2">
          <input
            type="text"
            value={newAnimName}
            onChange={(e) => setNewAnimName(e.target.value)}
            placeholder="アニメーション名"
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400">FPS</label>
              <input
                type="number"
                value={newAnimFps}
                onChange={(e) => setNewAnimFps(parseInt(e.target.value) || 1)}
                className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                min="1"
                max="60"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">フレーム選択</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {project.frames.map((_, index) => (
                <button
                  key={index}
                  onClick={() => toggleFrameSelection(index)}
                  className={`px-2 py-1 rounded text-xs ${
                    selectedFrames.includes(index)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleCreateAnimation}
            disabled={!newAnimName.trim() || selectedFrames.length === 0}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-30"
          >
            アニメーション作成
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">アニメーション一覧</h4>
        <div className="space-y-2">
          {project.animations.map((anim) => (
            <div key={anim.id} className="bg-gray-700 p-2 rounded">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{anim.name}</div>
                  <div className="text-xs text-gray-400">
                    フレーム: {anim.frameIndices.join(', ')} | FPS: {anim.fps} |{' '}
                    {anim.loop ? 'ループ' : '1回'}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingId(editingId === anim.id ? null : anim.id)}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => deleteAnimation(anim.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                  >
                    削除
                  </button>
                </div>
              </div>

              {editingId === anim.id && (
                <div className="mt-2 pt-2 border-t border-gray-600 space-y-2">
                  <input
                    type="text"
                    value={anim.name}
                    onChange={(e) => updateAnimation(anim.id, { name: e.target.value })}
                    className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400">FPS</label>
                      <input
                        type="number"
                        value={anim.fps}
                        onChange={(e) =>
                          updateAnimation(anim.id, { fps: parseInt(e.target.value) || 1 })
                        }
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={anim.loop}
                          onChange={(e) => updateAnimation(anim.id, { loop: e.target.checked })}
                        />
                        ループ
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
