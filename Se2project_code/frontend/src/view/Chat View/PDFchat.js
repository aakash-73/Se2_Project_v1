import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chatbot from './Chatbot';

const PDFchat = ({ username }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [syllabi, setSyllabi] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [pdfContent, setPdfContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const url = username
          ? `http://localhost:5000/syllabi?username=${username}`
          : 'http://localhost:5000/syllabi/all';
        const response = await axios.get(url, { withCredentials: true });

        if (response.data && Array.isArray(response.data)) {
          const courseNames = [...new Set(response.data.map((syllabus) => syllabus.course_name))];
          setCourses(courseNames);
        } else {
          console.error('Unexpected response data:', response.data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [username]);

  // Handle course selection
  const handleCourseSelect = async (e) => {
    const courseName = e.target.value;
    setSelectedCourse(courseName);

    try {
      const response = await axios.get(
        `http://localhost:5000/syllabi${username ? `?username=${username}` : '/all'}`,
        { withCredentials: true }
      );
      if (response.data && Array.isArray(response.data)) {
        const filteredSyllabi = response.data.filter((syllabus) => syllabus.course_name === courseName);
        setSyllabi(filteredSyllabi);
      } else {
        console.error('Unexpected response data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching syllabi:', error);
    }
  };

  const handleViewPdf = async (pdfUrl, pdfId) => {
    if (!pdfId) {
        console.error('[ERROR] PDF ID is undefined or null.');
        alert('Invalid PDF selection. Please try again.');
        return;
    }

    console.log('[DEBUG] Selected PDF ID:', pdfId);
    setPdfFile(`http://localhost:5000/get_pdf/${pdfUrl}`);
    setPdfId(pdfId);
    setShowPreview(true);
    setShowChat(false);

    try {
        console.log(`[DEBUG] Fetching PDF content for ID: ${pdfId}`);
        const response = await axios.get(`http://localhost:5000/extract_pdf_content/${pdfId}`, { withCredentials: true });

        console.log('[DEBUG] Full response:', response);
        if (response.status === 200 && response.data.content) {
            console.log('[DEBUG] PDF content successfully extracted.');
            setPdfContent(response.data.content);
        } else {
            console.error('[ERROR] Failed to extract PDF content:', response.data);
            setPdfContent('');
            alert('Failed to load PDF content. Please try again.');
        }
    } catch (error) {
        console.error('[ERROR] Error fetching PDF content:', error.response?.data || error.message);
        setPdfContent('');
        alert('Error loading PDF content. Please check the backend logs for more details.');
    }
};

  // Handle opening the chat window
  const handleOpenChat = () => {
    console.log('[DEBUG] Opening chat with PDF content:', pdfContent);
    if (!pdfContent || pdfContent.trim() === '') {
      alert('PDF content could not be loaded. Please try again.');
      return;
    }
    setShowChat(true);
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
            <option key={`${course}-${index}`} value={course}>
              {course}
            </option>
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
            {syllabi.map((syllabus, index) => (
              <tr key={syllabus.syllabus_pdf || index}>
                <td>{syllabus.course_id}</td>
                <td>{syllabus.course_name}</td>
                <td>{syllabus.department_name}</td>
                <td>{syllabus.professor}</td>
                <td>{syllabus.syllabus_description}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewPdf(syllabus.syllabus_pdf, syllabus.syllabus_pdf)}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* PDF Preview and Chat Button */}
      {showPreview && (
        <div style={styles.modalOverlay}>
          <div style={styles.floatingTab}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>Syllabus PDF</h5>
              <button style={styles.close} onClick={() => setShowPreview(false)}>
                &times;
              </button>
            </div>
            <div style={styles.modalBody}>
              {pdfFile && <embed src={pdfFile} style={styles.pdfEmbed} type="application/pdf" />}
            </div>
            <div style={styles.modalFooter}>
              <button className="btn btn-primary" onClick={handleOpenChat}>
                Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot floating window */}
      {showChat && <Chatbot pdfId={pdfId} pdfContent={pdfContent} onClose={() => setShowChat(false)} />}
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
  pdfEmbed: {
    width: '100%',
    height: '400px',
  },
};

export default PDFchat;
