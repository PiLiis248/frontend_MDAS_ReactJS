import * as types from '../constants/groupConstants';
import groupService from '../../services/groupService';

// Action to set notification
export const setNotification = (message, type) => (dispatch) => {
  dispatch({
    type: types.SET_NOTIFICATION,
    payload: { message, type }
  });
  
  setTimeout(() => {
    dispatch({ type: types.CLEAR_NOTIFICATION });
  }, 3000);
};

// Action to fetch groups
export const fetchGroups = (searchTerm = '', currentPage = 1, sortField = 'name', sortType = 'asc', minMembers = 0, maxMembers = 0) => async (dispatch) => {
  try {
    dispatch({ type: types.GROUP_LIST_REQUEST });
    
    const response = await groupService.viewGroups(
      searchTerm,
      currentPage,
      sortField,
      sortType,
      minMembers ? parseInt(minMembers) : 0,
      maxMembers ? parseInt(maxMembers) : 0
    );
    
    dispatch({
      type: types.GROUP_LIST_SUCCESS,
      payload: {
        groups: response.data.content || [],
        totalPages: response.data.totalPages || 0,
        totalItems: response.data.totalElements || 0
      }
    });
  } catch (error) {
    dispatch({
      type: types.GROUP_LIST_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to load groups'
    });
    dispatch(setNotification('Failed to load groups', 'error'));
  }
};

// Action to create a group
export const createGroup = (name) => async (dispatch) => {
  try {
    // Validate group name
    if (!name.trim()) {
      dispatch(setNotification('Group name cannot be empty', 'error'));
      return;
    }

    if (name.length > 50) {
      dispatch(setNotification('Group name must be 50 characters or less', 'error'));
      return;
    }
    
    dispatch({ type: types.GROUP_CREATE_REQUEST });
    
    await groupService.createGroup({ name });
    
    dispatch({ type: types.GROUP_CREATE_SUCCESS });
    dispatch(setNotification('Group created successfully', 'success'));
    
    // Refresh the group list after creating
    dispatch(fetchGroups());
  } catch (error) {
    dispatch({
      type: types.GROUP_CREATE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to create group'
    });
    dispatch(setNotification('Failed to create group', 'error'));
  }
};

// Action to edit a group
export const editGroup = (id, name, totalMember) => async (dispatch) => {
  try {
    // Validate group name
    if (!name.trim()) {
      dispatch(setNotification('Group name cannot be empty', 'error'));
      return;
    }

    if (name.length > 50) {
      dispatch(setNotification('Group name must be 50 characters or less', 'error'));
      return;
    }
    
    dispatch({ type: types.GROUP_EDIT_REQUEST });
    
    const payload = {
      name,
      totalMember: totalMember !== "" ? parseInt(totalMember) : undefined
    };
    
    await groupService.editGroup(id, payload);
    
    dispatch({ type: types.GROUP_EDIT_SUCCESS });
    dispatch(setNotification('Group updated successfully', 'success'));
    
    // Refresh the group list after editing
    dispatch(fetchGroups());
  } catch (error) {
    dispatch({
      type: types.GROUP_EDIT_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to update group'
    });
    dispatch(setNotification('Failed to update group', 'error'));
  }
};

// Action to delete groups
export const deleteGroups = (selectedGroups, currentPage, groupCount) => async (dispatch) => {
  try {
    if (selectedGroups.length === 0) {
      dispatch(setNotification('No groups selected', 'error'));
      return;
    }
    
    dispatch({ type: types.GROUP_DELETE_REQUEST });
    
    // Convert selected group IDs to string for API
    const groupIds = selectedGroups.join(',');
    await groupService.deleteGroup(groupIds);
    
    dispatch({ type: types.GROUP_DELETE_SUCCESS });
    dispatch(setNotification(`${selectedGroups.length} group(s) deleted successfully`, 'success'));
    
    // Reset to previous page if current page becomes invalid
    let newPage = currentPage;
    if (currentPage > 1 && groupCount === selectedGroups.length) {
      newPage = currentPage - 1;
    }
    
    // Refresh the group list after deleting
    dispatch(fetchGroups('', newPage));
  } catch (error) {
    dispatch({
      type: types.GROUP_DELETE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : 'Failed to delete groups'
    });
    dispatch(setNotification('Failed to delete groups', 'error'));
  }
};