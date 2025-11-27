'use client';

export default function SpeciesDetailImage({ src, alt, className, style }) {
    const handleImageError = (e) => {
        e.currentTarget.src = '/images/default.png';
    };

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={style}
            onError={handleImageError}
        />
    );
}
