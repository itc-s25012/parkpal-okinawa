export type Coordinates = {
    lat: number;
    lng: number;
};

export function distanceMeters(
    a: Coordinates,
    b: Coordinates,
) {
    const R = 6371000;

    const rad = (
        value: number,
    ) =>
        (value * Math.PI) /
        180;

    const dLat = rad(
        b.lat - a.lat,
    );

    const dLng = rad(
        b.lng - a.lng,
    );

    const value =
        Math.sin(
            dLat / 2,
        ) **
        2 +
        Math.cos(
            rad(a.lat),
        ) *
        Math.cos(
            rad(b.lat),
        ) *
        Math.sin(
            dLng / 2,
        ) **
        2;

    return (
        2 *
        R *
        Math.asin(
            Math.sqrt(
                value,
            ),
        )
    );
}