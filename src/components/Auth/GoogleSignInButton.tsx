import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        google?: {
            accounts?: {
                id?: {
                    initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
                    renderButton: (container: HTMLElement, options: Record<string, unknown>) => void;
                    cancel: () => void;
                };
            };
        };
    }
}

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const loadGoogleScript = () =>
    new Promise<void>((resolve, reject) => {
        if (typeof document === 'undefined') {
            reject(new Error('No document'));
            return;
        }

        const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load Google script')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = GOOGLE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener(
            'load',
            () => {
                script.dataset.loaded = 'true';
                resolve();
            },
            { once: true }
        );
        script.addEventListener('error', () => reject(new Error('Failed to load Google script')), { once: true });
        document.head.appendChild(script);
    });

export const GoogleSignInButton = ({
    clientId,
    onCredential,
    disabled,
}: {
    clientId: string;
    onCredential: (credential: string) => void;
    disabled?: boolean;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const setup = async () => {
            if (!clientId || disabled) {
                return;
            }

            try {
                await loadGoogleScript();
                const google = window.google?.accounts?.id;
                if (!google || !containerRef.current) {
                    return;
                }

                google.initialize({
                    client_id: clientId,
                    callback: (response) => {
                        if (response?.credential) {
                            onCredential(response.credential);
                        }
                    },
                });

                containerRef.current.innerHTML = '';
                google.renderButton(containerRef.current, {
                    theme: 'outline',
                    size: 'large',
                    shape: 'pill',
                    width: containerRef.current.offsetWidth || 320,
                    text: 'continue_with',
                });

                if (isMounted) {
                    setReady(true);
                }
            } catch {
                // ignore
            }
        };

        void setup();

        return () => {
            isMounted = false;
            try {
                window.google?.accounts?.id?.cancel?.();
            } catch {
                // ignore
            }
        };
    }, [clientId, disabled, onCredential]);

    return (
        <div className="w-full">
            <div
                ref={containerRef}
                className={`flex justify-center ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
            />
            {!ready && !disabled && clientId ? (
                <div className="mt-3 text-center text-xs text-[#5C5C5C]">Loading Google sign-in…</div>
            ) : null}
        </div>
    );
};

