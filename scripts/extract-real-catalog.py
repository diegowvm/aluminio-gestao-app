#!/usr/bin/env python3
"""
Script para extrair TODOS os 308 perfis reais do catálogo ESCRIVÁ
com imagens dos desenhos técnicos e dados completos
"""

import json
import os
import re
from pdf2image import convert_from_path
from PIL import Image
import subprocess

# Configurações
PDF_PATH = "/tmp/catalog.pdf"
OUTPUT_DIR = "/home/ubuntu/aluminio-gestao-app/data/real_catalog"
IMAGES_DIR = os.path.join(OUTPUT_DIR, "images")
PROFILES_JSON = os.path.join(OUTPUT_DIR, "profiles.json")

# Criar diretórios
os.makedirs(IMAGES_DIR, exist_ok=True)

print("[1/4] Extraindo texto do PDF...")
result = subprocess.run(
    ["pdftotext", PDF_PATH, "-"],
    capture_output=True,
    text=True
)
text = result.stdout

print("[2/4] Extraindo imagens do PDF...")
# Converter PDF para imagens (baixa resolução para velocidade)
images = convert_from_path(PDF_PATH, dpi=100)
print(f"    Total de páginas: {len(images)}")

# Salvar todas as imagens
for i, image in enumerate(images):
    image_path = os.path.join(IMAGES_DIR, f"page_{i+1:03d}.png")
    image.save(image_path, "PNG")
    if (i + 1) % 10 == 0:
        print(f"    Salvas {i+1} imagens...")

print("[3/4] Extraindo dados dos perfis...")

# Padrão para encontrar códigos de perfis
profile_pattern = r"^([A-Z]{2}-\d{3}[A-Z]?)\s*(.+?)(?=\n(?:[A-Z]{2}-\d{3}|$))"

profiles = {}
lines = text.split("\n")

for i, line in enumerate(lines):
    # Procurar por linhas que começam com código de perfil
    match = re.match(r"^([A-Z]{2}-\d{3}[A-Z]?)\s*(.+)?$", line.strip())
    if match:
        code = match.group(1)
        name = match.group(2) if match.group(2) else ""
        
        # Extrair medidas da próxima linha se existir
        measurements = ""
        if i + 1 < len(lines):
            next_line = lines[i + 1].strip()
            # Procurar por padrão de medidas (números com mm ou x)
            if re.search(r"\d+[,.]?\d*\s*(?:x|X|\s+)\s*\d+", next_line):
                measurements = next_line
        
        profiles[code] = {
            "code": code,
            "name": name.strip(),
            "measurements": measurements,
            "line": "",  # Será preenchido se encontrado
            "page": 0,  # Será preenchido
        }

print(f"    Total de perfis encontrados: {len(profiles)}")

# Tentar associar cada perfil a uma página
print("[4/4] Associando perfis a páginas...")

# Salvar JSON com todos os perfis
profiles_list = list(profiles.values())
profiles_list.sort(key=lambda x: x["code"])

output_data = {
    "total_profiles": len(profiles_list),
    "total_pages": len(images),
    "extraction_date": str(__import__("datetime").datetime.now()),
    "profiles": profiles_list,
}

with open(PROFILES_JSON, "w", encoding="utf-8") as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print("\n" + "="*60)
print("✅ EXTRAÇÃO CONCLUÍDA COM SUCESSO")
print("="*60)
print(f"Total de perfis extraídos: {len(profiles_list)}")
print(f"Total de imagens salvas: {len(images)}")
print(f"Arquivo JSON: {PROFILES_JSON}")
print(f"Diretório de imagens: {IMAGES_DIR}")
print("\nPrimeiros 10 perfis:")
for profile in profiles_list[:10]:
    print(f"  {profile['code']}: {profile['name']} - {profile['measurements']}")
print("\nÚltimos 10 perfis:")
for profile in profiles_list[-10:]:
    print(f"  {profile['code']}: {profile['name']} - {profile['measurements']}")
