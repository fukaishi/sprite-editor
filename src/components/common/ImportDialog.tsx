import { useState, useRef } from 'react';
import { Modal } from './Modal';
import { useProjectStore } from '../../store/projectStore';
import { importPNG, createProjectFromFrames } from '../../utils/import';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportDialog = ({ isOpen, onClose }: ImportDialogProps) => {
  const { loadProject } = useProjectStore();
  const [frameWidth, setFrameWidth] = useState(32);
  const [frameHeight, setFrameHeight] = useState(32);
  const [columns, setColumns] = useState<number | undefined>(undefined);
  const [rows, setRows] = useState<number | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const frames = await importPNG(selectedFile, {
        frameWidth,
        frameHeight,
        columns,
        rows,
      });

      if (frames.length === 0) {
        alert('No frames found in the image');
        return;
      }

      const project = createProjectFromFrames('Imported Project', frames);
      loadProject(project);
      onClose();
    } catch (error) {
      console.error('Failed to import:', error);
      alert('Failed to import image');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import PNG Spritesheet">
      <div className="space-y-4">
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            {selectedFile ? 'Change File' : 'Select File'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
          {selectedFile && (
            <p className="text-sm text-gray-400 mt-2">Selected: {selectedFile.name}</p>
          )}
        </div>

        {previewUrl && (
          <div className="border border-gray-600 rounded p-2">
            <img src={previewUrl} alt="Preview" className="max-w-full h-auto" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Frame Width</label>
            <input
              type="number"
              value={frameWidth}
              onChange={(e) => setFrameWidth(parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Frame Height</label>
            <input
              type="number"
              value={frameHeight}
              onChange={(e) => setFrameHeight(parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              min="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Columns (optional)
            </label>
            <input
              type="number"
              value={columns || ''}
              onChange={(e) =>
                setColumns(e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="Auto"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Rows (optional)
            </label>
            <input
              type="number"
              value={rows || ''}
              onChange={(e) =>
                setRows(e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="Auto"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              min="1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-30"
          >
            Import
          </button>
        </div>
      </div>
    </Modal>
  );
};
