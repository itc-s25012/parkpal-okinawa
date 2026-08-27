"use client";

import {
    LANGUAGE_LABELS,
    TEXT,
    type Language,
} from "@/lib/translations";

type Mode =
    | "student"
    | "tourist";

type TopControlsProps = {
    /*
     * 今は親側との互換性のため残しておく
     */
    mode:
        Mode;

    language:
        Language;

    languageOpen:
        boolean;

    /*
     * 今は親側との互換性のため残しておく
     */
    onModeChange:
        (
            mode:
            Mode,
        ) => void;

    onLanguageOpenChange:
        (
            open:
            boolean,
        ) => void;

    onLanguageChange:
        (
            language:
            Language,
        ) => void;

    /*
     * ParkPalロゴを押したとき
     * ホームへ戻る
     */
    onHome:
        () => void;
};

export function TopControls({
                                language,
                                languageOpen,
                                onLanguageOpenChange,
                                onLanguageChange,
                                onHome,
                            }: TopControlsProps) {
    const t =
        TEXT[
            language
            ];

    return (
        <>
            {/*
             * ====================================
             * LOGO / HOME
             * ====================================
             *
             * ParkPalロゴを押すと
             * 検索前のホーム状態へ戻る
             * ====================================
             */}

            <div
                className="absolute left-4 top-4"
                style={{
                    zIndex:
                        1200,
                }}
            >
                <button
                    type="button"
                    onClick={
                        onHome
                    }
                    aria-label="ホームに戻る"
                    title="ホームに戻る"
                    className="
                        rounded-2xl
                        bg-slate-950
                        px-4
                        py-3
                        text-left
                        shadow-xl
                        transition
                        hover:bg-slate-800
                        active:scale-95
                    "
                >
                    <p className="text-sm font-black text-white">
                        🅿️ ParkPal
                    </p>

                    <p className="text-[9px] font-bold tracking-widest text-slate-400">
                        OKINAWA
                    </p>
                </button>
            </div>

            {/*
             * ====================================
             * STUDENT MODE
             * ====================================
             *
             * 観光モードは廃止。
             * ParkPalは学生向け駐車場検索に特化。
             * ====================================
             */}

            <div
                className="absolute left-1/2 top-4 -translate-x-1/2"
                style={{
                    zIndex:
                        1200,
                }}
            >
                <div className="rounded-2xl bg-white px-4 py-3 shadow-lg">
                    <p className="text-xs font-black text-sky-600">
                        🎓 学生向け
                    </p>
                </div>
            </div>

            {/*
             * ====================================
             * LANGUAGE
             * ====================================
             */}

            <div
                className="absolute right-4 top-4"
                style={{
                    zIndex:
                        1300,
                }}
            >
                <button
                    type="button"
                    onClick={() =>
                        onLanguageOpenChange(
                            !languageOpen,
                        )
                    }
                    className="rounded-2xl bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-lg"
                >
                    🌐{" "}
                    {
                        LANGUAGE_LABELS[
                            language
                            ]
                    }
                </button>

                {languageOpen && (
                    <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl bg-white shadow-xl">
                        {(
                            Object.keys(
                                LANGUAGE_LABELS,
                            ) as Language[]
                        ).map(
                            (
                                lang,
                            ) => (
                                <button
                                    key={
                                        lang
                                    }
                                    type="button"
                                    onClick={() => {
                                        onLanguageChange(
                                            lang,
                                        );

                                        onLanguageOpenChange(
                                            false,
                                        );
                                    }}
                                    className="block w-full px-3 py-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    {
                                        LANGUAGE_LABELS[
                                            lang
                                            ]
                                    }
                                </button>
                            ),
                        )}
                    </div>
                )}
            </div>
        </>
    );
}