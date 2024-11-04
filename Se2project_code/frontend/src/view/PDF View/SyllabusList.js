// SyllabusList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PdfViewer from './PdfViewer';
import EditPDF from './EditPDF';
import DeletePDF from './DeletePDF';

const SyllabusList = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [filteredSyllabi, setFilteredSyllabi] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfToEdit, setPdfToEdit] = useState(null);
  const [pdfToDelete, setPdfToDelete] = useState(null);

  useEffect(() => {
    // Fetch syllabi data for the logged-in user
    const fetchSyllabi = async () => {
      try {
        const response = await axios.get('http://localhost:5000/syllabi', { withCredentials: true });
        console.log("Fetched syllabi data:", response.data); // Debug log
        setSyllabi(response.data);  // Set the retrieved data in state
        setFilteredSyllabi(response.data); // Initially show all syllabi
      } catch (error) {
        console.error("Error fetching syllabi data:", error);
      }
    };

    fetchSyllabi();
  }, []);

  const handleSearch = () => {
    // Filter syllabi based on the search query, including department_id
    const filtered = syllabi.filter((item) => 
      item.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.course_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department_id.toLowerCase().includes(searchQuery.toLowerCase()) // Add department_id to search criteria
    );
    setFilteredSyllabi(filtered);
  };

  const handleViewPdf = (pdfId) => {
    setSelectedPdf(pdfId);  // Set the selected PDF ID to display in PdfViewer
  };

  const handleEdit = (pdfId) => {
    setPdfToEdit(pdfId);  // Set the selected PDF ID for editing
  };

  const handleDelete = (pdfId) => {
    setPdfToDelete(pdfId);  // Set the selected PDF ID for deletion
  };

  const refreshSyllabusList = async () => {
    // Function to refresh the list after an edit or delete
    try {
      const response = await axios.get('http://localhost:5000/syllabi', { withCredentials: true });
      setSyllabi(response.data);
      setFilteredSyllabi(response.data); // Reset the filtered list to the full list
    } catch (error) {
      console.error("Error refreshing syllabi data:", error);
    }
  };

  // Helper function to group syllabi by course name
  const groupSyllabiByCourseName = (syllabiList) => {
    return syllabiList.reduce((acc, syllabus) => {
      const courseName = syllabus.course_name;
      if (!acc[courseName]) acc[courseName] = [];
      acc[courseName].push(syllabus);
      return acc;
    }, {});
  };

  // Group syllabi for display
  const groupedSyllabi = groupSyllabiByCourseName(filteredSyllabi);

  return (
    <div>
      <h2 className="mt-4">Uploaded Syllabi</h2>

      {/* Search Field */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Course ID, Course Name, Department Name, or Department ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      {Object.keys(groupedSyllabi).length === 0 ? (
        <p>No syllabi found.</p> // Message if no data
      ) : (
        Object.entries(groupedSyllabi).map(([courseName, syllabi]) => (
          <div key={courseName} className="mb-5">
            <h3>{courseName}</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Department ID</th>
                  <th>Department Name</th>
                  <th>Professor</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {syllabi.map((item) => (
                  <tr key={item.course_id}>
                    <td>{item.course_id}</td>
                    <td>{item.department_id}</td>
                    <td>{item.department_name}</td>
                    <td>{item.professor}</td>
                    <td>{item.syllabus_description}</td>
                    <td>
                      <button
                        className="btn btn-primary me-2"
                        onClick={() => handleViewPdf(item.syllabus_pdf)}
                      >
                        View PDF
                      </button>
                      <button
                        className="btn btn-warning me-2"
                        onClick={() => handleEdit(item.syllabus_pdf)}
                      >
                        Update
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(item.syllabus_pdf)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {selectedPdf && <PdfViewer pdfId={selectedPdf} handleClose={() => setSelectedPdf(null)} />}

      {pdfToEdit && (
        <EditPDF
          pdfId={pdfToEdit}
          handleClose={() => {
            setPdfToEdit(null);
            refreshSyllabusList();  // Refresh list after edit
          }}
        />
      )}

      {pdfToDelete && (
        <DeletePDF
          pdfId={pdfToDelete}
          handleClose={() => setPdfToDelete(null)}
          onDeleteSuccess={() => {
            setPdfToDelete(null);
            refreshSyllabusList();  // Refresh list after delete
          }}
        />
      )}
    </div>
  );
};

export default SyllabusList;
