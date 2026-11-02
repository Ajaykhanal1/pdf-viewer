from django.conf import settings
from pypdf import PdfReader
from rest_framework import serializers

from .models import PDFDocument


class PDFDocumentSerializer(serializers.ModelSerializer):
    pdf_file = serializers.FileField(write_only=True)

    class Meta:
        model = PDFDocument
        fields = ["id", "title", "description", "pdf_file", "uploaded_at", "is_active"]
        read_only_fields = ["id", "uploaded_at", "is_active"]

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value

    def validate_pdf_file(self, pdf):
        max_bytes = settings.MAX_PDF_SIZE_MB * 1024 * 1024
        if pdf.size == 0:
            raise serializers.ValidationError("The selected file is empty.")
        if pdf.size > max_bytes:
            raise serializers.ValidationError(
                f"PDF files must be {settings.MAX_PDF_SIZE_MB} MB or smaller."
            )
        if not pdf.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Only .pdf files are allowed.")
        if pdf.read(5) != b"%PDF-":
            raise serializers.ValidationError("The selected file is not a valid PDF.")
        pdf.seek(0)

        try:
            reader = PdfReader(pdf)
            if reader.is_encrypted:
                raise serializers.ValidationError(
                    "Password-protected PDFs are not supported."
                )
            if len(reader.pages) == 0:
                raise serializers.ValidationError("The PDF contains no pages.")
        except serializers.ValidationError:
            raise
        except Exception:
            raise serializers.ValidationError("The selected file is corrupted.")
        finally:
            pdf.seek(0)
        return pdf

    def create(self, validated_data):
        return PDFDocument.objects.create(**validated_data)
