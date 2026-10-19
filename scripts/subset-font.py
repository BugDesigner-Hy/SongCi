"""把完整的京華老宋体裁成网页用的子集（woff2）。

用法：
    python scripts/subset-font.py <完整字体.ttf> [输出路径]

子集包含：ASCII、常用中文标点与全角符号、GB2312 全部汉字（6763 个），
以及项目源码和词库里实际出现的所有字符；顺带保留竖排需要的 vert/vrt2 等特性。
字形不做改动，只是去掉用不到的，字体授权仍按原作者的声明。
"""

import json
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "src" / "assets" / "songti.woff2"

# 竖排标点要靠 vert / vrt2 换字形，竖排字距与避头尾靠 vpal / vhal
KEEP_FEATURES = ["vert", "vrt2", "vpal", "vhal", "kern", "liga", "ccmp", "locl"]


def gb2312_hanzi() -> set[str]:
    chars = set()
    for high in range(0xB0, 0xF8):
        for low in range(0xA1, 0xFF):
            try:
                chars.add(bytes([high, low]).decode("gb2312"))
            except UnicodeDecodeError:
                continue
    return chars


def project_chars() -> set[str]:
    chars = set()
    for pattern in ("src/**/*.vue", "src/**/*.js", "src/**/*.css", "*.html", "*.md"):
        for path in ROOT.glob(pattern):
            chars |= set(path.read_text(encoding="utf-8"))
    data = json.loads((ROOT / "public" / "data" / "library.json").read_text(encoding="utf-8"))
    for items in data.values():
        for item in items:
            chars |= set(item["t"]) | set(item["a"]) | set("".join(item["p"]))
    return {ch for ch in chars if ord(ch) >= 0x2E80}


def build_charset() -> set[str]:
    chars = {chr(code) for code in range(0x20, 0x7F)}  # ASCII
    chars |= {chr(code) for code in range(0x3000, 0x3040)}  # 中文标点
    chars |= {chr(code) for code in range(0xFF01, 0xFF5F)}  # 全角符号
    chars |= {chr(code) for code in range(0x2010, 0x2030)}  # 引号、破折号、省略号
    chars |= gb2312_hanzi()
    chars |= project_chars()
    return chars


def check(out: Path, chars: set[str]) -> None:
    font = TTFont(out, lazy=True)
    cmap = font.getBestCmap()
    missing = sorted(ch for ch in chars if ord(ch) not in cmap)
    print(f"子集 cmap {len(cmap)} 个码位，缺字 {len(missing)} 个")
    if missing:
        print("缺失码位：" + " ".join(f"U+{ord(ch):04X}" for ch in missing[:40]))
    print("特性表：" + ", ".join(tag for tag in ("GSUB", "GPOS") if tag in font))


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    source = Path(sys.argv[1])
    target = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT
    if not source.is_file():
        print(f"找不到字体：{source}")
        return 1

    chars = build_charset()
    options = subset.Options()
    options.flavor = "woff2"
    options.hinting = False
    options.layout_features = KEEP_FEATURES
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.recalc_bounds = True
    options.drop_tables = ["DSIG"]

    font = subset.load_font(str(source), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=[ord(ch) for ch in chars])
    subsetter.subset(font)

    target.parent.mkdir(parents=True, exist_ok=True)
    subset.save_font(font, str(target), options)

    before = source.stat().st_size
    after = target.stat().st_size
    print(f"字符数 {len(chars)}")
    print(f"{source.name}: {before / 1024 / 1024:.2f} MB")
    print(f"{target.name}: {after / 1024 / 1024:.2f} MB  （压缩到 {after / before:.1%}）")
    check(target, chars)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
