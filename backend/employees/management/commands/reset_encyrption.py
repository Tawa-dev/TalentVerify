from django.core.management.base import BaseCommand
from companies.models import Company

class Command(BaseCommand):
    help = 'Reset encrypted fields in Company model'

    def handle(self, *args, **options):
        companies = Company.objects.all()
        count = 0
        
        for company in companies:
            try:
                # Try to access the encrypted fields (this will fail)
                _ = company.contact_phone
                _ = company.email
                self.stdout.write(f"Company {company.name} has valid encryption.")
            except Exception as e:
                # Clear the corrupted encrypted fields
                company._contact_phone = None
                company._email = None
                company.save()
                count += 1
                self.stdout.write(f"Cleared encrypted fields for company {company.name}")
        
        self.stdout.write(f"Cleared encrypted fields for {count} companies.")