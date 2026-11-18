from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.core.management import call_command
from django.utils import timezone
import datetime

from customers.models import Customer, ActivityLog
from tasks.models import Task, FollowUp
from notifications.models import Notification

User = get_user_model()

class FollowFlowERPTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='erp_tester',
            email='tester@followflow.com',
            password='TestPassword123!',
            first_name='ERP',
            last_name='Expert'
        )

    def test_full_erp_lifecycle(self):
        # 1. Login & Token Obtain
        login_res = self.client.post('/api/auth/login/', {
            'username': 'erp_tester',
            'password': 'TestPassword123!'
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        access_token = login_res.data['access']
        refresh_token = login_res.data['refresh']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # 2. Token Refresh
        refresh_res = self.client.post('/api/auth/refresh/', {
            'refresh': refresh_token
        })
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_res.data)

        # 3. Create Customer
        cust_res = self.client.post('/api/customers/', {
            'company_name': 'Acme Global Corp',
            'contact_name': 'Alice Johnson',
            'email': 'alice@acme.com',
            'phone': '+1 555-0100',
            'status': 'New',
            'lead_value': 25000.00
        })
        self.assertEqual(cust_res.status_code, status.HTTP_201_CREATED)
        customer_id = cust_res.data['id']

        # 4. Verify ActivityLog on Customer creation
        customer = Customer.objects.get(id=customer_id)
        cust_log = ActivityLog.objects.filter(customer=customer, action_type='Created Customer').first()
        self.assertIsNotNone(cust_log)

        # 5. Create Task
        due_date = timezone.now() + datetime.timedelta(days=2)
        task_res = self.client.post('/api/tasks/', {
            'title': 'Present ERP Architecture',
            'customer': customer_id,
            'due_date': due_date.isoformat(),
            'priority': 'High'
        })
        self.assertEqual(task_res.status_code, status.HTTP_201_CREATED)
        task_id = task_res.data['id']

        # 6. Verify Task Created ActivityLog
        task_log = ActivityLog.objects.filter(customer=customer, action_type='Task Created').first()
        self.assertIsNotNone(task_log)

        # 7. Log FollowUp -> verify task auto-advances to "In Progress"
        fu_res = self.client.post('/api/followups/', {
            'task': task_id,
            'followup_type': 'Call',
            'outcome': 'Spoke with Alice, scheduled final contract review.'
        })
        self.assertEqual(fu_res.status_code, status.HTTP_201_CREATED)

        task = Task.objects.get(id=task_id)
        self.assertEqual(task.status, 'In Progress')

        # 8. Mark Task as Completed -> verify Notification is created
        task_update = self.client.patch(f'/api/tasks/{task_id}/', {'status': 'Completed'})
        self.assertEqual(task_update.status_code, status.HTTP_200_OK)

        notif = Notification.objects.filter(user=self.user, is_read=False).first()
        self.assertIsNotNone(notif)
        self.assertIn('Completed', notif.title)

        # 9. Test Bulk Mark All Read
        bulk_res = self.client.post('/api/notifications/mark-all-read/')
        self.assertEqual(bulk_res.status_code, status.HTTP_200_OK)
        unread_count = Notification.objects.filter(user=self.user, is_read=False).count()
        self.assertEqual(unread_count, 0)

        # 10. Test ActivityLog endpoint
        logs_res = self.client.get('/api/activity-logs/')
        self.assertEqual(logs_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(logs_res.data), 2)

        # 11. Test Dashboard Stats
        stats_res = self.client.get('/api/dashboard/stats/')
        self.assertEqual(stats_res.status_code, status.HTTP_200_OK)
        self.assertEqual(stats_res.data['customers']['total'], 1)
        self.assertEqual(stats_res.data['tasks']['total'], 1)
        self.assertEqual(stats_res.data['tasks']['completed'], 1)

        # 12. Test check_reminders command
        call_command('check_reminders')
