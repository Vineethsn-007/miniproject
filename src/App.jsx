import React, { useState, useEffect } from 'react';
import { uploadFileToPinata } from './ipfs';
import notesReward from './contract';

function App() {
  const [account, setAccount] = useState('');
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false); // for loading notes
  const [uploading, setUploading] = useState(false); // for uploading
  const [actionIndex, setActionIndex] = useState(null); // for button spinner

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch {
      alert('MetaMask connection rejected');
    }
  };

  async function loadNotes() {
    setLoading(true);
    try {
      const count = await notesReward.methods.getNotesCount().call();
      const loadedNotes = [];
      for (let i = 0; i < count; i++) {
        const note = await notesReward.methods.getNote(i).call();
        loadedNotes.push({
          uploader: note[0] || 'Unknown',
          filename: note[1] || 'Untitled',
          ipfsHash: note[2] || '',
          likes: Number(note[3]),
          dislikes: Number(note[4])
        });
      }
      setNotes(loadedNotes);
    } catch (err) {
      alert('Error loading notes: ' + err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (account) loadNotes();
  }, [account]);

  const uploadNote = async e => {
    e.preventDefault();
    if (!file) return alert('Select a file first');
    if (!account) return alert('Connect your MetaMask wallet first');
    setUploading(true);
    try {
      const cid = await uploadFileToPinata(file);
      await notesReward.methods.uploadNote(filename, cid).send({ from: account });
      alert('Note uploaded & reward sent!');
      setFile(null);
      setFilename('');
      await loadNotes();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
    setUploading(false);
  };

  // Peer review functions
  const likeNote = async idx => {
    setActionIndex(idx);
    try {
      await notesReward.methods.likeNote(idx).send({ from: account });
      await loadNotes();
    } catch (err) {
      alert('Like failed: ' + err.message);
    }
    setActionIndex(null);
  };

  const dislikeNote = async idx => {
    setActionIndex(idx);
    try {
      await notesReward.methods.dislikeNote(idx).send({ from: account });
      await loadNotes();
    } catch (err) {
      alert('Dislike failed: ' + err.message);
    }
    setActionIndex(null);
  };

  return (
    <div style={{
      maxWidth: 900,
      margin: '2rem auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '1.5rem',
      backgroundColor: '#fff',
      boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
      borderRadius: 24,
      color:"black"
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '2rem',
      }}>
        <h1 style={{
          fontWeight: '800',
          fontSize: '2.5rem',
          margin: 0,
          color: '#222'
        }}>
          Notes Sharing DApp
        </h1>
        {account ? (
          <span style={{
            backgroundColor: '#00b894',
            color: '#fff',
            fontWeight: 700,
            padding: '0.5rem 1rem',
            borderRadius: 22,
            fontSize: '1.05rem',
            fontFamily: 'monospace'
          }}>
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        ) : (
          <button
            onClick={connectWallet}
            style={{
              backgroundColor: '#0984e3',
              color: '#fff',
              border: 'none',
              borderRadius: 22,
              padding: '0.7rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 8px 20px rgba(9,132,227,0.18)'
            }}
          >
            Connect Wallet
          </button>
        )}
      </header>

      <form onSubmit={uploadNote} style={{
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <input
          type="file"
          onChange={e => {
            setFile(e.target.files[0]);
            setFilename(e.target.files[0] ? e.target.files[0].name : '');
          }}
          style={{
            flexGrow: 1,
            padding: '1rem 1.2rem',
            borderRadius: 16,
            border: '1.8px solid #dfe6e9',
            fontSize: '1.25rem',
            cursor: 'pointer'
          }}
          required
        />
        <button
          type="submit"
          disabled={uploading}
          style={{
            backgroundColor: '#0984e3',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.2rem',
            padding: '1rem 2rem',
            borderRadius: 18,
            border: 'none',
            cursor: uploading ? 'wait' : 'pointer',
            boxShadow: '0 8px 25px rgba(9,132,227,0.09)'
          }}
        >
          {uploading ? <span className="loader" /> : 'Upload & Get Reward'}
        </button>
      </form>

      <section>
        <h2 style={{
          fontWeight: 700,
          fontSize: '2rem',
          marginBottom: '1rem',
          color: '#222',
          borderBottom: '2px solid #0984e3',
          maxWidth: '300px'
        }}>
          Shared Notes
        </h2>
        {loading ? (
          <div style={{margin:"2rem auto", textAlign:"center"}}>
            <span className="loader"/> <p>Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <p style={{ color: "#636e72" }}>No notes shared yet.</p>
        ) : (
          <ul style={{
            listStyle: 'none',
            paddingLeft: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.3rem',
          }}>
            {notes.map(({ uploader, filename, ipfsHash, likes, dislikes }, idx) => (
              <li key={idx} style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                borderRadius: 20,
                padding: '1.4rem 2rem',
                backgroundColor: '#f9f9f9',
              }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  marginBottom: 6,
                  color: '#222'
                }}>{filename}</div>
                <div style={{ fontSize: '0.97rem', color: '#636e72', marginBottom: 8 }}>
                  Uploader: {uploader.slice(0, 8)}...{uploader.slice(-4)}
                </div>
                {ipfsHash ? (
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#0984e3',
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: 600,
                      padding: '0.7rem 1.3rem',
                      borderRadius: 16,
                      fontSize: '1rem',
                      display: 'inline-block',
                      marginTop: 4
                    }}>
                    View Note
                  </a>
                ) : (
                  <span style={{ color: '#d63031', fontWeight: 700, fontSize: '1rem' }}>Missing file hash</span>
                )}
                <div style={{marginTop:14,display:"flex",alignItems:"center",gap:"1rem"}}>
                  <button style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: 14,
                    border:"none",
                    background: "#C7FFD3",
                    fontWeight: "bold",
                    color: "#00882E",
                    cursor: actionIndex === idx ? 'wait' : 'pointer'
                  }} onClick={()=>likeNote(idx)} disabled={actionIndex === idx}>
                    {actionIndex === idx ? <span className="loader" style={{width:18,height:18,borderWidth:2,marginRight:5}}/> : '👍 '}{likes}
                  </button>
                  <button style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: 14,
                    border:"none",
                    background: "#FFD0D0",
                    fontWeight:"bold",
                    color: "#D63031",
                    cursor: actionIndex === idx ? 'wait' : 'pointer'
                  }} onClick={()=>dislikeNote(idx)} disabled={actionIndex === idx}>
                    {actionIndex === idx ? <span className="loader" style={{width:18,height:18,borderWidth:2,marginRight:5}}/> : '👎 '}{dislikes}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
