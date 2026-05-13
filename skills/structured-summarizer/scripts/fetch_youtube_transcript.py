from __future__ import annotations

import argparse
import html
import json
import os
import pathlib
import re
import subprocess
import sys
import urllib.request
from types import ModuleType
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

PREFERRED_EXTS: Sequence[str] = ("json3", "vtt", "srt", "srv3", "srv2", "srv1", "ttml")
_LOCAL_VENV_RELATIVE = pathlib.Path("tmp") / "structured-summarizer" / ".venv"
_YT_DLP_MODULE: Optional[ModuleType] = None


def workspace_root() -> pathlib.Path:
    return pathlib.Path(__file__).resolve().parents[3]


def default_out_dir() -> pathlib.Path:
    return workspace_root() / "tmp" / "structured-summarizer"


def local_venv_dir() -> pathlib.Path:
    return workspace_root() / _LOCAL_VENV_RELATIVE


def local_venv_python() -> pathlib.Path:
    venv = local_venv_dir()
    candidates = (venv / "bin" / "python3", venv / "bin" / "python")
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


def ensure_local_yt_dlp_runtime() -> pathlib.Path:
    venv_dir = local_venv_dir()
    venv_python = local_venv_python()

    if not venv_python.exists():
        venv_dir.mkdir(parents=True, exist_ok=True)
        print(
            f"INFO: Creating persistent venv for yt-dlp at {venv_dir}",
            file=sys.stderr,
        )
        subprocess.run(
            [sys.executable, "-m", "venv", str(venv_dir)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        venv_python = local_venv_python()

    probe = subprocess.run(
        [str(venv_python), "-c", "import yt_dlp"],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if probe.returncode != 0:
        print(
            "INFO: Installing yt-dlp into persistent venv (one-time setup)",
            file=sys.stderr,
        )
        subprocess.run(
            [str(venv_python), "-m", "pip", "install", "yt-dlp"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    return venv_python


def get_yt_dlp_module() -> ModuleType:
    global _YT_DLP_MODULE
    if _YT_DLP_MODULE is not None:
        return _YT_DLP_MODULE

    try:
        import yt_dlp as loaded_module

        _YT_DLP_MODULE = loaded_module
        return loaded_module
    except ImportError:
        pass

    try:
        venv_python = ensure_local_yt_dlp_runtime()
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(
            "Unable to prepare persistent yt-dlp runtime in workspace/tmp/structured-summarizer/.venv"
        ) from exc

    current_python = pathlib.Path(sys.executable).expanduser().absolute()
    target_python = venv_python.expanduser().absolute()
    if current_python != target_python:
        script_path = pathlib.Path(__file__).resolve()
        os.execv(
            str(target_python),
            [str(target_python), str(script_path), *sys.argv[1:]],
        )

    try:
        import yt_dlp as loaded_module

        _YT_DLP_MODULE = loaded_module
        return loaded_module
    except ImportError as exc:
        raise RuntimeError(
            f"yt-dlp is unavailable in persistent runtime {target_python}"
        ) from exc


def slugify(value: str, max_len: int = 64) -> str:
    lowered = value.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", lowered)
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    if not slug:
        return "video"
    return slug[:max_len].rstrip("-") or "video"


def unique_path(path: pathlib.Path) -> pathlib.Path:
    if not path.exists():
        return path

    stem = path.stem
    suffix = path.suffix
    index = 2
    while True:
        candidate = path.with_name(f"{stem}-{index}{suffix}")
        if not candidate.exists():
            return candidate
        index += 1


def parse_langs(raw: str) -> List[str]:
    langs: List[str] = []
    for item in raw.split(","):
        lang = item.strip()
        if lang:
            langs.append(lang)
    return langs or ["ru", "en", "en-orig"]


def lang_matches(available: str, requested: str) -> bool:
    a = available.lower().replace("_", "-")
    r = requested.lower().replace("_", "-")
    return a == r or a.startswith(r + "-") or r.startswith(a + "-")


def ordered_lang_keys(pool: Dict[str, List[dict]], requested_langs: Sequence[str]) -> Iterable[str]:
    seen = set()

    for requested in requested_langs:
        for key in pool.keys():
            if lang_matches(key, requested) and key not in seen:
                seen.add(key)
                yield key

    for key in pool.keys():
        if key not in seen:
            seen.add(key)
            yield key


def pick_format_entry(entries: Sequence[dict]) -> Optional[dict]:
    if not entries:
        return None

    for ext in PREFERRED_EXTS:
        for entry in entries:
            if entry.get("ext") == ext and entry.get("url"):
                return entry

    for entry in entries:
        if entry.get("url"):
            return entry

    return None


def iter_subtitle_tracks(
    info: dict,
    requested_langs: Sequence[str],
    prefer_automatic: bool,
) -> List[Tuple[str, str, dict]]:
    subtitles = info.get("subtitles") or {}
    automatic = info.get("automatic_captions") or {}

    pools: List[Tuple[str, Dict[str, List[dict]]]]
    if prefer_automatic:
        pools = [("automatic_captions", automatic), ("subtitles", subtitles)]
    else:
        pools = [("subtitles", subtitles), ("automatic_captions", automatic)]

    tracks: List[Tuple[str, str, dict]] = []
    seen_urls = set()

    for source_name, pool in pools:
        if not pool:
            continue
        for lang_key in ordered_lang_keys(pool, requested_langs):
            entry = pick_format_entry(pool.get(lang_key) or [])
            if entry:
                url = entry.get("url")
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)
                tracks.append((source_name, lang_key, entry))

    return tracks


def download_text(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; yt-sub-fetch/1.0)"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def dedupe_adjacent(lines: Iterable[str]) -> List[str]:
    out: List[str] = []
    prev: Optional[str] = None

    for line in lines:
        normalized = re.sub(r"\s+", " ", line).strip()
        if not normalized:
            continue

        if prev and normalized.casefold() == prev.casefold():
            continue

        out.append(normalized)
        prev = normalized

    return out


def strip_markup(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    return text


def parse_json3(raw: str) -> List[str]:
    data = json.loads(raw)
    lines: List[str] = []

    for event in data.get("events", []):
        segments = event.get("segs") or []
        text = "".join(segment.get("utf8", "") for segment in segments)
        text = text.replace("\n", " ")
        text = strip_markup(text)
        if text.strip():
            lines.append(text)

    return dedupe_adjacent(lines)


def parse_vtt_like(raw: str) -> List[str]:
    lines: List[str] = []

    for row in raw.replace("\r", "").split("\n"):
        text = row.strip()
        if not text:
            continue
        if text.startswith("WEBVTT"):
            continue
        if text.startswith(("Kind:", "Language:", "NOTE", "STYLE", "REGION")):
            continue
        if "-->" in text:
            continue
        if re.fullmatch(r"\d+", text):
            continue
        if re.match(r"^\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3}$", text):
            continue

        text = strip_markup(text)
        if text.strip():
            lines.append(text)

    return dedupe_adjacent(lines)


def parse_loose_xml_like(raw: str) -> List[str]:
    text = strip_markup(raw)
    rows = [line.strip() for line in text.splitlines()]
    cleaned: List[str] = []

    for row in rows:
        if not row:
            continue
        if "-->" in row:
            continue
        if re.fullmatch(r"\d+", row):
            continue
        cleaned.append(row)

    return dedupe_adjacent(cleaned)


def to_transcript_lines(raw: str, ext: str) -> List[str]:
    ext = (ext or "").lower()
    if ext == "json3":
        return parse_json3(raw)
    if ext in {"vtt", "srt"}:
        return parse_vtt_like(raw)
    return parse_loose_xml_like(raw)


def extract_video_info(url: str) -> dict:
    yt_dlp_module = get_yt_dlp_module()
    options = {
        "skip_download": True,
        "quiet": True,
        "no_warnings": True,
    }

    with yt_dlp_module.YoutubeDL(options) as ydl:
        info = ydl.extract_info(url, download=False)

    if info.get("_type") == "playlist":
        entries = info.get("entries") or []
        if entries:
            return entries[0]

    return info


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Fetch YouTube subtitles using yt-dlp Python library and save transcript."
    )
    parser.add_argument("url", help="YouTube URL")
    parser.add_argument(
        "--langs",
        default="ru,en,en-orig",
        help="Preferred languages, comma-separated (default: ru,en,en-orig)",
    )
    parser.add_argument(
        "--out-dir",
        default=str(default_out_dir()),
        help="Output directory for subtitles and transcript",
    )
    parser.add_argument(
        "--prefer-automatic",
        action="store_true",
        help="Prefer automatic captions over manual subtitles",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print JSON result instead of only transcript path",
    )
    args = parser.parse_args()

    out_dir = pathlib.Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    try:
        info = extract_video_info(args.url)
        requested_langs = parse_langs(args.langs)

        tracks = iter_subtitle_tracks(
            info=info,
            requested_langs=requested_langs,
            prefer_automatic=args.prefer_automatic,
        )
        if not tracks:
            available_subs = sorted((info.get("subtitles") or {}).keys())
            available_auto = sorted((info.get("automatic_captions") or {}).keys())
            print(
                "ERROR: No subtitles found for this video. "
                f"subtitles={available_subs}, automatic_captions={available_auto}",
                file=sys.stderr,
            )
            return 1

        selected: Optional[Tuple[str, str, str, str, List[str]]] = None
        errors: List[str] = []

        for source_kind, language, track_entry in tracks:
            subtitle_ext = (track_entry.get("ext") or "txt").lower()
            subtitle_url = track_entry.get("url")
            if not subtitle_url:
                errors.append(f"{source_kind}:{language}:{subtitle_ext}:missing_url")
                continue

            try:
                raw_subtitle = download_text(subtitle_url)
                transcript_lines = to_transcript_lines(raw_subtitle, subtitle_ext)
                if not transcript_lines:
                    errors.append(f"{source_kind}:{language}:{subtitle_ext}:empty_transcript")
                    continue
                selected = (source_kind, language, subtitle_ext, raw_subtitle, transcript_lines)
                break
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{source_kind}:{language}:{subtitle_ext}:{exc}")

        if not selected:
            detail = "; ".join(errors) if errors else "no track succeeded"
            print(f"ERROR: Failed to download subtitles. {detail}", file=sys.stderr)
            return 1

        source_kind, language, subtitle_ext, raw_subtitle, transcript_lines = selected
        transcript_text = "\n".join(transcript_lines).strip() + "\n"

        video_id = info.get("id") or "video"
        title = info.get("title") or video_id
        title_slug = slugify(title)
        lang_slug = slugify(language, max_len=24)
        stem = f"{video_id}-{title_slug}-{lang_slug}"

        subtitle_path = unique_path(out_dir / f"{stem}.{subtitle_ext}")
        transcript_path = unique_path(out_dir / f"{stem}.transcript.txt")
        metadata_path = unique_path(out_dir / f"{stem}.meta.json")

        subtitle_path.write_text(raw_subtitle, encoding="utf-8")
        transcript_path.write_text(transcript_text, encoding="utf-8")

        metadata = {
            "video_id": video_id,
            "title": title,
            "url": args.url,
            "language": language,
            "source_kind": source_kind,
            "subtitle_ext": subtitle_ext,
            "subtitle_path": str(subtitle_path),
            "transcript_path": str(transcript_path),
            "line_count": len(transcript_lines),
        }
        metadata_path.write_text(
            json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

        if args.json:
            payload = dict(metadata)
            payload["metadata_path"] = str(metadata_path)
            print(json.dumps(payload, ensure_ascii=False))
        else:
            print(str(transcript_path))

        return 0
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
