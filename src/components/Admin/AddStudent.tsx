import React, { useState } from 'react';
import { UserPlus, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StudentFormData {
  name: string;
  reg_no: string;
  dob: string;
  year_of_study: string;
  branch: string;
  phone: string;
  email: string;
  hostel_room_no: string;
  parent_name: string;
  parent_phone: string;
  parent_address: string;
}

const AddStudent: React.FC = () => {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    reg_no: '',
    dob: '',
    year_of_study: '',
    branch: '',
    phone: '',
    email: '',
    hostel_room_no: '',
    parent_name: '',
    parent_phone: '',
    parent_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate required fields
      if (!formData.year_of_study || !formData.branch) {
        throw new Error('Year of study and branch are required fields');
      }

      const { error } = await supabase
        .from('students')
        .insert([formData]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('A student with this registration number or email already exists');
        }
        throw error;
      }

      // Generate credentials
      const username = formData.reg_no;
      const password = new Date(formData.dob).toISOString().slice(0, 10).replace(/-/g, '');

      setMessage({
        type: 'success',
        text: `Student added successfully! Login credentials - Username: ${username}, Password: ${password}`
      });

      // Reset form
      setFormData({
        name: '',
        reg_no: '',
        dob: '',
        year_of_study: '',
        branch: '',
        phone: '',
        email: '',
        hostel_room_no: '',
        parent_name: '',
        parent_phone: '',
        parent_address: '',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to add student. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Final Year'
  ];

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <UserPlus className="h-6 w-6 text-indigo-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="reg_no" className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="reg_no"
                    name="reg_no"
                    required
                    value={formData.reg_no}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="year_of_study" className="block text-sm font-medium text-gray-700 mb-2">
                    Year of Study <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="year_of_study"
                    name="year_of_study"
                    required
                    value={formData.year_of_study}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Year</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    required
                    placeholder="e.g., Computer Science, Mechanical, etc."
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="hostel_room_no" className="block text-sm font-medium text-gray-700 mb-2">
                    Hostel Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="hostel_room_no"
                    name="hostel_room_no"
                    required
                    value={formData.hostel_room_no}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="parent_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="parent_name"
                    name="parent_name"
                    required
                    value={formData.parent_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="parent_phone"
                    name="parent_phone"
                    required
                    value={formData.parent_phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="parent_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="parent_address"
                    name="parent_address"
                    rows={3}
                    required
                    value={formData.parent_address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {loading ? 'Adding Student...' : 'Add Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
