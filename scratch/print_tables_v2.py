import sys
from docx import Document

# Set encoding for stdout to handle special characters
sys.stdout.reconfigure(encoding='utf-8')

def print_accident_table(docx_path):
    doc = Document(docx_path)
    for table in doc.tables:
        found = False
        for row in table.rows:
            for cell in row.cells:
                if "Date of Accident" in cell.text:
                    found = True
                    break
            if found:
                break
        if found:
            for row in table.rows:
                row_text = []
                for cell in row.cells:
                    row_text.append(cell.text.strip().replace("\n", " "))
                print(" | ".join(row_text))
            print("-" * 20)

if __name__ == "__main__":
    template_path = r"d:\FIR-Auto\backend\app\template_dar.docx"
    print_accident_table(template_path)
