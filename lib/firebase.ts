const admin = require('firebase-admin');
const firestore = require('firebase-admin/firestore');

!admin.apps.length ? admin.initializeApp({
  credential: admin.credential.cert({
      "type": "service_account",
      "project_id": "fibers",
      "private_key_id": "4bcab47c0731d28d15c798eb802a63bb0e694a20",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCsnQ7F73K0nPFJ\n0+NGcj8HHszG/yEuTvr8J29N+9Fi0zSm8lyxOA5wlO2pXsi5Bbbjvsa4ofajNktp\ndZiQrGeb43unXvcbVHjUDjR6PhapcBuuhyFbU5kfFd8bg8dP68C2MB9Xj1t2cAgf\nXmrNCMeo1NVMxGbZNUr3N8R8DNOLxa91gtjCYRIQMFtuftgdbaR4RzLvKI9+Ampx\nR7DM1GsyL87CxC0DR+jJbgpZtVkyk8ZlbOHeQgsIutRe2nLRGurZJtWnLdIQ8z+X\nwR/k5vDWViwpJb/ka9AH//ULPdqEC99UwcFERJA4Ato9pelnyBlDB2YxkXkjKaGC\nDp/Nolo3AgMBAAECggEAAwIBneVcRFVvxu+QSEv5WTBqNRWBCIOL0BUH1X4L2gMA\nKeCTSOtHJSMTOR5TtRWqaDGM2O7Jk3KAweewruSyMX83SmVXPPyt1lQhCfhHANDZ\nSqNEK4k7Y9VHu/0B3hynkQUppqby2w98tL86cTQz9ncu+FV7zVEma0RnghnfHdJe\ntni0pf/xZPKJ4MsLM0G55jHrE/4MInshiX9sI1z8MkIZ6Ga8KmnCFO8qviglqSL0\n58ZP+pSNTdVV2U+G5V/yx8fVdB81eT0fiWrCfP47QHnQtmda8P5IqeRHeYnHJ51Q\n/3qSMq12IgTHmRx9ZvOLVWjNSmB3YsY0JZ+tm9QvIQKBgQDWhLme209ckUp+cvtO\n5tZQz/OSDJDqR2yHgYmKNaMTkrlFL1+9zsEg7qr4Et2EkVWt6vjk6MmjfBkg9717\n52Bn+xnhPSewFkeEYk8Qc31hfU+z96dtoGej2aHn0oaDik6ijtrBh0H/h8EJJ5rk\nCXodLATJSItR9a297kRSn28N3wKBgQDN/esMdmd6HZ+82iFaEhF2pTqvQH2dBlRs\n4hPdVe6jj7Re3wRdA6zHQEEgU6U1oY1xFcC1eSmF8yhF3SpeRssQmjbSWbw/eBI5\n94I4vtAsjiNYT/cSE1JCjv8leP7rEAznaTF+yTECrrUgBInI998uicD/unOZrHSC\nU7ekt3AOqQKBgQCcPrPMRsR5EcIGc80jXPLAjZZEzC5I1Zjw4aLCLesHeJjFEYpU\nf2EfkXaplWQPCKQ1Nq3uXLdxAhRzdL5ontATLEtfSOG9WZzhiZE41EWAWntRA5LJ\nQEn8h6lrZmVfLb+0mwQubUveyIwLFPO2IEj3MnaR/Oqs2Zqgegj9fO6wVQKBgQDK\nw4yg4dQNkidwf86gmHR0M0RGydZbwKVN4GPpVPLoMUY8tI3Y+QsTvp3csjlHR1Sw\n4dalSzSiU61qx78yucCdAQ/Bku8IEqruQEIAlWLY2LjV7zCmrDomphdkzWsv+saY\n6yT7RhNmLo6/i3gNSGB5sMM3dlLgC69LshhsnNxCsQKBgFzWiVX4cyk+MejNnFd2\n6OmXpUNzsFqeT7JDs3hlHVC/Pbp1Rf+k+OHsglMxf6O2nAm61cc7VTnQVKQGmbIG\nRV8pvNOpjc6rTzpTfbmz+t9xw8/lNpinLE3bBBRavuPa/p6BCAThvwPp/CYlfIps\nj87J2LCQrcwD6VSgvvqLBfo/\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-qqb97@fibers.iam.gserviceaccount.com",
      "client_id": "104075786067790563862",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-qqb97%40fibers.iam.gserviceaccount.com"
    }
  )
}) : admin.app();

export default {
  db: firestore.getFirestore()
}