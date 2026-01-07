
import { toast } from 'react-toastify';
import React from 'react';

export function confirmToast(message = 'Are you sure?', {
  yesText = 'Yes',
  cancelText = 'Cancel',
  autoClose = 8000,    
  position = 'bottom-right',
  theme = 'dark',
} = {}) {
  return new Promise((resolve) => {
    const toastId = toast(
      ({ closeToast }) => (
        <div role='dialog'  aria-live='polite' aria-label='Confirmation' style={{ display: 'flex', flexDirection:'column', gap: 16, minWidth: 300, }}>
          <div style={{color: '#e5e7eb', lineHeight: 1.5, fontSize: 18}} >{message}</div>
          <div style={{ marginLeft: 'auto', display: 'flex',alignItems: 'center',gap: 12, justifyContent:'flex-start' }}>
            <button
              onClick={() => {
                resolve(true);
                closeToast();
                toast.dismiss(toastId);
              }}
              aria-label={yesText}
              style={{    
                padding: '8px 16px',
                borderRadius: 10,
                border: '1px solid #22c55e', // green-500
                background: 'transparent',
                color: '#22c55e',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(34,197,94,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {yesText}
            </button>
            <button
              onClick={() => {
                resolve(false);
                closeToast();
                toast.dismiss(toastId);
              }}
              aria-label={cancelText}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: '1px solid #9ca3af', // gray-400
                background: 'transparent',
                color: '#d1d5db', // gray-300
                fontSize: 16,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(156,163,175,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {cancelText}
            </button>
          </div>
        </div>
      ),
      {
        position,
        theme,
        autoClose,        
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
      }
    );
  });
}
