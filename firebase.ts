// Import the functions you need from the SDKs you need
// FIX: Use firebase compat library to resolve import error. This provides the v8 API surface.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// TODO: 아래 firebaseConfig 객체를 Firebase 콘솔에서 복사한 값으로 완전히 교체하세요.
// 1. Firebase 콘솔에서 프로젝트 설정 (톱니바퀴 아이콘)으로 이동합니다.
// 2. '내 앱' 섹션에서 </> 아이콘을 클릭하여 웹 앱을 등록합니다.
// 3. 'SDK 설정 및 구성' 단계에서 '구성' 옵션을 선택하면 이 코드를 찾을 수 있습니다.
const firebaseConfig = {
  apiKey: "AIzaSyDm6BUNlS5Dq4G3J4vfvAPL0dIq1o0zMYw",
  authDomain: "runrunrun-8fee2.firebaseapp.com",
  projectId: "runrunrun-8fee2",
  storageBucket: "runrunrun-8fee2.firebasestorage.app",
  messagingSenderId: "782513723357",
  appId: "1:782513723357:web:b1ea67908e5ce98c184834",
  measurementId: "G-4SJ9C6BFZ9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a Firestore instance
export const db = firebase.firestore();
