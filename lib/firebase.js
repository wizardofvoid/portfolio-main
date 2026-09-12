import admin from 'firebase-admin';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      if (serviceAccount.private_key) {
        // Ensure newlines in the private key are parsed correctly
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized successfully.');
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT is missing. Chat logging will be disabled.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
  }
}

// Export the db instance (it will be undefined if initialization failed, handled in logger)
export const db = admin.apps.length ? admin.firestore() : null;
