'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, Trash2, AlertTriangle, Edit } from 'lucide-react';
import { getStudentsApi, deleteStudentApi, updateStudentApi } from '@/lib/api';
import type { Student } from '@/lib/types';
import { useNotifications } from '@/contexts/NotificationContext';

const AllStudents: React.FC = () => {
  const { addNotification } = useNotifications();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation dialog state
  const [confirmDelete, setConfirmDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit dialog state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await getStudentsApi();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteStudentApi(confirmDelete.id);
      setStudents((prev) => prev.filter((s) => s.id !== confirmDelete.id));
      addNotification(
        'student_deleted',
        'Student Deleted',
        `${confirmDelete.name} (${confirmDelete.reg_no}) has been removed from the system.`
      );
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.reg_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.year_of_study.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-md mx-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete Student</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-900">{confirmDelete.name}</span>{' '}
                  ({confirmDelete.reg_no})? This will also permanently remove all their leave applications.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Trash2 size={14} className="mr-1.5" />
                )}
                {deleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSuccess={() => {
            setEditingStudent(null);
            fetchStudents();
          }}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
        <div className="relative w-full sm:w-auto">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Reg No', 'Year & Branch', 'Room No', 'Contact', 'Parent Contact', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.reg_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.year_of_study}</div>
                    <div className="text-sm text-gray-500">{student.branch}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.hostel_room_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.parent_name}</div>
                    <div className="text-sm text-gray-500">{student.parent_phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => setEditingStudent(student)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                    >
                      <Edit size={13} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(student)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      <Trash2 size={13} className="mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-gray-100">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <div className="ml-2.5">
                    <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                    <div className="text-xs font-medium text-indigo-600 mt-0.5">{student.reg_no}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100/50">
                <div>
                  <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Year & Branch</span>
                  <span className="text-gray-900 font-medium">{student.year_of_study} · {student.branch}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Room No</span>
                  <span className="text-gray-900 font-medium">{student.hostel_room_no}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Student Contact</span>
                  <span className="text-gray-900 font-medium">{student.phone}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block uppercase tracking-wider text-[9px] mb-0.5">Parent / Guardian</span>
                  <span className="text-gray-900 font-medium">{student.parent_name} ({student.parent_phone})</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setEditingStudent(student)}
                  className="inline-flex items-center justify-center flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg bg-white hover:bg-indigo-50 transition-colors"
                >
                  <Edit size={13} className="mr-1.5" />
                  Edit Details
                </button>
                <button
                  onClick={() => setConfirmDelete(student)}
                  className="inline-flex items-center justify-center flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg bg-white hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} className="mr-1.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'Try adjusting your search criteria.'
                : 'Get started by adding a new student.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose, onSuccess }) => {
  const { addNotification } = useNotifications();
  const getFirstAndLastName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  const nameParts = getFirstAndLastName(student.name || '');

  const [formData, setFormData] = useState({
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    phone: student.phone || '',
    email: student.email || '',
    hostel_room_no: student.hostel_room_no || '',
    parent_name: student.parent_name || '',
    parent_phone: student.parent_phone || '',
    parent_address: student.parent_address || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.phone,
        email: formData.email,
        hostel_room_no: formData.hostel_room_no,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        parent_address: formData.parent_address,
      };
      await updateStudentApi(student.id, payload);
      addNotification(
        'student_updated',
        'Student Updated',
        `${payload.name} (${student.reg_no})'s profile has been updated successfully.`
      );
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update student details');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
  const disabledInputClass =
    'w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1';
  const required = <span className="text-red-500">*</span>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Edit Student Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Student Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Academic & Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name {required}</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name {required}</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Registration Number (Read-only)</label>
                <input type="text" value={student.reg_no} readOnly className={disabledInputClass} />
              </div>
              <div>
                <label className={labelClass}>Date of Birth (Read-only)</label>
                <input type="text" value={student.dob} readOnly className={disabledInputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address {required}</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number {required}</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hostel Room Number {required}</label>
                <input type="text" name="hostel_room_no" required value={formData.hostel_room_no} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Parent Info */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Parent / Guardian Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Parent Name {required}</label>
                <input type="text" name="parent_name" required value={formData.parent_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Parent Phone {required}</label>
                <input type="tel" name="parent_phone" required value={formData.parent_phone} onChange={handleChange} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Parent Address {required}</label>
                <textarea name="parent_address" rows={2} required value={formData.parent_address} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllStudents;

