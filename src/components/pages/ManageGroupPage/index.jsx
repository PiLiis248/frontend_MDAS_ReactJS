import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../common/Navbar";
import Toast from "../../common/Toast";
import Button from "../../common/Button"; 
import ProfileSidebar from "../../pages/ProfileSideBar";
import "../../../assets/ManageGroup.css";
import InputField from "../../common/InputField";
import {
  fetchGroups,
  createGroup,
  editGroup,
  deleteGroups,
  setNotification
} from "../../../redux/actions/groupActions";

const ManageGroupPage = () => {
  const dispatch = useDispatch();
  
  // Get state from Redux
  const {
    groups,
    loading,
    error,
    totalPages,
    totalItems,
    notification,
    currentPage
  } = useSelector(state => state.groupState);
  
  // Local state for UI
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editTotalMember, setEditTotalMember] = useState("");
  
  // New state for tracking page-specific selections
  const [selectionsPerPage, setSelectionsPerPage] = useState({});
  const [currentPageSelectAll, setCurrentPageSelectAll] = useState(false);
  
  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [minMembers, setMinMembers] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortType, setSortType] = useState("asc");
  const [localCurrentPage, setLocalCurrentPage] = useState(1);

  // Fetch groups on component mount and when filters change
  useEffect(() => {
    dispatch(fetchGroups(
      searchTerm,
      localCurrentPage,
      sortField,
      sortType,
      minMembers,
      maxMembers
    ));
  }, [dispatch, searchTerm, localCurrentPage, sortField, sortType, minMembers, maxMembers]);

  // Reset selections when filter criteria change
  useEffect(() => {
    setSelectedGroups([]);
    setSelectionsPerPage({});
    setCurrentPageSelectAll(false);
  }, [searchTerm, minMembers, maxMembers]);

  // Update current page selection state when page changes or groups load
  useEffect(() => {
    if (groups.length > 0) {
      // Check if we have selections for this page stored
      const pageSelections = selectionsPerPage[localCurrentPage] || [];
      
      // Check if all items on this page are selected
      const allSelected = pageSelections.length === groups.length && 
        groups.every(group => pageSelections.includes(group.id));
      
      setCurrentPageSelectAll(allSelected);
    } else {
      setCurrentPageSelectAll(false);
    }
  }, [groups, localCurrentPage, selectionsPerPage]);

  // Update the selected groups array whenever page selections change
  useEffect(() => {
    // Combine all selections from all pages
    const allSelections = Object.values(selectionsPerPage).flat();
    setSelectedGroups(allSelections);
  }, [selectionsPerPage]);

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortType(sortType === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortType('asc');
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setLocalCurrentPage(newPage);
  };

  // Create group handler
  const handleCreateGroup = () => {
    dispatch(createGroup(newGroupName));
    setIsCreateModalOpen(false);
    setNewGroupName("");
  };

  // Edit group handler
  const handleEditGroup = () => {
    dispatch(editGroup(editingGroup.id, editGroupName, editTotalMember));
    closeEditModal();
  };

  // Open edit modal
  const openEditModal = (group) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditTotalMember(group.totalMember?.toString() || "");
    setIsEditModalOpen(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingGroup(null);
    setEditGroupName("");
    setEditTotalMember("");
  };

  // Delete group handler
  const handleDeleteGroups = () => {
    dispatch(deleteGroups(selectedGroups, localCurrentPage, groups.length));
    setSelectionsPerPage({});
    setSelectedGroups([]);
    setCurrentPageSelectAll(false);
    setIsDeleteModalOpen(false);
  };

  const refreshForm = () => {
    setSearchTerm("");
    setMinMembers("");
    setMaxMembers("");
    setLocalCurrentPage(1);
    setSelectionsPerPage({});
    setSelectedGroups([]);
    setCurrentPageSelectAll(false);
  };

  // Toggle group selection
  const toggleGroupSelection = (groupId) => {
    // Get current page selections
    const currentSelections = selectionsPerPage[localCurrentPage] || [];
    
    // Toggle the selected item
    let updatedPageSelections;
    if (currentSelections.includes(groupId)) {
      updatedPageSelections = currentSelections.filter(id => id !== groupId);
    } else {
      updatedPageSelections = [...currentSelections, groupId];
    }
    
    // Update selections state for this page
    setSelectionsPerPage({
      ...selectionsPerPage,
      [localCurrentPage]: updatedPageSelections
    });
    
    // Update current page select all state
    setCurrentPageSelectAll(
      updatedPageSelections.length === groups.length && 
      groups.every(group => updatedPageSelections.includes(group.id))
    );
  };

  // Toggle select all for current page
  const toggleSelectAllCurrentPage = () => {
    if (currentPageSelectAll) {
      // Deselect all on current page
      const updatedSelections = { ...selectionsPerPage };
      delete updatedSelections[localCurrentPage];
      setSelectionsPerPage(updatedSelections);
      setCurrentPageSelectAll(false);
    } else {
      // Select all on current page
      setSelectionsPerPage({
        ...selectionsPerPage,
        [localCurrentPage]: groups.map(group => group.id)
      });
      setCurrentPageSelectAll(true);
    }
  };

  // Check if a group is selected
  const isGroupSelected = (groupId) => {
    const pageSelections = selectionsPerPage[localCurrentPage] || [];
    return pageSelections.includes(groupId);
  };

  // Toggle Profile Sidebar
  const toggleProfileSidebar = () => {
    setIsProfileSidebarOpen(!isProfileSidebarOpen);
  };

  return (
    <div className="manage-group-container">
      <div className={`cover ${isProfileSidebarOpen ? 'active' : ''}`}></div>
      {/* Notification */}
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type}
          onClose={() => dispatch({ type: 'CLEAR_NOTIFICATION' })}
        />
      )}
      <Navbar onOpenProfile={toggleProfileSidebar}/>

      {/* Render ProfileSidebar conditionally */}
      {isProfileSidebarOpen && (
        <ProfileSidebar 
          isOpen={isProfileSidebarOpen} 
          onClose={toggleProfileSidebar} 
        />
      )}
      
      <div className="manage-group-content">
        <div className="table-container">
          <div className="manage-group-header">
            <h2>Manage Groups</h2>
            <div className="group-header-actions">
              <Button 
                className="create-group-btn" 
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Group
              </Button>
              <Button 
                className="delete-group-btn" 
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={selectedGroups.length === 0}
              >
                Delete ({selectedGroups.length})
              </Button>
              <Button 
                className="refresh-form-btn" 
                onClick={refreshForm}
              >
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="filter-container">
            <input 
              type="text" 
              placeholder="Search groups..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setLocalCurrentPage(1);
              }}
              className="search-input"
            />
            <div className="member-filter">
              <input 
                type="number" 
                placeholder="Min Members" 
                value={minMembers}
                onChange={(e) => {
                  setMinMembers(e.target.value);
                  setLocalCurrentPage(1);
                }}
                className="member-input"
              />
              <input 
                type="number" 
                placeholder="Max Members" 
                value={maxMembers}
                onChange={(e) => {
                  setMaxMembers(e.target.value);
                  setLocalCurrentPage(1);
                }}
                className="member-input"
              />
            </div>
          </div>

          {loading ? (
            <span className="loading-indicator">
              <span className="loading-spinner"></span> Processing...
            </span>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : groups.length === 0 ? (
            <p>No groups found.</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th className="selection-column">
                      <input 
                        type="checkbox"
                        checked={currentPageSelectAll}
                        onChange={toggleSelectAllCurrentPage}
                      />
                    </th>
                    <th 
                      onClick={() => handleSort('name')}
                      className="sortable-header"
                    >
                      Name 
                      {sortField === 'name' && (sortType === 'asc' ? ' ▲' : ' ▼')}
                    </th>
                    <th 
                      onClick={() => handleSort('totalMember')}
                      className="sortable-header"
                    >
                      Total Members 
                      {sortField === 'totalMember' && (sortType === 'asc' ? ' ▲' : ' ▼')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id}>
                      <td>
                        <input 
                          type="checkbox"
                          checked={isGroupSelected(group.id)}
                          onChange={() => toggleGroupSelection(group.id)}
                        />
                      </td>
                      <td>{group.name}</td>
                      <td>{group.totalMember || 0}</td>
                      <td>
                        <Button onClick={() => openEditModal(group)}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Selected groups info banner */}
              {selectedGroups.length > 0 && (
                <div className="selection-info-banner">
                  <p>
                    {selectedGroups.length} groups selected from {Object.keys(selectionsPerPage).length} page(s)
                  </p>
                </div>
              )}

              {/* Pagination */}
              <div className="pagination">
                <Button 
                  onClick={() => handlePageChange(localCurrentPage - 1)}
                  disabled={localCurrentPage === 1}
                >
                  Previous
                </Button>
                <span>{`Page ${localCurrentPage} of ${totalPages}`}</span>
                <Button 
                  onClick={() => handlePageChange(localCurrentPage + 1)}
                  disabled={localCurrentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay create-group">
          <div className="modal">
            <h2>Create New Group</h2>
            <InputField 
              label=""
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
            />
            <div className="character-count">
              {newGroupName.length}/50 characters
            </div>
            <div className="modal-actions">
              <Button 
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || newGroupName.length > 50 || loading}
              >
                {loading ? 'Creating...' : 'Create'}
              </Button>
              <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {isEditModalOpen && editingGroup && (
        <div className="modal-overlay edit-group">
          <div className="modal">
            <h2>Edit Group</h2>
            <InputField 
              label="Group Name"
              type="text"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              placeholder="Enter group name"
            />
            <div className="character-count">
              {editGroupName.length}/50 characters
            </div>
            <InputField 
              label="Total Members"
              type="number"
              value={editTotalMember}
              onChange={(e) => setEditTotalMember(e.target.value)}
              placeholder="Enter total members"
            />
            <div className="modal-actions">
              <Button 
                onClick={handleEditGroup}
                disabled={!editGroupName.trim() || editGroupName.length > 50 || loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={closeEditModal}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay delete-group">
          <div className="modal">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete {selectedGroups.length} group(s)?</p>
            <div className="modal-actions">
              <Button 
                onClick={handleDeleteGroups}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
              <Button onClick={() => {
                setIsDeleteModalOpen(false);
              }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGroupPage;