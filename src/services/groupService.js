import axiosInstance from "../api/axios";

const groupService = {
  viewGroups() {
     return axiosInstance.get("/groups");
  }
};

export default groupService;
