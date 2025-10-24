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
            {/* Modal plein écran optimisé pour mobile et pédagogie */}
            {playingVideoId && currentVideo && (
                <div
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-fadeIn"
                    onClick={handleClosePlayer}
                >
                    <div
                        className="w-full h-full flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header mobile-friendly */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 to-transparent">
                            <div className="flex-1 min-w-0 mr-3">
                                <h2 className="text-white font-title text-base md:text-xl truncate">{currentVideo.title}</h2>
                                {currentVideo.duration && (
                                    <p className="text-white/60 text-xs md:text-sm mt-0.5">Durée: {currentVideo.duration}</p>
                                )}
                            </div>
                            <button
                                onClick={handleClosePlayer}
                                className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white p-2 md:p-3 rounded-full transition-colors flex-shrink-0 touch-manipulation"
                                aria-label="Fermer le lecteur"
                            >
                                <span className="material-symbols-outlined !text-2xl md:!text-3xl">close</span>
                            </button>
                        </div>

                        {/* Player YouTube centré et responsive */}
                        <div className="flex-1 flex items-center justify-center bg-black px-2 md:px-4">
                            <div className="w-full max-w-6xl">
                                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                    <iframe
                                        src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&fs=1&cc_load_policy=1&iv_load_policy=3&playsinline=1&origin=${window.location.origin}`}
                                        title={currentVideo.title}
                                        className="absolute inset-0 w-full h-full rounded-lg md:rounded-xl shadow-2xl"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        referrerPolicy="strict-origin-when-cross-origin"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section pédagogique mobile-optimized */}
                        <div className="bg-gradient-to-t from-black/90 to-transparent px-4 py-4 md:py-6 space-y-3 md:space-y-4">
                            {/* Description pédagogique */}
                            {currentVideo.description && (
                                <div className="bg-white/5 backdrop-blur-md rounded-lg p-3 md:p-4 border border-white/10 max-w-4xl mx-auto">
                                    <div className="flex items-start gap-2 md:gap-3">
                                        <span className="material-symbols-outlined text-primary !text-xl md:!text-2xl flex-shrink-0 mt-0.5">lightbulb</span>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-semibold text-sm md:text-base mb-1">À retenir</h3>
                                            <p className="text-white/80 text-xs md:text-sm leading-relaxed">{currentVideo.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bouton "Bien assimilé" tactile */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => {
                                        handleMarkWatched(currentVideo.id);
                                        handleClosePlayer();
                                    }}
                                    disabled={watchedVideos[currentVideo.id]}
                                    className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 flex items-center gap-2 md:gap-3 touch-manipulation min-h-[48px] ${
                                        watchedVideos[currentVideo.id]
                                            ? 'bg-success/20 text-success border-2 border-success cursor-default'
                                            : 'bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    {watchedVideos[currentVideo.id] ? (
                                        <>
                                            <span className="material-symbols-outlined !text-xl md:!text-2xl">check_circle</span>
                                            <span>Déjà assimilé</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined !text-xl md:!text-2xl">task_alt</span>
                                            <span className="hidden sm:inline">Marquer comme assimilé</span>
                                            <span className="sm:hidden">Assimilé</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Indicateur de progression */}
                            <div className="text-center">
                                <p className="text-white/60 text-xs md:text-sm">
                                    Vidéo {videos.findIndex(v => v.id === currentVideo.id) + 1} sur {videos.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto animate-slideInUp px-4 md:px-0">
            {/* Header avec progression responsive */}
            <div className="mb-6 md:mb-8 bg-surface p-4 md:p-6 rounded-2xl border border-border shadow-claude">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-title text-text">Capsules Vidéo</h2>
                        <p className="text-text-secondary mt-1 text-sm md:text-base">Regardez les vidéos et marquez-les comme assimilées</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <div className="text-3xl md:text-4xl font-bold text-primary">{watchedCount}/{videos.length}</div>
                        <div className="text-xs md:text-sm text-text-secondary">Vidéos assimilées</div>
                    </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-background rounded-full h-2.5 md:h-3 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ease-out ${
                            allWatched ? 'bg-success' : 'bg-primary'
                        }`}
                        style={{ width: `${(watchedCount / videos.length) * 100}%` }}
                    />
                </div>

                {allWatched && (
                    <div className="mt-3 md:mt-4 flex items-center gap-2 text-success animate-fadeIn">
                        <span className="material-symbols-outlined !text-xl md:!text-2xl">check_circle</span>
                        <span className="font-semibold text-sm md:text-base">Toutes les vidéos sont assimilées ! Vous pouvez passer au quiz.</span>
                    </div>
                )}
            </div>

            {/* Grille de vidéos responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

                                {/* Overlay avec play button optimisé tactile */}
                                <button
                                    onClick={() => handlePlayVideo(video.id)}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 active:bg-black/70 transition-colors cursor-pointer touch-manipulation"
                                    aria-label={`Lire la vidéo: ${video.title}`}
                                >
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-error flex items-center justify-center transform active:scale-95 md:group-hover:scale-110 transition-transform shadow-2xl">
                                        <span className="material-symbols-outlined text-white !text-4xl md:!text-5xl ml-1">play_arrow</span>
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

                                {/* Bouton "Bien assimilé" optimisé tactile */}
                                <button
                                    onClick={() => handleMarkWatched(video.id)}
                                    disabled={isWatched}
                                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation min-h-[48px] ${
                                        isWatched
                                            ? 'bg-success/20 text-success border-2 border-success cursor-default'
                                            : 'bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-md hover:shadow-lg'
                                    }`}
                                    aria-label={isWatched ? 'Vidéo assimilée' : 'Marquer la vidéo comme assimilée'}
                                >
                                    {isWatched ? (
                                        <>
                                            <span className="material-symbols-outlined">check_circle</span>
                                            <span className="text-sm md:text-base">Bien assimilé</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">task_alt</span>
                                            <span className="text-sm md:text-base">Marquer comme assimilé</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Message d'encouragement responsive */}
            {!allWatched && watchedCount > 0 && (
                <div className="mt-6 md:mt-8 p-4 md:p-6 bg-info/10 border border-info/30 rounded-xl text-center animate-fadeIn">
                    <span className="material-symbols-outlined text-info !text-3xl md:!text-4xl mb-2">emoji_events</span>
                    <p className="text-base md:text-lg text-text">
                        Bravo ! Encore {videos.length - watchedCount} vidéo{videos.length - watchedCount > 1 ? 's' : ''} à assimiler.
                    </p>
                </div>
            )}
        </div>
        </>
    );
};

export default VideoCapsules;
