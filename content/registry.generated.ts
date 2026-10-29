// Tự sinh bởi scripts/gen-content.mjs — ĐỪNG sửa tay. Chạy `pnpm content` để cập nhật.
import type { SceneConfig } from "@/core/types";
import type { SceneSetup } from "@/core/engine/world";

export type ChapterEntry = {
  dir: string;
  config: () => Promise<{ default: SceneConfig }>;
  scene: () => Promise<{ default: SceneSetup }>;
};

/** Các chương, xếp theo thời gian. */
export const registry: Record<string, ChapterEntry> = {
  "nui-do": {
    dir: "nui-do",
    config: () => import("./nui-do/scene.config"),
    scene: () => import("./nui-do/scene"),
  },
  "son-vi": {
    dir: "son-vi",
    config: () => import("./son-vi/scene.config"),
    scene: () => import("./son-vi/scene"),
  },
  "con-moong": {
    dir: "con-moong",
    config: () => import("./con-moong/scene.config"),
    scene: () => import("./con-moong/scene"),
  },
  "hoa-binh": {
    dir: "hoa-binh",
    config: () => import("./hoa-binh/scene.config"),
    scene: () => import("./hoa-binh/scene"),
  },
  "bac-son": {
    dir: "bac-son",
    config: () => import("./bac-son/scene.config"),
    scene: () => import("./bac-son/scene"),
  },
  "quynh-van": {
    dir: "quynh-van",
    config: () => import("./quynh-van/scene.config"),
    scene: () => import("./quynh-van/scene"),
  },
  "phung-nguyen": {
    dir: "phung-nguyen",
    config: () => import("./phung-nguyen/scene.config"),
    scene: () => import("./phung-nguyen/scene"),
  },
  "dong-dau": {
    dir: "dong-dau",
    config: () => import("./dong-dau/scene.config"),
    scene: () => import("./dong-dau/scene"),
  },
  "con-rong-chau-tien": {
    dir: "con-rong-chau-tien",
    config: () => import("./con-rong-chau-tien/scene.config"),
    scene: () => import("./con-rong-chau-tien/scene"),
  },
  "dong-son": {
    dir: "dong-son",
    config: () => import("./dong-son/scene.config"),
    scene: () => import("./dong-son/scene"),
  },
  "co-loa": {
    dir: "co-loa",
    config: () => import("./co-loa/scene.config"),
    scene: () => import("./co-loa/scene"),
  },
  "hai-ba-trung-40": {
    dir: "hai-ba-trung-40",
    config: () => import("./hai-ba-trung-40/scene.config"),
    scene: () => import("./hai-ba-trung-40/scene"),
  },
  "van-xuan-544": {
    dir: "van-xuan-544",
    config: () => import("./van-xuan-544/scene.config"),
    scene: () => import("./van-xuan-544/scene"),
  },
  "bach-dang-938": {
    dir: "bach-dang-938",
    config: () => import("./bach-dang-938/scene.config"),
    scene: () => import("./bach-dang-938/scene"),
  },
  "dai-co-viet-968": {
    dir: "dai-co-viet-968",
    config: () => import("./dai-co-viet-968/scene.config"),
    scene: () => import("./dai-co-viet-968/scene"),
  },
  "chong-tong-981": {
    dir: "chong-tong-981",
    config: () => import("./chong-tong-981/scene.config"),
    scene: () => import("./chong-tong-981/scene"),
  },
  "doi-do-1010": {
    dir: "doi-do-1010",
    config: () => import("./doi-do-1010/scene.config"),
    scene: () => import("./doi-do-1010/scene"),
  },
  "nhu-nguyet-1077": {
    dir: "nhu-nguyet-1077",
    config: () => import("./nhu-nguyet-1077/scene.config"),
    scene: () => import("./nhu-nguyet-1077/scene"),
  },
  "dien-hong-1284": {
    dir: "dien-hong-1284",
    config: () => import("./dien-hong-1284/scene.config"),
    scene: () => import("./dien-hong-1284/scene"),
  },
  "bach-dang-1288": {
    dir: "bach-dang-1288",
    config: () => import("./bach-dang-1288/scene.config"),
    scene: () => import("./bach-dang-1288/scene"),
  },
  "nha-ho-1400": {
    dir: "nha-ho-1400",
    config: () => import("./nha-ho-1400/scene.config"),
    scene: () => import("./nha-ho-1400/scene"),
  },
  "hau-tran-1408": {
    dir: "hau-tran-1408",
    config: () => import("./hau-tran-1408/scene.config"),
    scene: () => import("./hau-tran-1408/scene"),
  },
  "lam-son-1418": {
    dir: "lam-son-1418",
    config: () => import("./lam-son-1418/scene.config"),
    scene: () => import("./lam-son-1418/scene"),
  },
  "tot-dong-1426": {
    dir: "tot-dong-1426",
    config: () => import("./tot-dong-1426/scene.config"),
    scene: () => import("./tot-dong-1426/scene"),
  },
  "chi-lang-1427": {
    dir: "chi-lang-1427",
    config: () => import("./chi-lang-1427/scene.config"),
    scene: () => import("./chi-lang-1427/scene"),
  },
  "binh-ngo-1428": {
    dir: "binh-ngo-1428",
    config: () => import("./binh-ngo-1428/scene.config"),
    scene: () => import("./binh-ngo-1428/scene"),
  },
  "do-ban-1471": {
    dir: "do-ban-1471",
    config: () => import("./do-ban-1471/scene.config"),
    scene: () => import("./do-ban-1471/scene"),
  },
  "hong-duc-1483": {
    dir: "hong-duc-1483",
    config: () => import("./hong-duc-1483/scene.config"),
    scene: () => import("./hong-duc-1483/scene"),
  },
  "nha-mac-1527": {
    dir: "nha-mac-1527",
    config: () => import("./nha-mac-1527/scene.config"),
    scene: () => import("./nha-mac-1527/scene"),
  },
  "thuan-hoa-1558": {
    dir: "thuan-hoa-1558",
    config: () => import("./thuan-hoa-1558/scene.config"),
    scene: () => import("./thuan-hoa-1558/scene"),
  },
  "trinh-nguyen-1627": {
    dir: "trinh-nguyen-1627",
    config: () => import("./trinh-nguyen-1627/scene.config"),
    scene: () => import("./trinh-nguyen-1627/scene"),
  },
  "tay-son-1771": {
    dir: "tay-son-1771",
    config: () => import("./tay-son-1771/scene.config"),
    scene: () => import("./tay-son-1771/scene"),
  },
  "rach-gam-1785": {
    dir: "rach-gam-1785",
    config: () => import("./rach-gam-1785/scene.config"),
    scene: () => import("./rach-gam-1785/scene"),
  },
  "dong-da-1789": {
    dir: "dong-da-1789",
    config: () => import("./dong-da-1789/scene.config"),
    scene: () => import("./dong-da-1789/scene"),
  },
  "gia-long-1802": {
    dir: "gia-long-1802",
    config: () => import("./gia-long-1802/scene.config"),
    scene: () => import("./gia-long-1802/scene"),
  },
  "da-nang-1858": {
    dir: "da-nang-1858",
    config: () => import("./da-nang-1858/scene.config"),
    scene: () => import("./da-nang-1858/scene"),
  },
  "can-giuoc-1861": {
    dir: "can-giuoc-1861",
    config: () => import("./can-giuoc-1861/scene.config"),
    scene: () => import("./can-giuoc-1861/scene"),
  },
  "truong-dinh-1864": {
    dir: "truong-dinh-1864",
    config: () => import("./truong-dinh-1864/scene.config"),
    scene: () => import("./truong-dinh-1864/scene"),
  },
  "cau-giay-1873": {
    dir: "cau-giay-1873",
    config: () => import("./cau-giay-1873/scene.config"),
    scene: () => import("./cau-giay-1873/scene"),
  },
  "bai-say-1883": {
    dir: "bai-say-1883",
    config: () => import("./bai-say-1883/scene.config"),
    scene: () => import("./bai-say-1883/scene"),
  },
  "yen-the-1884": {
    dir: "yen-the-1884",
    config: () => import("./yen-the-1884/scene.config"),
    scene: () => import("./yen-the-1884/scene"),
  },
  "can-vuong-1885": {
    dir: "can-vuong-1885",
    config: () => import("./can-vuong-1885/scene.config"),
    scene: () => import("./can-vuong-1885/scene"),
  },
  "ba-dinh-1886": {
    dir: "ba-dinh-1886",
    config: () => import("./ba-dinh-1886/scene.config"),
    scene: () => import("./ba-dinh-1886/scene"),
  },
  "huong-khe-1885": {
    dir: "huong-khe-1885",
    config: () => import("./huong-khe-1885/scene.config"),
    scene: () => import("./huong-khe-1885/scene"),
  },
  "dong-du-1905": {
    dir: "dong-du-1905",
    config: () => import("./dong-du-1905/scene.config"),
    scene: () => import("./dong-du-1905/scene"),
  },
  "ben-nha-rong-1911": {
    dir: "ben-nha-rong-1911",
    config: () => import("./ben-nha-rong-1911/scene.config"),
    scene: () => import("./ben-nha-rong-1911/scene"),
  },
};
