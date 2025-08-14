import React from 'react';

type IconProps = {
	name: string; // without extension, e.g. 'dashboard'
	alt?: string;
	className?: string;
};

export function Icon({ name, alt, className }: IconProps) {
    const src = `/icons/${name}.svg`;
    const onError: React.ReactEventHandler<HTMLImageElement> = (e) => {
        const el = e.currentTarget as HTMLImageElement;
        if (!el.dataset.fallback) {
            el.dataset.fallback = '1';
            el.src = '/icons/default.svg';
        }
    };
    return (
        <img
            src={src}
            onError={onError}
            alt={alt || name}
            className={className || 'h-5 w-5'}
            aria-hidden={alt ? undefined : true}
        />
    );
}


