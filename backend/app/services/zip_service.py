from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


def build_zip_bundle(case_id: str, file_paths: list[Path], generated_dir: Path) -> Path:
    zip_path = generated_dir / f"{case_id}_reports.zip"
    with ZipFile(zip_path, mode="w", compression=ZIP_DEFLATED) as archive:
        for path in file_paths:
            archive.write(path, arcname=path.name)
    return zip_path
