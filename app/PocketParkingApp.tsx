"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as Leaflet from "leaflet";

import {
    ALL_LANDMARKS,
    type Landmark,
    distanceMeters,
    driveMinutes,
    walkMinutes,
} from "@/lib/okinawa-data";

const DEFAULT_CENTER = {
    lat: 26.2185,
    lng: 127.6912,
};

const DEFAULT_ZOOM = 15;

type Mode = "student" | "tourist";

type Language =
    | "ja"
    | "en"
    | "zh-CN"
    | "zh-TW"
    | "ko";

type Target = {
    name: string;
    lat: number;
    lng: number;
};

type ParkingSpot = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    price: string;
    tags: string[];
    emoji: string;
    photo: string;
    distance: number;
};

type ParkingResponse = {
    parkings?: ParkingSpot[];
    count?: number;
    error?: string;
    detail?: string;
};

type Chip = {
    label: string;
    icon: string;
    kind: "landmark" | "area";
    query: string;
};

const STUDENT_CHIPS: Chip[] = [
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

const TOURIST_CHIPS: Chip[] = [
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

const LANGUAGE_LABELS: Record<Language, string> = {
    ja: "🇯🇵 日本語",
    en: "🇺🇸 English",
    "zh-CN": "🇨🇳 简体中文",
    "zh-TW": "🇹🇼 繁體中文",
    ko: "🇰🇷 한국어",
};

const TEXT = {
    ja: {
        student: "学生",
        tourist: "観光",
        searchStudent: "学校・塾・エリアを検索",
        searchTourist: "観光地・エリアを検索",
        chooseDestination: "目的地を選んでください",
        nearbyParking: "目的地に近い駐車場",
        loadingParking: "近くの駐車場を検索中…",
        noParking: "近くに駐車場が見つかりませんでした",
        availability: "空き情報",
        noLiveData: "まだLIVE情報なし",
        closest: "一番近い",
        walk: "徒歩",
        drive: "車",
        parkingInfo: "駐車場情報",
        route: "経路を見る",
        error: "駐車場情報を取得できませんでした",
    },

    en: {
        student: "Student",
        tourist: "Travel",
        searchStudent: "Search school, cram school or area",
        searchTourist: "Search tourist spot or area",
        chooseDestination: "Choose a destination",
        nearbyParking: "Nearby parking",
        loadingParking: "Searching nearby parking…",
        noParking: "No parking found nearby",
        availability: "Availability",
        noLiveData: "No live data yet",
        closest: "Closest",
        walk: "Walk",
        drive: "Drive",
        parkingInfo: "Parking information",
        route: "Directions",
        error: "Could not load parking information",
    },

    "zh-CN": {
        student: "学生",
        tourist: "观光",
        searchStudent: "搜索学校、补习班或地区",
        searchTourist: "搜索景点或地区",
        chooseDestination: "请选择目的地",
        nearbyParking: "附近停车场",
        loadingParking: "正在搜索附近停车场…",
        noParking: "附近没有找到停车场",
        availability: "空位信息",
        noLiveData: "暂无实时信息",
        closest: "最近",
        walk: "步行",
        drive: "驾车",
        parkingInfo: "停车场信息",
        route: "查看路线",
        error: "无法获取停车场信息",
    },

    "zh-TW": {
        student: "學生",
        tourist: "觀光",
        searchStudent: "搜尋學校、補習班或地區",
        searchTourist: "搜尋景點或地區",
        chooseDestination: "請選擇目的地",
        nearbyParking: "附近停車場",
        loadingParking: "正在搜尋附近停車場…",
        noParking: "附近找不到停車場",
        availability: "空位資訊",
        noLiveData: "暫無即時資訊",
        closest: "最近",
        walk: "步行",
        drive: "開車",
        parkingInfo: "停車場資訊",
        route: "查看路線",
        error: "無法取得停車場資訊",
    },

    ko: {
        student: "학생",
        tourist: "관광",
        searchStudent: "학교·학원·지역 검색",
        searchTourist: "관광지·지역 검색",
        chooseDestination: "목적지를 선택하세요",
        nearbyParking: "주변 주차장",
        loadingParking: "주변 주차장을 찾는 중…",
        noParking: "주변 주차장을 찾지 못했습니다",
        availability: "주차 가능 여부",
        noLiveData: "실시간 정보 없음",
        closest: "가장 가까움",
        walk: "도보",
        drive: "차량",
        parkingInfo: "주차장 정보",
        route: "길찾기",
        error: "주차장 정보를 가져오지 못했습니다",
    },
};

function landmarkIcon(landmark: Landmark) {
    if (landmark.category === "vocational") {
        return "🎓";
    }

    if (landmark.category === "cram") {
        return "📚";
    }

    if (landmark.category === "tourist") {
        return "🏝️";
    }

    return "📍";
}

export function PocketParkingApp() {
    const mapElement =
        useRef<HTMLDivElement>(null);

    const mapRef =
        useRef<Leaflet.Map | null>(null);

    const targetMarkerRef =
        useRef<Leaflet.Marker | null>(null);

    const parkingMarkersRef =
        useRef<Leaflet.Marker[]>([]);

    const [ready, setReady] =
        useState(false);

    const [mode, setMode] =
        useState<Mode>("student");

    const [language, setLanguage] =
        useState<Language>("ja");

    const [languageOpen, setLanguageOpen] =
        useState(false);

    const [query, setQuery] =
        useState("");

    const [focused, setFocused] =
        useState(false);

    const [target, setTarget] =
        useState<Target | null>(null);

    const [parkings, setParkings] =
        useState<ParkingSpot[]>([]);

    const [selected, setSelected] =
        useState<ParkingSpot | null>(null);

    const [parkingLoading, setParkingLoading] =
        useState(false);

    const [parkingError, setParkingError] =
        useState("");

    const t = TEXT[language];

    const chips =
        mode === "tourist"
            ? TOURIST_CHIPS
            : STUDENT_CHIPS;

    const suggestions = useMemo(() => {
        const q =
            query.trim().toLowerCase();

        if (!q) {
            return [];
        }

        return ALL_LANDMARKS
            .filter((landmark) => {
                if (mode === "tourist") {
                    return (
                        landmark.category === "tourist" ||
                        landmark.category === "area"
                    );
                }

                return landmark.category !== "tourist";
            })
            .filter((landmark) => {
                const text = [
                    landmark.name,
                    landmark.kana ?? "",
                    landmark.area ?? "",
                    ...landmark.aliases,
                ]
                    .join(" ")
                    .toLowerCase();

                return text.includes(q);
            })
            .slice(0, 8);
    }, [query, mode]);

    /*
     * 地図初期化
     */
    useEffect(() => {
        let cancelled = false;

        async function initMap() {
            const L =
                await import("leaflet");

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
                        center: [
                            DEFAULT_CENTER.lat,
                            DEFAULT_CENTER.lng,
                        ],
                        zoom:
                        DEFAULT_ZOOM,
                        zoomControl:
                            false,
                    },
                );

            /*
             * 薄い地図
             */
            L.tileLayer(
                "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                {
                    maxZoom: 20,
                    attribution:
                        "&copy; OpenStreetMap contributors &copy; CARTO",
                },
            ).addTo(map);

            mapRef.current = map;

            setTimeout(() => {
                map.invalidateSize();
            }, 100);

            setReady(true);
        }

        void initMap();

        return () => {
            cancelled = true;

            parkingMarkersRef.current.forEach(
                (marker) => {
                    marker.remove();
                },
            );

            parkingMarkersRef.current = [];

            if (targetMarkerRef.current) {
                targetMarkerRef.current.remove();
                targetMarkerRef.current = null;
            }

            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    /*
     * 本物の駐車場取得
     */
    useEffect(() => {
        if (!target) {
            return;
        }

        const controller =
            new AbortController();

        async function loadParkings() {
            try {
                const params =
                    new URLSearchParams({
                        lat:
                            String(
                                target!.lat,
                            ),

                        lng:
                            String(
                                target!.lng,
                            ),

                        radius:
                            "1500",
                    });

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

                if (!response.ok) {
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

                setSelected(null);

                setParkingError("");
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Parking load error:",
                    error,
                );

                setParkings([]);

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
    }, [target, t.error]);

    /*
     * 地図のマーカー
     */
    useEffect(() => {
        let cancelled = false;

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
                await import("leaflet");

            if (cancelled) {
                return;
            }

            parkingMarkersRef.current.forEach(
                (marker) => {
                    marker.remove();
                },
            );

            parkingMarkersRef.current = [];

            if (targetMarkerRef.current) {
                targetMarkerRef.current.remove();

                targetMarkerRef.current = null;
            }

            if (!target) {
                map.setView(
                    [
                        DEFAULT_CENTER.lat,
                        DEFAULT_CENTER.lng,
                    ],
                    DEFAULT_ZOOM,
                );

                return;
            }

            /*
             * 目的地マーカー
             */
            const targetIcon =
                L.divIcon({
                    className: "",

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
                            font-size:20px;
                        ">
                            🎯
                        </div>
                    `,

                    iconSize: [
                        46,
                        46,
                    ],

                    iconAnchor: [
                        23,
                        23,
                    ],
                });

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
                        target.name,
                    },
                ).addTo(map);

            /*
             * 目的地周辺だけ表示
             */
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

            /*
             * Pマーカー
             */
            parkings.forEach(
                (
                    parking,
                    index,
                ) => {
                    const closest =
                        index === 0;

                    const background =
                        closest
                            ? "#10b981"
                            : "#2563eb";

                    const parkingIcon =
                        L.divIcon({
                            className: "",

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
                                    font-weight:900;
                                ">
                                    P
                                </div>
                            `,

                            iconSize: [
                                44,
                                44,
                            ],

                            iconAnchor: [
                                22,
                                22,
                            ],
                        });

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
                        ).addTo(map);

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
        }

        void drawMarkers();

        return () => {
            cancelled = true;
        };
    }, [target, parkings, ready]);

    function startParkingSearch() {
        setParkingLoading(true);

        setParkingError("");

        setParkings([]);

        setSelected(null);
    }

    function selectLandmark(
        landmark: Landmark,
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

        setFocused(false);
    }

    function clearSearch() {
        setQuery("");

        setTarget(null);

        setParkings([]);

        setSelected(null);

        setFocused(false);

        setParkingError("");

        setParkingLoading(false);
    }

    function switchMode(
        nextMode: Mode,
    ) {
        setMode(nextMode);

        clearSearch();
    }

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (suggestions[0]) {
            selectLandmark(
                suggestions[0],
            );
        }
    }

    function handleChip(
        chip: Chip,
    ) {
        const found =
            ALL_LANDMARKS.find(
                (landmark) => {
                    if (
                        chip.kind === "area" &&
                        landmark.category !== "area"
                    ) {
                        return false;
                    }

                    return [
                        landmark.name,
                        ...landmark.aliases,
                    ].some(
                        (text) =>
                            text
                                .toLowerCase()
                                .includes(
                                    chip.query.toLowerCase(),
                                ),
                    );
                },
            );

        if (found) {
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
            {/* 地図 */}
            <div
                ref={mapElement}
                className="absolute inset-0"
                style={{
                    zIndex: 0,
                }}
                aria-label="ParkPal map"
            />

            {/* ローディング */}
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

            {/* ParkPal */}
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

            {/* 学生 / 観光 */}
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
                            mode === "student"
                                ? "bg-sky-500 text-white"
                                : "text-slate-500"
                        }`}
                    >
                        🎓 {t.student}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            switchMode(
                                "tourist",
                            )
                        }
                        className={`rounded-xl px-4 py-2 text-xs font-black ${
                            mode === "tourist"
                                ? "bg-sky-500 text-white"
                                : "text-slate-500"
                        }`}
                    >
                        🏝️ {t.tourist}
                    </button>

                </div>
            </div>

            {/* 言語 */}
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

            {/* 検索エリア */}
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

                    <span className="text-lg">
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
                                event
                                    .target
                                    .value,
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
                            mode === "tourist"
                                ? t.searchTourist
                                : t.searchStudent
                        }
                        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={
                                clearSearch
                            }
                            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500"
                        >
                            ×
                        </button>
                    )}

                </form>

                {/* 候補 */}
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
                                        onMouseDown={(
                                            event,
                                        ) =>
                                            event.preventDefault()
                                        }
                                        onClick={() =>
                                            selectLandmark(
                                                suggestion,
                                            )
                                        }
                                        className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                                    >
                                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100">
                                            {
                                                landmarkIcon(
                                                    suggestion,
                                                )
                                            }
                                        </span>

                                        <div className="min-w-0 flex-1">

                                            <p className="truncate text-sm font-black text-slate-800">
                                                {
                                                    suggestion.name
                                                }
                                            </p>

                                            {suggestion.area && (
                                                <p className="mt-0.5 text-[10px] text-slate-400">
                                                    {
                                                        suggestion.area
                                                    }
                                                </p>
                                            )}

                                        </div>
                                    </button>
                                ),
                            )}

                        </div>
                    )}

                {/* チップ */}
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">

                    {chips.map(
                        (chip) => (
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
                                className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-md"
                            >
                                {
                                    chip.icon
                                }{" "}
                                {
                                    chip.label
                                }
                            </button>
                        ),
                    )}

                </div>
            </div>

            {/* 目的地名 */}
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
                    <div className="max-w-[80vw] truncate rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white shadow-lg">
                        🎯 {target.name}
                    </div>
                </div>
            )}

            {/* 検索中 */}
            {parkingLoading && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-lg"
                    style={{
                        bottom:
                            "165px",

                        zIndex:
                            1150,
                    }}
                >
                    🔎 {t.loadingParking}
                </div>
            )}

            {/* エラー */}
            {parkingError && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-4 py-2 text-xs font-black text-white shadow-lg"
                    style={{
                        bottom:
                            "165px",

                        zIndex:
                            1150,
                    }}
                >
                    {parkingError}
                </div>
            )}

            {/* 下カード */}
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
                <BottomList
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

function BottomList({
                        parkings,
                        target,
                        loading,
                        language,
                        onPick,
                    }: {
    parkings: ParkingSpot[];
    target: Target | null;
    loading: boolean;
    language: Language;
    onPick: (
        parking: ParkingSpot,
    ) => void;
}) {
    const t =
        TEXT[language];

    return (
        <div
            className="absolute inset-x-0 bottom-0 rounded-t-[32px] bg-white/95 pb-4 shadow-[0_-10px_40px_rgba(15,23,42,.14)] backdrop-blur-xl"
            style={{
                zIndex:
                    1050,
            }}
        >
            <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-slate-300" />

            <div className="flex items-center justify-between px-5 pt-3">

                <h2 className="text-sm font-black text-slate-900">
                    {target
                        ? `🅿️ ${t.nearbyParking}`
                        : `📍 ${t.chooseDestination}`}
                </h2>

                {target && (
                    <span className="text-[10px] font-bold text-slate-400">
                        {parkings.length}件
                    </span>
                )}

            </div>

            {!target && (
                <div className="py-6 text-center text-xs font-bold text-slate-400">
                    🔎
                </div>
            )}

            {target &&
                !loading &&
                parkings.length ===
                0 && (
                    <div className="px-5 py-6 text-center">

                        <p className="text-xs font-bold text-slate-500">
                            {t.noParking}
                        </p>

                    </div>
                )}

            <div className="flex gap-3 overflow-x-auto px-5 pb-2 pt-3">

                {parkings.map(
                    (
                        parking,
                        index,
                    ) => {
                        const distance =
                            target
                                ? distanceMeters(
                                    target,
                                    parking,
                                )
                                : parking.distance;

                        return (
                            <button
                                key={
                                    parking.id
                                }
                                type="button"
                                onClick={() =>
                                    onPick(
                                        parking,
                                    )
                                }
                                className={`relative w-[240px] shrink-0 rounded-3xl bg-white p-3 text-left shadow-sm ${
                                    index ===
                                    0
                                        ? "ring-2 ring-emerald-400"
                                        : "ring-1 ring-slate-200"
                                }`}
                            >
                                {index ===
                                    0 && (
                                        <span className="absolute -top-2 left-3 rounded-full bg-emerald-500 px-2 py-1 text-[9px] font-black text-white">
                                        🚶{" "}
                                            {
                                                t.closest
                                            }
                                    </span>
                                    )}

                                <div className="flex items-start gap-3">

                                    <div
                                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl font-black text-white ${
                                            index ===
                                            0
                                                ? "bg-emerald-500"
                                                : "bg-blue-600"
                                        }`}
                                    >
                                        P
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <p className="line-clamp-2 text-xs font-black text-slate-900">
                                            {
                                                parking.name
                                            }
                                        </p>

                                        <p className="mt-1 text-[10px] font-black text-orange-500">
                                            {
                                                parking.price
                                            }
                                        </p>

                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">

                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                        🚶{" "}
                                        {walkMinutes(
                                            distance,
                                        )}
                                        分
                                    </span>

                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                        🚗{" "}
                                        {driveMinutes(
                                            distance,
                                        )}
                                        分
                                    </span>

                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                                        {Math.round(
                                            distance,
                                        )}
                                        m
                                    </span>

                                </div>

                                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">

                                    <p className="text-[10px] font-bold text-slate-500">
                                        ⚪{" "}
                                        {
                                            t.availability
                                        }
                                        :{" "}
                                        {
                                            t.noLiveData
                                        }
                                    </p>

                                </div>
                            </button>
                        );
                    },
                )}

            </div>
        </div>
    );
}

function ParkingDetail({
                           spot,
                           target,
                           language,
                           onClose,
                       }: {
    spot: ParkingSpot;
    target: Target | null;
    language: Language;
    onClose: () => void;
}) {
    const t =
        TEXT[language];

    const distance =
        target
            ? distanceMeters(
                target,
                spot,
            )
            : spot.distance;

    const navigationUrl =
        `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;

    return (
        <div
            className="absolute inset-x-0 bottom-0 rounded-t-[32px] bg-white p-5 shadow-[0_-12px_40px_rgba(15,23,42,.18)]"
            style={{
                zIndex:
                    1100,
            }}
        >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-300" />

            <div className="flex items-start gap-3">

                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-2xl font-black text-white">
                    P
                </div>

                <div className="min-w-0 flex-1">

                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {t.parkingInfo}
                    </p>

                    <h3 className="mt-1 text-base font-black text-slate-900">
                        {spot.name}
                    </h3>

                </div>

                <button
                    type="button"
                    onClick={
                        onClose
                    }
                    className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-lg text-slate-500"
                >
                    ×
                </button>

            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">

                <Info
                    label={
                        t.walk
                    }
                    value={`${walkMinutes(
                        distance,
                    )}分`}
                />

                <Info
                    label={
                        t.drive
                    }
                    value={`${driveMinutes(
                        distance,
                    )}分`}
                />

                <Info
                    label="DIST"
                    value={`${Math.round(
                        distance,
                    )}m`}
                />

            </div>

            <div className="mt-3 rounded-2xl bg-orange-50 px-4 py-3">

                <p className="text-[10px] font-black text-orange-400">
                    PRICE
                </p>

                <p className="mt-1 text-sm font-black text-orange-600">
                    {spot.price}
                </p>

            </div>

            <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">

                <p className="text-[10px] font-black text-slate-400">
                    {t.availability}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-600">
                    ⚪ {t.noLiveData}
                </p>

            </div>

            {spot.tags.length >
                0 && (
                    <div className="mt-3 flex flex-wrap gap-2">

                        {spot.tags.map(
                            (tag) => (
                                <span
                                    key={
                                        tag
                                    }
                                    className="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold text-slate-600"
                                >
                                {tag}
                            </span>
                            ),
                        )}

                    </div>
                )}

            <a
                href={
                    navigationUrl
                }
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center rounded-2xl bg-slate-950 py-3 text-sm font-black text-white shadow-lg"
            >
                🚗 {t.route}
            </a>
        </div>
    );
}

function Info({
                  label,
                  value,
              }: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl bg-slate-100 px-2 py-3 text-center">

            <p className="text-[9px] font-bold text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-xs font-black text-slate-900">
                {value}
            </p>

        </div>
    );
}