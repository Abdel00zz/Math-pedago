import React, { useRef, useState, useEffect } from 'react';
import { VideoResource } from '../types';

interface VideoPlayerProps {
    video: VideoResource;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);
        const handleEnded = () => setIsPlaying(false);

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', updateDuration);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    // Auto-hide controls after 3 seconds of inactivity
    const resetControlsTimeout = () => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        setShowControls(true);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    useEffect(() => {
        resetControlsTimeout();
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isPlaying]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const newMutedState = !isMuted;
        videoRef.current.muted = newMutedState;
        setIsMuted(newMutedState);
    };

    const toggleFullscreen = async () => {
        const container = videoRef.current?.parentElement;
        if (!container) return;

        try {
            if (!document.fullscreenElement) {
                await container.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Erreur fullscreen:', err);
        }
    };

    const jumpToTimestamp = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
            if (!isPlaying) {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const skip = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
        }
    };

    return (
        <div className="video-player-container">
            <div
                className="video-wrapper"
                onMouseMove={resetControlsTimeout}
                onClick={togglePlay}
            >
                <video
                    ref={videoRef}
                    src={video.url}
                    className="video-element"
                    playsInline
                    preload="metadata"
                />

                {/* Overlay pour contrôles */}
                <div className={`video-overlay ${showControls || !isPlaying ? 'visible' : ''}`}>
                    {/* Bouton play/pause central */}
                    {!isPlaying && (
                        <button
                            className="play-button-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePlay();
                            }}
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                    )}
                </div>

                {/* Contrôles en bas */}
                <div className={`video-controls ${showControls || !isPlaying ? 'visible' : ''}`}>
                    {/* Barre de progression */}
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="seek-bar"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <div className="controls-row">
                        <div className="controls-left">
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="control-button"
                            >
                                {isPlaying ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); skip(-10); }}
                                className="control-button"
                                title="Reculer 10s"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                                    <text x="7" y="15" fontSize="8" fill="white">10</text>
                                </svg>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); skip(10); }}
                                className="control-button"
                                title="Avancer 10s"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                                    <text x="9" y="15" fontSize="8" fill="white">10</text>
                                </svg>
                            </button>

                            <span className="time-display">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="controls-right">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                className="control-button"
                            >
                                {isMuted || volume === 0 ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                    </svg>
                                )}
                            </button>

                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="volume-bar"
                                onClick={(e) => e.stopPropagation()}
                            />

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                                className="control-button"
                            >
                                {isFullscreen ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timestamps pédagogiques */}
            {video.timestamps && video.timestamps.length > 0 && (
                <div className="video-timestamps">
                    <h4>Points clés :</h4>
                    <div className="timestamps-list">
                        {video.timestamps.map((timestamp, index) => (
                            <button
                                key={index}
                                className="timestamp-button"
                                onClick={() => jumpToTimestamp(timestamp.time)}
                            >
                                <span className="timestamp-time">{formatTime(timestamp.time)}</span>
                                <span className="timestamp-label">{timestamp.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .video-player-container {
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    background: #000;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .video-wrapper {
                    position: relative;
                    width: 100%;
                    padding-bottom: 56.25%; /* 16:9 aspect ratio */
                    background: #000;
                    cursor: pointer;
                }

                .video-element {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .video-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.3);
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                }

                .video-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .play-button-center {
                    background: rgba(0, 0, 0, 0.7);
                    border: none;
                    border-radius: 50%;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.2s, background 0.2s;
                    pointer-events: auto;
                }

                .play-button-center:hover {
                    background: rgba(0, 0, 0, 0.9);
                    transform: scale(1.1);
                }

                .video-controls {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
                    padding: 20px 10px 10px;
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                }

                .video-controls.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .seek-bar {
                    width: 100%;
                    height: 4px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    -webkit-appearance: none;
                    appearance: none;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                }

                .seek-bar::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #fff;
                    cursor: pointer;
                }

                .seek-bar::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #fff;
                    cursor: pointer;
                    border: none;
                }

                .controls-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }

                .controls-left,
                .controls-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .control-button {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.2s;
                    min-width: 30px;
                }

                .control-button:hover {
                    opacity: 0.7;
                }

                .time-display {
                    color: white;
                    font-size: 14px;
                    white-space: nowrap;
                }

                .volume-bar {
                    width: 60px;
                    height: 4px;
                    cursor: pointer;
                    -webkit-appearance: none;
                    appearance: none;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                }

                .volume-bar::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #fff;
                    cursor: pointer;
                }

                .volume-bar::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #fff;
                    cursor: pointer;
                    border: none;
                }

                .video-timestamps {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 0 0 8px 8px;
                }

                .video-timestamps h4 {
                    margin: 0 0 10px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                }

                .timestamps-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .timestamp-button {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }

                .timestamp-button:hover {
                    background: #f0f0f0;
                    border-color: #0066cc;
                    transform: translateX(4px);
                }

                .timestamp-time {
                    font-weight: 600;
                    color: #0066cc;
                    min-width: 45px;
                    font-size: 13px;
                }

                .timestamp-label {
                    color: #333;
                    font-size: 14px;
                }

                /* Adaptations mobile */
                @media (max-width: 768px) {
                    .play-button-center {
                        width: 60px;
                        height: 60px;
                    }

                    .play-button-center svg {
                        width: 36px;
                        height: 36px;
                    }

                    .controls-row {
                        gap: 5px;
                    }

                    .controls-left,
                    .controls-right {
                        gap: 5px;
                    }

                    .control-button {
                        padding: 3px;
                        min-width: 24px;
                    }

                    .control-button svg {
                        width: 18px;
                        height: 18px;
                    }

                    .time-display {
                        font-size: 12px;
                    }

                    .volume-bar {
                        width: 40px;
                    }

                    .video-timestamps {
                        padding: 12px;
                    }

                    .timestamp-button {
                        padding: 6px 10px;
                    }

                    .timestamp-time {
                        font-size: 12px;
                        min-width: 40px;
                    }

                    .timestamp-label {
                        font-size: 13px;
                    }
                }

                /* Mode plein écran */
                :global(.video-player-container:fullscreen) .video-wrapper {
                    padding-bottom: 0;
                    height: 100vh;
                }

                :global(.video-player-container:fullscreen) .video-element {
                    object-fit: contain;
                }

                /* Très petits écrans */
                @media (max-width: 480px) {
                    .controls-right .volume-bar {
                        display: none;
                    }

                    .video-controls {
                        padding: 15px 5px 8px;
                    }

                    .time-display {
                        font-size: 11px;
                    }
                }
            `}</style>
        </div>
    );
}
