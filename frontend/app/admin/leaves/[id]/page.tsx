'use client';

import { useParams } from 'next/navigation';
import LeaveDetails from '@/components/Student/LeaveDetails';

export default function AdminLeaveDetailsPage() {
  const params = useParams();
  const idStr = params?.id;
  const leaveId = idStr ? parseInt(idStr as string, 10) : undefined;

  if (!leaveId || isNaN(leaveId)) {
    return <div className="p-6 text-gray-500">Invalid Leave ID</div>;
  }

  return <LeaveDetails leaveId={leaveId} />;
}
