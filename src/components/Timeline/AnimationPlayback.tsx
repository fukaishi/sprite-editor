import { useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';

export const AnimationPlayback = () => {
  const { project } = useProjectStore();
  const {
    isPlaying,
    playbackFps,
    currentAnimationId,
    currentFrameIndex,
    setCurrentFrame,
    startPlayback,
    stopPlayback,
    setPlaybackFps,
  } = useEditorStore();

  const currentAnimation = project?.animations.find((a) => a.id === currentAnimationId);

  useEffect(() => {
    if (!isPlaying || !currentAnimation) return;

    const frameDelay = 1000 / (currentAnimation.fps || playbackFps);
    const frames = currentAnimation.frameIndices;

    if (frames.length === 0) {
      stopPlayback();
      return;
    }

    const currentIndexInAnimation = frames.indexOf(currentFrameIndex);
    const nextIndexInAnimation =
      currentIndexInAnimation >= 0
        ? (currentIndexInAnimation + 1) % frames.length
        : 0;

    const timer = setTimeout(() => {
      const nextFrame = frames[nextIndexInAnimation];
      setCurrentFrame(nextFrame);

      // Stop if not looping and reached the end
      if (!currentAnimation.loop && nextIndexInAnimation === 0) {
        stopPlayback();
      }
    }, frameDelay);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentAnimation,
    currentFrameIndex,
    playbackFps,
    setCurrentFrame,
    stopPlayback,
  ]);

  const handlePlayAnimation = (animationId?: string) => {
    if (isPlaying && currentAnimationId === animationId) {
      stopPlayback();
    } else {
      startPlayback(animationId);
      if (animationId) {
        const anim = project?.animations.find((a) => a.id === animationId);
        if (anim && anim.frameIndices.length > 0) {
          setCurrentFrame(anim.frameIndices[0]);
        }
      }
    }
  };

  const handlePlayAllFrames = () => {
    if (isPlaying && !currentAnimationId) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  return (
    <div className="bg-gray-700 p-2 rounded">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={handlePlayAllFrames}
          className={`px-3 py-1 rounded text-sm ${
            isPlaying && !currentAnimationId
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isPlaying && !currentAnimationId ? '⏸ Pause' : '▶ Play All'}
        </button>

        <div className="flex-1">
          <label className="text-xs text-gray-400">FPS</label>
          <input
            type="number"
            value={playbackFps}
            onChange={(e) => setPlaybackFps(parseInt(e.target.value) || 1)}
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
            min="1"
            max="60"
          />
        </div>
      </div>

      {project && project.animations.length > 0 && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Animations</label>
          <div className="space-y-1">
            {project.animations.map((anim) => (
              <button
                key={anim.id}
                onClick={() => handlePlayAnimation(anim.id)}
                className={`w-full px-2 py-1 rounded text-xs text-left ${
                  isPlaying && currentAnimationId === anim.id
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                {isPlaying && currentAnimationId === anim.id ? '⏸' : '▶'} {anim.name} ({anim.fps}{' '}
                fps)
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
