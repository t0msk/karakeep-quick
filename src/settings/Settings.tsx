import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/api/karakeep';
import '@/styles/globals.css';
import './settings.css';

export default function Settings() {
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);

    useEffect(() => {
        document.body.classList.add('settings-page');
        getSettings().then((s) => {
            setApiUrl(s.apiUrl);
            setApiKey(s.apiKey);
        });
    }, []);

    async function handleSave() {
        const url = apiUrl.trim(),
            key = apiKey.trim();
        if (!url || !key) {
            setError('Both API URL and API Key are required.');
            return;
        }
        try {
            new URL(url);
        } catch {
            setError('Enter a valid URL (e.g. https://karakeep.example.com)');
            return;
        }
        setError(null);
        await saveSettings({ apiUrl: url, apiKey: key });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    async function handleTest() {
        const url = apiUrl.trim(),
            key = apiKey.trim();
        if (!url || !key) return;
        setTesting(true);
        setTestResult(null);
        try {
            const res = await fetch(`${url.replace(/\/$/, '')}/api/v1/lists`, {
                headers: { Authorization: `Bearer ${key}` },
            });
            setTestResult(res.ok ? 'ok' : 'fail');
        } catch {
            setTestResult('fail');
        } finally {
            setTesting(false);
        }
    }

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex justify-center px-4 py-10 pb-16">
            <div className="w-full max-w-[480px] flex flex-col gap-5">
                {/* Header */}
                <header className="flex items-center gap-3.5 mb-1">
                    <div className="w-11 h-11 bg-[var(--accent-dim)] border border-[var(--accent-border)] rounded-[12px] flex items-center justify-center shrink-0">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-[18px] font-semibold tracking-tight text-[var(--text-primary)]">
                            Settings
                        </h1>
                        <p className="text-[12.5px] text-[var(--text-tertiary)] mt-0.5">
                            Configure your Karakeep connection
                        </p>
                    </div>
                </header>

                {/* API Card */}
                <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4">
                    <h2 className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[var(--text-tertiary)]">
                        API Connection
                    </h2>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="apiUrl"
                            className="text-[12.5px] font-medium text-[var(--text-secondary)]"
                        >
                            Instance URL
                        </label>
                        <input
                            id="apiUrl"
                            type="url"
                            placeholder="https://karakeep.example.com"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            spellCheck={false}
                            autoComplete="off"
                            className="settings-input bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 py-2.5 text-[var(--text-primary)] text-[13px] font-mono outline-none w-full transition-all duration-150 placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:shadow-[0_0_0_3px_var(--accent-glow)]"
                        />
                        <span className="text-[11.5px] text-[var(--text-tertiary)] leading-relaxed">
                            The base URL of your self-hosted Karakeep instance.
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="apiKey"
                            className="text-[12.5px] font-medium text-[var(--text-secondary)]"
                        >
                            API Key
                        </label>
                        <input
                            id="apiKey"
                            type="password"
                            placeholder="kk_••••••••••••••••••••••••"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            spellCheck={false}
                            autoComplete="off"
                            className="settings-input bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 py-2.5 text-[var(--text-primary)] text-[13px] font-mono outline-none w-full transition-all duration-150 placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:shadow-[0_0_0_3px_var(--accent-glow)]"
                        />
                        <span className="text-[11.5px] text-[var(--text-tertiary)] leading-relaxed">
                            Generate a key in Karakeep → Settings → API Keys.
                        </span>
                    </div>

                    {error && (
                        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-[var(--radius-sm)] text-[12.5px] text-[var(--color-error)]">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="shrink-0"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 8v4M12 16h.01" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 pt-0.5">
                        <button
                            onClick={handleTest}
                            disabled={testing || !apiUrl || !apiKey}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-active)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                        >
                            {testing ? (
                                <>
                                    <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
                                        <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round">
                                            <animateTransform
                                                attributeName="transform"
                                                type="rotate"
                                                from="0 12 12"
                                                to="360 12 12"
                                                dur="0.7s"
                                                repeatCount="indefinite"
                                            />
                                        </path>
                                    </svg>
                                    Testing…
                                </>
                            ) : (
                                'Test connection'
                            )}
                        </button>

                        <button
                            onClick={handleSave}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--accent)] text-[var(--accent-text-on)] rounded-[var(--radius-md)] text-[13px] font-semibold hover:opacity-85 active:scale-[0.97] transition-all duration-150 cursor-pointer"
                        >
                            {saved ? (
                                <>
                                    <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Saved
                                </>
                            ) : (
                                'Save settings'
                            )}
                        </button>
                    </div>

                    {testResult === 'ok' && (
                        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[var(--success-bg)] border border-[var(--success-border)] rounded-[var(--radius-sm)] text-[12.5px] text-[var(--color-success)]">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className="shrink-0"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="9 12 11 14 15 10" />
                            </svg>
                            Connected successfully!
                        </div>
                    )}
                    {testResult === 'fail' && (
                        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-[var(--radius-sm)] text-[12.5px] text-[var(--color-error)]">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="shrink-0"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 8v4M12 16h.01" />
                            </svg>
                            Connection failed. Check your URL and API key.
                        </div>
                    )}
                </section>

                {/* Links Card */}
                <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4">
                    <h2 className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[var(--text-tertiary)]">
                        Links
                    </h2>
                    <div className="flex flex-col gap-0.5 -mx-2">
                        <LinkRow
                            href="https://github.com/nichochar/karakeep"
                            label="GitHub"
                            sublabel="Source code & issues"
                            icon={
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                            }
                        />
                        <LinkRow
                            href="https://ko-fi.com"
                            label="Ko-fi"
                            sublabel="Support development"
                            icon={
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                >
                                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                                </svg>
                            }
                        />
                    </div>
                </section>

                <footer className="pt-2 text-center">
                    <span className="text-[11.5px] text-[var(--text-tertiary)] font-mono">
                        Karakeep Quick Extension v1.0.0
                    </span>
                </footer>
            </div>
        </div>
    );
}

function LinkRow({
    href,
    icon,
    label,
    sublabel,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    sublabel: string;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-2 py-2.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-elevated)] transition-colors duration-150 cursor-pointer"
        >
            <span className="text-[var(--text-secondary)] flex items-center w-5 shrink-0">
                {icon}
            </span>
            <span className="flex-1 flex flex-col gap-0.5">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">{label}</span>
                <span className="text-[11.5px] text-[var(--text-tertiary)]">{sublabel}</span>
            </span>
            <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-[var(--text-tertiary)] shrink-0"
            >
                <path d="M7 17 17 7M7 7h10v10" />
            </svg>
        </a>
    );
}
