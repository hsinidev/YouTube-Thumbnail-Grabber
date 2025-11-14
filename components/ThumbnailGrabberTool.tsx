import React, { useState, useCallback, useRef, useEffect } from 'react';
import { extractVideoId, generateThumbnailUrl, RESOLUTIONS, Resolution } from '../services/youtubeService';

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const ThumbnailGrabberTool: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [selectedResolution, setSelectedResolution] = useState<Resolution>('maxresdefault');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    
    const [currentResolutionAttempt, setCurrentResolutionAttempt] = useState<Resolution>('maxresdefault');
    const resolutionFallbackOrder: Resolution[] = ['maxresdefault', 'hq720', 'sddefault', 'hqdefault'];


    const handleGrabThumbnail = useCallback(() => {
        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        setVideoId(null);
        setCopySuccess(false);

        const extractedId = extractVideoId(videoUrl);
        if (!extractedId) {
            setError('Invalid YouTube URL or Video ID. Please check and try again.');
            setIsLoading(false);
            return;
        }
        
        setVideoId(extractedId);
        setCurrentResolutionAttempt(selectedResolution);
        const url = generateThumbnailUrl(extractedId, selectedResolution);
        setImageUrl(url);

    }, [videoUrl, selectedResolution]);

    const handleImageError = () => {
        if (!videoId) return;
        const currentIndex = resolutionFallbackOrder.indexOf(currentResolutionAttempt);
        const nextIndex = currentIndex + 1;

        if (nextIndex < resolutionFallbackOrder.length) {
            const nextResolution = resolutionFallbackOrder[nextIndex];
            setCurrentResolutionAttempt(nextResolution);
            const newUrl = generateThumbnailUrl(videoId, nextResolution);
            setImageUrl(newUrl);
        } else {
            setError("Could not load any thumbnail for this video. It might be private or deleted.");
            setIsLoading(false);
        }
    };
    
    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleDownload = async () => {
        if (!imageUrl) return;
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${videoId}_${currentResolutionAttempt}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError("Failed to download image. Please try again or copy the URL.");
        }
    };

    const handleCopyUrl = () => {
        if (!imageUrl) return;
        navigator.clipboard.writeText(imageUrl).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };
    
    useEffect(() => {
        // Reset image loading state when the source changes
        setIsLoading(!!imageUrl);
    }, [imageUrl]);

    return (
        <section id="tool" className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                YouTube Thumbnail Grabber
            </h1>
            <p className="max-w-2xl text-lg text-gray-300 mb-8">
                Instantly download any YouTube video thumbnail in the highest available resolution. Just paste the video URL below to get started.
            </p>

            <div className="w-full max-w-3xl bg-gray-900/50 backdrop-blur-sm border border-purple-500/50 rounded-xl p-6 md:p-8 shadow-2xl shadow-purple-900/50">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Paste YouTube URL or Video ID..."
                        className="flex-grow bg-gray-800/70 border-2 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 rounded-md py-3 px-4 text-white placeholder-gray-400 transition-all duration-300 ease-in-out outline-none"
                    />
                    <select
                        value={selectedResolution}
                        onChange={(e) => setSelectedResolution(e.target.value as Resolution)}
                        className="bg-gray-800/70 border-2 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 rounded-md py-3 px-4 text-white outline-none"
                    >
                        {RESOLUTIONS.map(res => (
                            <option key={res.value} value={res.value}>{res.label}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleGrabThumbnail}
                    disabled={!videoUrl || isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-md text-xl transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? 'Grabbing...' : 'Grab Thumbnail'}
                </button>
            </div>

            {error && (
                <div className="mt-6 bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-md max-w-3xl w-full">
                    {error}
                </div>
            )}

            {imageUrl && (
                <div className="mt-12 w-full max-w-3xl flex flex-col items-center animate-fadeIn">
                    <h2 className="text-3xl font-bold mb-6">Your Thumbnail</h2>
                    <div className="relative w-full aspect-video bg-gray-900/50 rounded-lg overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-900/50">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                            </div>
                        )}
                         <img
                            ref={imageRef}
                            src={imageUrl}
                            alt="YouTube Video Thumbnail"
                            className={`w-full h-full object-contain transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                    </div>
                    {!isLoading && !error && (
                        <div className="mt-6 w-full flex flex-col sm:flex-row gap-4">
                            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105">
                                <DownloadIcon className="w-6 h-6" />
                                <span>Download Image</span>
                            </button>
                            <button onClick={handleCopyUrl} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105">
                                <CopyIcon className="w-6 h-6" />
                                <span>{copySuccess ? 'Copied!' : 'Copy Image URL'}</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default ThumbnailGrabberTool;