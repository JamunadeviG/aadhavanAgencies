import React from 'react';
import { PageFooter, Grid, Flex } from './Layout.jsx';

/**
 * Common Footer Component
 * Standardized footer for all pages
 */
export const CommonFooter = ({ 
  showNewsletter = true,
  showSocialLinks = true,
  companyName = 'Aadhavan Agencies',
  companyTagline = 'Your Trusted Partner Since 1995'
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <PageFooter>
      <Grid cols={4} gap="8" className="footer-grid">
        {/* Company Info */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span>AA</span>
          </div>
          <div>
            <h3 className="footer-company-name">{companyName}</h3>
            <p className="footer-company-tagline">{companyTagline}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><button className="footer-link">Home</button></li>
            <li><button className="footer-link">About Us</button></li>
            <li><button className="footer-link">Products</button></li>
            <li><button className="footer-link">Services</button></li>
            <li><button className="footer-link">Contact</button></li>
          </ul>
        </div>

        {/* Services */}
        <div className="footer-section">
          <h4 className="footer-heading">Services</h4>
          <ul className="footer-links">
            <li><button className="footer-link">Retail Distribution</button></li>
            <li><button className="footer-link">Wholesale Supply</button></li>
            <li><button className="footer-link">Logistics</button></li>
            <li><button className="footer-link">Customer Support</button></li>
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div className="footer-section">
          <h4 className="footer-heading">Contact Info</h4>
          <div className="footer-contact">
            <p><strong>Address:</strong> 123 Business Street, City, State 12345</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Email:</strong> info@aadhavanagencies.com</p>
            
            {showNewsletter && (
              <div className="footer-newsletter">
                <p className="newsletter-text">Subscribe to our newsletter</p>
                <div className="newsletter-form">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="newsletter-input"
                  />
                  <button className="btn btn-primary btn-sm">Subscribe</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Grid>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <Flex justify="between" align="center">
          <p className="copyright">
            © {currentYear} {companyName}. All rights reserved.
          </p>
          
          {showSocialLinks && (
            <div className="social-links">
              <Flex gap="3" align="center">
                <button className="social-link" aria-label="Facebook">
                  <span>f</span>
                </button>
                <button className="social-link" aria-label="Twitter">
                  <span>𝕏</span>
                </button>
                <button className="social-link" aria-label="LinkedIn">
                  <span>in</span>
                </button>
                <button className="social-link" aria-label="Instagram">
                  <span>📷</span>
                </button>
              </Flex>
            </div>
          )}
        </Flex>
      </div>
    </PageFooter>
  );
};

/**
 * Simple Footer for minimal pages
 */
export const SimpleFooter = ({ 
  companyName = 'Aadhavan Agencies' 
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <PageFooter>
      <div className="text-center">
        <p className="copyright">
          © {currentYear} {companyName}. All rights reserved.
        </p>
        <div className="footer-legal-links">
          <Flex justify="center" gap="4" align="center">
            <button className="footer-link">Privacy Policy</button>
            <button className="footer-link">Terms of Service</button>
            <button className="footer-link">Cookie Policy</button>
          </Flex>
        </div>
      </div>
    </PageFooter>
  );
};
