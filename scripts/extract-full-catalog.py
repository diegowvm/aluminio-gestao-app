#!/usr/bin/env python3
"""
Script avançado para extrair TODOS os perfis do catálogo PDF.
Extrai imagens, texto OCR, medidas e cria dataset completo centralizado.
"""

import json
import os
import base64
import re
from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image
import io
import pytesseract

def extract_full_catalog():
    """Extrai TODOS os perfis do catálogo PDF de forma otimizada."""
    
    pdf_path = "/tmp/catalogo.pdf"
    output_dir = "/home/ubuntu/aluminio-gestao-app/data"
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 80)
    print("EXTRAÇÃO COMPLETA DO CATÁLOGO DE PERFIS DE ALUMÍNIO")
    print("=" * 80)
    
    try:
        # Converter TODAS as páginas do PDF
        print("\n[1/5] Convertendo PDF para imagens...")
        images = convert_from_path(pdf_path, dpi=200)
        print(f"✓ Total de páginas: {len(images)}")
        
        catalog_data = {
            "metadata": {
                "total_pages": len(images),
                "total_profiles": 0,
                "extraction_date": str(Path(pdf_path).stat().st_mtime),
                "version": "2.0"
            },
            "profiles": []
        }
        
        profile_count = 0
        
        # Processar cada página
        print("\n[2/5] Processando páginas e extraindo perfis...")
        for page_num, image in enumerate(images, 1):
            print(f"  Página {page_num}/{len(images)}...", end="\r")
            
            # Otimizar imagem
            image_optimized = image.copy()
            image_optimized.thumbnail((1200, 900))
            
            # Converter para base64 (JPEG de alta qualidade)
            img_byte_arr = io.BytesIO()
            image_optimized.save(img_byte_arr, format='JPEG', quality=85)
            img_byte_arr.seek(0)
            img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')
            
            # Extrair texto com OCR
            try:
                text = pytesseract.image_to_string(image_optimized, lang='por+eng')
            except:
                text = ""
            
            # Extrair medidas usando regex
            measurements = extract_measurements_from_text(text)
            
            # Criar registro do perfil
            profile_data = {
                "page": page_num,
                "image_base64": img_base64,
                "image_size_kb": len(img_base64) / 1024,
                "extracted_text": text[:500],  # Primeiros 500 caracteres
                "measurements": measurements,
                "profile_code": extract_profile_code(text),
                "profile_name": extract_profile_name(text),
                "line": extract_line(text),
                "description": f"Página {page_num} do catálogo técnico"
            }
            
            catalog_data["profiles"].append(profile_data)
            profile_count += 1
        
        print(f"\n✓ Total de perfis extraídos: {profile_count}")
        
        catalog_data["metadata"]["total_profiles"] = profile_count
        
        # Salvar dados em JSON
        print("\n[3/5] Salvando dados em JSON...")
        output_file = os.path.join(output_dir, "catalog_complete.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(catalog_data, f, indent=2, ensure_ascii=False)
        print(f"✓ Dados salvos em: {output_file}")
        
        # Calcular estatísticas
        total_size_mb = sum(p["image_size_kb"] for p in catalog_data["profiles"]) / 1024
        print(f"✓ Tamanho total: {total_size_mb:.2f} MB")
        
        # Criar índice de busca
        print("\n[4/5] Criando índice de busca...")
        search_index = create_search_index(catalog_data["profiles"])
        index_file = os.path.join(output_dir, "catalog_search_index.json")
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(search_index, f, indent=2, ensure_ascii=False)
        print(f"✓ Índice criado com {len(search_index)} entradas")
        
        # Criar relatório
        print("\n[5/5] Gerando relatório...")
        report = generate_report(catalog_data)
        report_file = os.path.join(output_dir, "extraction_report.txt")
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"✓ Relatório salvo em: {report_file}")
        
        print("\n" + "=" * 80)
        print("EXTRAÇÃO CONCLUÍDA COM SUCESSO!")
        print("=" * 80)
        print(f"\nResumo:")
        print(f"  - Perfis extraídos: {profile_count}")
        print(f"  - Tamanho total: {total_size_mb:.2f} MB")
        print(f"  - Arquivos gerados: 3")
        print(f"    1. catalog_complete.json")
        print(f"    2. catalog_search_index.json")
        print(f"    3. extraction_report.txt")
        
        return catalog_data
        
    except Exception as e:
        print(f"\n✗ Erro ao extrair PDF: {e}")
        import traceback
        traceback.print_exc()
        return None


def extract_measurements_from_text(text):
    """Extrai medidas do texto OCR."""
    measurements = {}
    
    # Padrões para encontrar medidas
    patterns = {
        'altura': r'(?:altura|h)\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*(?:mm|x)',
        'largura': r'(?:largura|l|w)\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*(?:mm|x)',
        'espessura': r'(?:espessura|e|t)\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*mm',
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            measurements[key] = float(match.group(1).replace(',', '.'))
    
    return measurements


def extract_profile_code(text):
    """Extrai código do perfil do texto."""
    # Procurar por padrões como SA-001, SA-002, etc
    match = re.search(r'([A-Z]{2,3}[-]?\d{3,4})', text)
    return match.group(1) if match else None


def extract_profile_name(text):
    """Extrai nome do perfil do texto."""
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if len(line) > 5 and len(line) < 100 and not any(c.isdigit() for c in line[:3]):
            return line
    return None


def extract_line(text):
    """Extrai linha/série do perfil."""
    match = re.search(r'(?:linha|série|series)\s*[:\-]?\s*([A-Za-z0-9\s]+)', text, re.IGNORECASE)
    return match.group(1).strip() if match else None


def create_search_index(profiles):
    """Cria índice de busca para acesso rápido."""
    index = []
    
    for i, profile in enumerate(profiles):
        index_entry = {
            "id": i,
            "page": profile["page"],
            "code": profile["profile_code"],
            "name": profile["profile_name"],
            "line": profile["line"],
            "measurements": profile["measurements"],
            "keywords": generate_keywords(profile)
        }
        index.append(index_entry)
    
    return index


def generate_keywords(profile):
    """Gera palavras-chave para busca."""
    keywords = []
    
    if profile["profile_code"]:
        keywords.append(profile["profile_code"].lower())
    
    if profile["profile_name"]:
        keywords.extend(profile["profile_name"].lower().split())
    
    if profile["line"]:
        keywords.append(profile["line"].lower())
    
    # Adicionar medidas como keywords
    for key, value in profile["measurements"].items():
        keywords.append(f"{key}:{value}")
    
    return list(set(keywords))  # Remove duplicatas


def generate_report(catalog_data):
    """Gera relatório de extração."""
    report = []
    report.append("=" * 80)
    report.append("RELATÓRIO DE EXTRAÇÃO DO CATÁLOGO DE PERFIS")
    report.append("=" * 80)
    report.append("")
    
    report.append(f"Total de páginas: {catalog_data['metadata']['total_pages']}")
    report.append(f"Total de perfis: {catalog_data['metadata']['total_profiles']}")
    report.append(f"Data de extração: {catalog_data['metadata']['extraction_date']}")
    report.append("")
    
    report.append("PERFIS IDENTIFICADOS:")
    report.append("-" * 80)
    
    for i, profile in enumerate(catalog_data["profiles"][:50], 1):  # Mostrar primeiros 50
        report.append(f"\n{i}. Página {profile['page']}")
        if profile["profile_code"]:
            report.append(f"   Código: {profile['profile_code']}")
        if profile["profile_name"]:
            report.append(f"   Nome: {profile['profile_name']}")
        if profile["measurements"]:
            report.append(f"   Medidas: {profile['measurements']}")
    
    if len(catalog_data["profiles"]) > 50:
        report.append(f"\n... e mais {len(catalog_data['profiles']) - 50} perfis")
    
    return "\n".join(report)


if __name__ == "__main__":
    extract_full_catalog()
