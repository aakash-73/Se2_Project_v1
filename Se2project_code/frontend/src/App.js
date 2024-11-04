// App.js
import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import Login from './view/Login';
import Register from './view/Register';
import UploadSyllabus from './view/PDF View/UploadSyllabus';
import SyllabusList from './view/PDF View/SyllabusList';
import PdfViewer from './view/PDF View/PdfViewer';
import EditPDF from './view/PDF View/EditPDF';
import DeletePDF from './view/PDF View/DeletePDF';
import Drawer from './view/Drawer View/Drawer';
import UserList from './view/User View/UserList';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [viewAsStudent, setViewAsStudent] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [syllabus, setSyllabus] = useState({});
  const [syllabi, setSyllabi] = useState([]);
  const [pdfToEdit, setPdfToEdit] = useState(null);
  const [pdfToDelete, setPdfToDelete] = useState(null);
  const [listKey, setListKey] = useState(0);
  const [adminView, setAdminView] = useState(localStorage.getItem('adminView') || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isUserListView = adminView === 'userList' || adminView === 'registrationRequests';

  // Fetch user data from local storage on mount
  useEffect(() => {
    const storedUserType = localStorage.getItem('user_type');
    const storedUsername = localStorage.getItem('username');
    if (storedUserType && storedUsername) {
      setIsLoggedIn(true);
      setUserType(storedUserType);
      setUsername(storedUsername);
    }
  }, []);

  // Fetch syllabi based on user type
  const fetchSyllabi = useCallback(async () => {
    try {
      const endpoint = userType === 'student' ? 'http://localhost:5000/syllabi/all' : 'http://localhost:5000/syllabi';
      const response = await axios.get(endpoint, { withCredentials: true });
      setSyllabi(response.data);
    } catch (error) {
      console.error('Error fetching syllabi:', error);
    }
  }, [userType]);

  // Fetch syllabi whenever login status, userType, or view mode changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchSyllabi();
    }
  }, [isLoggedIn, userType, viewAsStudent, fetchSyllabi]);

  // Persist admin view in local storage
  useEffect(() => {
    if (adminView) {
      localStorage.setItem('adminView', adminView);
    } else {
      localStorage.removeItem('adminView');
    }
  }, [adminView]);

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserType('');
    setViewAsStudent(false);
    setSyllabi([]);
    setSelectedPdf(null);
    setAdminView(null);
    localStorage.removeItem('username');
    localStorage.removeItem('user_type');
    localStorage.removeItem('adminView');
  };

  const toggleSignUp = () => setIsSignUp((prev) => !prev);

  const toggleViewMode = () => setViewAsStudent((prev) => !prev);

  const handleUploadSuccess = () => {
    fetchSyllabi();
    setListKey((prev) => prev + 1);
  };

  const handleOptionSelect = (option) => {
    setAdminView(option);
    setIsDrawerOpen(false);
  };

  const returnToAdminView = () => setAdminView(null);

  const renderContent = () => {
    if (adminView === 'userList') {
      return (
        <>
          <h1 className="mt-4 mb-4 text-center">User List</h1>
          <UserList onReturn={returnToAdminView} handleSignOut={handleSignOut} />
        </>
      );
    } else if (adminView === 'registrationRequests') {
      return (
        <>
          <h1 className="mt-4 mb-4 text-center">Registration Requests</h1>
          <div></div>
        </>
      );
    } else {
      return (
        <>
          <h1 className="mt-4 mb-4 text-center">
            {userType.includes('professor') && !viewAsStudent ? `Welcome Professor ${username}` : 'Welcome to Syllabus ChatBot'}
          </h1>
          <button onClick={handleSignOut} className="btn btn-danger mb-4 float-right">Sign Out</button>

          {userType.includes('professor') && viewAsStudent ? (
            <button onClick={toggleViewMode} className="btn btn-info mb-4 float-right me-2">
              View as Faculty
            </button>
          ) : userType.includes('professor') && !viewAsStudent ? (
            <>
              <button onClick={toggleViewMode} className="btn btn-info mb-4 float-right me-2">View as Student</button>
              <UploadSyllabus
                syllabus={syllabus}
                handleChange={(e) => setSyllabus({ ...syllabus, [e.target.name]: e.target.value })}
                resetForm={() => setSyllabus({})}
                onUploadSuccess={handleUploadSuccess}
              />
              <SyllabusList
                key={listKey}
                syllabi={syllabi}
                onEdit={(pdfId) => setPdfToEdit(pdfId)}
                onDelete={(pdfId) => setPdfToDelete(pdfId)}
                onView={(pdfId) => setSelectedPdf(pdfId)}
              />
            </>
          ) : (
            <>
              <p className="text-center">You are logged in as a student.</p>
              <SyllabusList
                key={listKey}
                syllabi={syllabi}
                onView={(pdfId) => setSelectedPdf(pdfId)}
              />
            </>
          )}
        </>
      );
    }
  };

  return (
    <div className="container mt-5">
      {!isLoggedIn ? (
        isSignUp ? (
          <Register toggleSignUp={toggleSignUp} />
        ) : (
          <Login
            toggleSignUp={toggleSignUp}
            setIsLoggedIn={setIsLoggedIn}
            setUserType={setUserType}
            setUsername={setUsername}
          />
        )
      ) : (
        <>
          {userType === 'professor & admin' && (
            <button
              onClick={isUserListView ? returnToAdminView : () => setIsDrawerOpen(true)}
              className="btn btn-outline-secondary mb-4 me-2"
              style={{ position: 'absolute', left: '10px', top: '10px' }}
            >
              {isUserListView ? <i className="fas fa-reply"></i> : '≡'}
            </button>
          )}

          {renderContent()}
        </>
      )}
      {selectedPdf && <PdfViewer pdfId={selectedPdf} handleClose={() => setSelectedPdf(null)} />}
      {pdfToEdit && <EditPDF pdfId={pdfToEdit} handleClose={() => setPdfToEdit(null)} onUpdateSuccess={fetchSyllabi} />}
      {pdfToDelete && <DeletePDF pdfId={pdfToDelete} handleClose={() => setPdfToDelete(null)} onDeleteSuccess={fetchSyllabi} />}

      {userType === 'professor & admin' && !viewAsStudent && (
        <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onOptionSelect={handleOptionSelect} />
      )}
    </div>
  );
}

export default App;
