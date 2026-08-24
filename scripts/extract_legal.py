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
                sizes = [s.get('size', 0) for s in spans]
                bold_flags = [bool(s.get('flags', 0) & 16) for s in spans]
                max_size = max(sizes)
                is_bold = all(bold_flags) and len(bold_flags) > 0
                # Détection heading : taille >= 13.5 OU (gras + motif titre)
                if max_size >= 13.5:
                    level = '#' if max_size >= 16 else '##'
                    lines.append(f'{level} {text}')
                elif is_bold and re.match(r'^(Article|Section|Préambule|Annexe|[IVX]+(\.|\b)|[A-Z][A-ZÀ-Ü\s]{3,})', text) and len(text) < 90:
                    lines.append(f'### {text}')
                elif re.match(r'^\d+(\.\d+)?\.\s+[A-ZÀ-Ü]', text) and len(text) < 100:
                    # Titres numérotés (TOC + sections) : 1., 3.1, 10. ...
                    lines.append(f'### {text}')
                else:
                    lines.append(text)
    doc.close()
    # Assemble : regroupe les lignes consécutives en paragraphes (une ligne de
    # PDF justifié = une ligne d'écran, pas un paragraphe !)
    md: list[str] = []
    para: list[str] = []
    for ln in lines:
        stripped = ln.lstrip()
        if ln.startswith('#'):
            if para:
                md.append(' '.join(para))
                para = []
            md.append(ln)
        elif re.match(r'^[-•◦]', stripped):
            if para:
                md.append(' '.join(para))
                para = []
            md.append('- ' + stripped.lstrip('-•◦ ').strip())
        else:
            para.append(ln)
    if para:
        md.append(' '.join(para))
    # Supprime le doublon titre (ligne = titre juste après le # titre)
    out: list[str] = []
    title = None
    for ln in md:
        if ln.startswith('# '):
            title = ln[2:].strip()
            out.append(ln)
            continue
        if title and ln.strip() == title:
            title = None
            continue
        title = None
        out.append(ln)

    # Supprime la table des matières : les titres numérotés consécutifs SANS
    # contenu entre eux (ex. page TOC des Mentions Légales) ne sont pas des sections.
    cleaned: list[str] = []
    for i, ln in enumerate(out):
        nxt = ''
        for j in range(i + 1, len(out)):
            if out[j].strip():
                nxt = out[j]
                break
        is_num_heading = ln.startswith('### ') and bool(re.match(r'^### \d+(\.\d+)?\.\s+', ln))
        nxt_is_heading = nxt.startswith('#')
        if is_num_heading and nxt_is_heading:
            continue  # entrée de TOC (pas de contenu après)
        cleaned.append(ln)
    # Fusion des fragments de titres + suppression des doublons de titres
    final: list[str] = []
    for ln in cleaned:
        if ln.startswith('#') and final and final[-1].startswith('#'):
            prev = final[-1]
            frag = ln.lstrip('#').strip()
            prev_text = prev.lstrip('#').strip()
            if re.match(r'^[a-zà-ÿ]', frag) or frag.lower() == prev_text.lower():
                # fragment de continuation OU même titre dupliqué (h1 + h3)
                if frag.lower() == prev_text.lower():
                    final[-1] = prev  # garde le premier niveau
                else:
                    final[-1] = prev + ' ' + frag
                continue
        final.append(ln)
    return '\n\n'.join(final)


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
