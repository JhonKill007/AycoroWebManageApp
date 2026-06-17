import {
    faCaretLeft,
    faCaretRight,
    faEllipsisH,
    faHeart,
    faPaperPlane,
    faPause,
    faPlay,
    faReply,
    faTimes,
    faVolumeMute,
    faVolumeUp
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';

// Interfaces para tipado
interface Story {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  image: string;
  video?: string;
  timestamp: string;
  duration: number; // Duración en segundos
  type: 'image' | 'video';
  isSeen: boolean;
  isLiked: boolean;
  likes: number;
}

interface User {
  id: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  isFollowing?: boolean;
}

interface StoriesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  currentStoryIndex: number;
  currentUser: User;
}

const StoriesViewer: React.FC<StoriesViewerProps> = ({
  isOpen,
  onClose,
  stories,
  currentStoryIndex,
  currentUser
}) => {
  const [currentIndex, setCurrentIndex] = useState(currentStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const currentStory = stories[currentIndex];

  // Efecto para manejar la reproducción y progreso
  useEffect(() => {
    if (!isOpen || !currentStory) return;

    // Reiniciar progreso cuando cambia la historia
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);

    // Manejar video
    if (currentStory.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      videoRef.current.muted = isMuted;
    }

    // Configurar intervalo de progreso para imágenes
    if (currentStory.type === 'image') {
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          const increment = (100 / currentStory.duration) * 0.1;
          const newProgress = prev + increment;
          
          if (newProgress >= 100) {
            clearInterval(progressIntervalRef.current);
            handleNext();
            return 0;
          }
          return newProgress;
        });
      }, 100);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, isOpen, currentStory, isPlaying]);

  // Efecto para manejar controles automáticos
  useEffect(() => {
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Efecto para manejar video
  useEffect(() => {
    if (currentStory?.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        setProgress((video.currentTime / video.duration) * 100);
      };

      const handleEnded = () => {
        handleNext();
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentStory]);

  // Manejar teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          togglePlayPause();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const togglePlayPause = () => {
    if (currentStory.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (currentStory.type === 'video' && videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Aquí iría la lógica para guardar el like
  };

  const handleReply = () => {
    if (replyMessage.trim()) {
      // Aquí iría la lógica para enviar la respuesta
      console.log('Respuesta enviada:', replyMessage);
      setReplyMessage('');
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentStory.type === 'video' && videoRef.current) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const seekTime = percent * videoRef.current.duration;
      
      videoRef.current.currentTime = seekTime;
      setProgress(percent * 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !currentStory) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={() => setShowControls(true)}
    >
      {/* Controles de navegación */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1002
        }}
      >
        <button
          onClick={handlePrevious}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '20px',
            backdropFilter: 'blur(10px)',
            opacity: currentIndex === 0 ? 0.3 : 1
          }}
          disabled={currentIndex === 0}
        >
          <FontAwesomeIcon icon={faCaretLeft} />
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1002
        }}
      >
        <button
          onClick={handleNext}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '20px',
            backdropFilter: 'blur(10px)',
            opacity: currentIndex === stories.length - 1 ? 0.3 : 1
          }}
          disabled={currentIndex === stories.length - 1}
        >
          <FontAwesomeIcon icon={faCaretRight} />
        </button>
      </div>

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
          zIndex: 1001,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
      >
        {/* Barras de progreso */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '16px'
          }}
        >
          {stories.map((story, index) => (
            <div
              key={story.id}
              style={{
                flex: 1,
                height: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%',
                  height: '100%',
                  backgroundColor: 'white',
                  transition: index === currentIndex ? 'width 0.1s linear' : 'none'
                }}
              />
            </div>
          ))}
        </div>

        {/* Información del usuario */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <img
              src={currentStory.avatar}
              alt={currentStory.username}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '2px solid #0095f6'
              }}
            />
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  {currentStory.username}
                </span>
                {currentUser.isVerified && (
                  <span style={{ color: '#0095f6', fontSize: '12px' }}>
                    ✓
                  </span>
                )}
              </div>
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '12px'
                }}
              >
                {currentStory.timestamp}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {currentStory.type === 'video' && (
              <button
                onClick={togglePlayPause}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              </button>
            )}

            {currentStory.type === 'video' && (
              <button
                onClick={toggleMute}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido de la historia */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          height: '80vh',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
      >
        {currentStory.type === 'image' ? (
          <img
            src={currentStory.image}
            alt={`Story by ${currentStory.username}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <video
            ref={videoRef}
            src={currentStory.video}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            autoPlay
            muted={isMuted}
            playsInline
          />
        )}

        {/* Timeline para video */}
        {currentStory.type === 'video' && (
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '20px',
              right: '20px',
              zIndex: 1001
            }}
          >
            <div
              onClick={handleSeek}
              style={{
                width: '100%',
                height: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '2px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: 'white',
                  borderRadius: '2px',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12px'
              }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentStory.duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controles inferiores */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
          zIndex: 1001,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Input de respuesta */}
          <div
            style={{
              flex: 1,
              marginRight: '16px'
            }}
          >
            <input
              type="text"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Envía un mensaje..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleReply();
                }
              }}
            />
          </div>

          {/* Acciones */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <button
              onClick={handleLike}
              style={{
                background: 'none',
                border: 'none',
                color: isLiked ? '#ff3040' : 'white',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              <FontAwesomeIcon icon={faHeart} />
            </button>

            <button
              onClick={handleReply}
              disabled={!replyMessage.trim()}
              style={{
                background: 'none',
                border: 'none',
                color: replyMessage.trim() ? '#0095f6' : 'rgba(255, 255, 255, 0.5)',
                cursor: replyMessage.trim() ? 'pointer' : 'not-allowed',
                fontSize: '20px'
              }}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>

            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              <FontAwesomeIcon icon={faReply} />
            </button>

            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
          </div>
        </div>
      </div>

      {/* Información de likes */}
      {currentStory.likes > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
            left: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '8px 12px',
            borderRadius: '16px',
            color: 'white',
            fontSize: '12px',
            backdropFilter: 'blur(10px)',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s'
          }}
        >
          ❤️ {currentStory.likes} me gusta
        </div>
      )}

      {/* Indicador de siguiente/usuario */}
      {currentIndex < stories.length - 1 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '12px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px',
            backdropFilter: 'blur(10px)',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <img
            src={stories[currentIndex + 1].avatar}
            alt="Siguiente"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%'
            }}
          />
          <span>Siguiente</span>
        </div>
      )}
    </div>
  );
};

export default StoriesViewer;