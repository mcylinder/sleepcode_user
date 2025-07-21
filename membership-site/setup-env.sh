#!/bin/bash

# Create .env.local file with Firebase configuration
cat > .env.local << EOF
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCn51coB3MJH-uP6iX37ErpkKDcZC40oaA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sleepcodingbase.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sleepcodingbase
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sleepcodingbase.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=2186950665
NEXT_PUBLIC_FIREBASE_APP_ID=1:2186950665:web:87ab81aa19f8cc17f120d8
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-6J693D0VCT

# RevenueCat API Key (you'll need to add this)
REVENUECAT_API_KEY=your_revenuecat_api_key_here
EOF

echo "✅ .env.local file created successfully!"
echo "⚠️  Remember to add your RevenueCat API key to the .env.local file"
echo "📝 The .env.local file is already in .gitignore and won't be committed" 