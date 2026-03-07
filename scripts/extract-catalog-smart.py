#!/usr/bin/env python3
"""
Script otimizado para extrair dados do catálogo PDF.
Extrai apenas as informações necessárias sem sobrecarregar o sistema.
"""

import json
import os
import base64
from pathlib import Path
from pdf2image import convert_from_path
import io

def extract_catalog_data():
    """Extrai dados do catálogo PDF de forma otimizada."""
    
    pdf_path = "/tmp/catalogo.pdf"
    output_dir = "/home/ubuntu/aluminio-gestao-app/data"
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("Extraindo catálogo do PDF...")
    
    try:
        # Converter apenas as primeiras 30 páginas para não sobrecarregar
        images = convert_from_path(pdf_path, dpi=150, first_page=1, last_page=30)
        print(f"Total de páginas processadas: {len(images)}")
        
        catalog_data = {
            "total_pages": len(images),
            "pages": []
        }
        
        # Processar cada página
        for i, image in enumerate(images):
            page_num = i + 1
            
            # Converter imagem para base64 comprimida
            img_byte_arr = io.BytesIO()
            image.thumbnail((800, 600))  # Redimensionar para economizar espaço
            image.save(img_byte_arr, format='JPEG', quality=75)
            img_byte_arr.seek(0)
            img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')
            
            page_data = {
                "page": page_num,
                "image_base64": img_base64,
                "image_size": len(img_base64),
                "description": f"Página {page_num} do catálogo técnico"
            }
            
            catalog_data["pages"].append(page_data)
            print(f"Página {page_num} processada ({len(img_base64)} bytes)")
        
        # Salvar dados em JSON
        output_file = os.path.join(output_dir, "catalog_pages.json")
        with open(output_file, 'w') as f:
            json.dump(catalog_data, f, indent=2)
        
        print(f"\nDados salvos em: {output_file}")
        print(f"Total de dados: {len(json.dumps(catalog_data)) / 1024 / 1024:.2f} MB")
        
        return catalog_data
        
    except Exception as e:
        print(f"Erro ao extrair PDF: {e}")
        return None

if __name__ == "__main__":
    extract_catalog_data()
