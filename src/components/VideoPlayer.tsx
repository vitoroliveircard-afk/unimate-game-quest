import { Play } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string | null;
  title: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  // Extract video ID for YouTube or Vimeo
  const getEmbedUrl = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-muted/30 rounded-2xl flex flex-col items-center justify-center gap-4 border border-white/10">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Play className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">Vídeo não disponível</p>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
      <iframe
        src={getEmbedUrl(videoUrl)}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
