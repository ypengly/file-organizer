from app.models.file import Category
from app.services.categorizer import categorize


def test_image_extensions():
    assert categorize(".jpg") == Category.IMAGES
    assert categorize(".PNG") == Category.IMAGES


def test_document_extensions():
    assert categorize(".pdf") == Category.DOCUMENTS
    assert categorize(".docx") == Category.DOCUMENTS


def test_unknown_extension_is_other():
    assert categorize(".xyz123") == Category.OTHER
