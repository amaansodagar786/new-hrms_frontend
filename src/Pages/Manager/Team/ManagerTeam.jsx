import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUsers, 
  FaUser, 
  FaIdCard, 
  FaBriefcase, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope,
  FaSearch,
  FaTimes,
  FaUserCheck
} from 'react-icons/fa';
import './ManagerTeam.scss';

const ManagerTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  useEffect(() => {
    // Filter team members based on search
    if (searchTerm.trim() === '') {
      setFilteredMembers(teamMembers);
    } else {
      const filtered = teamMembers.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.designation && member.designation.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, teamMembers]);

  const fetchMyTeam = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/employee/team`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        setTeamMembers(response.data.employees);
        setFilteredMembers(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="mt-loading">
        <div className="mt-spinner" />
        <p>Loading your team...</p>
      </div>
    );
  }

  return (
    <div className="mt-container">
      {/* Page Header */}
      <div className="mt-page-header">
        <div>
          <span className="mt-page-header__badge">
            <FaUsers /> My Team
          </span>
          <h1>Team Members</h1>
          <p>Manage and view your team members</p>
        </div>
        <div className="mt-stats-badge">
          <FaUserCheck />
          <span>{filteredMembers.length} Members</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-search-wrapper">
        <div className="mt-search">
          <FaSearch className="mt-search__icon" />
          <input
            type="text"
            placeholder="Search by name, ID, department or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-search__input"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="mt-search__clear">
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Team Members List */}
      {filteredMembers.length === 0 ? (
        <div className="mt-empty">
          <div className="mt-empty__icon">
            <FaUsers />
          </div>
          <h3>No team members found</h3>
          <p>
            {searchTerm 
              ? `No results matching "${searchTerm}"` 
              : "You don't have any team members assigned yet"}
          </p>
        </div>
      ) : (
        <div className="mt-list">
          {/* List Header */}
          <div className="mt-list__header">
            <div className="mt-list__col mt-list__col--name">Employee</div>
            {/* <div className="mt-list__col mt-list__col--id">ID</div> */}
            <div className="mt-list__col mt-list__col--dept">Department</div>
            <div className="mt-list__col mt-list__col--designation">Designation</div>
            <div className="mt-list__col mt-list__col--contact">Contact</div>
            <div className="mt-list__col mt-list__col--action">Action</div>
          </div>

          {/* List Items */}
          {filteredMembers.map((member, index) => (
            <div key={member.employeeId} className="mt-list__item">
              <div className="mt-list__col mt-list__col--name">
                <div className="mt-avatar">
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="mt-list__name">{member.name}</div>
                  <div className="mt-list__email">{member.email}</div>
                </div>
              </div>
              
              {/* <div className="mt-list__col mt-list__col--id">
                <FaIdCard className="mt-list__icon" />
                <span>{member.employeeId}</span>
              </div> */}
              
              <div className="mt-list__col mt-list__col--dept">
                <FaBuilding className="mt-list__icon" />
                <span>{member.department || '—'}</span>
              </div>
              
              <div className="mt-list__col mt-list__col--designation">
                <FaBriefcase className="mt-list__icon" />
                <span>{member.designation || '—'}</span>
              </div>
              
              <div className="mt-list__col mt-list__col--contact">
                {member.phone ? (
                  <>
                    <FaPhone className="mt-list__icon" />
                    <span>{member.phone}</span>
                  </>
                ) : (
                  <span className="mt-list__na">—</span>
                )}
              </div>
              
              <div className="mt-list__col mt-list__col--action">
                <button 
                  className="mt-view-btn"
                  onClick={() => handleViewDetails(member)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {filteredMembers.length > 0 && (
        <div className="mt-stats">
          <div className="mt-stats__item">
            <span className="mt-stats__label">Total Members</span>
            <span className="mt-stats__value">{filteredMembers.length}</span>
          </div>
          <div className="mt-stats__item">
            <span className="mt-stats__label">Departments</span>
            <span className="mt-stats__value">
              {new Set(filteredMembers.map(m => m.department).filter(Boolean)).size}
            </span>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {showModal && selectedMember && (
        <div className="mt-modal-overlay" onClick={closeModal}>
          <div className="mt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mt-modal__header">
              <div className="mt-modal__avatar">
                {selectedMember.name?.charAt(0).toUpperCase()}
              </div>
              <button className="mt-modal__close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className="mt-modal__body">
              <h2>{selectedMember.name}</h2>
              <p className="mt-modal__role">{selectedMember.designation || 'Employee'}</p>
              
              <div className="mt-modal__info">
                {/* <div className="mt-modal__info-item">
                  <FaIdCard />
                  <div>
                    <label>Employee ID</label>
                    <p>{selectedMember.employeeId}</p>
                  </div>
                </div> */}
                
                <div className="mt-modal__info-item">
                  <FaEnvelope />
                  <div>
                    <label>Email</label>
                    <p>{selectedMember.email}</p>
                  </div>
                </div>
                
                <div className="mt-modal__info-item">
                  <FaBuilding />
                  <div>
                    <label>Department</label>
                    <p>{selectedMember.department || 'Not assigned'}</p>
                  </div>
                </div>
                
                <div className="mt-modal__info-item">
                  <FaBriefcase />
                  <div>
                    <label>Designation</label>
                    <p>{selectedMember.designation || 'Not assigned'}</p>
                  </div>
                </div>
                
                {selectedMember.phone && (
                  <div className="mt-modal__info-item">
                    <FaPhone />
                    <div>
                      <label>Phone</label>
                      <p>{selectedMember.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTeam;