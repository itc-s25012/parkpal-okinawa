/*
 * ============================================
 * ParkPal 検索地点の型
 * ============================================
 */

export type Landmark = {
    /*
     * データを識別するID
     */
    id: string;

    /*
     * 表示する名前
     */
    name: string;

    /*
     * よみがな
     */
    kana?: string;

    /*
     * 検索用の別名
     */
    aliases: string[];

    /*
     * 緯度・経度
     *
     * この位置を中心に
     * 周辺駐車場を検索する
     */
    lat: number;
    lng: number;

    /*
     * 検索地点の種類
     */
    category:
        | "vocational"
        | "cram"
        | "area"
        | "tourist";

    /*
     * 大まかな地域
     *
     * 例:
     * 那覇市
     * 沖縄市宮里
     * 名護市宇茂佐
     */
    area?: string;

    /*
     * 正確な住所
     *
     * 塾・専門学校などで使用
     */
    address?: string;
};