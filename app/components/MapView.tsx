"use client";

import {
    useEffect,
    useRef,
} from "react";

import type * as Leaflet from "leaflet";

import type {
    ParkingSpot,
    Target,
} from "@/app/components/ParkingList";

import type {
    Language,
} from "@/lib/translations";

type Mode =
    | "student"
    | "tourist";

type MapViewProps = {
    target:
        Target | null;

    parkings:
        ParkingSpot[];

    language:
        Language;

    mode:
        Mode;

    selected:
        ParkingSpot | null;

    onSelectParking:
        (
            parking:
            ParkingSpot,
        ) => void;
};

const DEFAULT_CENTER = {
    lat: 26.2185,
    lng: 127.6912,
};

const DEFAULT_ZOOM =
    15;

export function MapView({
                            target,
                            parkings,
                            language,
                            mode,
                            selected,
                            onSelectParking,
                        }: MapViewProps) {
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

    /*
     * ========================================
     * 地図初期化
     * ========================================
     */

    useEffect(
        () => {
            let cancelled =
                false;

            async function initMap() {
                const L =
                    await import(
                        "leaflet",
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
     * ========================================
     * 目的地・駐車場マーカー
     * ========================================
     */

    useEffect(
        () => {
            let cancelled =
                false;

            async function drawMarkers() {
                const map =
                    mapRef.current;

                if (
                    !map
                ) {
                    return;
                }

                const L =
                    await import(
                        "leaflet",
                        );

                if (
                    cancelled
                ) {
                    return;
                }

                /*
                 * 古い駐車場マーカーを消す
                 */
                parkingMarkersRef.current.forEach(
                    (
                        marker,
                    ) => {
                        marker.remove();
                    },
                );

                parkingMarkersRef.current =
                    [];

                /*
                 * 古い目的地マーカーを消す
                 */
                if (
                    targetMarkerRef.current
                ) {
                    targetMarkerRef.current.remove();

                    targetMarkerRef.current =
                        null;
                }

                /*
                 * 目的地なし
                 */
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

                /*
                 * ====================================
                 * 目的地マーカー
                 * ====================================
                 */

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
                            target.name,
                        },
                    ).addTo(
                        map,
                    );

                /*
                 * ====================================
                 * 駐車場マーカー
                 * ====================================
                 */

                parkings.forEach(
                    (
                        parking,
                        index,
                    ) => {
                        const closest =
                            index ===
                            0;

                        const isSelected =
                            selected?.id ===
                            parking.id;

                        const background =
                            isSelected
                                ? "#0f172a"
                                : closest
                                    ? "#10b981"
                                    : "#2563eb";

                        const size =
                            isSelected
                                ? 50
                                : 44;

                        const parkingIcon =
                            L.divIcon(
                                {
                                    className:
                                        "",

                                    html: `
<div style="
width:${size}px;
height:${size}px;
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
                                            size,
                                            size,
                                        ],

                                    iconAnchor:
                                        [
                                            size /
                                            2,
                                            size /
                                            2,
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
                                onSelectParking(
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
                 * ====================================
                 * 地図表示
                 * ====================================
                 */

                if (
                    selected
                ) {
                    map.setView(
                        [
                            selected.lat,
                            selected.lng,
                        ],
                        18,
                        {
                            animate:
                                true,
                        },
                    );

                    return;
                }

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

                    return;
                }

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

            void drawMarkers();

            return () => {
                cancelled =
                    true;
            };
        },
        [
            target,
            parkings,
            mode,
            language,
            selected,
            onSelectParking,
        ],
    );

    return (
        <div
            ref={
                mapElement
            }
            className="absolute inset-0"
            style={{
                zIndex:
                    0,
            }}
            aria-label="ParkPal map"
        />
    );
}