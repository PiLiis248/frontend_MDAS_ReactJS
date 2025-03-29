import React, { useState, useEffect } from "react";
import Navbar from "../../common/Navbar";
import Toast from "../../common/Toast";
import Button from "../../common/Button"; 
import groupService from "../../../services/groupService";
import ProfileSidebar from "../../pages/ProfileSideBar";
import "../../../assets/ManageGroup.css";
import InputField from "../../common/InputField";

const ManageGroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

   // Profile Sidebar State
   const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [minMembers, setMinMembers] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortType, setSortType] = useState("asc");

  // Create and delete group states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editTotalMember, setEditTotalMember] = useState("");

  // Notification states
  const [notification, setNotification] = useState(null);

  // Fetch groups function (extracted for reusability)
  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await groupService.viewGroups(
        searchTerm, 
        currentPage, 
        sortField, 
        sortType, 
        minMembers ? parseInt(minMembers) : 0, 
        maxMembers ? parseInt(maxMembers) : 0
      );
      
      setGroups(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalItems(response.data.totalElements || 0);
      setError(null);
    } catch (error) {
      console.error("Error fetching groups", error);
      setError("Failed to load groups. Please try again later.");
      setGroups([]);
      showNotification("Failed to load groups", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [currentPage, searchTerm, minMembers, maxMembers, sortField, sortType]);

  // Show notification helper
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
    setCurrentPage(newPage);
  };

  // Create group handler
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      showNotification("Group name cannot be empty", "error");
      return;
    }

    if (newGroupName.length > 50) {
      showNotification("Group name must be 50 characters or less", "error");
      return;
    }

    try {
      await groupService.createGroup({ name: newGroupName });
      
      // Reset to first page after creation to ensure new group is visible
      setCurrentPage(1);
      
      // Refetch groups to update the list
      await fetchGroups();
      
      setIsCreateModalOpen(false);
      setNewGroupName("");
      showNotification("Group created successfully", "success");
    } catch (error) {
      console.error("Error creating group", error);
      showNotification("Failed to create group", "error");
    }
  };

  // Edit group handler
  const handleEditGroup = async () => {
    if (!editGroupName.trim()) {
      showNotification("Group name cannot be empty", "error");
      return;
    }

    if (editGroupName.length > 50) {
      showNotification("Group name must be 50 characters or less", "error");
      return;
    }

    try {
      const payload = {
        name: editGroupName,
        totalMember: editTotalMember !== "" ? parseInt(editTotalMember) : undefined
      };
      
      await groupService.editGroup(editingGroup.id, payload);
      
      // Refetch groups to update the list
      await fetchGroups();
      
      closeEditModal();
      showNotification("Group updated successfully", "success");
    } catch (error) {
      console.error("Error updating group", error);
      showNotification("Failed to update group", "error");
    }
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
  const handleDeleteGroups = async () => {
    if (selectedGroups.length === 0) {
      showNotification("No groups selected", "error");
      return;
    }

    try {
      // Convert selected group IDs to string for API
      const groupIds = selectedGroups.join(',');
      await groupService.deleteGroup(groupIds);
      
      // Reset to first page if current page becomes invalid
      if (currentPage > 1 && groups.length === selectedGroups.length) {
        setCurrentPage(currentPage - 1);
      }
      
      // Refetch groups to update the list
      await fetchGroups();
      
      setSelectedGroups([]);
      setIsDeleteModalOpen(false);
      showNotification(`${selectedGroups.length} group(s) deleted successfully`, "success");
    } catch (error) {
      console.error("Error deleting groups", error);
      showNotification("Failed to delete groups", "error");
    }
  };

  const refreshForm = () => {
    setSearchTerm("");
    setMinMembers("");
    setMaxMembers("");
  }

  // Toggle group selection
  const toggleGroupSelection = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
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
          onClose={() => setNotification(null)}
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
                className="reload-group-btn" 
                onClick={() => refreshForm()}
              >
                Reload
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
                setCurrentPage(1);
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
                  setCurrentPage(1);
                }}
                className="member-input"
              />
              <input 
                type="number" 
                placeholder="Max Members" 
                value={maxMembers}
                onChange={(e) => {
                  setMaxMembers(e.target.value);
                  setCurrentPage(1);
                }}
                className="member-input"
              />
            </div>
          </div>

          {isLoading ? (
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
                        checked={selectedGroups.length === groups.length}
                        onChange={() => {
                          setSelectedGroups(
                            selectedGroups.length === groups.length 
                              ? [] 
                              : groups.map(group => group.id)
                          );
                        }}
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
                          checked={selectedGroups.includes(group.id)}
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

              {/* Pagination */}
              <div className="pagination">
                <Button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                <Button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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
            <div className="modal-actions">
              <Button onClick={handleCreateGroup}>Create</Button>
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
            <InputField 
              label="Total Members"
              type="number"
              value={editTotalMember}
              onChange={(e) => setEditTotalMember(e.target.value)}
              placeholder="Enter total members"
            />
            <div className="modal-actions">
              <Button onClick={handleEditGroup}>Save Changes</Button>
              <Button onClick={closeEditModal}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {selectedGroups.length} group(s)?</p>
            <div className="modal-actions">
              <Button onClick={handleDeleteGroups}>Delete</Button>
              <Button onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedGroups([]);
              }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGroupPage;