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
    setNewCandidate((prev) => ({...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewCandidate((prev) => ({ ...prev, resume: e.target.files[0] }));
  };

  const addCandidate = () => {
    setCandidates((prev) => [...prev, newCandidate]);
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

  return (
    <div style={{justifyContent:"center",background:"pink",border:"2px solid",display:"flex",alignItems:"center"}} >
      <div>
        <div >
          <h2 style={{alignItems:"center",justifyContent:"center",textAlign:"center",color:"red",fontFamily:"cursive"}}>Raise New Referral</h2>
          <div style={{display:"flex",flexDirection:"column"}}>
            <label> Name:</label>
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={newCandidate.name}
              onChange={handleInputChange}
            />
            <label> Email:</label>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={newCandidate.email}
              onChange={handleInputChange}
            />
            <label>Experience:</label>
            <input
              type="text"
              placeholder="Experience"
              name="experience"
              value={newCandidate.experience}
              onChange={handleInputChange}
            />
            <label > Resume:</label>
            <input type="file" onChange={handleFileChange} />
            <button style={{width:"100px",height:"30px",background:"green",borderRadius:"10px",border:"none",marginTop:"10px",marginLeft:"70px"}} onClick={addCandidate}>Submit</button>
          </div>

          <h2>Candidate List</h2>
          <ol>
            {candidates.map((candidate, index) => (
              <li type="number" key={index} >
                <div>
                  <strong>Name:</strong> {candidate.name}
                </div>
                <div>
                  <strong>Email:</strong> {candidate.email}
                </div>
                <div>
                  <strong>Experience:</strong> {candidate.experience}
                </div>
                <div>
                  <strong>Status:</strong> {candidate.status}
                </div>
                <div>
                  <select
                    value={candidate.status}
                    onChange={(e) =>
                      updateCandidateStatus(index, e.target.value)
                    }
                  >
                    <option value="New">New</option>
                    <option value="Evaluated">Evaluated</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
export default Home;