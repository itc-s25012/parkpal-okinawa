
import type {
    Landmark,
} from "@/lib/landmark-types";

import {
    NAHA_VOCATIONAL_SCHOOLS_1,
} from "@/lib/vocational/south/naha-1";

import {
    NAHA_VOCATIONAL_SCHOOLS_2,
} from "@/lib/vocational/south/naha-2";

import {
    URASOE_VOCATIONAL_SCHOOLS,
} from "@/lib/vocational/south/urasoe";

/*
 * ============================================
 * 沖縄県 南部の専門学校
 * ============================================
 *
 * 那覇市その1
 * 那覇市その2
 * 浦添市
 *
 * のデータを1つにまとめる
 * ============================================
 */

export const SOUTH_VOCATIONAL_SCHOOLS:
    Landmark[] = [
    ...NAHA_VOCATIONAL_SCHOOLS_1,
    ...NAHA_VOCATIONAL_SCHOOLS_2,
    ...URASOE_VOCATIONAL_SCHOOLS,
];