# Compression & Decompression App
#### This is a web app that lets users compress and decompress files using two methods:

#### 1.Run-Length Encoding (RLE)

#### 2.Huffman Coding

#### You just upload a file, choose what you want to do (compress or decompress), and click the button. The app processes your file and lets you download the result.

### How it was made :
#### Frontend (what the user sees): Made using React + Vite + Tailwind CSS

#### Backend (where the file is processed): Made using Node.js + Express

### Deployment:

#### Frontend is hosted on Vercel

#### Backend is hosted on Render


### How it works :
#### 1.User uploads a file and selects an option.

#### 2.The file is sent to the backend.

#### 3.The backend compresses or decompresses the file using the selected algorithm.

#### 4.The processed file is stored temporarily.

#### 5.The backend sends back a download link.

#### 6.The frontend displays the result and download button.

### What are features it shows:
#### Show file size, time taken, and compression ratio

### project-root/

 1. frontend
    -App.jsx

 2. backend
    -server.js
    -rle.js
    -huffman.js

 3. uploads
 4. outputs

###  How to run it locally commands for backend and frontend :
####    1. Frontend
         cd frontend
         npm install
         npm run dev
####    2. Backend 
         cd backend
         npm install
         node server.js

###  Links for deployed frontend and backend:
#### 1. Frontend : https://comprassion-de-comprassion-app-5bu7.vercel.app/
#### 2. Backend : https://comprassion-de-comprassion-app-2.onrender.com
         
