from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import PDFDocument


@receiver(post_delete, sender=PDFDocument)
def delete_pdf_file(sender, instance, **kwargs):
    """Remove the stored file when its database record is deleted."""
    if instance.pdf_file:
        instance.pdf_file.delete(save=False)
