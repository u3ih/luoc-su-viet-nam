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
  "go-mun": {
    dir: "go-mun",
    config: () => import("./go-mun/scene.config"),
    scene: () => import("./go-mun/scene"),
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
  "lac-viet": {
    dir: "lac-viet",
    config: () => import("./lac-viet/scene.config"),
    scene: () => import("./lac-viet/scene"),
  },
  "banh-chung": {
    dir: "banh-chung",
    config: () => import("./banh-chung/scene.config"),
    scene: () => import("./banh-chung/scene"),
  },
  "thanh-giong": {
    dir: "thanh-giong",
    config: () => import("./thanh-giong/scene.config"),
    scene: () => import("./thanh-giong/scene"),
  },
  "chu-dong-tu": {
    dir: "chu-dong-tu",
    config: () => import("./chu-dong-tu/scene.config"),
    scene: () => import("./chu-dong-tu/scene"),
  },
  "mai-an-tiem": {
    dir: "mai-an-tiem",
    config: () => import("./mai-an-tiem/scene.config"),
    scene: () => import("./mai-an-tiem/scene"),
  },
  "son-tinh-thuy-tinh": {
    dir: "son-tinh-thuy-tinh",
    config: () => import("./son-tinh-thuy-tinh/scene.config"),
    scene: () => import("./son-tinh-thuy-tinh/scene"),
  },
  "sa-huynh": {
    dir: "sa-huynh",
    config: () => import("./sa-huynh/scene.config"),
    scene: () => import("./sa-huynh/scene"),
  },
  "trong-dong-ngoc-lu": {
    dir: "trong-dong-ngoc-lu",
    config: () => import("./trong-dong-ngoc-lu/scene.config"),
    scene: () => import("./trong-dong-ngoc-lu/scene"),
  },
  "co-loa": {
    dir: "co-loa",
    config: () => import("./co-loa/scene.config"),
    scene: () => import("./co-loa/scene"),
  },
  "khang-tan-218tcn": {
    dir: "khang-tan-218tcn",
    config: () => import("./khang-tan-218tcn/scene.config"),
    scene: () => import("./khang-tan-218tcn/scene"),
  },
  "trieu-da-179tcn": {
    dir: "trieu-da-179tcn",
    config: () => import("./trieu-da-179tcn/scene.config"),
    scene: () => import("./trieu-da-179tcn/scene"),
  },
  "nha-han-111tcn": {
    dir: "nha-han-111tcn",
    config: () => import("./nha-han-111tcn/scene.config"),
    scene: () => import("./nha-han-111tcn/scene"),
  },
  "hai-ba-trung-40": {
    dir: "hai-ba-trung-40",
    config: () => import("./hai-ba-trung-40/scene.config"),
    scene: () => import("./hai-ba-trung-40/scene"),
  },
  "oc-eo": {
    dir: "oc-eo",
    config: () => import("./oc-eo/scene.config"),
    scene: () => import("./oc-eo/scene"),
  },
  "si-nhiep-187": {
    dir: "si-nhiep-187",
    config: () => import("./si-nhiep-187/scene.config"),
    scene: () => import("./si-nhiep-187/scene"),
  },
  "lam-ap-192": {
    dir: "lam-ap-192",
    config: () => import("./lam-ap-192/scene.config"),
    scene: () => import("./lam-ap-192/scene"),
  },
  "khuong-tang-hoi-247": {
    dir: "khuong-tang-hoi-247",
    config: () => import("./khuong-tang-hoi-247/scene.config"),
    scene: () => import("./khuong-tang-hoi-247/scene"),
  },
  "ba-trieu-248": {
    dir: "ba-trieu-248",
    config: () => import("./ba-trieu-248/scene.config"),
    scene: () => import("./ba-trieu-248/scene"),
  },
  "my-son-380": {
    dir: "my-son-380",
    config: () => import("./my-son-380/scene.config"),
    scene: () => import("./my-son-380/scene"),
  },
  "cat-tien-450": {
    dir: "cat-tien-450",
    config: () => import("./cat-tien-450/scene.config"),
    scene: () => import("./cat-tien-450/scene"),
  },
  "van-xuan-544": {
    dir: "van-xuan-544",
    config: () => import("./van-xuan-544/scene.config"),
    scene: () => import("./van-xuan-544/scene"),
  },
  "trieu-quang-phuc-548": {
    dir: "trieu-quang-phuc-548",
    config: () => import("./trieu-quang-phuc-548/scene.config"),
    scene: () => import("./trieu-quang-phuc-548/scene"),
  },
  "ly-phat-tu-571": {
    dir: "ly-phat-tu-571",
    config: () => import("./ly-phat-tu-571/scene.config"),
    scene: () => import("./ly-phat-tu-571/scene"),
  },
  "an-nam-679": {
    dir: "an-nam-679",
    config: () => import("./an-nam-679/scene.config"),
    scene: () => import("./an-nam-679/scene"),
  },
  "mai-thuc-loan-722": {
    dir: "mai-thuc-loan-722",
    config: () => import("./mai-thuc-loan-722/scene.config"),
    scene: () => import("./mai-thuc-loan-722/scene"),
  },
  "khuong-cong-phu-780": {
    dir: "khuong-cong-phu-780",
    config: () => import("./khuong-cong-phu-780/scene.config"),
    scene: () => import("./khuong-cong-phu-780/scene"),
  },
  "phung-hung-791": {
    dir: "phung-hung-791",
    config: () => import("./phung-hung-791/scene.config"),
    scene: () => import("./phung-hung-791/scene"),
  },
  "duong-thanh-819": {
    dir: "duong-thanh-819",
    config: () => import("./duong-thanh-819/scene.config"),
    scene: () => import("./duong-thanh-819/scene"),
  },
  "dai-la-866": {
    dir: "dai-la-866",
    config: () => import("./dai-la-866/scene.config"),
    scene: () => import("./dai-la-866/scene"),
  },
  "khuc-thua-du-905": {
    dir: "khuc-thua-du-905",
    config: () => import("./khuc-thua-du-905/scene.config"),
    scene: () => import("./khuc-thua-du-905/scene"),
  },
  "khuc-hao-907": {
    dir: "khuc-hao-907",
    config: () => import("./khuc-hao-907/scene.config"),
    scene: () => import("./khuc-hao-907/scene"),
  },
  "duong-dinh-nghe-931": {
    dir: "duong-dinh-nghe-931",
    config: () => import("./duong-dinh-nghe-931/scene.config"),
    scene: () => import("./duong-dinh-nghe-931/scene"),
  },
  "bach-dang-938": {
    dir: "bach-dang-938",
    config: () => import("./bach-dang-938/scene.config"),
    scene: () => import("./bach-dang-938/scene"),
  },
  "ngo-quyen-939": {
    dir: "ngo-quyen-939",
    config: () => import("./ngo-quyen-939/scene.config"),
    scene: () => import("./ngo-quyen-939/scene"),
  },
  "ngo-xuong-van-950": {
    dir: "ngo-xuong-van-950",
    config: () => import("./ngo-xuong-van-950/scene.config"),
    scene: () => import("./ngo-xuong-van-950/scene"),
  },
  "dai-co-viet-968": {
    dir: "dai-co-viet-968",
    config: () => import("./dai-co-viet-968/scene.config"),
    scene: () => import("./dai-co-viet-968/scene"),
  },
  "thai-binh-hung-bao-970": {
    dir: "thai-binh-hung-bao-970",
    config: () => import("./thai-binh-hung-bao-970/scene.config"),
    scene: () => import("./thai-binh-hung-bao-970/scene"),
  },
  "khuong-viet-971": {
    dir: "khuong-viet-971",
    config: () => import("./khuong-viet-971/scene.config"),
    scene: () => import("./khuong-viet-971/scene"),
  },
  "chong-tong-981": {
    dir: "chong-tong-981",
    config: () => import("./chong-tong-981/scene.config"),
    scene: () => import("./chong-tong-981/scene"),
  },
  "le-hoan-982": {
    dir: "le-hoan-982",
    config: () => import("./le-hoan-982/scene.config"),
    scene: () => import("./le-hoan-982/scene"),
  },
  "tich-dien-987": {
    dir: "tich-dien-987",
    config: () => import("./tich-dien-987/scene.config"),
    scene: () => import("./tich-dien-987/scene"),
  },
  "le-long-dinh-1005": {
    dir: "le-long-dinh-1005",
    config: () => import("./le-long-dinh-1005/scene.config"),
    scene: () => import("./le-long-dinh-1005/scene"),
  },
  "doi-do-1010": {
    dir: "doi-do-1010",
    config: () => import("./doi-do-1010/scene.config"),
    scene: () => import("./doi-do-1010/scene"),
  },
  "tam-vuong-1028": {
    dir: "tam-vuong-1028",
    config: () => import("./tam-vuong-1028/scene.config"),
    scene: () => import("./tam-vuong-1028/scene"),
  },
  "hinh-thu-1042": {
    dir: "hinh-thu-1042",
    config: () => import("./hinh-thu-1042/scene.config"),
    scene: () => import("./hinh-thu-1042/scene"),
  },
  "chua-mot-cot-1049": {
    dir: "chua-mot-cot-1049",
    config: () => import("./chua-mot-cot-1049/scene.config"),
    scene: () => import("./chua-mot-cot-1049/scene"),
  },
  "dai-viet-1054": {
    dir: "dai-viet-1054",
    config: () => import("./dai-viet-1054/scene.config"),
    scene: () => import("./dai-viet-1054/scene"),
  },
  "phat-tich-1057": {
    dir: "phat-tich-1057",
    config: () => import("./phat-tich-1057/scene.config"),
    scene: () => import("./phat-tich-1057/scene"),
  },
  "thap-bao-thien-1057": {
    dir: "thap-bao-thien-1057",
    config: () => import("./thap-bao-thien-1057/scene.config"),
    scene: () => import("./thap-bao-thien-1057/scene"),
  },
  "khong-lo-1063": {
    dir: "khong-lo-1063",
    config: () => import("./khong-lo-1063/scene.config"),
    scene: () => import("./khong-lo-1063/scene"),
  },
  "y-lan-1069": {
    dir: "y-lan-1069",
    config: () => import("./y-lan-1069/scene.config"),
    scene: () => import("./y-lan-1069/scene"),
  },
  "van-mieu-1070": {
    dir: "van-mieu-1070",
    config: () => import("./van-mieu-1070/scene.config"),
    scene: () => import("./van-mieu-1070/scene"),
  },
  "le-van-thinh-1075": {
    dir: "le-van-thinh-1075",
    config: () => import("./le-van-thinh-1075/scene.config"),
    scene: () => import("./le-van-thinh-1075/scene"),
  },
  "nhu-nguyet-1077": {
    dir: "nhu-nguyet-1077",
    config: () => import("./nhu-nguyet-1077/scene.config"),
    scene: () => import("./nhu-nguyet-1077/scene"),
  },
  "thap-banh-it-1100": {
    dir: "thap-banh-it-1100",
    config: () => import("./thap-banh-it-1100/scene.config"),
    scene: () => import("./thap-banh-it-1100/scene"),
  },
  "ly-thuong-kiet-1105": {
    dir: "ly-thuong-kiet-1105",
    config: () => import("./ly-thuong-kiet-1105/scene.config"),
    scene: () => import("./ly-thuong-kiet-1105/scene"),
  },
  "de-co-xa-1108": {
    dir: "de-co-xa-1108",
    config: () => import("./de-co-xa-1108/scene.config"),
    scene: () => import("./de-co-xa-1108/scene"),
  },
  "tu-dao-hanh-1116": {
    dir: "tu-dao-hanh-1116",
    config: () => import("./tu-dao-hanh-1116/scene.config"),
    scene: () => import("./tu-dao-hanh-1116/scene"),
  },
  "mua-roi-nuoc-1121": {
    dir: "mua-roi-nuoc-1121",
    config: () => import("./mua-roi-nuoc-1121/scene.config"),
    scene: () => import("./mua-roi-nuoc-1121/scene"),
  },
  "to-hien-thanh-1175": {
    dir: "to-hien-thanh-1175",
    config: () => import("./to-hien-thanh-1175/scene.config"),
    scene: () => import("./to-hien-thanh-1175/scene"),
  },
  "tran-thay-ly-1226": {
    dir: "tran-thay-ly-1226",
    config: () => import("./tran-thay-ly-1226/scene.config"),
    scene: () => import("./tran-thay-ly-1226/scene"),
  },
  "dong-bo-dau-1258": {
    dir: "dong-bo-dau-1258",
    config: () => import("./dong-bo-dau-1258/scene.config"),
    scene: () => import("./dong-bo-dau-1258/scene"),
  },
  "linh-tu-1258": {
    dir: "linh-tu-1258",
    config: () => import("./linh-tu-1258/scene.config"),
    scene: () => import("./linh-tu-1258/scene"),
  },
  "tran-thanh-tong-1258": {
    dir: "tran-thanh-tong-1258",
    config: () => import("./tran-thanh-tong-1258/scene.config"),
    scene: () => import("./tran-thanh-tong-1258/scene"),
  },
  "le-van-huu-1272": {
    dir: "le-van-huu-1272",
    config: () => import("./le-van-huu-1272/scene.config"),
    scene: () => import("./le-van-huu-1272/scene"),
  },
  "tran-nhat-duat-1280": {
    dir: "tran-nhat-duat-1280",
    config: () => import("./tran-nhat-duat-1280/scene.config"),
    scene: () => import("./tran-nhat-duat-1280/scene"),
  },
  "binh-than-1282": {
    dir: "binh-than-1282",
    config: () => import("./binh-than-1282/scene.config"),
    scene: () => import("./binh-than-1282/scene"),
  },
  "pham-ngu-lao-1283": {
    dir: "pham-ngu-lao-1283",
    config: () => import("./pham-ngu-lao-1283/scene.config"),
    scene: () => import("./pham-ngu-lao-1283/scene"),
  },
  "dien-hong-1284": {
    dir: "dien-hong-1284",
    config: () => import("./dien-hong-1284/scene.config"),
    scene: () => import("./dien-hong-1284/scene"),
  },
  "hich-tuong-si-1284": {
    dir: "hich-tuong-si-1284",
    config: () => import("./hich-tuong-si-1284/scene.config"),
    scene: () => import("./hich-tuong-si-1284/scene"),
  },
  "ham-tu-1285": {
    dir: "ham-tu-1285",
    config: () => import("./ham-tu-1285/scene.config"),
    scene: () => import("./ham-tu-1285/scene"),
  },
  "tran-binh-trong-1285": {
    dir: "tran-binh-trong-1285",
    config: () => import("./tran-binh-trong-1285/scene.config"),
    scene: () => import("./tran-binh-trong-1285/scene"),
  },
  "yet-kieu-1285": {
    dir: "yet-kieu-1285",
    config: () => import("./yet-kieu-1285/scene.config"),
    scene: () => import("./yet-kieu-1285/scene"),
  },
  "van-don-1288": {
    dir: "van-don-1288",
    config: () => import("./van-don-1288/scene.config"),
    scene: () => import("./van-don-1288/scene"),
  },
  "bach-dang-1288": {
    dir: "bach-dang-1288",
    config: () => import("./bach-dang-1288/scene.config"),
    scene: () => import("./bach-dang-1288/scene"),
  },
  "truc-lam-1299": {
    dir: "truc-lam-1299",
    config: () => import("./truc-lam-1299/scene.config"),
    scene: () => import("./truc-lam-1299/scene"),
  },
  "po-klong-garai-1300": {
    dir: "po-klong-garai-1300",
    config: () => import("./po-klong-garai-1300/scene.config"),
    scene: () => import("./po-klong-garai-1300/scene"),
  },
  "tran-hung-dao-1300": {
    dir: "tran-hung-dao-1300",
    config: () => import("./tran-hung-dao-1300/scene.config"),
    scene: () => import("./tran-hung-dao-1300/scene"),
  },
  "yang-prong-1300": {
    dir: "yang-prong-1300",
    config: () => import("./yang-prong-1300/scene.config"),
    scene: () => import("./yang-prong-1300/scene"),
  },
  "pho-minh-1305": {
    dir: "pho-minh-1305",
    config: () => import("./pho-minh-1305/scene.config"),
    scene: () => import("./pho-minh-1305/scene"),
  },
  "huyen-tran-1306": {
    dir: "huyen-tran-1306",
    config: () => import("./huyen-tran-1306/scene.config"),
    scene: () => import("./huyen-tran-1306/scene"),
  },
  "mac-dinh-chi-1308": {
    dir: "mac-dinh-chi-1308",
    config: () => import("./mac-dinh-chi-1308/scene.config"),
    scene: () => import("./mac-dinh-chi-1308/scene"),
  },
  "chu-van-an-1350": {
    dir: "chu-van-an-1350",
    config: () => import("./chu-van-an-1350/scene.config"),
    scene: () => import("./chu-van-an-1350/scene"),
  },
  "ngo-be-1358": {
    dir: "ngo-be-1358",
    config: () => import("./ngo-be-1358/scene.config"),
    scene: () => import("./ngo-be-1358/scene"),
  },
  "che-bong-nga-1377": {
    dir: "che-bong-nga-1377",
    config: () => import("./che-bong-nga-1377/scene.config"),
    scene: () => import("./che-bong-nga-1377/scene"),
  },
  "tue-tinh-1385": {
    dir: "tue-tinh-1385",
    config: () => import("./tue-tinh-1385/scene.config"),
    scene: () => import("./tue-tinh-1385/scene"),
  },
  "nha-ho-1400": {
    dir: "nha-ho-1400",
    config: () => import("./nha-ho-1400/scene.config"),
    scene: () => import("./nha-ho-1400/scene"),
  },
  "ho-nguyen-trung-1405": {
    dir: "ho-nguyen-trung-1405",
    config: () => import("./ho-nguyen-trung-1405/scene.config"),
    scene: () => import("./ho-nguyen-trung-1405/scene"),
  },
  "hau-tran-1408": {
    dir: "hau-tran-1408",
    config: () => import("./hau-tran-1408/scene.config"),
    scene: () => import("./hau-tran-1408/scene"),
  },
  "nguyen-bieu-1413": {
    dir: "nguyen-bieu-1413",
    config: () => import("./nguyen-bieu-1413/scene.config"),
    scene: () => import("./nguyen-bieu-1413/scene"),
  },
  "lam-son-1418": {
    dir: "lam-son-1418",
    config: () => import("./lam-son-1418/scene.config"),
    scene: () => import("./lam-son-1418/scene"),
  },
  "quan-trung-tu-menh-1423": {
    dir: "quan-trung-tu-menh-1423",
    config: () => import("./quan-trung-tu-menh-1423/scene.config"),
    scene: () => import("./quan-trung-tu-menh-1423/scene"),
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
  "lam-son-thuc-luc-1431": {
    dir: "lam-son-thuc-luc-1431",
    config: () => import("./lam-son-thuc-luc-1431/scene.config"),
    scene: () => import("./lam-son-thuc-luc-1431/scene"),
  },
  "bia-le-loi-1432": {
    dir: "bia-le-loi-1432",
    config: () => import("./bia-le-loi-1432/scene.config"),
    scene: () => import("./bia-le-loi-1432/scene"),
  },
  "lam-kinh-1433": {
    dir: "lam-kinh-1433",
    config: () => import("./lam-kinh-1433/scene.config"),
    scene: () => import("./lam-kinh-1433/scene"),
  },
  "le-thai-tong-1433": {
    dir: "le-thai-tong-1433",
    config: () => import("./le-thai-tong-1433/scene.config"),
    scene: () => import("./le-thai-tong-1433/scene"),
  },
  "du-dia-chi-1435": {
    dir: "du-dia-chi-1435",
    config: () => import("./du-dia-chi-1435/scene.config"),
    scene: () => import("./du-dia-chi-1435/scene"),
  },
  "le-chi-vien-1442": {
    dir: "le-chi-vien-1442",
    config: () => import("./le-chi-vien-1442/scene.config"),
    scene: () => import("./le-chi-vien-1442/scene"),
  },
  "chu-dau-1450": {
    dir: "chu-dau-1450",
    config: () => import("./chu-dau-1450/scene.config"),
    scene: () => import("./chu-dau-1450/scene"),
  },
  "le-nghi-dan-1459": {
    dir: "le-nghi-dan-1459",
    config: () => import("./le-nghi-dan-1459/scene.config"),
    scene: () => import("./le-nghi-dan-1459/scene"),
  },
  "luong-the-vinh-1463": {
    dir: "luong-the-vinh-1463",
    config: () => import("./luong-the-vinh-1463/scene.config"),
    scene: () => import("./luong-the-vinh-1463/scene"),
  },
  "nui-bai-tho-1468": {
    dir: "nui-bai-tho-1468",
    config: () => import("./nui-bai-tho-1468/scene.config"),
    scene: () => import("./nui-bai-tho-1468/scene"),
  },
  "do-ban-1471": {
    dir: "do-ban-1471",
    config: () => import("./do-ban-1471/scene.config"),
    scene: () => import("./do-ban-1471/scene"),
  },
  "toan-thu-1479": {
    dir: "toan-thu-1479",
    config: () => import("./toan-thu-1479/scene.config"),
    scene: () => import("./toan-thu-1479/scene"),
  },
  "hong-duc-1483": {
    dir: "hong-duc-1483",
    config: () => import("./hong-duc-1483/scene.config"),
    scene: () => import("./hong-duc-1483/scene"),
  },
  "hong-duc-ban-do-1490": {
    dir: "hong-duc-ban-do-1490",
    config: () => import("./hong-duc-ban-do-1490/scene.config"),
    scene: () => import("./hong-duc-ban-do-1490/scene"),
  },
  "tao-dan-1495": {
    dir: "tao-dan-1495",
    config: () => import("./tao-dan-1495/scene.config"),
    scene: () => import("./tao-dan-1495/scene"),
  },
  "le-hien-tong-1497": {
    dir: "le-hien-tong-1497",
    config: () => import("./le-hien-tong-1497/scene.config"),
    scene: () => import("./le-hien-tong-1497/scene"),
  },
  "nha-mac-1527": {
    dir: "nha-mac-1527",
    config: () => import("./nha-mac-1527/scene.config"),
    scene: () => import("./nha-mac-1527/scene"),
  },
  "mac-khoa-thi-1529": {
    dir: "mac-khoa-thi-1529",
    config: () => import("./mac-khoa-thi-1529/scene.config"),
    scene: () => import("./mac-khoa-thi-1529/scene"),
  },
  "nguyen-binh-khiem-1535": {
    dir: "nguyen-binh-khiem-1535",
    config: () => import("./nguyen-binh-khiem-1535/scene.config"),
    scene: () => import("./nguyen-binh-khiem-1535/scene"),
  },
  "trinh-kiem-1545": {
    dir: "trinh-kiem-1545",
    config: () => import("./trinh-kiem-1545/scene.config"),
    scene: () => import("./trinh-kiem-1545/scene"),
  },
  "truyen-ky-man-luc-1550": {
    dir: "truyen-ky-man-luc-1550",
    config: () => import("./truyen-ky-man-luc-1550/scene.config"),
    scene: () => import("./truyen-ky-man-luc-1550/scene"),
  },
  "thuan-hoa-1558": {
    dir: "thuan-hoa-1558",
    config: () => import("./thuan-hoa-1558/scene.config"),
    scene: () => import("./thuan-hoa-1558/scene"),
  },
  "trinh-tung-1599": {
    dir: "trinh-tung-1599",
    config: () => import("./trinh-tung-1599/scene.config"),
    scene: () => import("./trinh-tung-1599/scene"),
  },
  "dong-ho-1600": {
    dir: "dong-ho-1600",
    config: () => import("./dong-ho-1600/scene.config"),
    scene: () => import("./dong-ho-1600/scene"),
  },
  "thien-mu-1601": {
    dir: "thien-mu-1601",
    config: () => import("./thien-mu-1601/scene.config"),
    scene: () => import("./thien-mu-1601/scene"),
  },
  "phu-yen-1611": {
    dir: "phu-yen-1611",
    config: () => import("./phu-yen-1611/scene.config"),
    scene: () => import("./phu-yen-1611/scene"),
  },
  "hoi-an-1617": {
    dir: "hoi-an-1617",
    config: () => import("./hoi-an-1617/scene.config"),
    scene: () => import("./hoi-an-1617/scene"),
  },
  "po-rome-1627": {
    dir: "po-rome-1627",
    config: () => import("./po-rome-1627/scene.config"),
    scene: () => import("./po-rome-1627/scene"),
  },
  "trinh-nguyen-1627": {
    dir: "trinh-nguyen-1627",
    config: () => import("./trinh-nguyen-1627/scene.config"),
    scene: () => import("./trinh-nguyen-1627/scene"),
  },
  "luy-thay-1631": {
    dir: "luy-thay-1631",
    config: () => import("./luy-thay-1631/scene.config"),
    scene: () => import("./luy-thay-1631/scene"),
  },
  "pho-hien-1637": {
    dir: "pho-hien-1637",
    config: () => import("./pho-hien-1637/scene.config"),
    scene: () => import("./pho-hien-1637/scene"),
  },
  "but-thap-1647": {
    dir: "but-thap-1647",
    config: () => import("./but-thap-1647/scene.config"),
    scene: () => import("./but-thap-1647/scene"),
  },
  "quoc-ngu-1651": {
    dir: "quoc-ngu-1651",
    config: () => import("./quoc-ngu-1651/scene.config"),
    scene: () => import("./quoc-ngu-1651/scene"),
  },
  "cao-bang-1677": {
    dir: "cao-bang-1677",
    config: () => import("./cao-bang-1677/scene.config"),
    scene: () => import("./cao-bang-1677/scene"),
  },
  "minh-huong-1679": {
    dir: "minh-huong-1679",
    config: () => import("./minh-huong-1679/scene.config"),
    scene: () => import("./minh-huong-1679/scene"),
  },
  "gia-dinh-1698": {
    dir: "gia-dinh-1698",
    config: () => import("./gia-dinh-1698/scene.config"),
    scene: () => import("./gia-dinh-1698/scene"),
  },
  "ha-tien-1708": {
    dir: "ha-tien-1708",
    config: () => import("./ha-tien-1708/scene.config"),
    scene: () => import("./ha-tien-1708/scene"),
  },
  "chieu-anh-cac-1736": {
    dir: "chieu-anh-cac-1736",
    config: () => import("./chieu-anh-cac-1736/scene.config"),
    scene: () => import("./chieu-anh-cac-1736/scene"),
  },
  "le-duy-mat-1738": {
    dir: "le-duy-mat-1738",
    config: () => import("./le-duy-mat-1738/scene.config"),
    scene: () => import("./le-duy-mat-1738/scene"),
  },
  "nguyen-huu-cau-1741": {
    dir: "nguyen-huu-cau-1741",
    config: () => import("./nguyen-huu-cau-1741/scene.config"),
    scene: () => import("./nguyen-huu-cau-1741/scene"),
  },
  "nguyen-phuc-khoat-1744": {
    dir: "nguyen-phuc-khoat-1744",
    config: () => import("./nguyen-phuc-khoat-1744/scene.config"),
    scene: () => import("./nguyen-phuc-khoat-1744/scene"),
  },
  "chinh-phu-ngam-1745": {
    dir: "chinh-phu-ngam-1745",
    config: () => import("./chinh-phu-ngam-1745/scene.config"),
    scene: () => import("./chinh-phu-ngam-1745/scene"),
  },
  "hoang-cong-chat-1758": {
    dir: "hoang-cong-chat-1758",
    config: () => import("./hoang-cong-chat-1758/scene.config"),
    scene: () => import("./hoang-cong-chat-1758/scene"),
  },
  "lan-ong-1770": {
    dir: "lan-ong-1770",
    config: () => import("./lan-ong-1770/scene.config"),
    scene: () => import("./lan-ong-1770/scene"),
  },
  "tay-son-1771": {
    dir: "tay-son-1771",
    config: () => import("./tay-son-1771/scene.config"),
    scene: () => import("./tay-son-1771/scene"),
  },
  "le-quy-don-1776": {
    dir: "le-quy-don-1776",
    config: () => import("./le-quy-don-1776/scene.config"),
    scene: () => import("./le-quy-don-1776/scene"),
  },
  "thanh-hoang-de-1778": {
    dir: "thanh-hoang-de-1778",
    config: () => import("./thanh-hoang-de-1778/scene.config"),
    scene: () => import("./thanh-hoang-de-1778/scene"),
  },
  "rach-gam-1785": {
    dir: "rach-gam-1785",
    config: () => import("./rach-gam-1785/scene.config"),
    scene: () => import("./rach-gam-1785/scene"),
  },
  "phu-le-diet-trinh-1786": {
    dir: "phu-le-diet-trinh-1786",
    config: () => import("./phu-le-diet-trinh-1786/scene.config"),
    scene: () => import("./phu-le-diet-trinh-1786/scene"),
  },
  "versailles-1787": {
    dir: "versailles-1787",
    config: () => import("./versailles-1787/scene.config"),
    scene: () => import("./versailles-1787/scene"),
  },
  "phuong-hoang-trung-do-1788": {
    dir: "phuong-hoang-trung-do-1788",
    config: () => import("./phuong-hoang-trung-do-1788/scene.config"),
    scene: () => import("./phuong-hoang-trung-do-1788/scene"),
  },
  "dong-da-1789": {
    dir: "dong-da-1789",
    config: () => import("./dong-da-1789/scene.config"),
    scene: () => import("./dong-da-1789/scene"),
  },
  "ngo-thi-nham-1789": {
    dir: "ngo-thi-nham-1789",
    config: () => import("./ngo-thi-nham-1789/scene.config"),
    scene: () => import("./ngo-thi-nham-1789/scene"),
  },
  "gia-dinh-thanh-1790": {
    dir: "gia-dinh-thanh-1790",
    config: () => import("./gia-dinh-thanh-1790/scene.config"),
    scene: () => import("./gia-dinh-thanh-1790/scene"),
  },
  "nguyen-quang-toan-1792": {
    dir: "nguyen-quang-toan-1792",
    config: () => import("./nguyen-quang-toan-1792/scene.config"),
    scene: () => import("./nguyen-quang-toan-1792/scene"),
  },
  "quang-trung-1792": {
    dir: "quang-trung-1792",
    config: () => import("./quang-trung-1792/scene.config"),
    scene: () => import("./quang-trung-1792/scene"),
  },
  "hoang-le-nhat-thong-chi-1800": {
    dir: "hoang-le-nhat-thong-chi-1800",
    config: () => import("./hoang-le-nhat-thong-chi-1800/scene.config"),
    scene: () => import("./hoang-le-nhat-thong-chi-1800/scene"),
  },
  "thi-nai-1801": {
    dir: "thi-nai-1801",
    config: () => import("./thi-nai-1801/scene.config"),
    scene: () => import("./thi-nai-1801/scene"),
  },
  "gia-long-1802": {
    dir: "gia-long-1802",
    config: () => import("./gia-long-1802/scene.config"),
    scene: () => import("./gia-long-1802/scene"),
  },
  "tran-ninh-1802": {
    dir: "tran-ninh-1802",
    config: () => import("./tran-ninh-1802/scene.config"),
    scene: () => import("./tran-ninh-1802/scene"),
  },
  "kinh-thanh-hue-1805": {
    dir: "kinh-thanh-hue-1805",
    config: () => import("./kinh-thanh-hue-1805/scene.config"),
    scene: () => import("./kinh-thanh-hue-1805/scene"),
  },
  "nguyen-du-1810": {
    dir: "nguyen-du-1810",
    config: () => import("./nguyen-du-1810/scene.config"),
    scene: () => import("./nguyen-du-1810/scene"),
  },
  "hoang-viet-luat-le-1813": {
    dir: "hoang-viet-luat-le-1813",
    config: () => import("./hoang-viet-luat-le-1813/scene.config"),
    scene: () => import("./hoang-viet-luat-le-1813/scene"),
  },
  "hoang-sa-1815": {
    dir: "hoang-sa-1815",
    config: () => import("./hoang-sa-1815/scene.config"),
    scene: () => import("./hoang-sa-1815/scene"),
  },
  "thoai-ha-1818": {
    dir: "thoai-ha-1818",
    config: () => import("./thoai-ha-1818/scene.config"),
    scene: () => import("./thoai-ha-1818/scene"),
  },
  "vinh-te-1819": {
    dir: "vinh-te-1819",
    config: () => import("./vinh-te-1819/scene.config"),
    scene: () => import("./vinh-te-1819/scene"),
  },
  "lich-trieu-hien-chuong-1821": {
    dir: "lich-trieu-hien-chuong-1821",
    config: () => import("./lich-trieu-hien-chuong-1821/scene.config"),
    scene: () => import("./lich-trieu-hien-chuong-1821/scene"),
  },
  "phan-ba-vanh-1821": {
    dir: "phan-ba-vanh-1821",
    config: () => import("./phan-ba-vanh-1821/scene.config"),
    scene: () => import("./phan-ba-vanh-1821/scene"),
  },
  "nguyen-cong-tru-1828": {
    dir: "nguyen-cong-tru-1828",
    config: () => import("./nguyen-cong-tru-1828/scene.config"),
    scene: () => import("./nguyen-cong-tru-1828/scene"),
  },
  "minh-mang-1831": {
    dir: "minh-mang-1831",
    config: () => import("./minh-mang-1831/scene.config"),
    scene: () => import("./minh-mang-1831/scene"),
  },
  "le-van-khoi-1833": {
    dir: "le-van-khoi-1833",
    config: () => import("./le-van-khoi-1833/scene.config"),
    scene: () => import("./le-van-khoi-1833/scene"),
  },
  "nong-van-van-1833": {
    dir: "nong-van-van-1833",
    config: () => import("./nong-van-van-1833/scene.config"),
    scene: () => import("./nong-van-van-1833/scene"),
  },
  "dai-nam-1838": {
    dir: "dai-nam-1838",
    config: () => import("./dai-nam-1838/scene.config"),
    scene: () => import("./dai-nam-1838/scene"),
  },
  "thieu-tri-1841": {
    dir: "thieu-tri-1841",
    config: () => import("./thieu-tri-1841/scene.config"),
    scene: () => import("./thieu-tri-1841/scene"),
  },
  "nguyen-dinh-chieu-1850": {
    dir: "nguyen-dinh-chieu-1850",
    config: () => import("./nguyen-dinh-chieu-1850/scene.config"),
    scene: () => import("./nguyen-dinh-chieu-1850/scene"),
  },
  "cao-ba-quat-1854": {
    dir: "cao-ba-quat-1854",
    config: () => import("./cao-ba-quat-1854/scene.config"),
    scene: () => import("./cao-ba-quat-1854/scene"),
  },
  "da-nang-1858": {
    dir: "da-nang-1858",
    config: () => import("./da-nang-1858/scene.config"),
    scene: () => import("./da-nang-1858/scene"),
  },
  "gia-dinh-1859": {
    dir: "gia-dinh-1859",
    config: () => import("./gia-dinh-1859/scene.config"),
    scene: () => import("./gia-dinh-1859/scene"),
  },
  "can-giuoc-1861": {
    dir: "can-giuoc-1861",
    config: () => import("./can-giuoc-1861/scene.config"),
    scene: () => import("./can-giuoc-1861/scene"),
  },
  "chi-hoa-1861": {
    dir: "chi-hoa-1861",
    config: () => import("./chi-hoa-1861/scene.config"),
    scene: () => import("./chi-hoa-1861/scene"),
  },
  "truong-dinh-1864": {
    dir: "truong-dinh-1864",
    config: () => import("./truong-dinh-1864/scene.config"),
    scene: () => import("./truong-dinh-1864/scene"),
  },
  "nguyen-truong-to-1863": {
    dir: "nguyen-truong-to-1863",
    config: () => import("./nguyen-truong-to-1863/scene.config"),
    scene: () => import("./nguyen-truong-to-1863/scene"),
  },
  "gia-dinh-bao-1865": {
    dir: "gia-dinh-bao-1865",
    config: () => import("./gia-dinh-bao-1865/scene.config"),
    scene: () => import("./gia-dinh-bao-1865/scene"),
  },
  "lang-tu-duc-1873": {
    dir: "lang-tu-duc-1873",
    config: () => import("./lang-tu-duc-1873/scene.config"),
    scene: () => import("./lang-tu-duc-1873/scene"),
  },
  "phan-thanh-gian-1867": {
    dir: "phan-thanh-gian-1867",
    config: () => import("./phan-thanh-gian-1867/scene.config"),
    scene: () => import("./phan-thanh-gian-1867/scene"),
  },
  "dang-huy-tru-1869": {
    dir: "dang-huy-tru-1869",
    config: () => import("./dang-huy-tru-1869/scene.config"),
    scene: () => import("./dang-huy-tru-1869/scene"),
  },
  "cau-giay-1873": {
    dir: "cau-giay-1873",
    config: () => import("./cau-giay-1873/scene.config"),
    scene: () => import("./cau-giay-1873/scene"),
  },
  "nguyen-tri-phuong-1873": {
    dir: "nguyen-tri-phuong-1873",
    config: () => import("./nguyen-tri-phuong-1873/scene.config"),
    scene: () => import("./nguyen-tri-phuong-1873/scene"),
  },
  "giap-tuat-1874": {
    dir: "giap-tuat-1874",
    config: () => import("./giap-tuat-1874/scene.config"),
    scene: () => import("./giap-tuat-1874/scene"),
  },
  "nha-tho-duc-ba-1880": {
    dir: "nha-tho-duc-ba-1880",
    config: () => import("./nha-tho-duc-ba-1880/scene.config"),
    scene: () => import("./nha-tho-duc-ba-1880/scene"),
  },
  "hoang-dieu-1882": {
    dir: "hoang-dieu-1882",
    config: () => import("./hoang-dieu-1882/scene.config"),
    scene: () => import("./hoang-dieu-1882/scene"),
  },
  "bai-say-1883": {
    dir: "bai-say-1883",
    config: () => import("./bai-say-1883/scene.config"),
    scene: () => import("./bai-say-1883/scene"),
  },
  "cau-giay-1883": {
    dir: "cau-giay-1883",
    config: () => import("./cau-giay-1883/scene.config"),
    scene: () => import("./cau-giay-1883/scene"),
  },
  "quy-mui-1883": {
    dir: "quy-mui-1883",
    config: () => import("./quy-mui-1883/scene.config"),
    scene: () => import("./quy-mui-1883/scene"),
  },
  "giap-than-1884": {
    dir: "giap-than-1884",
    config: () => import("./giap-than-1884/scene.config"),
    scene: () => import("./giap-than-1884/scene"),
  },
  "phap-thanh-1884": {
    dir: "phap-thanh-1884",
    config: () => import("./phap-thanh-1884/scene.config"),
    scene: () => import("./phap-thanh-1884/scene"),
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
  "duong-sat-sai-gon-my-tho-1885": {
    dir: "duong-sat-sai-gon-my-tho-1885",
    config: () => import("./duong-sat-sai-gon-my-tho-1885/scene.config"),
    scene: () => import("./duong-sat-sai-gon-my-tho-1885/scene"),
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
  "hung-linh-1887": {
    dir: "hung-linh-1887",
    config: () => import("./hung-linh-1887/scene.config"),
    scene: () => import("./hung-linh-1887/scene"),
  },
  "nha-tho-lon-1887": {
    dir: "nha-tho-lon-1887",
    config: () => import("./nha-tho-lon-1887/scene.config"),
    scene: () => import("./nha-tho-lon-1887/scene"),
  },
  "thanh-thai-1889": {
    dir: "thanh-thai-1889",
    config: () => import("./thanh-thai-1889/scene.config"),
    scene: () => import("./thanh-thai-1889/scene"),
  },
  "pasteur-sai-gon-1891": {
    dir: "pasteur-sai-gon-1891",
    config: () => import("./pasteur-sai-gon-1891/scene.config"),
    scene: () => import("./pasteur-sai-gon-1891/scene"),
  },
  "phat-diem-1891": {
    dir: "phat-diem-1891",
    config: () => import("./phat-diem-1891/scene.config"),
    scene: () => import("./phat-diem-1891/scene"),
  },
  "yersin-1893": {
    dir: "yersin-1893",
    config: () => import("./yersin-1893/scene.config"),
    scene: () => import("./yersin-1893/scene"),
  },
  "huynh-tinh-cua-1895": {
    dir: "huynh-tinh-cua-1895",
    config: () => import("./huynh-tinh-cua-1895/scene.config"),
    scene: () => import("./huynh-tinh-cua-1895/scene"),
  },
  "quoc-hoc-hue-1896": {
    dir: "quoc-hoc-hue-1896",
    config: () => import("./quoc-hoc-hue-1896/scene.config"),
    scene: () => import("./quoc-hoc-hue-1896/scene"),
  },
  "cau-long-bien-1898": {
    dir: "cau-long-bien-1898",
    config: () => import("./cau-long-bien-1898/scene.config"),
    scene: () => import("./cau-long-bien-1898/scene"),
  },
  "cau-truong-tien-1899": {
    dir: "cau-truong-tien-1899",
    config: () => import("./cau-truong-tien-1899/scene.config"),
    scene: () => import("./cau-truong-tien-1899/scene"),
  },
  "tu-xuong-1900": {
    dir: "tu-xuong-1900",
    config: () => import("./tu-xuong-1900/scene.config"),
    scene: () => import("./tu-xuong-1900/scene"),
  },
  "vien-dong-bac-co-1900": {
    dir: "vien-dong-bac-co-1900",
    config: () => import("./vien-dong-bac-co-1900/scene.config"),
    scene: () => import("./vien-dong-bac-co-1900/scene"),
  },
  "tau-dien-ha-noi-1901": {
    dir: "tau-dien-ha-noi-1901",
    config: () => import("./tau-dien-ha-noi-1901/scene.config"),
    scene: () => import("./tau-dien-ha-noi-1901/scene"),
  },
  "truong-y-ha-noi-1902": {
    dir: "truong-y-ha-noi-1902",
    config: () => import("./truong-y-ha-noi-1902/scene.config"),
    scene: () => import("./truong-y-ha-noi-1902/scene"),
  },
  "dong-du-1905": {
    dir: "dong-du-1905",
    config: () => import("./dong-du-1905/scene.config"),
    scene: () => import("./dong-du-1905/scene"),
  },
  "dai-hoc-dong-duong-1906": {
    dir: "dai-hoc-dong-duong-1906",
    config: () => import("./dai-hoc-dong-duong-1906/scene.config"),
    scene: () => import("./dai-hoc-dong-duong-1906/scene"),
  },
  "duy-tan-trung-ky-1906": {
    dir: "duy-tan-trung-ky-1906",
    config: () => import("./duy-tan-trung-ky-1906/scene.config"),
    scene: () => import("./duy-tan-trung-ky-1906/scene"),
  },
  "dong-kinh-nghia-thuc-1907": {
    dir: "dong-kinh-nghia-thuc-1907",
    config: () => import("./dong-kinh-nghia-thuc-1907/scene.config"),
    scene: () => import("./dong-kinh-nghia-thuc-1907/scene"),
  },
  "chong-thue-1908": {
    dir: "chong-thue-1908",
    config: () => import("./chong-thue-1908/scene.config"),
    scene: () => import("./chong-thue-1908/scene"),
  },
  "ha-thanh-dau-doc-1908": {
    dir: "ha-thanh-dau-doc-1908",
    config: () => import("./ha-thanh-dau-doc-1908/scene.config"),
    scene: () => import("./ha-thanh-dau-doc-1908/scene"),
  },
  "duong-sat-van-nam-1910": {
    dir: "duong-sat-van-nam-1910",
    config: () => import("./duong-sat-van-nam-1910/scene.config"),
    scene: () => import("./duong-sat-van-nam-1910/scene"),
  },
  "bach-mai-1911": {
    dir: "bach-mai-1911",
    config: () => import("./bach-mai-1911/scene.config"),
    scene: () => import("./bach-mai-1911/scene"),
  },
  "ben-nha-rong-1911": {
    dir: "ben-nha-rong-1911",
    config: () => import("./ben-nha-rong-1911/scene.config"),
    scene: () => import("./ben-nha-rong-1911/scene"),
  },
  "nha-hat-lon-1911": {
    dir: "nha-hat-lon-1911",
    config: () => import("./nha-hat-lon-1911/scene.config"),
    scene: () => import("./nha-hat-lon-1911/scene"),
  },
  "ntrang-long-1912": {
    dir: "ntrang-long-1912",
    config: () => import("./ntrang-long-1912/scene.config"),
    scene: () => import("./ntrang-long-1912/scene"),
  },
  "quang-phuc-hoi-1912": {
    dir: "quang-phuc-hoi-1912",
    config: () => import("./quang-phuc-hoi-1912/scene.config"),
    scene: () => import("./quang-phuc-hoi-1912/scene"),
  },
  "cho-ben-thanh-1914": {
    dir: "cho-ben-thanh-1914",
    config: () => import("./cho-ben-thanh-1914/scene.config"),
    scene: () => import("./cho-ben-thanh-1914/scene"),
  },
  "duy-tan-1916": {
    dir: "duy-tan-1916",
    config: () => import("./duy-tan-1916/scene.config"),
    scene: () => import("./duy-tan-1916/scene"),
  },
  "thai-nguyen-1917": {
    dir: "thai-nguyen-1917",
    config: () => import("./thai-nguyen-1917/scene.config"),
    scene: () => import("./thai-nguyen-1917/scene"),
  },
  "thu-vien-quoc-gia-1917": {
    dir: "thu-vien-quoc-gia-1917",
    config: () => import("./thu-vien-quoc-gia-1917/scene.config"),
    scene: () => import("./thu-vien-quoc-gia-1917/scene"),
  },
  "cai-luong-1918": {
    dir: "cai-luong-1918",
    config: () => import("./cai-luong-1918/scene.config"),
    scene: () => import("./cai-luong-1918/scene"),
  },
  "nu-gioi-chung-1918": {
    dir: "nu-gioi-chung-1918",
    config: () => import("./nu-gioi-chung-1918/scene.config"),
    scene: () => import("./nu-gioi-chung-1918/scene"),
  },
  "bao-tang-cham-1919": {
    dir: "bao-tang-cham-1919",
    config: () => import("./bao-tang-cham-1919/scene.config"),
    scene: () => import("./bao-tang-cham-1919/scene"),
  },
  "vien-hai-duong-hoc-1922": {
    dir: "vien-hai-duong-hoc-1922",
    config: () => import("./vien-hai-duong-hoc-1922/scene.config"),
    scene: () => import("./vien-hai-duong-hoc-1922/scene"),
  },
  "sa-dien-1924": {
    dir: "sa-dien-1924",
    config: () => import("./sa-dien-1924/scene.config"),
    scene: () => import("./sa-dien-1924/scene"),
  },
  "my-thuat-dong-duong-1925": {
    dir: "my-thuat-dong-duong-1925",
    config: () => import("./my-thuat-dong-duong-1925/scene.config"),
    scene: () => import("./my-thuat-dong-duong-1925/scene"),
  },
  "phan-chau-trinh-1926": {
    dir: "phan-chau-trinh-1926",
    config: () => import("./phan-chau-trinh-1926/scene.config"),
    scene: () => import("./phan-chau-trinh-1926/scene"),
  },
  "xo-viet-nghe-tinh-1930": {
    dir: "xo-viet-nghe-tinh-1930",
    config: () => import("./xo-viet-nghe-tinh-1930/scene.config"),
    scene: () => import("./xo-viet-nghe-tinh-1930/scene"),
  },
  "yen-bai-1930": {
    dir: "yen-bai-1930",
    config: () => import("./yen-bai-1930/scene.config"),
    scene: () => import("./yen-bai-1930/scene"),
  },
  "bao-tang-lich-su-1932": {
    dir: "bao-tang-lich-su-1932",
    config: () => import("./bao-tang-lich-su-1932/scene.config"),
    scene: () => import("./bao-tang-lich-su-1932/scene"),
  },
  "tho-moi-1932": {
    dir: "tho-moi-1932",
    config: () => import("./tho-moi-1932/scene.config"),
    scene: () => import("./tho-moi-1932/scene"),
  },
  "tu-luc-van-doan-1932": {
    dir: "tu-luc-van-doan-1932",
    config: () => import("./tu-luc-van-doan-1932/scene.config"),
    scene: () => import("./tu-luc-van-doan-1932/scene"),
  },
  "ao-dai-lemur-1934": {
    dir: "ao-dai-lemur-1934",
    config: () => import("./ao-dai-lemur-1934/scene.config"),
    scene: () => import("./ao-dai-lemur-1934/scene"),
  },
  "duong-sat-1936": {
    dir: "duong-sat-1936",
    config: () => import("./duong-sat-1936/scene.config"),
    scene: () => import("./duong-sat-1936/scene"),
  },
  "tan-nhac-1938": {
    dir: "tan-nhac-1938",
    config: () => import("./tan-nhac-1938/scene.config"),
    scene: () => import("./tan-nhac-1938/scene"),
  },
  "ton-that-tung-1939": {
    dir: "ton-that-tung-1939",
    config: () => import("./ton-that-tung-1939/scene.config"),
    scene: () => import("./ton-that-tung-1939/scene"),
  },
  "viet-minh-1941": {
    dir: "viet-minh-1941",
    config: () => import("./viet-minh-1941/scene.config"),
    scene: () => import("./viet-minh-1941/scene"),
  },
  "binh-dan-hoc-vu-1945": {
    dir: "binh-dan-hoc-vu-1945",
    config: () => import("./binh-dan-hoc-vu-1945/scene.config"),
    scene: () => import("./binh-dan-hoc-vu-1945/scene"),
  },
  "cach-mang-thang-tam-1945": {
    dir: "cach-mang-thang-tam-1945",
    config: () => import("./cach-mang-thang-tam-1945/scene.config"),
    scene: () => import("./cach-mang-thang-tam-1945/scene"),
  },
  "nam-bo-khang-chien-1945": {
    dir: "nam-bo-khang-chien-1945",
    config: () => import("./nam-bo-khang-chien-1945/scene.config"),
    scene: () => import("./nam-bo-khang-chien-1945/scene"),
  },
  "nan-doi-1945": {
    dir: "nan-doi-1945",
    config: () => import("./nan-doi-1945/scene.config"),
    scene: () => import("./nan-doi-1945/scene"),
  },
  "tieng-noi-viet-nam-1945": {
    dir: "tieng-noi-viet-nam-1945",
    config: () => import("./tieng-noi-viet-nam-1945/scene.config"),
    scene: () => import("./tieng-noi-viet-nam-1945/scene"),
  },
  "toan-quoc-khang-chien-1946": {
    dir: "toan-quoc-khang-chien-1946",
    config: () => import("./toan-quoc-khang-chien-1946/scene.config"),
    scene: () => import("./toan-quoc-khang-chien-1946/scene"),
  },
  "tong-tuyen-cu-1946": {
    dir: "tong-tuyen-cu-1946",
    config: () => import("./tong-tuyen-cu-1946/scene.config"),
    scene: () => import("./tong-tuyen-cu-1946/scene"),
  },
  "viet-bac-1947": {
    dir: "viet-bac-1947",
    config: () => import("./viet-bac-1947/scene.config"),
    scene: () => import("./viet-bac-1947/scene"),
  },
  "cu-chi-1948": {
    dir: "cu-chi-1948",
    config: () => import("./cu-chi-1948/scene.config"),
    scene: () => import("./cu-chi-1948/scene"),
  },
  "bien-gioi-1950": {
    dir: "bien-gioi-1950",
    config: () => import("./bien-gioi-1950/scene.config"),
    scene: () => import("./bien-gioi-1950/scene"),
  },
  "dien-bien-phu-1954": {
    dir: "dien-bien-phu-1954",
    config: () => import("./dien-bien-phu-1954/scene.config"),
    scene: () => import("./dien-bien-phu-1954/scene"),
  },
  "bach-khoa-ha-noi-1956": {
    dir: "bach-khoa-ha-noi-1956",
    config: () => import("./bach-khoa-ha-noi-1956/scene.config"),
    scene: () => import("./bach-khoa-ha-noi-1956/scene"),
  },
  "truong-son-1959": {
    dir: "truong-son-1959",
    config: () => import("./truong-son-1959/scene.config"),
    scene: () => import("./truong-son-1959/scene"),
  },
  "dong-khoi-1960": {
    dir: "dong-khoi-1960",
    config: () => import("./dong-khoi-1960/scene.config"),
    scene: () => import("./dong-khoi-1960/scene"),
  },
  "cuc-phuong-1962": {
    dir: "cuc-phuong-1962",
    config: () => import("./cuc-phuong-1962/scene.config"),
    scene: () => import("./cuc-phuong-1962/scene"),
  },
  "tau-khong-so-1962": {
    dir: "tau-khong-so-1962",
    config: () => import("./tau-khong-so-1962/scene.config"),
    scene: () => import("./tau-khong-so-1962/scene"),
  },
  "vinh-moc-1965": {
    dir: "vinh-moc-1965",
    config: () => import("./vinh-moc-1965/scene.config"),
    scene: () => import("./vinh-moc-1965/scene"),
  },
  "hiep-dinh-paris-1973": {
    dir: "hiep-dinh-paris-1973",
    config: () => import("./hiep-dinh-paris-1973/scene.config"),
    scene: () => import("./hiep-dinh-paris-1973/scene"),
  },
  "olympic-toan-1974": {
    dir: "olympic-toan-1974",
    config: () => import("./olympic-toan-1974/scene.config"),
    scene: () => import("./olympic-toan-1974/scene"),
  },
  "lang-chu-tich-1975": {
    dir: "lang-chu-tich-1975",
    config: () => import("./lang-chu-tich-1975/scene.config"),
    scene: () => import("./lang-chu-tich-1975/scene"),
  },
  "thong-nhat-1975": {
    dir: "thong-nhat-1975",
    config: () => import("./thong-nhat-1975/scene.config"),
    scene: () => import("./thong-nhat-1975/scene"),
  },
  "quoc-hieu-1976": {
    dir: "quoc-hieu-1976",
    config: () => import("./quoc-hieu-1976/scene.config"),
    scene: () => import("./quoc-hieu-1976/scene"),
  },
  "thuy-dien-hoa-binh-1979": {
    dir: "thuy-dien-hoa-binh-1979",
    config: () => import("./thuy-dien-hoa-binh-1979/scene.config"),
    scene: () => import("./thuy-dien-hoa-binh-1979/scene"),
  },
  "dang-thai-son-1980": {
    dir: "dang-thai-son-1980",
    config: () => import("./dang-thai-son-1980/scene.config"),
    scene: () => import("./dang-thai-son-1980/scene"),
  },
  "pham-tuan-1980": {
    dir: "pham-tuan-1980",
    config: () => import("./pham-tuan-1980/scene.config"),
    scene: () => import("./pham-tuan-1980/scene"),
  },
  "cau-thang-long-1985": {
    dir: "cau-thang-long-1985",
    config: () => import("./cau-thang-long-1985/scene.config"),
    scene: () => import("./cau-thang-long-1985/scene"),
  },
  "dau-tho-1986": {
    dir: "dau-tho-1986",
    config: () => import("./dau-tho-1986/scene.config"),
    scene: () => import("./dau-tho-1986/scene"),
  },
  "doi-moi-1986": {
    dir: "doi-moi-1986",
    config: () => import("./doi-moi-1986/scene.config"),
    scene: () => import("./doi-moi-1986/scene"),
  },
  "thuy-dien-tri-an-1988": {
    dir: "thuy-dien-tri-an-1988",
    config: () => import("./thuy-dien-tri-an-1988/scene.config"),
    scene: () => import("./thuy-dien-tri-an-1988/scene"),
  },
  "xuan-thuy-1989": {
    dir: "xuan-thuy-1989",
    config: () => import("./xuan-thuy-1989/scene.config"),
    scene: () => import("./xuan-thuy-1989/scene"),
  },
  "ba-be-1992": {
    dir: "ba-be-1992",
    config: () => import("./ba-be-1992/scene.config"),
    scene: () => import("./ba-be-1992/scene"),
  },
  "co-do-hue-1993": {
    dir: "co-do-hue-1993",
    config: () => import("./co-do-hue-1993/scene.config"),
    scene: () => import("./co-do-hue-1993/scene"),
  },
  "duong-day-500kv-1994": {
    dir: "duong-day-500kv-1994",
    config: () => import("./duong-day-500kv-1994/scene.config"),
    scene: () => import("./duong-day-500kv-1994/scene"),
  },
  "ha-long-1994": {
    dir: "ha-long-1994",
    config: () => import("./ha-long-1994/scene.config"),
    scene: () => import("./ha-long-1994/scene"),
  },
  "asean-1995": {
    dir: "asean-1995",
    config: () => import("./asean-1995/scene.config"),
    scene: () => import("./asean-1995/scene"),
  },
  "viet-my-1995": {
    dir: "viet-my-1995",
    config: () => import("./viet-my-1995/scene.config"),
    scene: () => import("./viet-my-1995/scene"),
  },
  "internet-1997": {
    dir: "internet-1997",
    config: () => import("./internet-1997/scene.config"),
    scene: () => import("./internet-1997/scene"),
  },
  "my-son-hoi-an-1999": {
    dir: "my-son-hoi-an-1999",
    config: () => import("./my-son-hoi-an-1999/scene.config"),
    scene: () => import("./my-son-hoi-an-1999/scene"),
  },
  "can-gio-2000": {
    dir: "can-gio-2000",
    config: () => import("./can-gio-2000/scene.config"),
    scene: () => import("./can-gio-2000/scene"),
  },
  "cau-my-thuan-2000": {
    dir: "cau-my-thuan-2000",
    config: () => import("./cau-my-thuan-2000/scene.config"),
    scene: () => import("./cau-my-thuan-2000/scene"),
  },
  "tran-hieu-ngan-2000": {
    dir: "tran-hieu-ngan-2000",
    config: () => import("./tran-hieu-ngan-2000/scene.config"),
    scene: () => import("./tran-hieu-ngan-2000/scene"),
  },
  "nha-nhac-2003": {
    dir: "nha-nhac-2003",
    config: () => import("./nha-nhac-2003/scene.config"),
    scene: () => import("./nha-nhac-2003/scene"),
  },
  "phong-nha-2003": {
    dir: "phong-nha-2003",
    config: () => import("./phong-nha-2003/scene.config"),
    scene: () => import("./phong-nha-2003/scene"),
  },
  "sea-games-2003": {
    dir: "sea-games-2003",
    config: () => import("./sea-games-2003/scene.config"),
    scene: () => import("./sea-games-2003/scene"),
  },
  "cat-ba-2004": {
    dir: "cat-ba-2004",
    config: () => import("./cat-ba-2004/scene.config"),
    scene: () => import("./cat-ba-2004/scene"),
  },
  "cong-chieng-2005": {
    dir: "cong-chieng-2005",
    config: () => import("./cong-chieng-2005/scene.config"),
    scene: () => import("./cong-chieng-2005/scene"),
  },
  "ham-hai-van-2005": {
    dir: "ham-hai-van-2005",
    config: () => import("./ham-hai-van-2005/scene.config"),
    scene: () => import("./ham-hai-van-2005/scene"),
  },
  "apec-2006": {
    dir: "apec-2006",
    config: () => import("./apec-2006/scene.config"),
    scene: () => import("./apec-2006/scene"),
  },
  "wto-2007": {
    dir: "wto-2007",
    config: () => import("./wto-2007/scene.config"),
    scene: () => import("./wto-2007/scene"),
  },
  "aff-cup-2008": {
    dir: "aff-cup-2008",
    config: () => import("./aff-cup-2008/scene.config"),
    scene: () => import("./aff-cup-2008/scene"),
  },
  "vinasat-2008": {
    dir: "vinasat-2008",
    config: () => import("./vinasat-2008/scene.config"),
    scene: () => import("./vinasat-2008/scene"),
  },
  "ca-tru-2009": {
    dir: "ca-tru-2009",
    config: () => import("./ca-tru-2009/scene.config"),
    scene: () => import("./ca-tru-2009/scene"),
  },
  "cu-lao-cham-2009": {
    dir: "cu-lao-cham-2009",
    config: () => import("./cu-lao-cham-2009/scene.config"),
    scene: () => import("./cu-lao-cham-2009/scene"),
  },
  "dung-quat-2009": {
    dir: "dung-quat-2009",
    config: () => import("./dung-quat-2009/scene.config"),
    scene: () => import("./dung-quat-2009/scene"),
  },
  "moc-ban-2009": {
    dir: "moc-ban-2009",
    config: () => import("./moc-ban-2009/scene.config"),
    scene: () => import("./moc-ban-2009/scene"),
  },
  "quan-ho-2009": {
    dir: "quan-ho-2009",
    config: () => import("./quan-ho-2009/scene.config"),
    scene: () => import("./quan-ho-2009/scene"),
  },
  "son-doong-2009": {
    dir: "son-doong-2009",
    config: () => import("./son-doong-2009/scene.config"),
    scene: () => import("./son-doong-2009/scene"),
  },
  "bia-tien-si-2010": {
    dir: "bia-tien-si-2010",
    config: () => import("./bia-tien-si-2010/scene.config"),
    scene: () => import("./bia-tien-si-2010/scene"),
  },
  "cau-can-tho-2010": {
    dir: "cau-can-tho-2010",
    config: () => import("./cau-can-tho-2010/scene.config"),
    scene: () => import("./cau-can-tho-2010/scene"),
  },
  "dong-van-2010": {
    dir: "dong-van-2010",
    config: () => import("./dong-van-2010/scene.config"),
    scene: () => import("./dong-van-2010/scene"),
  },
  "hoang-thanh-thang-long-2010": {
    dir: "hoang-thanh-thang-long-2010",
    config: () => import("./hoang-thanh-thang-long-2010/scene.config"),
    scene: () => import("./hoang-thanh-thang-long-2010/scene"),
  },
  "ngo-bao-chau-2010": {
    dir: "ngo-bao-chau-2010",
    config: () => import("./ngo-bao-chau-2010/scene.config"),
    scene: () => import("./ngo-bao-chau-2010/scene"),
  },
  "hat-xoan-2011": {
    dir: "hat-xoan-2011",
    config: () => import("./hat-xoan-2011/scene.config"),
    scene: () => import("./hat-xoan-2011/scene"),
  },
  "hung-vuong-2012": {
    dir: "hung-vuong-2012",
    config: () => import("./hung-vuong-2012/scene.config"),
    scene: () => import("./hung-vuong-2012/scene"),
  },
  "moc-ban-vinh-nghiem-2012": {
    dir: "moc-ban-vinh-nghiem-2012",
    config: () => import("./moc-ban-vinh-nghiem-2012/scene.config"),
    scene: () => import("./moc-ban-vinh-nghiem-2012/scene"),
  },
  "thuy-dien-son-la-2012": {
    dir: "thuy-dien-son-la-2012",
    config: () => import("./thuy-dien-son-la-2012/scene.config"),
    scene: () => import("./thuy-dien-son-la-2012/scene"),
  },
  "cau-rong-2013": {
    dir: "cau-rong-2013",
    config: () => import("./cau-rong-2013/scene.config"),
    scene: () => import("./cau-rong-2013/scene"),
  },
  "don-ca-tai-tu-2013": {
    dir: "don-ca-tai-tu-2013",
    config: () => import("./don-ca-tai-tu-2013/scene.config"),
    scene: () => import("./don-ca-tai-tu-2013/scene"),
  },
  "hien-phap-2013": {
    dir: "hien-phap-2013",
    config: () => import("./hien-phap-2013/scene.config"),
    scene: () => import("./hien-phap-2013/scene"),
  },
  "vnredsat-2013": {
    dir: "vnredsat-2013",
    config: () => import("./vnredsat-2013/scene.config"),
    scene: () => import("./vnredsat-2013/scene"),
  },
  "chau-ban-2014": {
    dir: "chau-ban-2014",
    config: () => import("./chau-ban-2014/scene.config"),
    scene: () => import("./chau-ban-2014/scene"),
  },
  "trang-an-2014": {
    dir: "trang-an-2014",
    config: () => import("./trang-an-2014/scene.config"),
    scene: () => import("./trang-an-2014/scene"),
  },
  "vi-giam-2014": {
    dir: "vi-giam-2014",
    config: () => import("./vi-giam-2014/scene.config"),
    scene: () => import("./vi-giam-2014/scene"),
  },
  "cau-nhat-tan-2015": {
    dir: "cau-nhat-tan-2015",
    config: () => import("./cau-nhat-tan-2015/scene.config"),
    scene: () => import("./cau-nhat-tan-2015/scene"),
  },
  "keo-co-2015": {
    dir: "keo-co-2015",
    config: () => import("./keo-co-2015/scene.config"),
    scene: () => import("./keo-co-2015/scene"),
  },
  "hoang-xuan-vinh-2016": {
    dir: "hoang-xuan-vinh-2016",
    config: () => import("./hoang-xuan-vinh-2016/scene.config"),
    scene: () => import("./hoang-xuan-vinh-2016/scene"),
  },
  "tho-mau-2016": {
    dir: "tho-mau-2016",
    config: () => import("./tho-mau-2016/scene.config"),
    scene: () => import("./tho-mau-2016/scene"),
  },
  "bai-choi-2017": {
    dir: "bai-choi-2017",
    config: () => import("./bai-choi-2017/scene.config"),
    scene: () => import("./bai-choi-2017/scene"),
  },
  "tan-vu-lach-huyen-2017": {
    dir: "tan-vu-lach-huyen-2017",
    config: () => import("./tan-vu-lach-huyen-2017/scene.config"),
    scene: () => import("./tan-vu-lach-huyen-2017/scene"),
  },
  "non-nuoc-cao-bang-2018": {
    dir: "non-nuoc-cao-bang-2018",
    config: () => import("./non-nuoc-cao-bang-2018/scene.config"),
    scene: () => import("./non-nuoc-cao-bang-2018/scene"),
  },
  "thuong-chau-2018": {
    dir: "thuong-chau-2018",
    config: () => import("./thuong-chau-2018/scene.config"),
    scene: () => import("./thuong-chau-2018/scene"),
  },
  "dak-nong-2020": {
    dir: "dak-nong-2020",
    config: () => import("./dak-nong-2020/scene.config"),
    scene: () => import("./dak-nong-2020/scene"),
  },
  "xoe-thai-2021": {
    dir: "xoe-thai-2021",
    config: () => import("./xoe-thai-2021/scene.config"),
    scene: () => import("./xoe-thai-2021/scene"),
  },
  "gom-cham-2022": {
    dir: "gom-cham-2022",
    config: () => import("./gom-cham-2022/scene.config"),
    scene: () => import("./gom-cham-2022/scene"),
  },
  "world-cup-nu-2023": {
    dir: "world-cup-nu-2023",
    config: () => import("./world-cup-nu-2023/scene.config"),
    scene: () => import("./world-cup-nu-2023/scene"),
  },
  "ba-chua-xu-2024": {
    dir: "ba-chua-xu-2024",
    config: () => import("./ba-chua-xu-2024/scene.config"),
    scene: () => import("./ba-chua-xu-2024/scene"),
  },
  "metro-so-1-2024": {
    dir: "metro-so-1-2024",
    config: () => import("./metro-so-1-2024/scene.config"),
    scene: () => import("./metro-so-1-2024/scene"),
  },
};
