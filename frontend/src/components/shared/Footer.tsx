import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Manufacturing Management System</h3>
            <p className="text-gray-400 text-sm">
              Comprehensive solution for managing manufacturing operations, inventory, quality control, and employee management.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/production" className="text-gray-400 hover:text-white transition-colors">Production</a></li>
              <li><a href="/inventory" className="text-gray-400 hover:text-white transition-colors">Inventory</a></li>
              <li><a href="/quality" className="text-gray-400 hover:text-white transition-colors">Quality</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/support" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact Info</h4>
            <address className="text-gray-400 text-sm not-italic">
              <p>123 Manufacturing St</p>
              <p>Industrial City, IN 12345</p>
              <p>Email: info@manufacturing.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Manufacturing Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;