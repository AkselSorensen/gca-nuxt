#!/usr/bin/env python3
"""Extrait les PDFs juridiques GSA en markdown structuré (headings détectés par
taille de police + gras) vers content/legal/*.md

Usage: python scripts/extract_legal.py
"""
import os
import re
import sys

import pymupdf  # type: ignore

BASE = r"C:\Users\azrae\Downloads\mentions légales\mentions légale"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'content', 'legal')

DOCS = [
    ('Mentions légales/Mentions Légales GSA (1).pdf', 'mentions-legales'),
    ('CGU GSA.pdf', 'cgu'),
    ('CGV GSA.pdf', 'cgv'),
    ('GSA — CONTRAT VENDEUR.pdf', 'contrat-vendeur'),
    ('GSA — POLITIQUE DE RÉTRACTATION, REMBOURSEMENT ET RÉCLAMATIONS.pdf', 'retractation'),
    ('Politique conf.pdf', 'confidentialite'),
    ('Politique cookies.pdf', 'cookies'),
]


def span_to_text(span: dict) -> str:
    return span.get('text', '')


def extract_md(path: str) -> str:
    doc = pymupdf.open(path)
    lines: list[str] = []
    for page in doc:
        d = page.get_text('dict')
        for block in d.get('blocks', []):
            if block.get('type') != 0:
                continue
            for line in block.get('lines', []):
                spans = line.get('spans', [])
                if not spans:
                    continue
                text = ''.join(s.get('text', '') for s in spans).strip()
                if not text:
                    continue
                # Taille max + gras de la ligne
                sizes = [s.get('size', 0) for s in spans]
                bold_flags = [bool(s.get('flags', 0) & 16) for s in spans]
                max_size = max(sizes)
                is_bold = all(bold_flags) and len(bold_flags) > 0
                body_size = max(sizes)  # approx
                # Détection heading : plus gros que le corps OU gras + court
                if max_size >= 13.5:
                    level = '#' if max_size >= 16 else '##'
                    lines.append(f'{level} {text}')
                elif is_bold and len(text) < 90 and re.match(r'^(Article|Section|\d+\.|Préambule|[IVX]+)', text):
                    lines.append(f'### {text}')
                else:
                    lines.append(text)
    doc.close()
    # Assemble les paragraphes (une ligne = paragraphe dans ces PDFs)
    md: list[str] = []
    for ln in lines:
        if ln.startswith('#'):
            md.append('\n' + ln + '\n')
        elif re.match(r'^[-•◦]', ln):
            md.append('- ' + ln.lstrip('-•◦ ').strip())
        else:
            md.append(ln)
    return '\n'.join(md)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for rel, slug in DOCS:
        src = os.path.join(BASE, rel)
        if not os.path.exists(src):
            print(f'  MANQUANT: {rel}')
            continue
        md = extract_md(src)
        dest = os.path.join(OUT, f'{slug}.md')
        with open(dest, 'w', encoding='utf-8') as f:
            f.write(md)
        print(f'  {slug}.md — {len(md.splitlines())} lignes, {len(md)//1024} Ko')
    print('Terminé.')


if __name__ == '__main__':
    main()
