import React from 'react';
import { PageFooter, Grid, Flex } from './Layout.jsx';

/**
 * Common Footer Component
 * Standardized footer for all pages
 */
export const CommonFooter = ({ 
  companyName = 'Aadhavan Agencies'
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <PageFooter style={{
      margin: '0',
      padding: '40px 20px 20px',
      backgroundColor: '#1a1a1a', // Dark background for white text
      borderTop: '1px solid #333333',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Company Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            <span>AA</span>
          </div>
          <div>
            <h3 style={{
              margin: '0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff'
            }}>{companyName}</h3>
          </div>
        </div>

        {/* Contact Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          <div style={{
            color: '#ffffff',
            fontSize: '14px'
          }}>
            <strong>Phone:</strong> +91 97909 48214
          </div>
          <div style={{
            color: '#ffffff',
            fontSize: '14px'
          }}>
            <strong>Email:</strong> aadhavanagencies@gmail.com
          </div>
          <div style={{
            color: '#ffffff',
            fontSize: '14px'
          }}>
            <strong>Address:</strong> No. 35,Thalagiriyar Street, Thiruvannamalai, TamilNadu  – 606601 
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #333333'
        }}>
          <p style={{
            margin: '0',
            color: '#ffffff',
            fontSize: '12px'
          }}>
            © {currentYear} {companyName}. All rights reserved.
          </p>
        </div>
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
