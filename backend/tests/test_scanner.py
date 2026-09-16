from app.services.scanner import scan_folder


def test_scan_counts_files_by_category(tmp_path):
    (tmp_path / "a.jpg").write_bytes(b"x" * 10)
    (tmp_path / "b.pdf").write_bytes(b"x" * 20)
    (tmp_path / "c.unknownext").write_bytes(b"x" * 5)
    (tmp_path / "subdir").mkdir()

    result = scan_folder(str(tmp_path))

    assert result.total_files == 3
    assert result.total_size == 35
    assert result.category_counts["Images"] == 1
    assert result.category_counts["Documents"] == 1
    assert result.category_counts["Other"] == 1


def test_scan_rejects_missing_path():
    import pytest
    from app.utils.filesystem import UnsafePathError

    with pytest.raises(UnsafePathError):
        scan_folder("/definitely/does/not/exist/anywhere")
