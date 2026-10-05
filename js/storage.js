// File: js/storage.js

const StorageManager = {
    FORM_DATA_KEY: 'surat_form_data',
    RECIPIENTS_KEY: 'surat_recipients',
    
    // Save form data to localStorage
    saveFormData: function(data) {
        try {
            localStorage.setItem(this.FORM_DATA_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Gagal menyimpan form data", e);
        }
    },
    
    // Load form data from localStorage
    loadFormData: function() {
        try {
            const data = localStorage.getItem(this.FORM_DATA_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Gagal memuat form data", e);
            return null;
        }
    },
    
    // Save recipients to localStorage
    saveRecipients: function(recipients) {
        try {
            localStorage.setItem(this.RECIPIENTS_KEY, JSON.stringify(recipients));
        } catch (e) {
            console.error("Gagal menyimpan penerima", e);
        }
    },
    
    // Load recipients from localStorage
    loadRecipients: function() {
        try {
            const data = localStorage.getItem(this.RECIPIENTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Gagal memuat penerima", e);
            return [];
        }
    },
    
    // Clear all data
    clearAll: function() {
        localStorage.removeItem(this.FORM_DATA_KEY);
        localStorage.removeItem(this.RECIPIENTS_KEY);
    },

    // Convert image file to Base64 to store in localStorage
    fileToBase64: function(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
};
