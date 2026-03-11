import type { WalletName } from '@solana/wallet-adapter-base';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import type { Wallet } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { FC, MouseEvent } from 'react';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Collapse } from './Collapse';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export const CustomWalletModal: FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const { wallets, select } = useWallet();
    const { visible, setVisible } = useWalletModal();
    const [expanded, setExpanded] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [portal, setPortal] = useState<Element | null>(null);

    const [listedWallets, collapsedWallets] = useMemo(() => {
        const installed: Wallet[] = [];
        const notInstalled: Wallet[] = [];

        for (const wallet of wallets) {
            if (wallet.readyState === WalletReadyState.Installed) {
                installed.push(wallet);
            } else {
                notInstalled.push(wallet);
            }
        }

        return installed.length ? [installed, notInstalled] : [notInstalled, []];
    }, [wallets]);

    const hideModal = useCallback(() => {
        setFadeIn(false);
        setTimeout(() => setVisible(false), 150);
    }, [setVisible]);

    const handleClose = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            hideModal();
        },
        [hideModal]
    );

    const handleWalletClick = useCallback(
        (event: MouseEvent, walletName: WalletName) => {
            select(walletName);
            handleClose(event);
        },
        [select, handleClose]
    );

    const handleCollapseClick = useCallback(() => setExpanded(!expanded), [expanded]);

    const handleTabKey = useCallback(
        (event: KeyboardEvent) => {
            const node = ref.current;
            if (!node) return;

            const focusableElements = node.querySelectorAll('button');
            const firstElement = focusableElements[0]!;
            const lastElement = focusableElements[focusableElements.length - 1]!;

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        },
        [ref]
    );

    useLayoutEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                hideModal();
            } else if (event.key === 'Tab') {
                handleTabKey(event);
            }
        };

        const { overflow } = window.getComputedStyle(document.body);
        setTimeout(() => setFadeIn(true), 0);
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown, false);

        return () => {
            document.body.style.overflow = overflow;
            window.removeEventListener('keydown', handleKeyDown, false);
        };
    }, [hideModal, handleTabKey]);

    useLayoutEffect(() => setPortal(document.querySelector('body')), []);

    if (!visible) return null;

    return (
        portal &&
        createPortal(
            <div
                ref={ref}
                aria-labelledby="wallet-adapter-modal-title"
                aria-modal="true"
                role="dialog"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: fadeIn ? 1 : 0,
                    transition: 'opacity 150ms ease-in',
                }}
            >
                {/* Backdrop */}
                <div
                    onMouseDown={handleClose}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                    }}
                />

                {/* Modal card */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '92vw',
                        maxWidth: 420,
                        background: 'linear-gradient(168deg, #0d1120 0%, #070a14 50%, #0b0e1a 100%)',
                        border: '1px solid rgba(124, 106, 247, 0.15)',
                        borderRadius: 16,
                        padding: 24,
                        boxShadow: '0 0 80px rgba(124, 106, 247, 0.08), 0 24px 48px rgba(0,0,0,0.5)',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        transform: fadeIn ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(12px)',
                        transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.04)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="#6b7280">
                            <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
                        </svg>
                    </button>

                    {listedWallets.length ? (
                        <>
                            <h1
                                id="wallet-adapter-modal-title"
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    marginBottom: 20,
                                    textAlign: 'center',
                                    letterSpacing: '-0.2px',
                                    lineHeight: 1.4,
                                    marginTop: 0,
                                    paddingRight: 32,
                                }}
                            >
                                Connect your wallet
                            </h1>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {listedWallets.map((wallet) => (
                                    <WalletItem
                                        key={wallet.adapter.name}
                                        wallet={wallet}
                                        onClick={(e) => handleWalletClick(e, wallet.adapter.name)}
                                    />
                                ))}
                                {collapsedWallets.length ? (
                                    <Collapse expanded={expanded} id="wallet-adapter-modal-collapse">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {collapsedWallets.map((wallet) => (
                                                <WalletItem
                                                    key={wallet.adapter.name}
                                                    wallet={wallet}
                                                    onClick={(e) => handleWalletClick(e, wallet.adapter.name)}
                                                    tabIndex={expanded ? 0 : -1}
                                                />
                                            ))}
                                        </div>
                                    </Collapse>
                                ) : null}
                            </ul>

                            {collapsedWallets.length ? (
                                <button
                                    onClick={handleCollapseClick}
                                    tabIndex={0}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        width: '100%',
                                        padding: 10,
                                        marginTop: 4,
                                        borderRadius: 8,
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#6b7280',
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: 12,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span>{expanded ? 'Less ' : 'More '}options</span>
                                    <svg
                                        width="13"
                                        height="7"
                                        viewBox="0 0 13 7"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        style={{
                                            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                                            transition: 'transform 200ms ease',
                                        }}
                                    >
                                        <path d="M0.71418 1.626L5.83323 6.26188C5.91574 6.33657 6.0181 6.39652 6.13327 6.43762C6.24844 6.47872 6.37371 6.5 6.50048 6.5C6.62725 6.5 6.75252 6.47872 6.8677 6.43762C6.98287 6.39652 7.08523 6.33657 7.16774 6.26188L12.2868 1.626C12.7753 1.1835 12.3703 0.5 11.6195 0.5H1.37997C0.629216 0.5 0.224175 1.1835 0.71418 1.626Z" />
                                    </svg>
                                </button>
                            ) : null}
                        </>
                    ) : (
                        <>
                            <h1
                                id="wallet-adapter-modal-title"
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    marginBottom: 16,
                                    textAlign: 'center',
                                    marginTop: 0,
                                    paddingRight: 32,
                                }}
                            >
                                You need a wallet on Solana to continue
                            </h1>
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="6" width="20" height="14" rx="2" />
                                    <path d="M22 10H2" />
                                    <path d="M6 14h4" />
                                </svg>
                            </div>
                            {collapsedWallets.length ? (
                                <>
                                    <button
                                        onClick={handleCollapseClick}
                                        tabIndex={0}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 6,
                                            width: '100%',
                                            padding: 10,
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#6b7280',
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: 12,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <span>{expanded ? 'Hide ' : 'Already have a wallet? View '}options</span>
                                        <svg
                                            width="13"
                                            height="7"
                                            viewBox="0 0 13 7"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            style={{
                                                transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                                                transition: 'transform 200ms ease',
                                            }}
                                        >
                                            <path d="M0.71418 1.626L5.83323 6.26188C5.91574 6.33657 6.0181 6.39652 6.13327 6.43762C6.24844 6.47872 6.37371 6.5 6.50048 6.5C6.62725 6.5 6.75252 6.47872 6.8677 6.43762C6.98287 6.39652 7.08523 6.33657 7.16774 6.26188L12.2868 1.626C12.7753 1.1835 12.3703 0.5 11.6195 0.5H1.37997C0.629216 0.5 0.224175 1.1835 0.71418 1.626Z" />
                                        </svg>
                                    </button>
                                    <Collapse expanded={expanded} id="wallet-adapter-modal-collapse">
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {collapsedWallets.map((wallet) => (
                                                <WalletItem
                                                    key={wallet.adapter.name}
                                                    wallet={wallet}
                                                    onClick={(e) => handleWalletClick(e, wallet.adapter.name)}
                                                    tabIndex={expanded ? 0 : -1}
                                                />
                                            ))}
                                        </ul>
                                    </Collapse>
                                </>
                            ) : null}
                        </>
                    )}
                </div>
            </div>,
            portal
        )
    );
};

const WalletItem: FC<{
    wallet: Wallet;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
    tabIndex?: number;
}> = ({ wallet, onClick, tabIndex }) => {
    const isInstalled = wallet.readyState === WalletReadyState.Installed;

    return (
        <li>
            <button
                onClick={onClick}
                tabIndex={tabIndex}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#e5e7eb',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(167,139,250,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(167,139,250,0.2)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                {wallet.adapter.icon && (
                    <img
                        src={wallet.adapter.icon}
                        alt={`${wallet.adapter.name} icon`}
                        style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }}
                    />
                )}
                <span style={{ flex: 1 }}>{wallet.adapter.name}</span>
                {isInstalled && (
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: '#34d399',
                            background: 'rgba(52,211,153,0.1)',
                            padding: '2px 8px',
                            borderRadius: 99,
                            marginLeft: 'auto',
                        }}
                    >
                        Detected
                    </span>
                )}
            </button>
        </li>
    );
};
