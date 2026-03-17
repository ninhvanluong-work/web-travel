import { useEffect, useRef, useState } from 'react';

import { dislikeVideo, likeVideo } from '@/api/video';
import { useLikedVideos } from '@/hooks/useLikedVideos';

export function useVideoSlideLike(videoId: string, initialLikeCount: number) {
  const { isLiked, toggleLike: persistLike } = useLikedVideos();

  const [liked, setLiked] = useState(() => isLiked(videoId));
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likeAnimKey, setLikeAnimKey] = useState(0);

  const serverLikedRef = useRef(isLiked(videoId));
  const serverLikeCountRef = useRef(initialLikeCount);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const syncToServer = (targetLiked: boolean, count: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (targetLiked === serverLikedRef.current) return;
      try {
        if (targetLiked) {
          await likeVideo(videoId);
        } else {
          await dislikeVideo(videoId);
        }
        serverLikedRef.current = targetLiked;
        serverLikeCountRef.current = count;
      } catch {
        setLiked(serverLikedRef.current);
        setLikeCount(serverLikeCountRef.current);
        persistLike(videoId);
      }
    }, 500);
  };

  const toggleLike = () => {
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setLiked(newLiked);
    setLikeCount(newCount);
    setLikeAnimKey((k) => k + 1);
    persistLike(videoId);
    syncToServer(newLiked, newCount);
  };

  return { liked, likeCount, setLikeCount, serverLikeCountRef, likeAnimKey, toggleLike };
}
