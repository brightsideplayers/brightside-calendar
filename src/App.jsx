import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZ3nQpzf246EepmNDK6Qs32q-G4-b8R4E",
  authDomain: "brightside-calendar-50da5.firebaseapp.com",
  projectId: "brightside-calendar-50da5",
  storageBucket: "brightside-calendar-50da5.firebasestorage.app",
  messagingSenderId: "342676365953",
  appId: "1:342676365953:web:d4fb633c1bb0d8af09e380"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function App() {
  const designMode = true;

  const [items, setItems] = useState([]);
  const [user, setUser] = useState(
    designMode
      ? {
          displayName: "Brightside Team",
          email: "team@brightside.ca",
          photoURL: "https://i.imgur.com/YdjP8nC.png"
        }
      : null
  );

  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (designMode) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, "calendarItems"), (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));

      setItems(data);
    });

    return () => unsubscribe();
  }, [user]);

  const addItem = async () => {
    if (!caption || !date) return;

    await addDoc(collection(db, "calendarItems"), {
      caption,
      date,
      createdBy: user?.displayName || "Unknown"
    });

    setCaption("");
    setDate("");
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "calendarItems", id));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #111827, #1f2937, #0f172a)",
      color: "white",
      padding: "40px",
      fontFamily: "Arial"
    }}>
      <div style={{display:"flex", alignItems:"center", gap:"20px", marginBottom:"30px"}}>
        <img
          src="https://i.imgur.com/YdjP8nC.png"
          alt="logo"
          style={{
            width:"90px",
            height:"90px",
            borderRadius:"999px"
          }}
        />

        <div>
          <h1 style={{fontSize:"42px", margin:0}}>Brightside Calendar</h1>
          <p style={{letterSpacing:"4px", color:"#5eead4"}}>
            DELIVERING LAUGHS ON TIME
          </p>
        </div>
      </div>

      <div style={{
        background:"rgba(255,255,255,0.05)",
        padding:"20px",
        borderRadius:"20px",
        marginBottom:"20px"
      }}>
        <input
          placeholder="Caption"
          value={caption}
          onChange={(e)=>setCaption(e.target.value)}
          style={{
            width:"100%",
            padding:"12px",
            marginBottom:"10px",
            borderRadius:"10px"
          }}
        />

        <input
          type="datetime-local"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
          style={{
            width:"100%",
            padding:"12px",
            marginBottom:"10px",
            borderRadius:"10px"
          }}
        />

        <button
          onClick={addItem}
          style={{
            padding:"12px 20px",
            borderRadius:"999px",
            background:"#5eead4",
            border:"none",
            fontWeight:"bold"
          }}
        >
          Add Item
        </button>
      </div>

      <div style={{display:"grid", gap:"12px"}}>
        {items.map((item)=>(
          <div
            key={item.id}
            style={{
              background:"rgba(255,255,255,0.05)",
              padding:"20px",
              borderRadius:"20px"
            }}
          >
            <p>{item.caption}</p>
            <p style={{opacity:0.7}}>
              {new Date(item.date).toLocaleString()}
            </p>

            <button
              onClick={()=>deleteItem(item.id)}
              style={{
                padding:"8px 14px",
                borderRadius:"999px"
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
