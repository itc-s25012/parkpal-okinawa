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
    mode:
        Mode;

    language:
        Language;

    languageOpen:
        boolean;

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
};

export function TopControls({
                                mode,
                                language,
                                languageOpen,
                                onModeChange,
                                onLanguageOpenChange,
                                onLanguageChange,
                            }: TopControlsProps) {
    const t =
        TEXT[
            language
            ];

    return (
        <>
            {/*
             * ====================================
             * LOGO
             * ====================================
             */}

            <div
                className="absolute left-4 top-4"
                style={{
                    zIndex:
                        1200,
                }}
            >
                <div className="rounded-2xl bg-slate-950 px-4 py-3 shadow-xl">
                    <p className="text-sm font-black text-white">
                        🅿️ ParkPal
                    </p>

                    <p className="text-[9px] font-bold tracking-widest text-slate-400">
                        OKINAWA
                    </p>
                </div>
            </div>

            {/*
             * ====================================
             * STUDENT / TRAVEL
             * ====================================
             */}

            <div
                className="absolute left-1/2 top-4 -translate-x-1/2"
                style={{
                    zIndex:
                        1200,
                }}
            >
                <div className="flex rounded-2xl bg-white p-1.5 shadow-lg">
                    <button
                        type="button"
                        onClick={() =>
                            onModeChange(
                                "student",
                            )
                        }
                        className={`rounded-xl px-4 py-2 text-xs font-black ${
                            mode ===
                            "student"
                                ? "bg-sky-500 text-white"
                                : "text-slate-500"
                        }`}
                    >
                        🎓{" "}
                        {
                            t.student
                        }
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onModeChange(
                                "tourist",
                            )
                        }
                        className={`rounded-xl px-4 py-2 text-xs font-black ${
                            mode ===
                            "tourist"
                                ? "bg-sky-500 text-white"
                                : "text-slate-500"
                        }`}
                    >
                        🏝️{" "}
                        {
                            t.tourist
                        }
                    </button>
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