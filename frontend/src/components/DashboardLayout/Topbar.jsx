import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoClose, IoMenu } from 'react-icons/io5';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from "../../context/AuthContext";
import ProfileImage from "../../assets/images/imageicon1.png";
import "../../styles/tableDesign.css";
export default function Topbar({ pageTitle, onMenuClick }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname === '/attendance/attendance-dashboard';
     // Check if current route is a Team Members sub-route
     const isTeamMemberRoute = 
     location.pathname.startsWith('/attendance/employee/') ||
     location.pathname.startsWith('/attendance/regularization-requests/') ||
     location.pathname.startsWith('/attendance/leave-summary/') ||
     location.pathname.startsWith('/attendance/leave-balance/') ||
     location.pathname.startsWith('/attendance/leave-requests/');
    const [isToggled, setIsToggled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const notificationRef = useRef(null);
      const { user } = useAuth();

    const notifications = [
        { id: 1, text: 'New message from John' },
        { id: 2, text: 'Your report is ready' },
        { id: 3, text: 'System maintenance at 5 PM' },
        { id: 4, text: 'Team meeting at 3 PM' },
        { id: 5, text: 'Password expires in 5 days' },
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
                setShowAll(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleViewAll = () => setShowAll(true);
    const handleClose = () => {
        setShowNotifications(false);
        setShowAll(false);
    };

    const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

    return (
        <header className="topbar">
            {/* Page Title Section */}
            <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                {/* Mobile Menu Button */}
                <button
                    data-menu-button
                    onClick={onMenuClick}
                    className="lg:hidden mr-2 sm:mr-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 flex-shrink-0"
                    aria-label="Toggle menu"
                >
                    <IoMenu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                {pageTitle ? (
                    <div className="flex items-center min-w-0 flex-1">
                        {!isDashboard && (
                            <button
                                onClick={() => {
                                    navigate('/attendance/attendance-dashboard');
                                    if (isTeamMemberRoute) {
                                        navigate('/attendance/team-members');
                                    }
                                }}
                                className="flex-shrink-0 p-1.5 mr-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                                title={isTeamMemberRoute ? "Back to Team Members" : "Back to Dashboard"}
                            >
                                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        )}
                        <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-gray-900 truncate min-w-0" title={pageTitle}>{pageTitle}</h1>
                    </div>
                ) : (
                    <div className="flex flex-col min-w-0 overflow-hidden">
                <p className="text-xs sm:text-sm text-gray-500 truncate">Welcome Back!</p>
                        <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{user?.role_name}</h1>
                    </div>
                )}
            </div>

            {/* Controls Section */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {/* Toggle Button
                <button
                    type="button"
                    onClick={() => setIsToggled(!isToggled)}
                    className={`relative w-9 h-5 sm:w-11 sm:h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${isToggled ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                    <span
                        className={`absolute top-[1px] left-[1px] sm:top-[2px] sm:left-[2px] w-3.5 h-3.5 sm:w-5 sm:h-5 bg-white border border-gray-300 rounded-full transition-transform duration-300 ${isToggled ? 'translate-x-full border-white' : ''}`}
                    />
                </button> */}

                {/* Notification Button and Dropdown */}
                <div className="relative flex-shrink-0" ref={notificationRef}>
                    <button
                        onClick={() => notifications.length && setShowNotifications(!showNotifications)}
                        className="topbar-notification"
                        id="notificationBtn"
                    >
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        {notifications.length > 0 && (
                            <span className="notification-badge"></span>
                        )}
                    </button>

                    {/* Fixed Notification Dropdown */}
                    {showNotifications && (
                        <div className="fixed top-20 right-4 sm:right-8 w-[95vw] sm:w-[350px] max-h-[400px] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-3 sm:p-4">
                            <div className="flex justify-between items-center mb-2 sm:mb-3">
                                {!showAll && (
                                    <button
                                        onClick={handleViewAll}
                                        className="text-blue-600 text-xs sm:text-sm font-medium hover:underline"
                                    >
                                        View All
                                    </button>
                                )}
                                <button
                                    onClick={handleClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <IoClose className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                {displayedNotifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition cursor-pointer text-xs sm:text-sm"
                                    >
                                        {n.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Section */}
                <button className="topbar-profile" id="profileBtn">
                    <div className="profile-avatar-wrapper">
                        <img src={ProfileImage} alt="Profile" className="profile-img" />
                    </div>
                    <div className="profile-info">
                        <p className="profile-name">{user?.first_name} {user?.last_name}</p>
                        <p className="profile-role">{user?.position_name}</p>
                </div>
                    <svg className="profile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
            </div>
        </header>
    );
}
