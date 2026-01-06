import React from 'react';
import '../../styles/tableDesign.css';

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-left">
                &copy; 2025 PeopleVista. All rights reserved.
            </div>
            <div className="footer-right">
                <span className="footer-version">v1.2.0</span>
                <a href="#" className="footer-link">Help Center</a>
                <a href="#" className="footer-link">Privacy Policy</a>
            </div>
        </footer>
    );
}
