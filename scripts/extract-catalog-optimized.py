#!/usr/bin/env python3
"""
Script otimizado para extrair catálogo completo do PDF.
Estratégia: Extrair imagens comprimidas + metadados para IA analisar.
"""

import json
import os
import base64
from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image
import io

def extract_catalog_optimized():
    """Extrai catálogo de forma otimizada."""
    
    pdf_path = "/tmp/catalogo.pdf"
    output_dir = "/home/ubuntu/aluminio-gestao-app/data"
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 80)
    print("EXTRAÇÃO OTIMIZADA DO CATÁLOGO DE PERFIS")
    print("=" * 80)
    
    try:
        # Converter TODAS as páginas com DPI reduzido
        print("\n[1/3] Convertendo PDF para imagens (DPI: 150)...")
        images = convert_from_path(pdf_path, dpi=150)
        print(f"✓ Total de páginas: {len(images)}")
        
        catalog_data = {
            "metadata": {
                "total_pages": len(images),
                "extraction_date": str(Path(pdf_path).stat().st_mtime),
                "version": "3.0",
                "strategy": "Imagens comprimidas + IA para análise"
            },
            "pages": []
        }
        
        # Processar cada página
        print("\n[2/3] Processando páginas...")
        for page_num, image in enumerate(images, 1):
            if page_num % 20 == 0:
                print(f"  Processadas {page_num}/{len(images)} páginas...")
            
            # Redimensionar para economizar espaço
            image_resized = image.copy()
            image_resized.thumbnail((1024, 768))
            
            # Converter para base64 (JPEG comprimido)
            img_byte_arr = io.BytesIO()
            image_resized.save(img_byte_arr, format='JPEG', quality=75)
            img_byte_arr.seek(0)
            img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')
            
            page_data = {
                "page_number": page_num,
                "image_base64": img_base64,
                "image_size_kb": len(img_base64) / 1024,
                "width": image_resized.width,
                "height": image_resized.height,
                "description": f"Página {page_num} - Catálogo de Perfis de Alumínio"
            }
            
            catalog_data["pages"].append(page_data)
        
        print(f"✓ Total de páginas processadas: {len(catalog_data['pages'])}")
        
        # Salvar dados em JSON
        print("\n[3/3] Salvando catálogo...")
        output_file = os.path.join(output_dir, "catalog_full.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(catalog_data, f, indent=2)
        
        # Calcular estatísticas
        total_size_mb = sum(p["image_size_kb"] for p in catalog_data["pages"]) / 1024
        avg_size_kb = sum(p["image_size_kb"] for p in catalog_data["pages"]) / len(catalog_data["pages"])
        
        print(f"✓ Arquivo salvo: {output_file}")
        print(f"✓ Tamanho total: {total_size_mb:.2f} MB")
        print(f"✓ Tamanho médio por página: {avg_size_kb:.2f} KB")
        
        print("\n" + "=" * 80)
        print("EXTRAÇÃO CONCLUÍDA COM SUCESSO!")
        print("=" * 80)
        print(f"\nResumo:")
        print(f"  - Total de páginas: {len(images)}")
        print(f"  - Tamanho total: {total_size_mb:.2f} MB")
        print(f"  - Arquivo gerado: catalog_full.json")
        print(f"\nPróximos passos:")
        print(f"  1. Sincronizar com banco de dados")
        print(f"  2. Gerar embeddings visuais com IA")
        print(f"  3. Criar índices de busca")
        
        return catalog_data
        
    except Exception as e:
        print(f"\n✗ Erro: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    extract_catalog_optimized()
