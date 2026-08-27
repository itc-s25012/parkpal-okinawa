

import type { PointerEventHandler } from "react";

type Props = {
    isDragging: boolean;
    onPointerDown: PointerEventHandler<HTMLDivElement>;
    onPointerMove: PointerEventHandler<HTMLDivElement>;
    onPointerUp: PointerEventHandler<HTMLDivElement>;
    onPointerCancel: PointerEventHandler<HTMLDivElement>;
};

export function ParkingDragHandle({
                                      isDragging,
                                      onPointerDown,
                                      onPointerMove,
                                      onPointerUp,
                                      onPointerCancel,
                                  }: Props) {
    return (
        <div
            role="button"
            tabIndex={0}
            aria-label="詳細パネルを上下に動かす"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            className={`flex h-11 shrink-0 touch-none select-none items-center justify-center ${
                isDragging
                    ? "cursor-grabbing"
                    : "cursor-ns-resize"
            }`}
        >
            <div
                className={`h-1.5 rounded-full transition-all ${
                    isDragging
                        ? "w-16 bg-slate-400"
                        : "w-14 bg-slate-300"
                }`}
            />
        </div>
    );
}
