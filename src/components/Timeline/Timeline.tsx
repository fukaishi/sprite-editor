import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { AnimationPlayback } from './AnimationPlayback';

export const Timeline = () => {
  const { project, addFrame, deleteFrame, duplicateFrame } = useProjectStore();
  const { currentFrameIndex, setCurrentFrame } = useEditorStore();

  if (!project) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-3">
      <AnimationPlayback />

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-300">Timeline</h3>
        <div className="flex gap-2">
          <button
            onClick={addFrame}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            + Add Frame
          </button>
          <button
            onClick={() => duplicateFrame(currentFrameIndex)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              if (project.frames.length > 1) {
                deleteFrame(currentFrameIndex);
                if (currentFrameIndex >= project.frames.length - 1) {
                  setCurrentFrame(Math.max(0, currentFrameIndex - 1));
                }
              }
            }}
            disabled={project.frames.length <= 1}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs disabled:opacity-30"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {project.frames.map((frame, index) => (
          <div
            key={frame.id}
            onClick={() => setCurrentFrame(index)}
            className={`flex-shrink-0 w-16 h-16 border-2 rounded cursor-pointer flex items-center justify-center ${
              index === currentFrameIndex
                ? 'border-blue-500 bg-blue-900'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="text-xs text-gray-300">{index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
