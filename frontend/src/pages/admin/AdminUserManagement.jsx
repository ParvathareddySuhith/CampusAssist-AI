import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaFilter, FaUsers, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import * as userService from "../../services/adminUserService";
import UserTable from "../../components/admin/UserTable";
import UserDetailsDrawer from "../../components/admin/UserDetailsDrawer";
import SendNotificationDialog from "../../components/admin/SendNotificationDialog";

function AdminUserManagement() {
  // Lists and pagination states
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL"); // ALL, ACTIVE, DISABLED
  
  // Sorting state
  const [sortBy, setSortBy] = useState("last_active");
  const [sortOrder, setSortOrder] = useState("desc");

  // Drawer / Dialog states
  const [inspectUserId, setInspectUserId] = useState(null);
  const [inspectUser, setInspectUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [notifyUserId, setNotifyUserId] = useState(null);
  const [notifyUserName, setNotifyUserName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [togglingUserId, setTogglingUserId] = useState(null);

  // Fetch users from service
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Map frontend filters to server request query params
      // Since department/semester filters are done on the client-side OR backend-side,
      // let's pass search and pagination, and filter in client-side or backend.
      // The implementation plan says backend get_users_page handles pagination, sorting and searching.
      // So we fetch with search query, page, page_size, sort, and order.
      const res = await userService.getUsers({
        page: pagination.page,
        page_size: pagination.page_size,
        search: searchText.trim(),
        sort: sortBy,
        order: sortOrder
      });

      setUsers(res.users || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Unable to load student users. Please check server connections.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.page_size, searchText, sortBy, sortOrder]);

  // Trigger fetch when search or page changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchText, sortBy, sortOrder]);

  // Handle client-side status & department/semester filtering on the loaded page
  const getFilteredUsers = () => {
    return users.filter(user => {
      // Status filter
      if (selectedStatus === "ACTIVE" && !user.is_active) return false;
      if (selectedStatus === "DISABLED" && user.is_active) return false;

      // Department filter
      if (selectedDept && user.department !== selectedDept) return false;

      // Semester filter
      if (selectedSemester && String(user.semester) !== selectedSemester) return false;

      return true;
    });
  };

  // Inspect student details
  const handleViewDetails = async (userId) => {
    setInspectUserId(userId);
    setInspectUser(null);
    setLoadingDetails(true);
    setDrawerOpen(true);
    try {
      const details = await userService.getUser(userId);
      setInspectUser(details);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      // Fallback: build details using minimal user table object
      const minimalUser = users.find(u => u.id === userId);
      if (minimalUser) {
        setInspectUser({
          id: userId,
          username: minimalUser.username,
          email: minimalUser.email,
          is_active: minimalUser.is_active,
          student: {
            full_name: minimalUser.full_name,
            department: minimalUser.department,
            semester: minimalUser.semester
          }
        });
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  // Toggle user activation status (Active / Disabled) with optimistic UI updates
  const handleToggleStatus = async (userId, currentActive) => {
    const actionWord = currentActive ? "disable" : "enable";
    const confirmed = window.confirm(`Are you sure you want to ${actionWord} this student's login access?`);
    if (!confirmed) return;

    // Save previous state for rollback
    const originalUsers = [...users];

    // 1. Optimistic UI update
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u)
    );
    setTogglingUserId(userId);

    try {
      // 2. Perform API PATCH request
      const res = await userService.updateUserStatus(userId, !currentActive);
      
      // Update with exact response status just in case
      if (res && res.user) {
        setUsers(prevUsers =>
          prevUsers.map(u => u.id === userId ? { ...u, is_active: res.user.is_active } : u)
        );
      }
    } catch (err) {
      console.error("Status toggle failed:", err);
      // 3. Rollback UI on failure
      setUsers(originalUsers);
      alert("Failed to update student activation status. Connection refused.");
    } finally {
      setTogglingUserId(null);
    }
  };

  // Open notification sender dialog
  const handleSendNotification = (userId, userName) => {
    setNotifyUserId(userId);
    setNotifyUserName(userName);
    setDialogOpen(true);
  };

  const filteredUsersList = getFilteredUsers();

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header Summary Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <FaUsers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">User Management</h2>
            <p className="text-xs text-neutral-400">Inspect student records, active study courses and account access policies</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-5 border border-neutral-900 bg-neutral-950/40 rounded-2xl">
        
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            placeholder="Search by name, email, roll..."
            className="w-full pl-9 pr-4 py-2 border border-neutral-900 placeholder-neutral-600 bg-neutral-950 rounded-lg text-xs focus:outline-none focus:border-violet-500/80 transition-colors"
          />
        </div>

        {/* Department Filter */}
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-3 h-3" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-900 text-neutral-350 bg-neutral-950 rounded-lg text-xs focus:outline-none focus:border-violet-500/80 cursor-pointer"
          >
            <option value="">All Departments</option>
            <option value="Computer Science and Engineering">Computer Science (CSE)</option>
            <option value="Information Technology">Information Technology (IT)</option>
            <option value="Electronics and Communication Engineering">ECE</option>
            <option value="Mechanical Engineering">Mechanical</option>
          </select>
        </div>

        {/* Semester Filter */}
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-3 h-3" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-900 text-neutral-350 bg-neutral-950 rounded-lg text-xs focus:outline-none focus:border-violet-500/80 cursor-pointer"
          >
            <option value="">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-3 h-3" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-900 text-neutral-350 bg-neutral-950 rounded-lg text-xs focus:outline-none focus:border-violet-500/80 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled Only</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      {error ? (
        <div className="p-6 border border-rose-500/20 bg-rose-500/10 rounded-2xl text-center space-y-4">
          <p className="text-sm text-rose-400 font-semibold">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-3.5 py-6">
          <div className="h-4 bg-neutral-900 animate-pulse rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-14 bg-neutral-900/60 border border-neutral-950 animate-pulse rounded-xl"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <UserTable
            users={filteredUsersList}
            onViewDetails={handleViewDetails}
            onToggleStatus={handleToggleStatus}
            onSendNotification={handleSendNotification}
            togglingUserId={togglingUserId}
          />

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center bg-neutral-950/20 p-4 border border-neutral-900 rounded-2xl select-none">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                Showing Page {pagination.page} of {pagination.pages} (Total: {pagination.total} students)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="p-2 border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-850 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaArrowLeft className="w-3 h-3" />
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="p-2 border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-850 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Inspect Drawer */}
      <UserDetailsDrawer
        isOpen={drawerOpen}
        user={inspectUser}
        loading={loadingDetails}
        onClose={() => {
          setDrawerOpen(false);
          setInspectUserId(null);
          setInspectUser(null);
        }}
      />

      {/* Send Notification Dialog Modal */}
      <SendNotificationDialog
        isOpen={dialogOpen}
        userId={notifyUserId}
        studentName={notifyUserName}
        onCancel={() => {
          setDialogOpen(false);
          setNotifyUserId(null);
          setNotifyUserName("");
        }}
      />

    </div>
  );
}

export default AdminUserManagement;
