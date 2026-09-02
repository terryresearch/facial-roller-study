#!/usr/bin/env python3
"""Inline src/ into the single-file index.html that GitHub Pages serves."""
import pathlib
src = pathlib.Path(__file__).parent / "src"
html = (src / "index.html").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="study.css">',
                    "<style>\n" + (src / "study.css").read_text(encoding="utf-8") + "\n</style>")
html = html.replace(
    '<script src="config.js"></script>\n<script src="roller.js"></script>\n'
    '<script src="measures.js"></script>\n<script src="study.js"></script>',
    "<script>\n" + (src / "config.js").read_text(encoding="utf-8") + "\n</script>\n\n"
    "<script>\n" + (src / "roller.js").read_text(encoding="utf-8") + "\n</script>\n\n"
    "<script>\n" + (src / "measures.js").read_text(encoding="utf-8") + "\n</script>\n\n"
    "<script>\n" + (src / "study.js").read_text(encoding="utf-8") + "\n</script>")
out = pathlib.Path(__file__).parent / "index.html"
out.write_text(html, encoding="utf-8")
print("wrote", out, len(html), "bytes")
