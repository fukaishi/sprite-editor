import { useState, useEffect, useRef } from 'react';
import { useProjectStore } from './store/projectStore';
import { useHistoryStore } from './store/historyStore';
import { MenuBar } from './components/common/MenuBar';
import { NewProjectDialog } from './components/common/NewProjectDialog';
import { ImportDialog } from './components/common/ImportDialog';
import { Canvas } from './components/Canvas/Canvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { ColorPalette } from './components/ColorPalette/ColorPalette';
import { LayerPanel } from './components/LayerPanel/LayerPanel';
import { Timeline } from './components/Timeline/Timeline';
import { Properties } from './components/Properties/Properties';
import { downloadSpriteSheet, saveProject, loadProject } from './utils/export';
import { useAutoSave, loadAutoSave } from './hooks/useAutoSave';

function App() {
  const { project, loadProject: setProject } = useProjectStore();
  const { undo, redo } = useHistoryStore();
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAutoSavePrompt, setShowAutoSavePrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enable auto-save
  useAutoSave();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleNewProject = () => {
    setShowNewProjectDialog(true);
  };

  const handleSaveProject = () => {
    if (project) {
      saveProject(project);
    }
  };

  const handleLoadProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const loadedProject = await loadProject(file);
      setProject(loadedProject);
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = () => {
    setShowImportDialog(true);
  };

  const handleExport = () => {
    if (project) {
      downloadSpriteSheet(project, 'horizontal');
    }
  };

  // Check for auto-save on first load
  useEffect(() => {
    const checkAutoSave = async () => {
      const autoSaved = await loadAutoSave();
      if (autoSaved && !project) {
        setShowAutoSavePrompt(true);
      } else if (!project) {
        setShowNewProjectDialog(true);
      }
    };
    checkAutoSave();
  }, []);

  const handleRestoreAutoSave = async () => {
    const autoSaved = await loadAutoSave();
    if (autoSaved) {
      setProject(autoSaved);
    }
    setShowAutoSavePrompt(false);
  };

  const handleSkipAutoSave = () => {
    setShowAutoSavePrompt(false);
    setShowNewProjectDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <MenuBar
        onNewProject={handleNewProject}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onImport={handleImport}
        onExport={handleExport}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <NewProjectDialog
        isOpen={showNewProjectDialog}
        onClose={() => setShowNewProjectDialog(false)}
      />

      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
      />

      {/* Auto-save restore prompt */}
      {showAutoSavePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">自動保存されたプロジェクトを復元しますか？</h2>
            <p className="text-gray-300 mb-6">
              自動保存されたプロジェクトが見つかりました。復元しますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRestoreAutoSave}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                復元
              </button>
              <button
                onClick={handleSkipAutoSave}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                新規作成
              </button>
            </div>
          </div>
        </div>
      )}

      {project ? (
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 flex flex-col gap-4 overflow-y-auto">
            <Toolbar />
            <ColorPalette />
          </div>

          {/* Center - Canvas */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <Canvas />
            </div>
            <Timeline />
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto">
            <LayerPanel />
            <Properties />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">スプライトエディタへようこそ</h2>
            <p className="text-gray-400 mb-4">新しいプロジェクトを作成して始めましょう</p>
            <button
              onClick={handleNewProject}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg"
            >
              新規プロジェクト作成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
