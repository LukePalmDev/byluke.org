#!/usr/bin/env python3
"""Rebuild the no-JS project cards in index.html from projects.json.

GitHub Pages publishes this repository as static files, so the cards have to
be in the HTML itself. app.js still replaces them when it can load the JSON.
"""

import html
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
PROJECTS = ROOT / "projects.json"
START = "<!-- projects:start -->"
END = "<!-- projects:end -->"


def esc(value):
    return html.escape(str(value), quote=True)


def description(project):
    text = project.get("description") or ""
    if isinstance(text, dict):
        return text.get("it") or text.get("en") or ""
    return text


def line(level, text):
    return ("  " * level) + text


def card_lines(project):
    lines = [
        line(6, '<article class="card">'),
        line(7, '<div class="card-top">'),
        line(8, f"<h3>{esc(project['name'])}</h3>"),
    ]
    tags = project.get("tags") or []
    if tags:
        lines.append(line(8, '<ul class="tags">'))
        lines.extend(line(9, f"<li>{esc(tag)}</li>") for tag in tags)
        lines.append(line(8, "</ul>"))
    lines.append(line(7, "</div>"))
    lines.append(line(7, f"<p>{esc(description(project))}</p>"))
    lines.append(line(7, '<p class="card-links">'))
    live = project.get("liveUrl")
    if live:
        lines.append(
            line(8, f'<a class="link-live" href="{esc(live)}">Sito</a>')
        )
    lines.append(
        line(8, f'<a class="link-repo" href="{esc(project["repoUrl"])}">GitHub</a>')
    )
    lines.extend(
        [
            line(7, "</p>"),
            line(6, "</article>"),
        ]
    )
    return lines


def section_lines(heading_id, title, lead, projects):
    lines = [
        line(4, f'<section class="group" aria-labelledby="{heading_id}">'),
        line(5, '<div class="group-head">'),
        line(6, f'<h2 id="{heading_id}">{esc(title)}</h2>'),
        line(6, f'<span class="count">{len(projects)}</span>'),
        line(6, f"<p>{esc(lead)}</p>"),
        line(5, "</div>"),
        line(5, '<div class="grid">'),
    ]
    for project in projects:
        lines.extend(card_lines(project))
    lines.extend([line(5, "</div>"), line(4, "</section>")])
    return lines


def render(projects):
    sites = [project for project in projects if project.get("liveUrl")]
    code = [project for project in projects if not project.get("liveUrl")]
    lines = []
    if sites:
        lines.extend(
            section_lines(
                "heading-sites",
                "Siti",
                "Pubblicati su GitHub Pages.",
                sites,
            )
        )
    if code:
        if lines:
            lines.append("")
        lines.extend(
            section_lines(
                "heading-code",
                "Codice",
                "Senza sito pubblico: solo il repository.",
                code,
            )
        )
    return "\n".join(lines)


def splice(document, block):
    start = document.find(START)
    end = document.find(END)
    if start < 0 or end < 0 or end < start:
        raise SystemExit("index.html is missing project markers")
    before = document[: start + len(START)]
    after = document[end:]
    return before + "\n" + block + "\n        " + after


def main():
    projects = json.loads(PROJECTS.read_text(encoding="utf-8"))
    if not isinstance(projects, list) or not projects:
        raise SystemExit("projects.json must be a non-empty array")
    updated = splice(INDEX.read_text(encoding="utf-8"), render(projects))
    if "--check" in sys.argv:
        if updated != INDEX.read_text(encoding="utf-8"):
            raise SystemExit("index.html is stale. Run python3 scripts/prerender.py")
        return
    INDEX.write_text(updated, encoding="utf-8")


if __name__ == "__main__":
    main()
