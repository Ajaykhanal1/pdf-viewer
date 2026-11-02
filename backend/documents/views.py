from django.conf import settings
from django.contrib.auth import authenticate
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils.http import content_disposition_header
from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import NotFound, ParseError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import PDFDocument
from .permissions import HasDocumentAccess, IsAdminUser
from .serializers import PDFDocumentSerializer


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


class AdminLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        username = str(request.data.get("username", "")).strip()
        password = str(request.data.get("password", ""))
        if not username or not password:
            raise ParseError("Username and password are required.")

        user = authenticate(request, username=username, password=password)
        if user is None or not user.is_staff:
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username})


class DocumentListView(generics.ListAPIView):
    serializer_class = PDFDocumentSerializer
    permission_classes = [HasDocumentAccess]
    queryset = PDFDocument.objects.filter(is_active=True)


class DocumentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = PDFDocumentSerializer
    queryset = PDFDocument.objects.filter(is_active=True)

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminUser()]
        return [HasDocumentAccess()]


class DocumentUploadView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = PDFDocumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DocumentFileView(APIView):
    """Streams the PDF inline. The private media folder is never served directly."""

    permission_classes = [HasDocumentAccess]

    def get(self, request, pk):
        document = get_object_or_404(PDFDocument, pk=pk, is_active=True)

        try:
            with document.pdf_file.open("rb") as pdf:
                if pdf.read(5) != b"%PDF-":
                    return Response(
                        {"detail": "The stored PDF file is corrupted."},
                        status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    )
        except (FileNotFoundError, ValueError, OSError):
            raise NotFound("The PDF file is missing.")

        try:
            pdf = document.pdf_file.open("rb")
        except (FileNotFoundError, ValueError, OSError):
            raise NotFound("The PDF file is missing.")

        response = FileResponse(pdf, content_type="application/pdf")
        response.headers["Content-Disposition"] = content_disposition_header(
            False, document.pdf_file.name.rsplit("/", 1)[-1]
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Cache-Control"] = "private, no-store, max-age=0"
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; frame-ancestors 'none'"
        )
        return response
