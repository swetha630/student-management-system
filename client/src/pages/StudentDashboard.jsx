import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [targets, setTargets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
      education: { ssc: {}, intermediate: {}, btech: {} },
      socialLinks: {},
      projects: [],
      internships: [],
      certifications: [],
      semesterResults: [],
      codingProfiles: []
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const profileRes = await axios.get('/api/student/profile', config);
      const targetsRes = await axios.get('/api/student/targets', config);
      const notifRes = await axios.get('/api/notifications', config);
      const adminsRes = await axios.get('/api/messages/conversations', config);

      setProfile(profileRes.data);
      setFormData({
          ...profileRes.data,
          education: profileRes.data.education || { ssc: {}, intermediate: {}, btech: {} },
          socialLinks: profileRes.data.socialLinks || {},
          projects: profileRes.data.projects || [],
          internships: profileRes.data.internships || [],
          certifications: profileRes.data.certifications || [],
          semesterResults: profileRes.data.semesterResults || []
      });
      setTargets(targetsRes.data);
      setNotifications(notifRes.data);
      if(adminsRes.data.length > 0) setSelectedAdmin(adminsRes.data[0]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
      if(selectedAdmin) {
          fetchMessages(selectedAdmin._id);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAdmin]);

  const fetchMessages = async (adminId) => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.get(`/api/messages/${adminId}`, config);
          setMessages(res.data);
      } catch (error) {
          console.error(error);
      }
  }

  const handleSendMessage = async (e) => {
      e.preventDefault();
      if(!newMessage.trim() || !selectedAdmin) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post('/api/messages', { recipientId: selectedAdmin._id, content: newMessage }, config);
          setNewMessage('');
          fetchMessages(selectedAdmin._id);
      } catch (error) {
          console.error(error);
      }
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` },
        };
        const res = await axios.put('/api/student/profile', formData, config);
        setProfile(res.data);
        setEditMode(false);
    } catch (error) {
        console.error(error);
    }
  };

  const updateTargetStatus = async (id, status) => {
      try {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` },
        };
        await axios.put(`/api/student/targets/${id}`, { status }, config);
        fetchData();
      } catch (error) {
          console.error(error);
      }
  }

  // Helper Functions for Form
  const handleNestedChange = (parent, key, value) => {
      setFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent], [key]: value }
      }));
  };

  const handleEducationChange = (level, key, value) => {
      setFormData(prev => ({
          ...prev,
          education: {
              ...prev.education,
              [level]: { ...prev.education[level], [key]: value }
          }
      }));
  };

  const handleArrayChange = (arrayName, index, key, value) => {
      const newArray = [...(formData[arrayName] || [])];
      newArray[index] = { ...newArray[index], [key]: value };
      setFormData({ ...formData, [arrayName]: newArray });
  };

  const addArrayItem = (arrayName, initialItem) => {
      setFormData({ ...formData, [arrayName]: [...(formData[arrayName] || []), initialItem] });
  };

  const removeArrayItem = (arrayName, index) => {
      const newArray = [...formData[arrayName]];
      newArray.splice(index, 1);
      setFormData({ ...formData, [arrayName]: newArray });
  };

  if (loading) return <div>Loading...</div>;

  const groupedTargets = targets.reduce((acc, target) => {
      const sem = target.semester;
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(target);
      return acc;
  }, {});

  const totalTargets = targets.length;
  const completedTargets = targets.filter(t => t.status === 'completed').length;
  const progress = totalTargets === 0 ? 0 : Math.round((completedTargets / totalTargets) * 100);

  const formatScore = (score) => {
      if (!score) return '';
      const val = parseFloat(score);
      return val <= 10 ? `CGPA: ${val}/10` : `Percentage: ${val}%`;
  };

  return (
    <div className="pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        {/* Profile Section */}
        <div className="bg-white p-6 rounded shadow max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Profile</h2>
              <button onClick={() => setEditMode(!editMode)} className="text-blue-600">
                  {editMode ? 'Cancel' : 'Edit'}
              </button>
          </div>
          
          {editMode ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                  {/* Basic Info */}
                  <h3 className="font-bold border-b">Basic Info</h3>
                  <div><label className="text-xs">Phone</label><input value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="border p-1 w-full"/></div>
                  <div><label className="text-xs">Address</label><input value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="border p-1 w-full"/></div>
                  <div><label className="text-xs">Current Semester</label><input type="number" value={formData.currentSemester || ''} onChange={e => setFormData({...formData, currentSemester: e.target.value})} className="border p-1 w-full"/></div>
                  <div><label className="text-xs">Overall CGPA</label><input type="number" step="0.01" value={formData.cgpa || ''} onChange={e => setFormData({...formData, cgpa: e.target.value})} className="border p-1 w-full"/></div>

                  {/* Social Links */}
                  <h3 className="font-bold border-b mt-4">Social Links</h3>
                  <div><label className="text-xs">LinkedIn</label><input value={formData.socialLinks?.linkedin || ''} onChange={e => handleNestedChange('socialLinks', 'linkedin', e.target.value)} className="border p-1 w-full"/></div>
                  <div><label className="text-xs">GitHub</label><input value={formData.socialLinks?.github || ''} onChange={e => handleNestedChange('socialLinks', 'github', e.target.value)} className="border p-1 w-full"/></div>
                  <div><label className="text-xs">LeetCode</label><input value={formData.socialLinks?.leetcode || ''} onChange={e => handleNestedChange('socialLinks', 'leetcode', e.target.value)} className="border p-1 w-full"/></div>

                  {/* Education */}
                  <h3 className="font-bold border-b mt-4">Education</h3>
                  <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm font-semibold">B.Tech</p>
                      <input placeholder="College" value={formData.education?.btech?.college || ''} onChange={e => handleEducationChange('btech', 'college', e.target.value)} className="border p-1 w-full mb-1 text-sm"/>
                      <div className="flex gap-2">
                          <input placeholder="Year" value={formData.education?.btech?.year || ''} onChange={e => handleEducationChange('btech', 'year', e.target.value)} className="border p-1 w-1/2 text-sm"/>
                          <input placeholder="Current CGPA" value={formData.education?.btech?.currentCgpa || ''} onChange={e => handleEducationChange('btech', 'currentCgpa', e.target.value)} className="border p-1 w-1/2 text-sm"/>
                      </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm font-semibold">Intermediate</p>
                      <input placeholder="College" value={formData.education?.intermediate?.college || ''} onChange={e => handleEducationChange('intermediate', 'college', e.target.value)} className="border p-1 w-full mb-1 text-sm"/>
                      <div className="flex gap-2">
                          <input placeholder="Year" value={formData.education?.intermediate?.year || ''} onChange={e => handleEducationChange('intermediate', 'year', e.target.value)} className="border p-1 w-1/2 text-sm"/>
                          <input placeholder="Percentage" value={formData.education?.intermediate?.percentage || ''} onChange={e => handleEducationChange('intermediate', 'percentage', e.target.value)} className="border p-1 w-1/2 text-sm"/>
                      </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm font-semibold">SSC</p>
                      <input placeholder="School" value={formData.education?.ssc?.school || ''} onChange={e => handleEducationChange('ssc', 'school', e.target.value)} className="border p-1 w-full mb-1 text-sm"/>
                      <div className="flex gap-2">
                          <input placeholder="Year" value={formData.education?.ssc?.year || ''} onChange={e => handleEducationChange('ssc', 'year', e.target.value)} className="border p-1 w-1/2 text-sm"/>
                          <input placeholder="Percentage" value={formData.education?.ssc?.percentage || ''} onChange={e => handleEducationChange('ssc', 'percentage', e.target.value)} className="border p-1 w-1/2 text-sm"/>
                      </div>
                  </div>

                  {/* Semester Results */}
                  <h3 className="font-bold border-b mt-4">Semester Results (SGPA/CGPA)</h3>
                  {formData.semesterResults?.map((res, i) => (
                      <div key={i} className="flex gap-2 mb-1">
                          <input type="number" placeholder="Sem" value={res.semester} onChange={e => handleArrayChange('semesterResults', i, 'semester', e.target.value)} className="border p-1 w-1/4"/>
                          <input type="number" step="0.01" placeholder="SGPA" value={res.sgpa} onChange={e => handleArrayChange('semesterResults', i, 'sgpa', e.target.value)} className="border p-1 w-1/3"/>
                          <input type="number" step="0.01" placeholder="CGPA" value={res.cgpa} onChange={e => handleArrayChange('semesterResults', i, 'cgpa', e.target.value)} className="border p-1 w-1/3"/>
                          <button type="button" onClick={() => removeArrayItem('semesterResults', i)} className="text-red-500">x</button>
                      </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('semesterResults', { semester: '', sgpa: '', cgpa: '' })} className="text-sm text-blue-600">+ Add Semester</button>

                  {/* Projects */}
                  <h3 className="font-bold border-b mt-4">Projects</h3>
                  {formData.projects?.map((p, i) => (
                      <div key={i} className="bg-gray-50 p-2 rounded mb-2">
                          <input placeholder="Title" value={p.title} onChange={e => handleArrayChange('projects', i, 'title', e.target.value)} className="border p-1 w-full mb-1"/>
                          <textarea placeholder="Description" value={p.description} onChange={e => handleArrayChange('projects', i, 'description', e.target.value)} className="border p-1 w-full mb-1 text-sm"/>
                          <input placeholder="Tech Stack" value={p.techStack} onChange={e => handleArrayChange('projects', i, 'techStack', e.target.value)} className="border p-1 w-full mb-1"/>
                          <input placeholder="Link" value={p.link} onChange={e => handleArrayChange('projects', i, 'link', e.target.value)} className="border p-1 w-full mb-1"/>
                          <button type="button" onClick={() => removeArrayItem('projects', i)} className="text-red-500 text-xs">Remove Project</button>
                      </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('projects', { title: '', description: '', techStack: '', link: '' })} className="text-sm text-blue-600">+ Add Project</button>

                  {/* Internships */}
                  <h3 className="font-bold border-b mt-4">Internships</h3>
                  {formData.internships?.map((item, i) => (
                      <div key={i} className="bg-gray-50 p-2 rounded mb-2">
                          <input placeholder="Company" value={item.company} onChange={e => handleArrayChange('internships', i, 'company', e.target.value)} className="border p-1 w-full mb-1"/>
                          <input placeholder="Role" value={item.role} onChange={e => handleArrayChange('internships', i, 'role', e.target.value)} className="border p-1 w-full mb-1"/>
                          <input placeholder="Duration" value={item.duration} onChange={e => handleArrayChange('internships', i, 'duration', e.target.value)} className="border p-1 w-full mb-1"/>
                          <textarea placeholder="Description" value={item.description} onChange={e => handleArrayChange('internships', i, 'description', e.target.value)} className="border p-1 w-full mb-1 text-sm"/>
                          <button type="button" onClick={() => removeArrayItem('internships', i)} className="text-red-500 text-xs">Remove Internship</button>
                      </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('internships', { company: '', role: '', duration: '', description: '' })} className="text-sm text-blue-600">+ Add Internship</button>

                  {/* Certifications */}
                  <h3 className="font-bold border-b mt-4">Certifications</h3>
                  {formData.certifications?.map((c, i) => (
                      <div key={i} className="flex gap-2 mb-1 flex-wrap">
                          <input placeholder="Name" value={c.name} onChange={e => handleArrayChange('certifications', i, 'name', e.target.value)} className="border p-1 flex-1"/>
                          <input placeholder="Issuer" value={c.issuer} onChange={e => handleArrayChange('certifications', i, 'issuer', e.target.value)} className="border p-1 w-1/4"/>
                          <input placeholder="Year" value={c.year} onChange={e => handleArrayChange('certifications', i, 'year', e.target.value)} className="border p-1 w-20"/>
                          <button type="button" onClick={() => removeArrayItem('certifications', i)} className="text-red-500">x</button>
                      </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('certifications', { name: '', issuer: '', year: '', link: '' })} className="text-sm text-blue-600">+ Add Certification</button>

                  {/* Technical Skills */}
                  <h3 className="font-bold border-b mt-4">Technical Skills</h3>
                  {formData.technicalSkills?.map((skill, i) => (
                      <div key={i} className="flex gap-2 mb-1">
                          <input placeholder="Category (e.g. Programming)" value={skill.category} onChange={e => handleArrayChange('technicalSkills', i, 'category', e.target.value)} className="border p-1 w-1/3"/>
                          <input placeholder="Skills (comma separated)" value={skill.items} onChange={e => handleArrayChange('technicalSkills', i, 'items', e.target.value)} className="border p-1 w-2/3"/>
                          <button type="button" onClick={() => removeArrayItem('technicalSkills', i)} className="text-red-500">x</button>
                      </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('technicalSkills', { category: '', items: '' })} className="text-sm text-blue-600">+ Add Skill Category</button>

                   {/* Achievements */}
                   <h3 className="font-bold border-b mt-4">Achievements</h3>
                   <div className="mb-2">
                      <label className="block text-sm">Achievements (comma separated)</label>
                      <input value={formData.achievements || ''} onChange={e => setFormData({...formData, achievements: e.target.value.toString().split(',')})} className="border p-1 w-full"/>
                   </div>

                  <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded mt-4 w-full">Save Profile</button>
              </form>
          ) : (
              <div>
                  {/* Read-Only View */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">{profile?.user?.name}</h3>
                    <p className="text-sm text-gray-600">{profile?.enrollmentNo} | {profile?.branch}</p>
                    <p className="text-sm">{profile?.phone} | {profile?.email} | {profile?.address}</p>
                    <div className="flex gap-2 text-sm text-blue-600 mt-1">
                        {profile?.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                        {profile?.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" rel="noreferrer">GitHub</a>}
                        {profile?.socialLinks?.leetcode && <a href={profile.socialLinks.leetcode} target="_blank" rel="noreferrer">LeetCode</a>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                          <span className="font-semibold block">CGPA</span> {profile?.cgpa}
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                          <span className="font-semibold block">Semester</span> {profile?.currentSemester}
                      </div>
                  </div>

                  {profile?.cgpa < 8.5 && (
                      <div className="bg-red-100 text-red-700 p-2 rounded my-2 text-sm border border-red-300">
                          Warning: You are currently not eligible for scholarships (CGPA {'<'} 8.5).
                      </div>
                  )}
                  {progress < 90 && (
                      <div className="bg-red-100 text-red-700 p-2 rounded my-2 text-sm border border-red-300">
                          Warning: Scholarship under risk! Your work progress is {progress}% (Required: 90%).
                      </div>
                  )}

                  <div className="mt-4">
                      <h4 className="font-bold border-b mb-2">Projects</h4>
                      {profile?.projects?.length > 0 ? profile.projects.map((p, i) => (
                          <div key={i} className="mb-2">
                              <p className="font-semibold text-sm">{p.title}</p>
                              <p className="text-xs text-gray-600">{p.description}</p>
                              <p className="text-xs text-gray-500 italic">{p.techStack}</p>
                          </div>
                      )) : <p className="text-xs text-gray-500">No projects added.</p>}
                  </div>

                  <div className="mt-4">
                      <h4 className="font-bold border-b mb-2">Internships</h4>
                      {profile?.internships?.length > 0 ? profile.internships.map((item, i) => (
                          <div key={i} className="mb-2">
                              <p className="font-semibold text-sm">{item.company} - {item.role}</p>
                              <p className="text-xs text-gray-600">{item.duration}</p>
                          </div>
                      )) : <p className="text-xs text-gray-500">No internships added.</p>}
                  </div>
              </div>
          )}
        </div>

        {/* Notifications & Progress */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Overall Progress</h2>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-green-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-right text-sm mt-1">{progress}% Completed</p>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Notifications</h2>
                {notifications.length === 0 ? <p className="text-gray-500">No notifications.</p> : (
                    <ul className="max-h-48 overflow-y-auto">
                        {notifications.map(n => (
                            <li key={n._id} className="border-b py-2">
                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${n.type === 'contest' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}`}>{n.type}</span>
                                <p className="mt-1">{n.message}</p>
                                <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Chat Section */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Chat with Admin</h2>
                <div className="border rounded h-64 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`mb-2 flex ${m.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2 rounded max-w-xs ${m.sender === user._id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} className="p-2 border-t flex">
                        <input 
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 border p-2 rounded-l"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 rounded-r">Send</button>
                    </form>
                </div>
            </div>
        </div>

        {/* Targets Section */}
        <div className="md:col-span-2 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Academic Targets (Semester-wise)</h2>
          {Object.keys(groupedTargets).length === 0 ? <p>No targets assigned.</p> : (
              Object.keys(groupedTargets).sort().map(sem => (
                  <div key={sem} className="mb-6">
                      <h3 className="font-bold text-lg border-b pb-1 mb-2">Semester {sem}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {groupedTargets[sem].map(target => (
                              <div key={target._id} className={`p-4 rounded border ${target.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="font-semibold">{target.title}</span>
                                      {target.status === 'completed' ? (
                                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Done</span>
                                      ) : (
                                          <button 
                                              onClick={() => updateTargetStatus(target._id, 'completed')}
                                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                          >
                                              Mark Done
                                          </button>
                                      )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{target.description}</p>
                                  <p className="text-xs text-gray-500">Deadline: {new Date(target.deadline).toLocaleDateString()}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              ))
          )}
        </div>
        
        {/* Resume Print Button */}
        <div className="md:col-span-2 bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Resume Generation</h2>
            <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={() => window.print()}>
                Print Resume / Download PDF
            </button>
        </div>
      </div>

      {/* PRINT ONLY RESUME VIEW */}
      <div className="hidden print:block p-8 bg-white text-black font-serif max-w-[21cm] mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
              <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{profile?.user?.name}</h1>
              
              <div className="flex justify-center items-center gap-4 text-sm flex-wrap">
                  {profile?.socialLinks?.github && (
                      <a href={profile.socialLinks.github} className="text-black underline font-bold">GitHub</a>
                  )}
                  {profile?.socialLinks?.linkedin && (
                      <a href={profile.socialLinks.linkedin} className="text-black underline font-bold">LinkedIn</a>
                  )}
                  {profile?.socialLinks?.leetcode && (
                      <a href={profile.socialLinks.leetcode} className="text-black underline font-bold">LeetCode</a>
                  )}
                   <div className="flex items-center gap-1">
                      <span className="font-bold">Email</span> {profile?.user?.email}
                   </div>
              </div>
              
              <div className="flex justify-center items-center gap-4 text-sm mt-1">
                   <div className="flex items-center gap-1">
                      <span className="font-bold">Location</span> {profile?.address}
                   </div>
                   <div className="flex items-center gap-1">
                      <span className="font-bold">Phone</span> {profile?.phone}
                   </div>
              </div>
          </div>

          {/* Education */}
          <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wide">Education</h2>
              
              {profile?.education?.btech?.college && (
                  <div className="mb-2">
                      <div className="flex justify-between text-sm font-bold">
                          <span>{profile.education.btech.college}</span>
                          <span>{profile.education.btech.year}</span>
                      </div>
                      <div className="flex justify-between text-sm italic">
                          <span>Bachelor of Technology in {profile.branch}</span>
                          <span>{formatScore(profile.education.btech.currentCgpa)}</span>
                      </div>
                  </div>
              )}
              
              {profile?.education?.intermediate?.college && (
                  <div className="mb-2">
                      <div className="flex justify-between text-sm font-bold">
                          <span>{profile.education.intermediate.college}</span>
                          <span>{profile.education.intermediate.year}</span>
                      </div>
                      <div className="flex justify-between text-sm italic">
                          <span>Intermediate (MPC)</span>
                          <span>{formatScore(profile.education.intermediate.percentage)}</span>
                      </div>
                  </div>
              )}

              {profile?.education?.ssc?.school && (
                  <div className="mb-2">
                      <div className="flex justify-between text-sm font-bold">
                          <span>{profile.education.ssc.school}</span>
                          <span>{profile.education.ssc.year}</span>
                      </div>
                      <div className="flex justify-between text-sm italic">
                          <span>Secondary School Certificate</span>
                          <span>{formatScore(profile.education.ssc.percentage)}</span>
                      </div>
                  </div>
              )}
          </div>

          {/* Technical Skills */}
          {profile?.technicalSkills?.length > 0 && (
            <div className="mb-4">
                <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wide">Technical Skills</h2>
                <div className="text-sm">
                    {profile.technicalSkills.map((skill, i) => (
                        <div key={i} className="grid grid-cols-[150px_1fr] mb-1">
                            <span className="font-bold">{skill.category}:</span>
                            <span>{skill.items}</span>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* Internships */}
          {profile?.internships?.length > 0 && (
            <div className="mb-4">
                <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wide">Internships</h2>
                {profile.internships.map((item, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold">{item.company}</span>
                            <span className="italic">{item.duration}</span>
                        </div>
                        <div className="text-sm italic mb-1">{item.role}</div>
                        <ul className="list-disc ml-5 text-sm">
                            {item.description.split('\n').map((line, idx) => (
                                line.trim() && <li key={idx}>{line.trim()}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
          )}

          {/* Projects */}
          {profile?.projects?.length > 0 && (
            <div className="mb-4">
                <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wide">Projects</h2>
                {profile.projects.map((p, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold">{p.title}</span>
                            <span className="italic">{p.techStack}</span>
                        </div>
                        <ul className="list-disc ml-5 text-sm mt-1">
                            {p.description.split('\n').map((line, idx) => (
                                line.trim() && <li key={idx}>{line.trim()}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
          )}

           {/* Achievements & Certifications */}
           <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wide">Achievements & Certifications</h2>
              <ul className="list-disc ml-5 text-sm">
                  {profile?.certifications?.map((c, i) => (
                      <li key={`cert-${i}`}>
                          <span className="font-bold">{c.name}</span> — {c.issuer}
                      </li>
                  ))}
                  {profile?.achievements?.map((a, i) => (
                      <li key={`ach-${i}`}>{a}</li>
                  ))}
              </ul>
          </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
