#!/usr/bin/env python3
"""index.html の css/js の ?v= を、中身のハッシュに合わせて書きかえる。

GitHub Pages は max-age=600 で配信するので、更新直後に古い css/js を
つかんだままの端末が出る。とくに新しい html と古い js の組み合わせは
壊れ方が読めないので、中身が変わったら URL も変えて必ず取り直させる。

    python3 stamp.py     # 変更を反映（push する前に実行する）
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
ASSETS = {"styles.css": r'(href="styles\.css)(\?v=[0-9a-f]+)?(")',
          "app.js": r'(src="app\.js)(\?v=[0-9a-f]+)?(")'}

html_path = ROOT / "index.html"
html = html_path.read_text(encoding="utf-8")
changed = []

for name, pattern in ASSETS.items():
    digest = hashlib.sha256((ROOT / name).read_bytes()).hexdigest()[:8]
    html, count = re.subn(pattern, rf'\g<1>?v={digest}\g<3>', html)
    if not count:
        raise SystemExit(f"index.html に {name} の参照が見つかりません")
    changed.append(f"{name} -> {digest}")

html_path.write_text(html, encoding="utf-8")
print("\n".join(changed))
