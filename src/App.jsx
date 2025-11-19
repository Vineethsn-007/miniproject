import React, { useState, useEffect } from 'react';
import { uploadFileToPinata } from './ipfs';
import notesReward from './contract';

// COLOR PALETTE
const COLORS = {
  aqua: "#66C5CC",
  yellow: "#F6CF71",
  peach: "#F89C74",
  gray: "#B3B3B3",
  white: "#FFFFFF",
  black: "#222222"
};

// Loader CSS inline for central loader
const loaderStyle = `
.circle-loader {
  display: block;
  margin: 0 auto;
  border: 6px solid #F6CF71;
  border-radius: 50%;
  border-top: 6px solid #66C5CC;
  width: 60px; height: 60px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

const fileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['png', 'jpg', 'jpeg'].includes(ext)) return '🖼️';
  if (['txt'].includes(ext)) return '📃';
  return '📁';
};

function App() {
  const [account, setAccount] = useState('');
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionIndex, setActionIndex] = useState(null);
  const [search, setSearch] = useState('');

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

  const filteredNotes = notes.filter(note =>
    note.filename.toLowerCase().includes(search.toLowerCase())
  );

  const downloadNote = (ipfsHash, filename) => {
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'note';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Stats bar
  const stats = {
    notes: notes.length,
    totalLikes: notes.reduce((a, b) => a + b.likes, 0),
    totalDislikes: notes.reduce((a, b) => a + b.dislikes, 0)
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: COLORS.white,
      position: 'relative',
      overflow: 'auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <style>{loaderStyle}</style>

      {loading && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(246,207,113,0.17)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div>
            <span className="circle-loader" />
          </div>
        </div>
      )}
      {uploading && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(102,197,204,0.14)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <span className="circle-loader" />
          <div style={{textAlign:'center',marginTop:'1.2rem',fontWeight:600, color: COLORS.aqua}}>Uploading...</div>
        </div>
      )}

      <div style={{
        width: '98vw',
        maxWidth: '1150px',
        minHeight: '90vh',
        margin: '0 auto',
        padding: '2.5rem 2vw',
        background: COLORS.white,
        boxShadow: `0 10px 28px ${COLORS.gray}33`,
        borderRadius: 24,
        position: 'relative',
      }}>

        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.6rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.4rem',
          }}>
            <img
              src="https://media.istockphoto.com/id/913682290/vector/notes-icon.jpg?s=612x612&w=0&k=20&c=aZuKUzCM3VTY4ZITfYANxScKcZdifWSv-idMJyvxIEU="
              alt="Notes Logo"
              style={{
                width: 52, height: 52, borderRadius: '50%',
                border: `3.5px solid ${COLORS.aqua}`,
                background: COLORS.yellow,
              }}
            />
            <h1 style={{
              fontWeight: '900',
              fontSize: '2.4rem',
              color: COLORS.black,
              letterSpacing: '-1.2px',
              margin: 0
            }}>
              Notes Sharing DApp
            </h1>
          </div>
          {account ? (
            <span style={{
              display: 'flex', alignItems: 'center',
              padding: "0.5rem 0.9rem", borderRadius: 22,
              backgroundColor: COLORS.aqua, color: COLORS.white,
              fontWeight: 700, fontSize: '1.04rem', fontFamily: 'monospace'
            }}>
              <img
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account}`}
                style={{width:28, height:28, marginRight:9, borderRadius:10}}
                alt="User avatar"
              />
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          ) : (
            <button
              onClick={connectWallet}
              style={{
                backgroundColor: COLORS.peach,
                color: COLORS.white,
                border: 'none',
                borderRadius: 22,
                padding: '0.85rem 2.2rem',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}
            >
              Connect Wallet
            </button>
          )}
        </header>

        <div style={{
          margin: "0.7rem 0 2rem 0",
          background: COLORS.yellow,
          color: COLORS.black,
          padding: "1rem 1.3rem",
          borderRadius: 10,
          fontWeight: "bold",
          fontSize: "1.05rem",
          boxShadow: `0 2px 13px ${COLORS.yellow}33`,
          textAlign: "center",
          letterSpacing: "0.01em"
        }}>
          Share your notes securely and reward your peers!
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '2.2rem',
          fontSize: '1.11rem',
          fontWeight: '500',
          marginBottom: '1.2rem',
          color: COLORS.gray
        }}>
          <div><span style={{ fontWeight: 700, color: COLORS.aqua }}>{stats.notes}</span> Notes Shared</div>
          <div><span style={{ fontWeight: 700, color: COLORS.peach }}>{stats.totalLikes}</span> Likes</div>
          <div><span style={{ fontWeight: 700, color: COLORS.gray }}>{stats.totalDislikes}</span> Dislikes</div>
        </div>

        <form onSubmit={uploadNote} style={{
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
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
              borderRadius: 18,
              border: `2px solid ${COLORS.aqua}`,
              fontSize: '1.13rem',
              cursor: 'pointer',
              color: COLORS.black
            }}
            required
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          />
          <button
            type="submit"
            disabled={uploading}
            style={{
              backgroundColor: COLORS.peach,
              color: COLORS.white,
              fontWeight: 700,
              fontSize: '1.15rem',
              padding: '1rem 2.2rem',
              borderRadius: 18,
              border: 'none',
              cursor: uploading ? 'wait' : 'pointer',
              boxShadow: '0 2px 8px #F89C7450'
            }}
          >
            Upload & Get Reward
          </button>
        </form>

        <div style={{
          marginBottom: '1.1rem',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}>
          <input
            type="search"
            placeholder="Search notes by filename..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '310px',
              padding: '0.7rem 1rem',
              borderRadius: 17,
              border: `2px solid ${COLORS.aqua}`,
              fontSize: '1.13rem',
              color: COLORS.black,
              outline: 'none'
            }}
            aria-label="Search notes"
          />
        </div>

        <section style={{ flexGrow: 1 }}>
          <h2 style={{
            fontWeight: 700,
            fontSize: '1.6rem',
            marginBottom: '1.1rem',
            color: COLORS.black,
            borderBottom: `2.5px solid ${COLORS.gray}`,
            maxWidth: '300px'
          }}>
            Shared Notes
          </h2>
          {filteredNotes.length === 0 ? (
            <p style={{ color: COLORS.gray, fontSize: '1.18rem' }}>No notes found.</p>
          ) : (
            <ul style={{
              listStyle: 'none',
              paddingLeft: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
              gap: '1.7rem',
            }}>
              {filteredNotes.map(({ uploader, filename, ipfsHash, likes, dislikes }, idx) => (
                <li key={idx} style={{
                  boxShadow: `0 6px 30px ${COLORS.aqua}29`,
                  borderRadius: 21,
                  padding: '1.25rem 1.75rem',
                  backgroundColor: COLORS.white,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  border: `2px solid ${COLORS.yellow}`,
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute', top: 16, right: 18, fontSize: "1.8rem", opacity: .25
                  }}>
                    {fileIcon(filename)}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1.13rem',
                      marginBottom: 8,
                      color: COLORS.black,
                      wordBreak: 'break-word',
                      display: "flex", alignItems: "center", gap: "0.70rem"
                    }}>
                      <span>{filename}</span>
                    </div>
                    <div style={{
                      fontSize: '0.98rem',
                      color: COLORS.gray,
                      marginBottom: 10,
                      display: "flex", gap: "0.4rem", alignItems: "center"
                    }}>
                      <img
                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${uploader}`}
                        style={{ width: 19, height: 19, borderRadius: 5 }}
                        alt="Uploader avatar"
                      />
                      Uploader: {uploader.slice(0, 8)}...{uploader.slice(-4)}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: 10 }}>
                      {ipfsHash ? (
                        <>
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: COLORS.aqua,
                              color: COLORS.white,
                              textDecoration: 'none',
                              fontWeight: 600,
                              padding: '0.6rem 1.1rem',
                              borderRadius: 17,
                              fontSize: '1.01rem',
                              display: 'inline-block',
                              transition: 'background-color 0.3s',
                              cursor: 'pointer',
                            }}
                            aria-label={`View note ${filename}`}
                          >
                            View Note
                          </a>
                          <button
                            onClick={() => downloadNote(ipfsHash, filename)}
                            style={{
                              backgroundColor: COLORS.peach,
                              color: COLORS.white,
                              fontWeight: 600,
                              padding: '0.6rem 1.1rem',
                              borderRadius: 17,
                              fontSize: '1.01rem',
                              border: 'none',
                              cursor: 'pointer',
                              marginLeft: '.4rem',
                            }}
                            aria-label={`Download note ${filename}`}
                          >
                            Download
                          </button>
                        </>
                      ) : (
                        <span style={{ color: COLORS.peach, fontWeight: 700, fontSize: '1.05rem' }}>Missing file hash</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 10 }}>
                    <button
                      style={{
                        padding: '0.55rem 1.09rem',
                        borderRadius: 10,
                        border: "none",
                        background: COLORS.aqua,
                        fontWeight: "bold",
                        color: COLORS.white,
                        cursor: actionIndex === idx ? 'wait' : 'pointer',
                        gap: '0.44rem',
                        fontSize: '1rem',
                        userSelect: 'none'
                      }}
                      onClick={() => likeNote(idx)}
                      disabled={actionIndex === idx}
                      aria-label={`Like note ${filename}`}
                    >
                      {actionIndex === idx ? <span className="circle-loader" style={{ width: 18, height: 18, borderWidth: 2, display:'inline-block', marginRight:5 }} /> : '👍'} {likes}
                    </button>
                    <button
                      style={{
                        padding: '0.55rem 1.09rem',
                        borderRadius: 10,
                        border: "none",
                        background: COLORS.gray,
                        fontWeight: "bold",
                        color: COLORS.black,
                        cursor: actionIndex === idx ? 'wait' : 'pointer',
                        gap: '0.44rem',
                        fontSize: '1rem',
                        userSelect: 'none'
                      }}
                      onClick={() => dislikeNote(idx)}
                      disabled={actionIndex === idx}
                      aria-label={`Dislike note ${filename}`}
                    >
                      {actionIndex === idx ? <span className="circle-loader" style={{ width: 18, height: 18, borderWidth: 2, display:'inline-block', marginRight:5 }} /> : '👎'} {dislikes}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
