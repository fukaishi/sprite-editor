import { useState } from 'react';
import { Modal } from './Modal';
import { useProjectStore } from '../../store/projectStore';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectDialog = ({ isOpen, onClose }: NewProjectDialogProps) => {
  const { createProject } = useProjectStore();
  const [name, setName] = useState('無題');
  const [sheetWidth, setSheetWidth] = useState(512);
  const [sheetHeight, setSheetHeight] = useState(512);
  const [characterWidth, setCharacterWidth] = useState(16);
  const [characterHeight, setCharacterHeight] = useState(16);

  const handleCreate = () => {
    createProject(name, sheetWidth, sheetHeight, characterWidth, characterHeight);
    onClose();
  };

  const sheetSizes = [
    { name: '512x512', width: 512, height: 512 },
    { name: '1024x1024', width: 1024, height: 1024 },
  ];

  const characterSizes = [
    { name: '8x8', width: 8, height: 8 },
    { name: '16x16', width: 16, height: 16 },
    { name: '24x24', width: 24, height: 24 },
    { name: '32x32', width: 32, height: 32 },
    { name: '64x64', width: 64, height: 64 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新規プロジェクト">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">プロジェクト名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            placeholder="プロジェクト名を入力"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">シートサイズ</label>
          <div className="grid grid-cols-2 gap-2">
            {sheetSizes.map((size) => (
              <button
                key={size.name}
                onClick={() => {
                  setSheetWidth(size.width);
                  setSheetHeight(size.height);
                }}
                className={`px-3 py-2 rounded text-sm ${
                  sheetWidth === size.width && sheetHeight === size.height
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">キャラクタサイズ</label>
          <div className="grid grid-cols-3 gap-2">
            {characterSizes.map((size) => (
              <button
                key={size.name}
                onClick={() => {
                  setCharacterWidth(size.width);
                  setCharacterHeight(size.height);
                }}
                className={`px-3 py-2 rounded text-sm ${
                  characterWidth === size.width && characterHeight === size.height
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            キャンセル
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            作成
          </button>
        </div>
      </div>
    </Modal>
  );
};
