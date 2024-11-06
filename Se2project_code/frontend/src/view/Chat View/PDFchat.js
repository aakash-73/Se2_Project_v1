// PDFchat.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PDFchat = ({ username }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [syllabi, setSyllabi] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Fetch all unique course names for dropdown, or only those uploaded by the professor if viewing as a student
    const fetchCourses = async () => {
      try {
        const url = username ? `http://localhost:5000/syllabi?username=${username}` : 'http://localhost:5000/syllabi/all';
        const response = await axios.get(url, { withCredentials: true });
        
        if (response.data && Array.isArray(response.data)) {
          const courseNames = [...new Set(response.data.map((syllabus) => syllabus.course_name))];
          setCourses(courseNames);
        } else {
          console.error("Unexpected response data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [username]);

  const handleCourseSelect = async (e) => {
    const courseName = e.target.value;
    setSelectedCourse(courseName);

    // Fetch syllabi for the selected course
    try {
      const response = await axios.get(`http://localhost:5000/syllabi${username ? `?username=${username}` : '/all'}`, { withCredentials: true });
      if (response.data && Array.isArray(response.data)) {
        const filteredSyllabi = response.data.filter((syllabus) => syllabus.course_name === courseName);
        setSyllabi(filteredSyllabi);
      } else {
        console.error("Unexpected response data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching syllabi:", error);
    }
  };

  const handleViewPdf = (pdfId) => {
    setPdfFile(`http://localhost:5000/get_pdf/${pdfId}`);
    setShowPreview(true);
  };

  return (
    <div>
      <h2 className="mt-4">PDF Chat</h2>

      {/* Dropdown for selecting course */}
      <div className="mb-4">
        <label>Select Course:</label>
        <select
          className="form-control"
          value={selectedCourse}
          onChange={handleCourseSelect}
        >
          <option value="">Select a course</option>
          {courses.map((course, index) => (
            <option key={index} value={course}>{course}</option>
          ))}
        </select>
      </div>

      {/* Table for displaying syllabi of the selected course */}
      {syllabi.length > 0 && (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Department Name</th>
              <th>Professor</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {syllabi.map((syllabus) => (
              <tr key={syllabus.id}>
                <td>{syllabus.course_id}</td>
                <td>{syllabus.course_name}</td>
                <td>{syllabus.department_name}</td>
                <td>{syllabus.professor}</td>
                <td>{syllabus.syllabus_description}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewPdf(syllabus.syllabus_pdf)}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Floating Tab for PDF Preview */}
      {showPreview && (
        <div style={styles.modalOverlay}>
          <div style={styles.floatingTab}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>Syllabus PDF</h5>
              <button style={styles.close} onClick={() => setShowPreview(false)}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              {pdfFile && (
                <embed src={pdfFile} style={styles.pdfEmbed} type="application/pdf" />
              )}
            </div>
            <div style={styles.modalFooter}>
              <button className="btn btn-primary" onClick={() => alert("Chat functionality coming soon!")}>
                Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles for modal overlay and PDF preview
const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  floatingTab: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '85%',
    maxWidth: '800px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    animation: 'fadeIn 0.3s ease-in-out',
    padding: '20px',
  },
  modalHeader: {
    paddingBottom: '10px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.25rem',
  },
  close: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  modalBody: {
    paddingTop: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfEmbed: {
    width: '100%',
    height: '400px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  modalFooter: {
    paddingTop: '10px',
    borderTop: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'center',
  },
};

export default PDFchat;
