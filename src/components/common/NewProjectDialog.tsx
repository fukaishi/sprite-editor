import { useState } from 'react';
import { Modal } from './Modal';
import { useProjectStore } from '../../store/projectStore';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectDialog = ({ isOpen, onClose }: NewProjectDialogProps) => {
  const { createProject } = useProjectStore();
  const [name, setName] = useState('Untitled');
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);

  const handleCreate = () => {
    createProject(name, width, height);
    onClose();
  };

  const presets = [
    { name: '16x16', width: 16, height: 16 },
    { name: '32x32', width: 32, height: 32 },
    { name: '48x48', width: 48, height: 48 },
    { name: '64x64', width: 64, height: 64 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            placeholder="Enter project name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Width</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              min="1"
              max="256"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Height</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              min="1"
              max="256"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Presets</label>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setWidth(preset.width);
                  setHeight(preset.height);
                }}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                {preset.name}
              </button>
            ))}
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
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
};
