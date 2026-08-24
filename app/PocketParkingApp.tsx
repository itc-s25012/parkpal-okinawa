"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type * as Leaflet from "leaflet";

import {
    ALL_LANDMARKS,
    type Landmark,
    distanceMeters,
    driveMinutes,
    walkMinutes,
} from "@/lib/okinawa-data";

import {
    LANGUAGE_LABELS,
    TEXT,
    type Language,
} from "@/lib/translations";

import {
    ParkingList,
    type ParkingSpot,
    type Target,
} from "@/app/components/ParkingList";

import {
    ParkingDetail,
} from "@/app/components/ParkingDetail";

const DEFAULT_CENTER = {
    lat: 26.2185,
    lng: 127.6912,
};


const DEFAULT_ZOOM = 15;

type Mode =
    | "student"
    | "tourist";


type ParkingResponse = {
    parkings?: ParkingSpot[];
    count?: number;
    error?: string;
    detail?: string;
};

type Chip = {
    label: string;
    icon: string;
    kind:
        | "landmark"
        | "area";
    query: string;
};

const STUDENT_CHIPS:
    Chip[] = [
    {
        label: "ITカレッジ",
        icon: "🏫",
        kind: "landmark",
        query: "ITカレッジ",
    },
    {
        label: "開南",
        icon: "📍",
        kind: "area",
        query: "開南",
    },
    {
        label: "安里",
        icon: "📍",
        kind: "area",
        query: "安里",
    },
    {
        label: "壺川",
        icon: "📍",
        kind: "area",
        query: "壺川",
    },
    {
        label: "コザ",
        icon: "📍",
        kind: "area",
        query: "コザ",
    },
];

const TOURIST_CHIPS:
    Chip[] = [
    {
        label: "国際通り",
        icon: "🛍️",
        kind: "landmark",
        query: "国際通り",
    },
    {
        label: "首里城",
        icon: "🏯",
        kind: "landmark",
        query: "首里城",
    },
    {
        label: "美ら海",
        icon: "🐟",
        kind: "landmark",
        query: "美ら海",
    },
    {
        label: "アメリカンビレッジ",
        icon: "🎡",
        kind: "landmark",
        query: "アメリカンビレッジ",
    },
    {
        label: "古宇利島",
        icon: "🏝️",
        kind: "landmark",
        query: "古宇利",
    },
];




const CHIP_LABELS:
    Record<
        Language,
        Record<
            string,
            string
        >
    > = {
    ja: {
        ITカレッジ: "ITカレッジ",
        開南: "開南",
        安里: "安里",
        壺川: "壺川",
        コザ: "コザ",
        国際通り: "国際通り",
        首里城: "首里城",
        美ら海: "美ら海",
        アメリカンビレッジ:
            "アメリカンビレッジ",
        古宇利島: "古宇利島",
    },

    en: {
        ITカレッジ: "IT College",
        開南: "Kainan",
        安里: "Asato",
        壺川: "Tsubogawa",
        コザ: "Koza",
        国際通り:
            "Kokusai Street",
        首里城:
            "Shuri Castle",
        美ら海:
            "Churaumi Aquarium",
        アメリカンビレッジ:
            "American Village",
        古宇利島:
            "Kouri Island",
    },

    "zh-CN": {
        ITカレッジ:
            "IT学院",
        開南:
            "开南",
        安里:
            "安里",
        壺川:
            "壶川",
        コザ:
            "胡差",
        国際通り:
            "国际通",
        首里城:
            "首里城",
        美ら海:
            "美丽海水族馆",
        アメリカンビレッジ:
            "美国村",
        古宇利島:
            "古宇利岛",
    },

    "zh-TW": {
        ITカレッジ:
            "IT學院",
        開南:
            "開南",
        安里:
            "安里",
        壺川:
            "壺川",
        コザ:
            "胡差",
        国際通り:
            "國際通",
        首里城:
            "首里城",
        美ら海:
            "美麗海水族館",
        アメリカンビレッジ:
            "美國村",
        古宇利島:
            "古宇利島",
    },

    ko: {
        ITカレッジ:
            "IT 칼리지",
        開南:
            "카이난",
        安里:
            "아사토",
        壺川:
            "쓰보가와",
        コザ:
            "고자",
        国際通り:
            "국제거리",
        首里城:
            "슈리성",
        美ら海:
            "추라우미 수족관",
        アメリカンビレッジ:
            "아메리칸 빌리지",
        古宇利島:
            "고우리섬",
    },
};

function chipLabel(
    language: Language,
    label: string,
) {
    return (
        CHIP_LABELS[
            language
            ][label] ??
        label
    );
}

function landmarkIcon(
    landmark: Landmark,
) {
    if (
        landmark.category ===
        "vocational"
    ) {
        return "🎓";
    }

    if (
        landmark.category ===
        "cram"
    ) {
        return "📚";
    }

    if (
        landmark.category ===
        "tourist"
    ) {
        return "🏝️";
    }

    return "📍";
}

function translatedTargetName(
    target:
        | Target
        | null,
    language:
    Language,
) {
    if (!target) {
        return "";
    }

    return (
        CHIP_LABELS[
            language
            ][target.name] ??
        target.name
    );
}

export function PocketParkingApp() {
    const mapElement =
        useRef<HTMLDivElement>(
            null,
        );

    const mapRef =
        useRef<
            Leaflet.Map | null
        >(null);

    const targetMarkerRef =
        useRef<
            Leaflet.Marker | null
        >(null);

    const parkingMarkersRef =
        useRef<
            Leaflet.Marker[]
        >([]);

    const [
        ready,
        setReady,
    ] =
        useState(false);

    const [
        mode,
        setMode,
    ] =
        useState<Mode>(
            "student",
        );

    const [
        language,
        setLanguage,
    ] =
        useState<Language>(
            "ja",
        );

    const [
        languageOpen,
        setLanguageOpen,
    ] =
        useState(false);

    const [
        query,
        setQuery,
    ] =
        useState("");

    const [
        focused,
        setFocused,
    ] =
        useState(false);

    const [
        target,
        setTarget,
    ] =
        useState<
            Target | null
        >(null);

    const [
        parkings,
        setParkings,
    ] =
        useState<
            ParkingSpot[]
        >([]);

    const [
        selected,
        setSelected,
    ] =
        useState<
            ParkingSpot | null
        >(null);

    const [
        parkingLoading,
        setParkingLoading,
    ] =
        useState(false);

    const [
        parkingError,
        setParkingError,
    ] =
        useState("");

    const t =
        TEXT[language];

    const chips =
        mode ===
        "tourist"
            ? TOURIST_CHIPS
            : STUDENT_CHIPS;

    const suggestions =
        useMemo(
            () => {
                const q =
                    query
                        .trim()
                        .toLowerCase();

                if (!q) {
                    return [];
                }

                return ALL_LANDMARKS
                    .filter(
                        (
                            landmark,
                        ) => {
                            if (
                                mode ===
                                "tourist"
                            ) {
                                return (
                                    landmark.category ===
                                    "tourist" ||
                                    landmark.category ===
                                    "area"
                                );
                            }

                            return (
                                landmark.category !==
                                "tourist"
                            );
                        },
                    )
                    .filter(
                        (
                            landmark,
                        ) => {
                            const text =
                                [
                                    landmark.name,
                                    landmark.kana ??
                                    "",
                                    landmark.area ??
                                    "",
                                    ...landmark.aliases,
                                ]
                                    .join(
                                        " ",
                                    )
                                    .toLowerCase();

                            return text.includes(
                                q,
                            );
                        },
                    )
                    .slice(
                        0,
                        8,
                    );
            },
            [
                query,
                mode,
            ],
        );

    /*
     * MAP初期化
     */
    useEffect(
        () => {
            let cancelled =
                false;

            async function initMap() {
                const L =
                    await import(
                        "leaflet"
                        );

                if (
                    cancelled ||
                    !mapElement.current ||
                    mapRef.current
                ) {
                    return;
                }

                const map =
                    L.map(
                        mapElement.current,
                        {
                            center:
                                [
                                    DEFAULT_CENTER.lat,
                                    DEFAULT_CENTER.lng,
                                ],

                            zoom:
                            DEFAULT_ZOOM,

                            zoomControl:
                                false,
                        },
                    );

                L.tileLayer(
                    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                    {
                        maxZoom:
                            20,

                        attribution:
                            "&copy; OpenStreetMap contributors &copy; CARTO",
                    },
                ).addTo(
                    map,
                );

                mapRef.current =
                    map;

                setTimeout(
                    () => {
                        map.invalidateSize();
                    },
                    100,
                );

                setReady(
                    true,
                );
            }

            void initMap();

            return () => {
                cancelled =
                    true;

                parkingMarkersRef.current.forEach(
                    (
                        marker,
                    ) => {
                        marker.remove();
                    },
                );

                parkingMarkersRef.current =
                    [];

                if (
                    targetMarkerRef.current
                ) {
                    targetMarkerRef.current.remove();

                    targetMarkerRef.current =
                        null;
                }

                if (
                    mapRef.current
                ) {
                    mapRef.current.remove();

                    mapRef.current =
                        null;
                }
            };
        },
        [],
    );

    /*
     * P検索
     */
    useEffect(
        () => {
            if (!target) {
                return;
            }

            const controller =
                new AbortController();

            async function loadParkings() {
                try {
                    const radius =
                        mode ===
                        "tourist"
                            ? "3000"
                            : "1500";

                    const params =
                        new URLSearchParams(
                            {
                                lat:
                                    String(
                                        target!.lat,
                                    ),

                                lng:
                                    String(
                                        target!.lng,
                                    ),

                                radius,

                                lang:
                                language,
                            },
                        );

                    const response =
                        await fetch(
                            `/api/parkings?${params.toString()}`,
                            {
                                signal:
                                controller.signal,
                            },
                        );

                    const text =
                        await response.text();

                    if (
                        !response.ok
                    ) {
                        throw new Error(
                            text,
                        );
                    }

                    const data =
                        JSON.parse(
                            text,
                        ) as ParkingResponse;

                    setParkings(
                        data.parkings ??
                        [],
                    );

                    setSelected(
                        null,
                    );

                    setParkingError(
                        "",
                    );
                } catch (
                    error
                    ) {
                    if (
                        error instanceof
                        DOMException &&
                        error.name ===
                        "AbortError"
                    ) {
                        return;
                    }

                    console.error(
                        "Parking load error:",
                        error,
                    );

                    setParkings(
                        [],
                    );

                    setParkingError(
                        t.error,
                    );
                } finally {
                    setParkingLoading(
                        false,
                    );
                }
            }

            void loadParkings();

            return () => {
                controller.abort();
            };
        },
        [
            target,
            language,
            mode,
            t.error,
        ],
    );

    /*
     * Pマーカー表示
     */
    useEffect(
        () => {
            let cancelled =
                false;

            async function drawMarkers() {
                const map =
                    mapRef.current;

                if (
                    !map ||
                    !ready
                ) {
                    return;
                }

                const L =
                    await import(
                        "leaflet"
                        );

                if (
                    cancelled
                ) {
                    return;
                }

                parkingMarkersRef.current.forEach(
                    (
                        marker,
                    ) => {
                        marker.remove();
                    },
                );

                parkingMarkersRef.current =
                    [];

                if (
                    targetMarkerRef.current
                ) {
                    targetMarkerRef.current.remove();

                    targetMarkerRef.current =
                        null;
                }

                if (
                    !target
                ) {
                    map.setView(
                        [
                            DEFAULT_CENTER.lat,
                            DEFAULT_CENTER.lng,
                        ],
                        DEFAULT_ZOOM,
                    );

                    return;
                }

                const targetIcon =
                    L.divIcon(
                        {
                            className:
                                "",

                            html: `
<div style="
width:46px;
height:46px;
border-radius:50%;
background:#0f172a;
border:4px solid white;
box-shadow:0 8px 22px rgba(0,0,0,.25);
display:flex;
align-items:center;
justify-content:center;
font-size:20px;">
🎯
</div>
`,

                            iconSize:
                                [
                                    46,
                                    46,
                                ],

                            iconAnchor:
                                [
                                    23,
                                    23,
                                ],
                        },
                    );

                targetMarkerRef.current =
                    L.marker(
                        [
                            target.lat,
                            target.lng,
                        ],
                        {
                            icon:
                            targetIcon,

                            title:
                                translatedTargetName(
                                    target,
                                    language,
                                ),
                        },
                    ).addTo(
                        map,
                    );

                /*
                 * P追加
                 */
                parkings.forEach(
                    (
                        parking,
                        index,
                    ) => {
                        const closest =
                            index ===
                            0;

                        const background =
                            closest
                                ? "#10b981"
                                : "#2563eb";

                        const parkingIcon =
                            L.divIcon(
                                {
                                    className:
                                        "",

                                    html: `
<div style="
width:44px;
height:44px;
border-radius:50%;
background:${background};
border:3px solid white;
box-shadow:0 6px 18px rgba(0,0,0,.22);
display:flex;
align-items:center;
justify-content:center;
color:white;
font-size:19px;
font-weight:900;">
P
</div>
`,

                                    iconSize:
                                        [
                                            44,
                                            44,
                                        ],

                                    iconAnchor:
                                        [
                                            22,
                                            22,
                                        ],
                                },
                            );

                        const marker =
                            L.marker(
                                [
                                    parking.lat,
                                    parking.lng,
                                ],
                                {
                                    icon:
                                    parkingIcon,

                                    title:
                                    parking.name,
                                },
                            ).addTo(
                                map,
                            );

                        marker.on(
                            "click",
                            () => {
                                setSelected(
                                    parking,
                                );
                            },
                        );

                        parkingMarkersRef.current.push(
                            marker,
                        );
                    },
                );

                /*
                 * 観光ならP全体を見せる
                 */
                if (
                    mode ===
                    "tourist" &&
                    parkings.length >
                    0
                ) {
                    const points:
                        [
                            number,
                            number,
                        ][] = [
                        [
                            target.lat,
                            target.lng,
                        ],
                        ...parkings.map(
                            (
                                parking,
                            ) =>
                                [
                                    parking.lat,
                                    parking.lng,
                                ] as [
                                    number,
                                    number,
                                ],
                        ),
                    ];

                    const bounds =
                        L.latLngBounds(
                            points,
                        );

                    map.fitBounds(
                        bounds,
                        {
                            padding:
                                [
                                    60,
                                    120,
                                ],

                            maxZoom:
                                15,

                            animate:
                                true,
                        },
                    );
                } else {
                    map.setView(
                        [
                            target.lat,
                            target.lng,
                        ],
                        16,
                        {
                            animate:
                                true,
                        },
                    );
                }
            }

            void drawMarkers();

            return () => {
                cancelled =
                    true;
            };
        },
        [
            target,
            parkings,
            ready,
            language,
            mode,
        ],
    );

    function startParkingSearch() {
        setParkingLoading(
            true,
        );

        setParkingError(
            "",
        );

        setParkings(
            [],
        );

        setSelected(
            null,
        );
    }

    function selectLandmark(
        landmark:
        Landmark,
    ) {
        startParkingSearch();

        setTarget({
            name:
            landmark.name,

            lat:
            landmark.lat,

            lng:
            landmark.lng,
        });

        setQuery(
            landmark.name,
        );

        setFocused(
            false,
        );
    }

    function clearSearch() {
        setQuery(
            "",
        );

        setTarget(
            null,
        );

        setParkings(
            [],
        );

        setSelected(
            null,
        );

        setFocused(
            false,
        );

        setParkingError(
            "",
        );

        setParkingLoading(
            false,
        );
    }

    function switchMode(
        nextMode:
        Mode,
    ) {
        setMode(
            nextMode,
        );

        clearSearch();
    }

    function handleSubmit(
        event:
        React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (
            suggestions[0]
        ) {
            selectLandmark(
                suggestions[0],
            );
        }
    }

    function handleChip(
        chip:
        Chip,
    ) {
        const found =
            ALL_LANDMARKS.find(
                (
                    landmark,
                ) => {
                    if (
                        chip.kind ===
                        "area" &&
                        landmark.category !==
                        "area"
                    ) {
                        return false;
                    }

                    return [
                        landmark.name,
                        ...landmark.aliases,
                    ].some(
                        (
                            text,
                        ) =>
                            text
                                .toLowerCase()
                                .includes(
                                    chip.query.toLowerCase(),
                                ),
                    );
                },
            );

        if (
            found
        ) {
            selectLandmark(
                found,
            );
        }
    }

    return (
        <main
            className="relative h-screen w-full overflow-hidden bg-slate-100"
            style={{
                height:
                    "100dvh",
            }}
        >
            <div
                ref={
                    mapElement
                }
                className="absolute inset-0"
                style={{
                    zIndex:
                        0,
                }}
            />

            {!ready && (
                <div
                    className="absolute inset-0 grid place-items-center bg-white"
                    style={{
                        zIndex:
                            2000,
                    }}
                >
                    <div className="text-center">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />

                        <p className="mt-3 text-sm font-bold text-slate-600">
                            Map Loading...
                        </p>
                    </div>
                </div>
            )}

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
                            switchMode(
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
                            switchMode(
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
                        setLanguageOpen(
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
                                        setLanguage(
                                            lang,
                                        );

                                        setLanguageOpen(
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

            <div
                className="absolute left-1/2 top-20 w-[min(92%,680px)] -translate-x-1/2"
                style={{
                    zIndex:
                        1150,
                }}
            >
                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-xl"
                >
                    <span>
                        🔍
                    </span>

                    <input
                        value={
                            query
                        }
                        onChange={(
                            event,
                        ) => {
                            setQuery(
                                event.target.value,
                            );

                            setFocused(
                                true,
                            );
                        }}
                        onFocus={() =>
                            setFocused(
                                true,
                            )
                        }
                        placeholder={
                            mode ===
                            "tourist"
                                ? t.searchTourist
                                : t.searchStudent
                        }
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={
                                clearSearch
                            }
                        >
                            ×
                        </button>
                    )}
                </form>

                {focused &&
                    suggestions.length >
                    0 && (
                        <div className="mt-2 max-h-64 overflow-y-auto rounded-2xl bg-white shadow-xl">
                            {suggestions.map(
                                (
                                    suggestion,
                                ) => (
                                    <button
                                        key={
                                            suggestion.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            selectLandmark(
                                                suggestion,
                                            )
                                        }
                                        className="flex w-full items-center gap-3 border-b px-4 py-3 text-left"
                                    >
                                    <span>
                                        {
                                            landmarkIcon(
                                                suggestion,
                                            )
                                        }
                                    </span>

                                        <span className="font-bold">
                                        {
                                            suggestion.name
                                        }
                                    </span>
                                    </button>
                                ),
                            )}
                        </div>
                    )}

                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                    {chips.map(
                        (
                            chip,
                        ) => (
                            <button
                                key={
                                    chip.label
                                }
                                type="button"
                                onClick={() =>
                                    handleChip(
                                        chip,
                                    )
                                }
                                className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-bold shadow"
                            >
                                {
                                    chip.icon
                                }{" "}
                                {chipLabel(
                                    language,
                                    chip.label,
                                )}
                            </button>
                        ),
                    )}
                </div>
            </div>

            {target && (
                <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                        bottom:
                            "210px",

                        zIndex:
                            1100,
                    }}
                >
                    <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white shadow-lg">
                        🎯{" "}
                        {
                            translatedTargetName(
                                target,
                                language,
                            )
                        }
                    </div>
                </div>
            )}

            {parkingLoading && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-bold shadow"
                    style={{
                        bottom:
                            "165px",

                        zIndex:
                            1150,
                    }}
                >
                    🔎{" "}
                    {
                        t.loadingParking
                    }
                </div>
            )}

            {parkingError && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white"
                    style={{
                        bottom:
                            "165px",

                        zIndex:
                            1150,
                    }}
                >
                    {
                        parkingError
                    }
                </div>
            )}

            {selected ? (
                <ParkingDetail
                    spot={
                        selected
                    }
                    target={
                        target
                    }
                    language={
                        language
                    }
                    onClose={() =>
                        setSelected(
                            null,
                        )
                    }
                />
            ) : (
                <ParkingList
                    parkings={
                        parkings
                    }
                    target={
                        target
                    }
                    loading={
                        parkingLoading
                    }
                    language={
                        language
                    }
                    onPick={(
                        parking,
                    ) => {
                        setSelected(
                            parking,
                        );

                        mapRef.current?.setView(
                            [
                                parking.lat,
                                parking.lng,
                            ],
                            18,
                            {
                                animate:
                                    true,
                            },
                        );
                    }}
                />
            )}
        </main>
    );
}


