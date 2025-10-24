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
                        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-sm">
                            <div className="flex-1 min-w-0 mr-3">
                                <h2 className="text-white font-display font-bold text-base md:text-xl lg:text-2xl truncate tracking-tight">{currentVideo.title}</h2>
                                {currentVideo.duration && (
                                    <p className="text-white/60 text-xs md:text-sm mt-1 font-mono">Durée: {currentVideo.duration}</p>
                                )}
                            </div>
                            <button
                                onClick={handleClosePlayer}
                                className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white p-2.5 md:p-3 rounded-xl transition-all duration-200 flex-shrink-0 touch-manipulation hover:scale-105 active:scale-95 shadow-lg"
                                aria-label="Fermer le lecteur"
                            >
                                <span className="material-symbols-outlined !text-xl md:!text-2xl">close</span>
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
                        <div className="bg-gradient-to-t from-black/95 to-transparent px-4 md:px-6 py-5 md:py-7 space-y-4 md:space-y-5">
                            {/* Description pédagogique */}
                            {currentVideo.description && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-white/10 max-w-4xl mx-auto shadow-elevated">
                                    <div className="flex items-start gap-3 md:gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary !text-xl md:!text-2xl">lightbulb</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-display font-bold text-sm md:text-base mb-2 tracking-tight">À retenir</h3>
                                            <p className="text-white/80 text-xs md:text-sm leading-relaxed">{currentVideo.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bouton style YouTube S'abonner/Abonné */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => {
                                        handleMarkWatched(currentVideo.id);
                                        handleClosePlayer();
                                    }}
                                    disabled={watchedVideos[currentVideo.id]}
                                    className={`px-6 md:px-8 py-3.5 md:py-4 rounded-full font-sans font-bold text-sm md:text-base transition-all duration-200 flex items-center gap-2.5 touch-manipulation min-h-[48px] shadow-md hover:shadow-lg ${
                                        watchedVideos[currentVideo.id]
                                            ? 'bg-white/10 text-white border-2 border-white/20 cursor-default backdrop-blur-sm hover:bg-white/15'
                                            : 'bg-white text-black hover:bg-white/90 active:scale-95'
                                    }`}
                                >
                                    {watchedVideos[currentVideo.id] ? (
                                        <>
                                            <span className="material-symbols-outlined !text-lg md:!text-xl">check_circle</span>
                                            <span>Compris</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined !text-lg md:!text-xl">check</span>
                                            <span>J'ai compris</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Indicateur de progression */}
                            <div className="text-center">
                                <p className="text-white/50 text-xs md:text-sm font-mono">
                                    Vidéo {videos.findIndex(v => v.id === currentVideo.id) + 1} / {videos.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto animate-slideInUp px-4 sm:px-6 lg:px-8 pb-24 sm:pb-12">
            {/* Header avec progression responsive et compact */}
            <div className="mb-6 md:mb-8 bg-surface/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-border/50 shadow-soft">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4">
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-text mb-1 tracking-tight">Capsules Vidéo</h2>
                        <p className="text-text-secondary text-sm md:text-base leading-relaxed">Ressources pour approfondir le chapitre</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl px-4 md:px-5 py-2.5 md:py-3 border border-primary/20">
                        <div className="text-2xl md:text-3xl font-display font-bold text-primary tabular-nums">{watchedCount}<span className="text-text-secondary text-xl md:text-2xl">/{videos.length}</span></div>
                        <div className="text-[10px] md:text-xs text-text-secondary font-medium tracking-wide uppercase">Comprises</div>
                    </div>
                </div>

                {/* Barre de progression compacte */}
                <div className="w-full bg-border/20 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-700 ease-out rounded-full ${
                            allWatched ? 'bg-gradient-to-r from-success to-success' : 'bg-gradient-to-r from-primary to-primary'
                        }`}
                        style={{ width: `${(watchedCount / videos.length) * 100}%` }}
                    />
                </div>

                {allWatched && (
                    <div className="mt-3 flex items-center gap-2 text-success bg-success/10 rounded-lg p-3 animate-fadeIn border border-success/20">
                        <span className="material-symbols-outlined !text-xl md:!text-2xl flex-shrink-0">check_circle</span>
                        <span className="font-display font-semibold text-xs md:text-sm">Toutes les vidéos comprises ! 🎉</span>
                    </div>
                )}
            </div>

            {/* Grille de vidéos responsive et compacte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {videos.map((video, index) => {
                    const isWatched = watchedVideos[video.id] || false;
                    const thumbnailUrl = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

                    return (
                        <div
                            key={video.id}
                            className={`group bg-surface/80 backdrop-blur-sm rounded-xl border-2 overflow-hidden transition-all duration-300 shadow-soft hover:shadow-medium active:scale-[0.98] ${
                                isWatched
                                    ? 'border-success/40 bg-gradient-to-br from-success/5 to-success/0'
                                    : 'border-border/50 hover:border-primary/40 hover:bg-surface'
                            }`}
                        >
                            {/* Thumbnail avec overlay optimisé tactile */}
                            <div className="relative aspect-video bg-black overflow-hidden">
                                <img
                                    src={thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                                    }}
                                />

                                {/* Overlay avec play button optimisé */}
                                <button
                                    onClick={() => handlePlayVideo(video.id)}
                                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/30 to-transparent hover:from-black/80 hover:via-black/50 transition-all duration-300 cursor-pointer touch-manipulation"
                                    aria-label={`Lire: ${video.title}`}
                                >
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-error to-error/80 flex items-center justify-center active:scale-90 group-hover:scale-110 transition-all duration-300 shadow-xl">
                                        <span className="material-symbols-outlined text-white !text-3xl md:!text-4xl ml-1">play_arrow</span>
                                    </div>
                                </button>

                                {/* Badge numéro compact */}
                                <div className="absolute top-2 left-2 bg-gradient-to-br from-primary to-primary/80 text-white px-2.5 py-1 rounded-lg text-xs font-display font-bold backdrop-blur-sm shadow-md">
                                    #{index + 1}
                                </div>

                                {/* Badge durée */}
                                {video.duration && (
                                    <div className="absolute bottom-2 right-2 bg-black/90 text-white px-2 py-1 rounded-md text-[10px] font-mono backdrop-blur-sm shadow-sm">
                                        {video.duration}
                                    </div>
                                )}

                                {/* Badge validé */}
                                {isWatched && (
                                    <div className="absolute top-2 right-2 bg-success text-white p-1.5 rounded-lg animate-scaleIn shadow-glow-success">
                                        <span className="material-symbols-outlined !text-xl">check_circle</span>
                                    </div>
                                )}
                            </div>

                            {/* Contenu compact */}
                            <div className="p-3 md:p-4">
                                <h3 className="text-base md:text-lg font-display font-bold text-text mb-2 leading-tight tracking-tight line-clamp-2">
                                    {video.title}
                                </h3>

                                {video.description && (
                                    <p className="text-xs md:text-sm text-text-secondary mb-3 leading-relaxed line-clamp-2">
                                        {video.description}
                                    </p>
                                )}

                                {/* Bouton style YouTube compact */}
                                <button
                                    onClick={() => handleMarkWatched(video.id)}
                                    disabled={isWatched}
                                    className={`w-full px-4 py-3 rounded-full font-sans font-semibold text-xs md:text-sm transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation min-h-[44px] shadow-sm ${
                                        isWatched
                                            ? 'bg-surface-secondary text-text-secondary border-2 border-border cursor-default hover:bg-surface-secondary'
                                            : 'bg-text text-white hover:bg-text/90 active:scale-95'
                                    }`}
                                >
                                    {isWatched ? (
                                        <>
                                            <span className="material-symbols-outlined !text-base md:!text-lg">check_circle</span>
                                            <span>Compris</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined !text-base md:!text-lg">check</span>
                                            <span>J'ai compris</span>
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
                <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-br from-info/10 to-info/5 border-2 border-info/30 rounded-xl text-center animate-fadeIn shadow-soft">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-info/20 rounded-xl mb-3">
                        <span className="material-symbols-outlined text-info !text-3xl">emoji_events</span>
                    </div>
                    <p className="text-base md:text-lg font-display font-semibold text-text">
                        Plus que {videos.length - watchedCount} vidéo{videos.length - watchedCount > 1 ? 's' : ''} à comprendre ! 💪
                    </p>
                </div>
            )}
        </div>
        </>
    );
};

export default VideoCapsules;