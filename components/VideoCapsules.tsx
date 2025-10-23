import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../context/AppContext';
import { Video } from '../types';

const VideoCapsules: React.FC = () => {
    const state = useAppState();
    const dispatch = useAppDispatch();
    const { currentChapterId, activities, progress } = state;

    const [startTime] = useState(Date.now());
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const chapter = currentChapterId ? activities[currentChapterId] : null;
    const videosProgress = currentChapterId ? progress[currentChapterId]?.videos : null;

    // Timer pour tracker la durée
    useEffect(() => {
        timerRef.current = setInterval(() => {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            dispatch({ type: 'SET_VIDEOS_DURATION', payload: { duration } });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [startTime, dispatch]);

    const handleMarkWatched = useCallback((videoId: string) => {
        dispatch({ type: 'MARK_VIDEO_WATCHED', payload: { videoId } });
    }, [dispatch]);

    const handlePlayVideo = useCallback((videoId: string) => {
        setPlayingVideoId(videoId);
    }, []);

    const handleClosePlayer = useCallback(() => {
        setPlayingVideoId(null);
    }, []);

    // Fermer avec ESC et gérer le scroll du body
    useEffect(() => {
        if (playingVideoId) {
            // Désactiver le scroll du body
            document.body.style.overflow = 'hidden';

            // Handler pour la touche ESC
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    handleClosePlayer();
                }
            };
            document.addEventListener('keydown', handleEsc);

            return () => {
                document.body.style.overflow = 'unset';
                document.removeEventListener('keydown', handleEsc);
            };
        }
    }, [playingVideoId, handleClosePlayer]);

    if (!chapter || !chapter.videos || chapter.videos.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">video_library</span>
                <p className="text-xl text-text-secondary">Aucune vidéo disponible pour ce chapitre.</p>
            </div>
        );
    }

    const videos = chapter.videos;
    const watchedVideos = videosProgress?.watched || {};
    const watchedCount = Object.values(watchedVideos).filter(Boolean).length;
    const allWatched = videosProgress?.allWatched || false;

    // Trouver la vidéo en cours de lecture
    const currentVideo = playingVideoId ? videos.find(v => v.id === playingVideoId) : null;

    return (
        <>
            {/* Modal plein écran pour le player vidéo */}
            {playingVideoId && currentVideo && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fadeIn backdrop-blur-sm"
                    onClick={handleClosePlayer}
                >
                    <div
                        className="w-full h-full max-w-7xl max-h-screen p-4 md:p-8 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header du modal */}
                        <div className="flex items-start justify-between mb-4 text-white">
                            <div className="flex-1">
                                <h2 className="text-2xl md:text-3xl font-title mb-2">{currentVideo.title}</h2>
                                {currentVideo.description && (
                                    <p className="text-white/80 text-sm md:text-base">{currentVideo.description}</p>
                                )}
                            </div>
                            <button
                                onClick={handleClosePlayer}
                                className="ml-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors flex-shrink-0"
                                aria-label="Fermer le lecteur"
                            >
                                <span className="material-symbols-outlined !text-3xl">close</span>
                            </button>
                        </div>

                        {/* Player YouTube */}
                        <div className="flex-1 relative bg-black rounded-xl overflow-hidden shadow-2xl">
                            <iframe
                                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                                title={currentVideo.title}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        {/* Bouton "Bien assimilé" dans le modal */}
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => {
                                    handleMarkWatched(currentVideo.id);
                                    handleClosePlayer();
                                }}
                                disabled={watchedVideos[currentVideo.id]}
                                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center gap-3 ${
                                    watchedVideos[currentVideo.id]
                                        ? 'bg-success/20 text-success border-2 border-success cursor-default'
                                        : 'bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {watchedVideos[currentVideo.id] ? (
                                    <>
                                        <span className="material-symbols-outlined !text-2xl">check_circle</span>
                                        <span>Déjà assimilé</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined !text-2xl">task_alt</span>
                                        <span>Marquer comme assimilé et fermer</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto animate-slideInUp">
            {/* Header avec progression */}
            <div className="mb-8 bg-surface p-6 rounded-2xl border border-border shadow-claude">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-3xl font-title text-text">Capsules Vidéo</h2>
                        <p className="text-text-secondary mt-1">Regardez les vidéos et marquez-les comme assimilées</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-primary">{watchedCount}/{videos.length}</div>
                        <div className="text-sm text-text-secondary">Vidéos assimilées</div>
                    </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-background rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${
                            allWatched ? 'bg-success' : 'bg-primary'
                        }`}
                        style={{ width: `${(watchedCount / videos.length) * 100}%` }}
                    />
                </div>

                {allWatched && (
                    <div className="mt-4 flex items-center gap-2 text-success animate-fadeIn">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span className="font-semibold">Toutes les vidéos sont assimilées ! Vous pouvez passer au quiz.</span>
                    </div>
                )}
            </div>

            {/* Grille de vidéos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video, index) => {
                    const isWatched = watchedVideos[video.id] || false;
                    const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

                    return (
                        <div
                            key={video.id}
                            className={`bg-surface rounded-xl border-2 overflow-hidden transition-all duration-300 shadow-claude hover:shadow-2xl ${
                                isWatched
                                    ? 'border-success bg-success/5'
                                    : 'border-border hover:border-primary/50'
                            }`}
                        >
                            {/* Thumbnail avec overlay */}
                            <div className="relative aspect-video bg-black group">
                                <img
                                    src={thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback si maxresdefault n'existe pas
                                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                                    }}
                                />

                                {/* Overlay avec play button */}
                                <button
                                    onClick={() => handlePlayVideo(video.id)}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors cursor-pointer"
                                >
                                    <div className="w-16 h-16 rounded-full bg-error flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-2xl">
                                        <span className="material-symbols-outlined text-white !text-4xl ml-1">play_arrow</span>
                                    </div>
                                </button>

                                {/* Badge numéro */}
                                <div className="absolute top-3 left-3 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                                    #{index + 1}
                                </div>

                                {/* Badge durée */}
                                {video.duration && (
                                    <div className="absolute bottom-3 right-3 bg-black/90 text-white px-2 py-1 rounded text-xs font-mono backdrop-blur-sm">
                                        {video.duration}
                                    </div>
                                )}

                                {/* Badge validé */}
                                {isWatched && (
                                    <div className="absolute top-3 right-3 bg-success text-white p-2 rounded-full animate-scaleIn shadow-lg">
                                        <span className="material-symbols-outlined !text-2xl">check_circle</span>
                                    </div>
                                )}
                            </div>

                            {/* Contenu */}
                            <div className="p-5">
                                <h3 className="text-xl font-title text-text mb-2 leading-tight">
                                    {video.title}
                                </h3>

                                {video.description && (
                                    <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                                        {video.description}
                                    </p>
                                )}

                                {/* Bouton "Bien assimilé" */}
                                <button
                                    onClick={() => handleMarkWatched(video.id)}
                                    disabled={isWatched}
                                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                                        isWatched
                                            ? 'bg-success/20 text-success border-2 border-success cursor-default'
                                            : 'bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-md hover:shadow-lg'
                                    }`}
                                >
                                    {isWatched ? (
                                        <>
                                            <span className="material-symbols-outlined">check_circle</span>
                                            <span>Bien assimilé</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">task_alt</span>
                                            <span>Marquer comme assimilé</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Message d'encouragement */}
            {!allWatched && watchedCount > 0 && (
                <div className="mt-8 p-6 bg-info/10 border border-info/30 rounded-xl text-center animate-fadeIn">
                    <span className="material-symbols-outlined text-info !text-4xl mb-2">emoji_events</span>
                    <p className="text-lg text-text">
                        Bravo ! Encore {videos.length - watchedCount} vidéo{videos.length - watchedCount > 1 ? 's' : ''} à assimiler.
                    </p>
                </div>
            )}
        </div>
        </>
    );
};

export default VideoCapsules;
