# Generated by Django 5.2 on 2025-05-18 20:11

import companies.encryption
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('companies', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BulkUploadLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('file_name', models.CharField(max_length=255)),
                ('file_size', models.IntegerField()),
                ('upload_type', models.CharField(max_length=20)),
                ('records_processed', models.IntegerField(default=0)),
                ('records_created', models.IntegerField(default=0)),
                ('records_updated', models.IntegerField(default=0)),
                ('errors', models.IntegerField(default=0)),
                ('error_details', models.TextField(blank=True, null=True)),
                ('status', models.CharField(default='processing', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('employee_id', companies.encryption.EncryptedCharField(blank=True, max_length=None, null=True)),
                ('current_role', models.CharField(max_length=100)),
                ('date_joined', models.DateField()),
                ('date_left', models.DateField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('current_company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='employees', to='companies.company')),
                ('current_department', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='employees', to='companies.department')),
            ],
        ),
        migrations.CreateModel(
            name='EmployeeRole',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=100)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(blank=True, null=True)),
                ('duties', models.TextField()),
                ('is_current', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='companies.company')),
                ('department', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='companies.department')),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='roles', to='employees.employee')),
            ],
            options={
                'ordering': ['-start_date'],
            },
        ),
    ]
