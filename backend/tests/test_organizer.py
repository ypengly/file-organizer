from app.models.file import DuplicateStrategy, OrganizeMode, PreviewRequest
from app.services import organizer


def test_preview_by_type_groups_correctly(tmp_path):
    (tmp_path / "photo.jpg").write_bytes(b"1" * 100)
    (tmp_path / "report.pdf").write_bytes(b"2" * 50)

    req = PreviewRequest(folder_path=str(tmp_path), mode=OrganizeMode.BY_TYPE)
    result = organizer.build_preview(req)

    assert result.total_files == 2
    dest_by_name = {op.source.split("/")[-1]: op.destination for op in result.operations}
    assert dest_by_name["photo.jpg"].endswith("Images/photo.jpg")
    assert dest_by_name["report.pdf"].endswith("Documents/report.pdf")


def test_preview_never_moves_files(tmp_path):
    f = tmp_path / "keepme.txt"
    f.write_text("hello")

    req = PreviewRequest(folder_path=str(tmp_path), mode=OrganizeMode.BY_TYPE)
    organizer.build_preview(req)

    assert f.exists()


def test_execute_then_undo_round_trip(tmp_path):
    f = tmp_path / "notes.txt"
    f.write_text("hello")

    req = PreviewRequest(
        folder_path=str(tmp_path),
        mode=OrganizeMode.BY_TYPE,
        duplicate_strategy=DuplicateStrategy.RENAME,
    )
    preview = organizer.build_preview(req)
    stats = organizer.execute_organize(preview.preview_id)

    assert stats.files_organized == 1
    moved = tmp_path / "Documents" / "notes.txt"
    assert moved.exists()
    assert not f.exists()

    undo_result = organizer.undo_last()
    assert undo_result.restored_files == 1
    assert f.exists()
    assert not moved.exists()


def test_duplicate_rename_never_overwrites(tmp_path):
    (tmp_path / "Documents").mkdir()
    (tmp_path / "Documents" / "notes.txt").write_text("original")
    (tmp_path / "notes.txt").write_text("new")

    req = PreviewRequest(
        folder_path=str(tmp_path),
        mode=OrganizeMode.BY_TYPE,
        duplicate_strategy=DuplicateStrategy.RENAME,
    )
    preview = organizer.build_preview(req)
    op = next(o for o in preview.operations if o.source.endswith("notes.txt") and "Documents" not in o.source)
    assert op.is_duplicate is True
    assert op.destination != str(tmp_path / "Documents" / "notes.txt")

    organizer.execute_organize(preview.preview_id)
    assert (tmp_path / "Documents" / "notes.txt").read_text() == "original"
