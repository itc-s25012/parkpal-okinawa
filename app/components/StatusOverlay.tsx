"use client";

import type {
    Target,
} from "@/app/components/ParkingList";

import {
    type Language,
} from "@/lib/translations";

type StatusOverlayProps = {
    target:
        Target | null;

    language:
        Language;

    loading:
        boolean;

    error:
        string;
};

const SEARCHING_TEXT:
    Record<
        Language,
        string
    > = {
    ja:
        "周辺の駐車場を探しています…",

    en:
        "Searching for nearby parking…",

    "zh-CN":
        "正在搜索附近的停车场…",

    "zh-TW":
        "正在搜尋附近的停車場…",

    ko:
        "주변 주차장을 찾고 있어요…",
};

export function StatusOverlay({
                                  target,
                                  language,
                                  loading,
                                  error,
                              }: StatusOverlayProps) {
    return (
        <>
            {/*
             * ====================================
             * 波紋ローディング
             * ====================================
             */}

            {loading && (
                <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    style={{
                        zIndex:
                            1140,
                    }}
                >
                    <div className="flex flex-col items-center">
                        {/*
                         * 波紋部分
                         */}

                        <div className="relative flex h-40 w-40 items-center justify-center">

                            {/*
                             * 波紋1
                             */}

                            <span
                                className="absolute h-16 w-16 rounded-full border-2 border-sky-400/70"
                                style={{
                                    animation:
                                        "parkpalRipple 2.4s ease-out infinite",
                                }}
                            />

                            {/*
                             * 波紋2
                             */}

                            <span
                                className="absolute h-16 w-16 rounded-full border-2 border-sky-400/55"
                                style={{
                                    animation:
                                        "parkpalRipple 2.4s ease-out 0.8s infinite",
                                }}
                            />

                            {/*
                             * 波紋3
                             */}

                            <span
                                className="absolute h-16 w-16 rounded-full border-2 border-sky-400/40"
                                style={{
                                    animation:
                                        "parkpalRipple 2.4s ease-out 1.6s infinite",
                                }}
                            />

                            {/*
                             * 中央アイコン
                             */}

                            <div className="relative z-10 grid h-16 w-16 place-items-center rounded-full bg-white text-2xl shadow-xl ring-1 ring-slate-200">
                                🅿️
                            </div>
                        </div>

                        {/*
                         * 検索中メッセージ
                         */}

                        <div className="-mt-3 rounded-full bg-white/95 px-5 py-2.5 text-xs font-black text-slate-700 shadow-xl backdrop-blur">
                            {
                                SEARCHING_TEXT[
                                    language
                                    ]
                            }
                        </div>
                    </div>

                    {/*
                     * 波紋アニメーション
                     */}

                    <style jsx>
                        {`
                            @keyframes parkpalRipple {
                                0% {
                                    transform: scale(0.55);
                                    opacity: 0.95;
                                }

                                70% {
                                    opacity: 0.35;
                                }

                                100% {
                                    transform: scale(2.4);
                                    opacity: 0;
                                }
                            }
                        `}
                    </style>
                </div>
            )}

            {/*
             * ====================================
             * エラー
             * ====================================
             */}

            {error && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-4 py-2 text-xs font-black text-white shadow-lg"
                    style={{
                        bottom:
                            "165px",

                        zIndex:
                            1150,
                    }}
                >
                    {
                        error
                    }
                </div>
            )}
        </>
    );
}