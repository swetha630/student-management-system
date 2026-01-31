import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Forms
  const [targetForm, setTargetForm] = useState({ title: '', description: '', semester: 1, deadline: '' });
  const [notifForm, setNotifForm] = useState({ message: '', type: 'general' });
  
  // Chat
  const [chatStudent, setChatStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // UI Toggles
  const [activeTab, setActiveTab] = useState('students'); // students, notifications
  const [filterType, setFilterType] = useState('all'); // all, eligible, risk

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, []);

  const fetchStudents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/admin/students', config);
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTarget = async (e) => {
      e.preventDefault();
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.post('/api/admin/targets', {
            studentId: selectedStudent.user._id,
            ...targetForm
        }, config);
        alert('Target assigned successfully');
        setSelectedStudent(null);
        setTargetForm({ title: '', description: '', semester: 1, deadline: '' });
      } catch (error) {
          console.error(error);
          alert('Failed to assign target');
      }
  }

  const handleSendNotification = async (e) => {
      e.preventDefault();
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post('/api/notifications', notifForm, config);
          alert('Notification sent!');
          setNotifForm({ message: '', type: 'general' });
      } catch (error) {
          console.error(error);
          alert('Failed to send notification');
      }
  }

  // Chat Functions
  const openChat = async (student) => {
      setChatStudent(student);
      fetchMessages(student.user._id);
  }

  const fetchMessages = async (studentId) => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.get(`/api/messages/${studentId}`, config);
          setMessages(res.data);
      } catch (error) {
          console.error(error);
      }
  }

  const handleSendMessage = async (e) => {
      e.preventDefault();
      if(!newMessage.trim() || !chatStudent) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post('/api/messages', { recipientId: chatStudent.user._id, content: newMessage }, config);
          setNewMessage('');
          fetchMessages(chatStudent.user._id);
      } catch (error) {
          console.error(error);
      }
  }

  const getFilteredStudents = () => {
    if (filterType === 'eligible') {
        return students.filter(s => (s.progress || 0) >= 90);
    } else if (filterType === 'risk') {
        return students.filter(s => (s.progress || 0) < 90);
    }
    return students;
  };

  const filteredStudents = getFilteredStudents();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Students</button>
            <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 rounded ${activeTab === 'notifications' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Notifications</button>
        </div>
      </div>
      
      {activeTab === 'notifications' && (
          <div className="bg-white p-6 rounded shadow mb-6 max-w-lg">
              <h2 className="text-xl font-bold mb-4">Broadcast Notification</h2>
              <form onSubmit={handleSendNotification}>
                  <div className="mb-4">
                      <label className="block text-sm mb-1">Type</label>
                      <select 
                        value={notifForm.type} 
                        onChange={e => setNotifForm({...notifForm, type: e.target.value})}
                        className="w-full border p-2 rounded"
                      >
                          <option value="general">General</option>
                          <option value="contest">Contest</option>
                          <option value="competition">Competition</option>
                      </select>
                  </div>
                  <div className="mb-4">
                      <label className="block text-sm mb-1">Message</label>
                      <textarea 
                        value={notifForm.message}
                        onChange={e => setNotifForm({...notifForm, message: e.target.value})}
                        className="w-full border p-2 rounded"
                        rows="4"
                        required
                      ></textarea>
                  </div>
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">Send to All Students</button>
              </form>
          </div>
      )}

      {activeTab === 'students' && (
          <>
            <div className="flex justify-end mb-4 gap-2">
                <button 
                    onClick={() => setFilterType('all')} 
                    className={`px-3 py-1 rounded text-sm ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    All Students
                </button>
                <button 
                    onClick={() => setFilterType('eligible')} 
                    className={`px-3 py-1 rounded text-sm ${filterType === 'eligible' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                >
                    Eligible ({'>'}= 90%)
                </button>
                <button 
                    onClick={() => setFilterType('risk')} 
                    className={`px-3 py-1 rounded text-sm ${filterType === 'risk' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                >
                    Not Eligible / Risk ({'<'} 90%)
                </button>
            </div>

            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-3">Name</th>
                            <th className="p-3">Enrollment</th>
                            <th className="p-3">Sem</th>
                            <th className="p-3">CGPA</th>
                            <th className="p-3">Progress</th>
                            <th className="p-3">Scholarship Status</th>
                            <th className="p-3">Coding Profiles</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => (
                            <tr key={student._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{student.user?.name}</td>
                                <td className="p-3">{student.enrollmentNo}</td>
                                <td className="p-3">{student.currentSemester}</td>
                                <td className="p-3">{student.cgpa}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${student.progress || 0}%` }}></div>
                                        </div>
                                        <span className="text-xs">{student.progress || 0}%</span>
                                    </div>
                                </td>
                                <td className="p-3">
                                    {(student.progress || 0) >= 90 ? (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">Eligible</span>
                                    ) : (
                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold">Risk</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    {student.codingProfiles?.length > 0 ? (
                                        <div className="text-xs">
                                            {student.codingProfiles.map((cp, i) => (
                                                <div key={i}>{cp.platform}: {cp.handle}</div>
                                            ))}
                                        </div>
                                    ) : <span className="text-gray-400 text-xs">None</span>}
                                </td>
                                <td className="p-3 flex gap-2">
                                    <button 
                                        onClick={() => setSelectedStudent(student)}
                                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                    >
                                        Assign Target
                                    </button>
                                    <button 
                                        onClick={() => openChat(student)}
                                        className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                                    >
                                        Chat
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </>
      )}

      {/* Target Assignment Modal */}
      {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-96">
                  <h3 className="text-lg font-bold mb-4">Assign Target to {selectedStudent.user?.name}</h3>
                  <form onSubmit={handleAssignTarget}>
                      <div className="mb-2">
                          <label className="block text-sm">Title</label>
                          <input required value={targetForm.title} onChange={e => setTargetForm({...targetForm, title: e.target.value})} className="border p-1 w-full"/>
                      </div>
                      <div className="mb-2">
                          <label className="block text-sm">Description</label>
                          <textarea value={targetForm.description} onChange={e => setTargetForm({...targetForm, description: e.target.value})} className="border p-1 w-full"></textarea>
                      </div>
                      <div className="mb-2">
                          <label className="block text-sm">Semester</label>
                          <input type="number" required value={targetForm.semester} onChange={e => setTargetForm({...targetForm, semester: e.target.value})} className="border p-1 w-full"/>
                      </div>
                      <div className="mb-4">
                          <label className="block text-sm">Deadline</label>
                          <input type="date" required value={targetForm.deadline} onChange={e => setTargetForm({...targetForm, deadline: e.target.value})} className="border p-1 w-full"/>
                      </div>
                      <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setSelectedStudent(null)} className="text-gray-500">Cancel</button>
                          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Assign</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Chat Modal */}
      {chatStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded shadow-lg w-[500px] h-[600px] flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t">
                      <h3 className="font-bold">Chat with {chatStudent.user?.name}</h3>
                      <button onClick={() => setChatStudent(null)} className="text-gray-500 hover:text-gray-700">X</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-white">
                      {messages.map((m, i) => (
                          <div key={i} className={`mb-2 flex ${m.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                              <div className={`p-2 rounded max-w-xs ${m.sender === user._id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                  {m.content}
                              </div>
                          </div>
                      ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50 rounded-b flex gap-2">
                      <input 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border p-2 rounded"
                        autoFocus
                      />
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
