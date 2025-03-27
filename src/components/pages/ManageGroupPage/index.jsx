import React, { useState, useEffect } from "react";
import Sidebar from "../../common/Sidebar";
import groupService from "../../../services/groupService"; 
import "../../../assets/ManageGroup.css"; 

const ManageGroupPage = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupService.viewGroups();
        setGroups(response.data.content); // Giới hạn 10 dòng
      } catch (error) {
        console.error("Error fetching groups", error);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="manage-group-container">
      <Sidebar />
      <div className="manage-group-content">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Member</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>{group.totalMember}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageGroupPage;
