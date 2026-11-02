import io
import shutil
import tempfile

from django.conf import settings
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from pypdf import PdfWriter
from rest_framework.test import APITestCase

from .models import PDFDocument


def make_pdf(pages: int = 1) -> bytes:
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def upload_file(name: str = "sample.pdf") -> SimpleUploadedFile:
    return SimpleUploadedFile(name, make_pdf(), content_type="application/pdf")


class DocumentAPITests(APITestCase):
    @classmethod
    def setUpClass(cls):
        cls._media_root = tempfile.mkdtemp(prefix="pdf-viewer-tests-")
        cls._media_override = override_settings(MEDIA_ROOT=cls._media_root)
        cls._media_override.enable()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        cls._media_override.disable()
        shutil.rmtree(cls._media_root, ignore_errors=True)

    def setUp(self):
        self.admin = User.objects.create_user(
            "admin", password="StrongPass123!", is_staff=True
        )
        self.user = User.objects.create_user("user", password="StrongPass123!")

    def admin_token(self) -> str:
        response = self.client.post(
            "/api/admin/login/",
            {"username": "admin", "password": "StrongPass123!"},
            format="json",
        )
        return response.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Token {token}"}

    def upload(self, token: str, **extra):
        data = {
            "title": "Getting Started",
            "description": "A short guide.",
            "pdf_file": upload_file(),
            **extra,
        }
        return self.client.post(
            "/api/documents/upload/",
            data,
            format="multipart",
            **self.auth(token),
        )

    def test_admin_login_returns_token(self):
        response = self.client.post(
            "/api/admin/login/",
            {"username": "admin", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["token"])

    def test_non_admin_cannot_login(self):
        response = self.client.post(
            "/api/admin/login/",
            {"username": "user", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_upload_requires_admin_token(self):
        response = self.upload("not-a-token")
        self.assertIn(response.status_code, (401, 403))

    def test_invalid_and_corrupted_files_are_rejected(self):
        token = self.admin_token()
        not_pdf = self.upload(
            token,
            pdf_file=SimpleUploadedFile(
                "notes.pdf", b"hello", content_type="application/pdf"
            ),
        )
        self.assertEqual(not_pdf.status_code, 400)

        corrupt = self.upload(
            token,
            pdf_file=SimpleUploadedFile(
                "broken.pdf", b"%PDF-1.4\nnot really a pdf", content_type="application/pdf"
            ),
        )
        self.assertEqual(corrupt.status_code, 400)

    def test_upload_list_view_and_delete_flow(self):
        token = self.admin_token()
        upload = self.upload(token)
        self.assertEqual(upload.status_code, 201)
        document_id = upload.json()["id"]
        self.assertEqual(upload.json()["title"], "Getting Started")

        listing = self.client.get("/api/documents/", HTTP_X_APP_KEY=settings.APP_API_KEY)
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json()), 1)
        self.assertNotIn("pdf_file", listing.json()[0])

        detail = self.client.get(
            f"/api/documents/{document_id}/", HTTP_X_APP_KEY=settings.APP_API_KEY
        )
        self.assertEqual(detail.status_code, 200)

        pdf = self.client.get(
            f"/api/documents/{document_id}/view/",
            HTTP_X_APP_KEY=settings.APP_API_KEY,
        )
        self.assertEqual(pdf.status_code, 200)
        self.assertEqual(pdf["Content-Type"], "application/pdf")
        self.assertTrue(pdf["Content-Disposition"].startswith("inline"))
        self.assertEqual(pdf["Cache-Control"], "private, no-store, max-age=0")
        self.assertEqual(b"".join(pdf.streaming_content)[:5], b"%PDF-")

        deleted = self.client.delete(
            f"/api/documents/{document_id}/", **self.auth(token)
        )
        self.assertEqual(deleted.status_code, 204)
        self.assertFalse(PDFDocument.objects.exists())

    def test_documents_require_app_key(self):
        response = self.client.get("/api/documents/")
        self.assertEqual(response.status_code, 401)
        self.assertTrue(PDFDocument.objects.count() == 0)

    def test_missing_or_corrupted_stored_file(self):
        document = PDFDocument.objects.create(
            title="Missing", pdf_file=upload_file("missing.pdf")
        )
        path = document.pdf_file.path
        document.pdf_file.storage.delete(path)

        response = self.client.get(
            f"/api/documents/{document.id}/view/",
            HTTP_X_APP_KEY=settings.APP_API_KEY,
        )
        self.assertEqual(response.status_code, 404)

        document.pdf_file.save("corrupt.pdf", SimpleUploadedFile("corrupt.pdf", b"junk"))
        response = self.client.get(
            f"/api/documents/{document.id}/view/",
            HTTP_X_APP_KEY=settings.APP_API_KEY,
        )
        self.assertEqual(response.status_code, 422)

    def test_delete_requires_admin(self):
        document = PDFDocument.objects.create(
            title="Protected", pdf_file=upload_file("protected.pdf")
        )
        response = self.client.delete(
            f"/api/documents/{document.id}/",
            HTTP_X_APP_KEY=settings.APP_API_KEY,
        )
        self.assertEqual(response.status_code, 401)
        self.assertTrue(PDFDocument.objects.filter(id=document.id).exists())
