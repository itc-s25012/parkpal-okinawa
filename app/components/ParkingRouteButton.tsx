
type Props = {
    navigationUrl: string;
    isMonthly: boolean;
    label: string;
};

export function ParkingRouteButton({
                                       navigationUrl,
                                       isMonthly,
                                       label,
                                   }: Props) {
    return (
        <div
            className="shrink-0 border-t border-slate-100 bg-white px-5 pt-3"
            style={{
                paddingBottom:
                    "max(20px, env(safe-area-inset-bottom))",
            }}
        >
            <a
                href={navigationUrl}
                target="_blank"
                rel="noreferrer"
                className={`flex w-full justify-center rounded-2xl py-3 text-sm font-black text-white ${
                    isMonthly
                        ? "bg-violet-700"
                        : "bg-slate-950"
                }`}
            >
                🚗 {label}
            </a>
        </div>
    );
}
