"use client";

import {
    useRef,
    useState,
    type PointerEvent,
} from "react";

import {
    distanceMeters,
} from "@/lib/okinawa-data";

import {
    TEXT,
    type Language,
} from "@/lib/translations";

import type {
    ParkingSpot,
    Target,
} from "./ParkingList";

import {
    ParkingDragHandle,
} from "./ParkingDragHandle";

import {
    ParkingInfoSection,
} from "./ParkingInfoSection";

import {
    ParkingRouteButton,
} from "./ParkingRouteButton";

type ParkingDetailProps = {
    spot: ParkingSpot;
    target: Target | null;
    language: Language;
    onClose: () => void;
};

export function ParkingDetail({
                                  spot,
                                  target,
                                  language,
                                  onClose,
                              }: ParkingDetailProps) {
    const t =
        TEXT[language];

    /*
     * ====================================
     * パネルの高さ
     * ====================================
     */

    const [
        panelHeight,
        setPanelHeight,
    ] = useState<number | null>(
        null,
    );

    const [
        isDragging,
        setIsDragging,
    ] = useState(false);

    /*
     * ドラッグを始めたときの
     * マウス / 指のY座標
     */
    const dragStartY =
        useRef(0);

    /*
     * ドラッグ開始時の
     * パネル高さ
     */
    const dragStartHeight =
        useRef(0);

    /*
     * ====================================
     * 高さ取得
     * ====================================
     */

    function getMaxHeight() {
        return (
            window.innerHeight *
            0.85
        );
    }

    function getMinHeight() {
        /*
         * 小さくした状態
         *
         * バー
         * 駐車場名
         * 徒歩・車・距離
         * ルートボタン
         *
         * が見えるくらい
         */
        return 300;
    }

    /*
     * ====================================
     * ドラッグ開始
     * ====================================
     */

    const handlePointerDown = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        /*
         * PCは左クリックだけ
         */
        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }

        const maxHeight =
            getMaxHeight();

        /*
         * 初回は85vh相当
         */
        const currentHeight =
            panelHeight ??
            maxHeight;

        setIsDragging(true);

        dragStartY.current =
            event.clientY;

        dragStartHeight.current =
            currentHeight;

        event.currentTarget.setPointerCapture(
            event.pointerId,
        );
    };

    /*
     * ====================================
     * ドラッグ中
     * ====================================
     */

    const handlePointerMove = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        if (!isDragging) {
            return;
        }

        /*
         * 下へ動かすと
         * clientYが増える
         */
        const movedY =
            event.clientY -
            dragStartY.current;

        /*
         * 下へ動かしたぶん
         * 高さを小さくする
         *
         * 上へ動かしたら
         * 高さを大きくする
         */
        const nextHeight =
            dragStartHeight.current -
            movedY;

        const minHeight =
            getMinHeight();

        const maxHeight =
            getMaxHeight();

        /*
         * 最小〜最大の間に制限
         */
        const limitedHeight =
            Math.min(
                Math.max(
                    nextHeight,
                    minHeight,
                ),
                maxHeight,
            );

        setPanelHeight(
            limitedHeight,
        );
    };

    /*
     * ====================================
     * ドラッグ終了
     * ====================================
     */

    const handlePointerUp = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        if (!isDragging) {
            return;
        }

        setIsDragging(false);

        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId,
            )
        ) {
            event.currentTarget.releasePointerCapture(
                event.pointerId,
            );
        }

        /*
         * 今回はスナップさせない
         *
         * → 手を離した高さでそのまま止まる
         */
    };

    /*
     * ====================================
     * ドラッグ中断
     * ====================================
     */

    const handlePointerCancel = () => {
        setIsDragging(false);
    };

    /*
     * ====================================
     * 距離
     * ====================================
     */

    const distance =
        target
            ? distanceMeters(
                target,
                spot,
            )
            : spot.distance;

    /*
     * ====================================
     * Google Maps
     * ====================================
     */

    const navigationUrl =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${spot.lat},${spot.lng}` +
        `&travelmode=driving` +
        `&dir_action=navigate`;

    /*
     * ====================================
     * 表示
     * ====================================
     */

    return (
        <div
            className="
                absolute
                inset-x-0
                bottom-0
                flex
                flex-col
                overflow-hidden
                rounded-t-[32px]
                bg-white
                shadow-xl
            "
            style={{
                zIndex: 11000,

                /*
                 * ここが今回の重要部分
                 *
                 * パネルを移動するのではなく
                 * 高さそのものを変える
                 */
                height:
                    panelHeight ===
                    null
                        ? "85vh"
                        : `${panelHeight}px`,

                maxHeight:
                    "85vh",

                /*
                 * ドラッグしていない時は
                 * なめらかに高さ変更
                 */
                transition:
                    isDragging
                        ? "none"
                        : "height 180ms ease-out",
            }}
        >
            {/*
             * ====================================
             * 上下ドラッグバー
             * ====================================
             */}

            <ParkingDragHandle
                isDragging={
                    isDragging
                }
                onPointerDown={
                    handlePointerDown
                }
                onPointerMove={
                    handlePointerMove
                }
                onPointerUp={
                    handlePointerUp
                }
                onPointerCancel={
                    handlePointerCancel
                }
            />

            {/*
             * ====================================
             * 駐車場情報
             *
             * flex-1 なので
             * パネルが小さくなると
             * この部分だけ縮む
             * ====================================
             */}

            <ParkingInfoSection
                spot={
                    spot
                }
                distance={
                    distance
                }
                language={
                    language
                }
                onClose={
                    onClose
                }
            />

            {/*
             * ====================================
             * ルートボタン
             *
             * shrink-0なので
             * パネルが縮んでも残る
             * ====================================
             */}

            <ParkingRouteButton
                navigationUrl={
                    navigationUrl
                }
                isMonthly={
                    spot.rentalType ===
                    "monthly"
                }
                label={
                    t.route
                }
            />
        </div>
    );
}