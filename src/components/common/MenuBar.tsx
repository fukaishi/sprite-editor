import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { useHistoryStore } from '../../store/historyStore';

interface MenuBarProps {
  onNewProject: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onExport: () => void;
}

export const MenuBar = ({ onNewProject, onSaveProject, onLoadProject, onExport }: MenuBarProps) => {
  const { project } = useProjectStore();
  const { showGrid, toggleGrid } = useEditorStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">ドットキャラクタエディタ</h1>
          {project && (
            <span className="text-sm text-gray-400">
              {project.settings.name} - シート:{project.settings.sheetWidth}x{project.settings.sheetHeight} / キャラ:{project.settings.characterWidth}x{project.settings.characterHeight}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 mr-2">
            <button
              onClick={onNewProject}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              新規作成
            </button>
            <button
              onClick={onSaveProject}
              disabled={!project}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-30"
            >
              保存
            </button>
            <button
              onClick={onLoadProject}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              読込
            </button>
            <button
              onClick={onExport}
              disabled={!project}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-30"
            >
              エクスポート
            </button>
          </div>

          <div className="flex gap-1 mr-2 border-l border-gray-700 pl-2">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-30"
              title="元に戻す (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-30"
              title="やり直す (Ctrl+Y)"
            >
              ↷
            </button>
          </div>

          <div className="flex gap-1 border-l border-gray-700 pl-2">
            <button
              onClick={toggleGrid}
              className={`px-3 py-1 rounded text-sm ${
                showGrid ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title="グリッド表示切替"
            >
              グリッド
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
