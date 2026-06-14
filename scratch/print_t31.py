import sys
from docx import Document

sys.stdout.reconfigure(encoding='utf-8')

def print_table_details(docx_path):
    print(f"--- Printing details for {docx_path} ---")
    doc = Document(docx_path)
    # Let's find tables that contain "Legal Representatives"
    for table_idx, table in enumerate(doc.tables):
        found = False
        for row in table.rows:
            for cell in row.cells:
                if "Legal Representatives" in cell.text:
                    found = True
                    break
            if found:
                break
        if found:
            print(f"Table index: {table_idx}, total rows: {len(table.rows)}")
            for row_idx, row in enumerate(table.rows):
                if 10 <= row_idx <= 45:
                    cells_text = []
                    for col_idx, cell in enumerate(row.cells):
                        # merge duplicates if they are part of merged cells
                        cells_text.append(f"C{col_idx}:{cell.text.strip().replace('\n', ' ')}")
                    # Deduplicate adjacent identical cells to clean up printed merged cells
                    deduped = []
                    for c in cells_text:
                        if not deduped or deduped[-1].split(":", 1)[1] != c.split(":", 1)[1]:
                            deduped.append(c)
                    print(f"Row {row_idx}: " + " | ".join(deduped))

if __name__ == "__main__":
    print_table_details(r"d:\FIR-Auto\212-2026 New DAR Form (9).docx")
    print_table_details(r"d:\FIR-Auto\backend\app\template_dar.docx")
