import { useState } from "react";

const Home = () => {
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    experience: "",
    resume: null,
    status: "New",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCandidate((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewCandidate((prev) => ({ ...prev, resume: e.target.files[0] }));
  };

  const addCandidate = () => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.experience) {
      alert("Please fill in all required fields");
      return;
    }
    
    setCandidates((prev) => [...prev, { ...newCandidate, id: Date.now() }]);
    setNewCandidate({
      name: "",
      email: "",
      experience: "",
      resume: null,
      status: "New",
    });
  };

  const updateCandidateStatus = (index, status) => {
    setCandidates((prev) => {
      const updated = [...prev];
      updated[index].status = status;
      return updated;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Evaluated': return 'bg-yellow-100 text-yellow-800';
      case 'Hired': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">WorkAI</h1>
          <p className="text-lg text-gray-600">Employee Referral Management System</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-center text-red-600 mb-8 font-cursive">
            Raise New Referral
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                placeholder="Enter candidate name"
                name="name"
                value={newCandidate.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                name="email"
                value={newCandidate.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience *
              </label>
              <input
                type="text"
                placeholder="Years of experience"
                name="experience"
                value={newCandidate.experience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button
              onClick={addCandidate}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition duration-200 shadow-md"
            >
              Submit Referral
            </button>
          </div>
        </div>

        {candidates.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Candidate List ({candidates.length})
            </h2>
            
            <div className="space-y-4">
              {candidates.map((candidate, index) => (
                <div key={candidate.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{candidate.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{candidate.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium text-gray-900">{candidate.experience}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Status</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(candidate.status)}`}>
                          {candidate.status}
                        </span>
                        <select
                          value={candidate.status}
                          onChange={(e) => updateCandidateStatus(index, e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="New">New</option>
                          <option value="Evaluated">Evaluated</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {candidate.resume && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Resume: <span className="text-blue-600">{candidate.resume.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;