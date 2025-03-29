import axiosInstance from "../api/axios";

const groupService = {
  viewGroups(name = null, page = 1, sortField = null, sortType = null, min = 0, max = 0) {
    // Create an array to collect query parameters
    const params = [];

    // Add page parameter (note: API seems to use 0-based indexing)
    params.push(`page=${page}`);
    params.push(`size=5`); // Fixed page size as per your requirement

    // Add search parameter
    if (name) {
      params.push(`search=${encodeURIComponent(name)}`);
    }

    // Add sorting parameters
    if (sortField === "name") {
      params.push(`sort=name,${sortType || 'asc'}`);
    } else if (sortField === "totalMember") {
      params.push(`sort=totalMember,${sortType || 'asc'}`);
    }

    // Add min and max total member parameters
    if (min > 0) {
      params.push(`minTotalMember=${min}`);
    }
    if (max > 0) {
      params.push(`maxTotalMember=${max}`);
    }

    // Construct the full URL
    const queryString = params.join('&');
    return axiosInstance.get(`/groups?${queryString}`);
  },

  // we just need new group name for the request body that can create new group
  createGroup(payload = {}) {
    return axiosInstance.post("/groups", payload);
  },

  // delete in backend if delete 1 group then it will be .../groups/15 , if delete groups then .../groups/1,2,4,15
  deleteGroup(ids) {
    return axiosInstance.delete(`/groups/${ids}`);
  },

  // edit update name and totalMember of that group via its id
  editGroup(id, payload = {}) {
    return axiosInstance.put(`/groups/${id}`, payload);
  }
};

export default groupService;